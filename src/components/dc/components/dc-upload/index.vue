<template>
  <div
    class="common-upload-file"
    :class="{
      pain: !!pain,
      disabled: $attrs.disabled || !isUpload,
      'has-no-data': fileList?.length < 1,
    }"
  >
    <div v-if="fileList?.length > 0" class="file-list">
      <div class="file-item" v-for="(item, index) in fileList" :key="index">
        <div class="file-item-type">
          <svg class="file-item-type_icon" aria-hidden="true">
            <use :xlink:href="getFileIconByUrl(item.name)"></use>
          </svg>
          <div class="file-item-type_operate">
            <el-icon @click="handleDownload(item)">
              <Download />
            </el-icon>
            <el-icon @click="handleDelete(item)" v-if="!$attrs.disabled && isRemove">
              <DeleteFilled />
            </el-icon>
          </div>
        </div>
        <el-tooltip effect="dark" :content="item.originalName" placement="bottom">
          <div class="file-item_name">
            {{ item.originalName }}
          </div>
        </el-tooltip>
      </div>
    </div>
    <span v-else>
      <span v-if="props.pain">-</span>
    </span>
    <div class="common-upload-box" v-if="isShowHead || isUpload">
      <div class="upload-head" v-if="isShowHead">
        <div class="item" @click="download">
          <el-icon>
            <Bottom />
          </el-icon>
          下载
        </div>
        <div class="item" @click="claer">
          <el-icon>
            <Delete />
          </el-icon>
          清空
        </div>
      </div>
      <el-upload
        v-if="isUpload"
        multiple
        :disabled="$attrs.disabled"
        :http-request="uploadFileFun"
        :action="uploadImgUrl"
        :accept="acceptTypes"
        :on-success="handleUploadSuccess"
        :before-upload="handleBeforeUpload"
        :limit="limit"
        :on-error="handleUploadError"
        :on-exceed="handleExceed"
        ref="fileUpload"
        :before-remove="handleDelete"
        :show-file-list="true"
        :headers="headers"
        :file-list="fileList"
        :class="{ hide: fileList.length >= limit }"
        drag
      >
        <div class="upload__tip">拖拽到此处可上传</div>
      </el-upload>
    </div>

    <div class="el-upload__tip" v-if="showTip">
      请上传
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
      </template>
      的文件
    </div>
  </div>
</template>

<script setup>
import { Base64 } from 'js-base64';
import website from '@/config/website';
import Api from '@/api/index';
import { downloadFileBlob, getFileIconByUrl } from '@/utils/util';
import { computed } from 'vue';

const props = defineProps({
  modelValue: [String, Object, Array],
  limit: { type: Number, default: 5 },
  fileType: {
    type: Array,
    default: () => [
      'jpg',
      'jpeg',
      'png',
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'pps',
      'txt',
      'zip',
      'apk',
    ],
  },
  // 是否展示头部
  isShowHead: { type: Boolean, default: false },
  // 是否展示提示
  isShowTip: { type: Boolean, default: false },
  // 是否可上传
  isUpload: {
    type: Boolean,
    default: true,
  },
  // 是否有删除选项
  isRemove: {
    type: Boolean,
    default: true,
  },
  pain: {
    type: Boolean,
    default() {
      return false;
    },
  },
  // 文件类型
  targetType: {
    type: String,
    default: '',
  },
});
const { proxy } = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const uploadImgUrl = ref('/api/blade-resource/oss/endpoint/put-file-attach');
const headers = ref({
  Authorization: `Basic ${Base64.encode(`${website.clientId}:${website.clientSecret}`)}`,
  'Blade-Requested-With': 'BladeHttpRequest',
  'Content-Type': 'multipart/form-data',
});
const fileList = ref([]);
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize));

watch(
  () => props.modelValue,
  async val => {
    if (val) {
      if (typeof props.modelValue === 'string') {
        const res = await Api.common.getFileByIds(props.modelValue);
        const { code, data } = res.data;
        if (code === 200) {
          fileList.value = data.map(item => {
            return {
              id: item.id,
              name: item.path,
              url: item.path,
              originalName: item.sourceFileName,
            };
          });
          emit('update:modelValue', fileList.value);
        }
      } else {
        fileList.value = JSON.parse(JSON.stringify(val));
      }
    } else {
      fileList.value = [];
    }
  },
  { deep: true, immediate: true }
);

const acceptTypes = computed(() => {
  return Array.isArray(props.fileType) ? `.${(props.fileType || []).join(',.')}` : '';
});

