<template>
  <div class="uploader">
    <div class="pick-wrap">
      <button class="pick-btn" @click="pick">选择文件</button>
      <input ref="fileInput" type="file" class="pick-input" @change="onFileChange" />
    </div>

    <div v-if="file" class="meta">
      已选：{{ file.name }}（{{ (file.size / 1024 / 1024).toFixed(2) }}MB）
    </div>

    <div class="controls">
      <button :disabled="!file || uploading" @click="startUpload">
        {{ uploading ? `上传中 ${Math.round(progress)}%` : '开始上传' }}
      </button>
      <button v-if="uploading" @click="abortUpload">取消</button>
    </div>

    <div v-if="message" class="msg">{{ message }}</div>
  </div>
</template>

<script>
import request from '@/axios';
import func from '@/utils/func';

export default {
  name: 'dc-chunk-upload',
  props: {
    // 上传地址（按你的要求固定到该接口，除非外部覆盖）
    endpoint: {
      type: String,
      default: '/blade-resource/oss/endpoint/multipart/put-part',
    },
    // 分片大小，默认 2MB
    chunkSizeMB: {
      type: Number,
      default: 5,
    },
    // bucket：默认取环境变量或'multipart-temp'
    bucketName: {
      type: String,
      default: () => import.meta?.env?.VITE_BUCKET || 'multipart-temp',
    },
    // 是否把最终合并文件名直接用原文件名（xxx.mp4）
    useOriginalAsTarget: {
      type: Boolean,
      default: true,
    },
    // 可选：自定义最终合并后的文件名（当 useOriginalAsTarget=false 时生效）
    targetFileName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      file: null,
      uploading: false,
      progress: 0,
      message: '',
      controller: null,
    };
  },
  computed: {
    chunkSize() {
      return this.chunkSizeMB * 1024 * 1024;
    },
  },
  methods: {
    pick() {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const f = e.target.files && e.target.files[0];
      this.file = f || null;
      this.progress = 0;
      this.message = '';
    },
    abortUpload() {
      try {
        this.controller && this.controller.abort();
      } catch (_) {}
      this.uploading = false;
      this.message = '已取消上传';
    },
    async startUpload() {
      if (!this.file) return;

      const file = this.file;
      const chunkSize = this.chunkSize;
      const totalChunks = Math.ceil(file.size / chunkSize);
      if (totalChunks <= 0) return;

      // 统一的 bucketCode（本文件的所有分片共享）
      const bucketCode = func.generateUUID();

      // 预生成“有序”的 partNames（UUID），并建立映射关系
      const partNamesArr = Array.from({ length: totalChunks }, () => func.generateUUID());
      const partNames = partNamesArr.join(',');
      const partIndexMap = new Map(partNamesArr.map((id, idx) => [id, idx]));

      const finalName = this.useOriginalAsTarget ? file.name : this.targetFileName || file.name;

      this.uploading = true;
      this.progress = 0;
      this.message = '';
      this.controller = new AbortController();

      const CONCURRENCY = 4;
      const RETRY_TIMES = 1;

      // 单片上传（带映射校验 + 重试）
      const uploadChunk = i => async () => {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);

        const partName = partNamesArr[i]; // 与 partNames 一一对应
        if (!partIndexMap.has(partName) || partIndexMap.get(partName) !== i) {
          throw new Error(`分片索引映射异常：partName=${partName} index=${i}`);
        }

        const execOnce = async () => {
          const form = new FormData();
          form.append('file', chunk, `${file.name}.${partName}`);
          form.append('partName', partName); // 当前分片名（在 partNames 中）
          form.append('partNames', partNames); // 全量有序列表（用于后端合并）
          form.append('targetFileName', finalName);
          form.append('bucketName', 'multipart-temp'); // 你原有的 bucket
          form.append('bucketCode', bucketCode); // ✅ 新增：同一文件统一的 bucketCode

          const res = await request({
            url: this.endpoint,
            method: 'POST',
            data: form,
            signal: this.controller.signal,
          });

          const { code } = res.data || {};
          if (code !== 200) {
            throw new Error(
              res?.data?.msg || `分片 ${i + 1}/${totalChunks}（${partName}）上传失败`
            );
          }
        };

        // 简单重试（指数退避）
        for (let t = 0; t <= RETRY_TIMES; t++) {
          try {
            await execOnce();
            return;
          } catch (err) {
            if (err?.name === 'AbortError') throw err;
            if (t === RETRY_TIMES) throw err;
            await new Promise(r => setTimeout(r, 300 * Math.pow(2, t)));
          }
        }
      };

      // 并发调度器（限流）
      const runWithConcurrency = async (fns, limit) => {
        let idx = 0;
        let done = 0;
        const results = new Array(fns.length);

        const worker = async () => {
          while (true) {
            const current = idx++;
            if (current >= fns.length) break;
            try {
              await fns[current]();
              results[current] = { status: 'fulfilled' };
            } catch (err) {
              results[current] = { status: 'rejected', reason: err };
            } finally {
              done++;
              this.progress = (done / fns.length) * 100; // 分片完成度
            }
          }
        };

        await Promise.all(new Array(Math.min(limit, fns.length)).fill(0).map(worker));
        return results;
      };

      try {
        const tasks = Array.from({ length: totalChunks }, (_, i) => uploadChunk(i));
        const results = await runWithConcurrency(tasks, CONCURRENCY);

        const failedIdx = results
          .map((r, i) => (r?.status === 'rejected' ? i : -1))
          .filter(i => i >= 0);

        if (failedIdx.length) {
          const list = failedIdx.map(i => `#${i + 1}(${partNamesArr[i]})`).join('，');
          this.message = `部分分片失败：${list}`;
        } else {
          this.message = '全部分片上传完成。（最终合并/URL 将由后端或 Socket 返回）';
        }
      } catch (err) {
        this.message =
          err?.name === 'AbortError' ? '上传已取消。' : `上传异常：${err?.message || err}`;
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
.uploader {
  display: inline-block;
  font-size: 14px;
}
.pick-wrap {
  position: relative;
  display: inline-block;
}
.pick-btn {
  padding: 6px 12px;
  cursor: pointer;
}
.pick-input {
  display: none;
}
.meta {
  margin-top: 8px;
  opacity: 0.85;
}
.controls {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.msg {
  margin-top: 8px;
  white-space: pre-line;
}
</style>