const uploadFileFun = async option => {
  const data = new FormData();
  data.append('file', option.file);
  const res = await axios({
    url: uploadImgUrl.value,
    method: 'post',
    data,
    headers: headers.value,
    responseType: 'application/json',
  });
  return res;
};

function handleBeforeUpload(file) {
  if (!props.targetType) {
    proxy.$message.error('上传文件类型不能为空');
    return false;
  }
  let isImg = props.fileType.some(type => file.type.includes(type) || file.name.endsWith(type));
  if (!isImg) {
    proxy.$message.error(`文件格式不正确, 请上传${props.fileType.join('/')}格式文件!`);
    return false;
  }
  proxy.$modal.loading('正在上传文件，请稍候...');
  number.value++;
}

function handleExceed() {
  proxy.$message.error(`上传文件数量不能超过 ${props.limit} 个!`);
}

async function handleUploadSuccess(res, file) {
  const { code, data } = res.data;
  if (code === 200) {
    const res2 = await Api.common.postSubmitFile({
      path: data.link,
      targetType: props.targetType,
      sourceFileName: data.originalName,
    });
    if (res2.data.code === 200) {
      fileList.value.push({
        id: res2.data.data.id,
        name: res2.data.data.path,
        url: res2.data.data.path,
        originalName: res2.data.data.sourceFileName,
      });
      emit('update:modelValue', fileList.value);
      proxy.$modal.closeLoading();
      // uploadedSuccessfully();
    }
  } else {
    number.value--;
    proxy.$message.error(data.msg);
    proxy.$refs.fileUpload.handleRemove(file);
  }
  proxy.$modal.closeLoading();
}

function handleDelete(file) {
  const index = fileList.value.findIndex(f => f.id === file.id);
  if (index > -1) {
    fileList.value.splice(index, 1);
    emit('update:modelValue', fileList.value);
    return false;
  }
}

function uploadedSuccessfully() {
  if (number.value && fileList.value.length === number.value) {
    fileList.value = fileList.value.filter(f => f.url).concat(fileList.value);
    fileList.value = [];
    number.value = 0;
    emit('update:modelValue', fileList.value);
    proxy.$modal.closeLoading();
  }
}

function handleUploadError() {
  proxy.$message.error('上传文件失败');
  proxy.$modal.closeLoading();
}

const handleDownload = item => {
  try {
    downloadFileBlob(item.url, item.originalName);
  } catch (err) {
    proxy.$message.error('下载异常');
  }
};

const claer = () => {
  fileList.value = [];
  emit('update:modelValue', []);
};

const download = () => {
  if (!props.modelValue || props.modelValue.length === 0)
    return proxy.$message({ type: 'warning', message: '无可下载文件' });
  try {
    props.modelValue.forEach(item => downloadFileBlob(item.url, item.originalName));
    if (props.modelValue)
      props.modelValue.forEach(item => downloadFileBlob(item.url, item.originalName));
  } catch (err) {
    proxy.$message.error('下载异常');
  }
};
</script>

<style lang="scss">
.common-upload-file {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #dadbe0;
  &.disabled {
    background-color: var(--el-disabled-bg-color);
    &.pain {
      background-color: transparent;
      border-color: transparent;
    }
    &.has-no-data {
      background-color: transparent;
      border: 1px solid transparent;
    }
  }
  .common-upload-box {
    border: none;
    // border: 1px solid #dadbe0;
  }

  .upload-head {
    padding: 0 26px;
    display: flex;
    justify-content: flex-start;
    height: 36px;
    border-bottom: none;
    // border-bottom: 1px solid #dadbe0;
    background: rgba(247, 246, 245, 1);
    color: #666;
    border-radius: 4px 4px 0 0;
    gap: 10px;

    .item {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;

      .el-icon {
        margin-right: 3px;
      }
    }
  }

  .el-upload-dragger {
    padding: 0;
    display: flex;
    flex-direction: column;
    border: none;
    border-radius: 4px;
  }

  .upload__tip {
    padding: 34px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #dadbe0;
    border: none;
  }

  .el-upload-list,
  .el-upload-list--text {
    display: none;
  }

  .file-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    box-sizing: border-box;
    padding: 8px 16px 0;
    .file-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 60px;

      &-type {
        position: relative;
        width: 36px;
        height: 32px;
        border-radius: 4px;
        overflow: hidden;

        &:hover {
          .file-item-type_operate {
            display: flex;
          }
        }

        &_icon {
          width: 36px;
          height: 32px;
        }

        &_operate {
          display: none;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
          cursor: pointer;
          color: #fff;
          font-size: 16px;
          gap: 4px;
        }
      }

      &_name {
        margin-top: 5px;
        text-align: center;
        width: 100%;
        font-size: 12px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
