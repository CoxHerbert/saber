<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :http-request="uploadFileFun"
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :accept="acceptTypes"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :before-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
      :disabled="disabled"
    >
      <el-icon class="avatar-uploader-icon"><plus /></el-icon>
    </el-upload>
    <!-- 上传提示 -->
    <div class="el-upload__tip" v-if="showTip">
      请上传
      <template v-if="fileSize">
        大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
      </template>
      的文件
    </div>

    <el-dialog v-model="dialogVisible" title="预览" width="800px" append-to-body>
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup>
import { Base64 } from 'js-base64';
import website from '@/config/website';
import { computed } from 'vue';

const props = defineProps({
  modelValue: [String, Object, Array],
  limit: { type: Number, default: 5 },
  fileSize: { type: Number, default: 5 },
  fileType: { type: Array, default: () => ['png', 'jpg', 'jpeg'] },
  isShowTip: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const uploadList = ref([]);
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const uploadImgUrl = ref(import.meta.env.VITE_APP_FLIEUPLOAD_CODE);
const headers = ref({
  Authorization: `Basic ${Base64.encode(`${website.clientId}:${website.clientSecret}`)}`,
  'Blade-Requested-With': 'BladeHttpRequest',
  'Content-Type': 'multipart/form-data',
});
const fileList = ref([]);
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize));

watch(
  () => props.modelValue,
  val => {
    if (val) {
      const list = Array.isArray(val) ? val : props.modelValue.split(',');
      fileList.value = list.map(item =>
        typeof item === 'string' ? { name: item, url: item } : item
      );
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
  let isImg = props.fileType.some(type => file.type.includes(type) || file.name.endsWith(type));
  if (!isImg) {
    proxy.$message.error(`文件格式不正确, 请上传${props.fileType.join('/')}图片格式文件!`);
    return false;
  }
  if (file.size / 1024 / 1024 > props.fileSize) {
    proxy.$message.error(`上传头像图片大小不能超过 ${props.fileSize} MB!`);
    return false;
  }
  proxy.$modal.loading('正在上传图片，请稍候...');
  number.value++;
}

function handleExceed() {
  proxy.$message.error(`上传文件数量不能超过 ${props.limit} 个!`);
}

function handleUploadSuccess(res, file) {
  const { code, data } = res.data;
  if (code === 200) {
    uploadList.value.push({ name: data.link, url: data.link });
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy.$message.error(data.msg);
    proxy.$refs.imageUpload.handleRemove(file);
  }
  proxy.$modal.closeLoading();
}

function handleDelete(file) {
  const index = fileList.value.findIndex(f => f.name === file.name);
  if (index > -1 && uploadList.value.length === number.value) {
    fileList.value.splice(index, 1);
    emit('update:modelValue', listToString(fileList.value));
    return false;
  }
}

function uploadedSuccessfully() {
  if (number.value && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter(f => f.url).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit('update:modelValue', listToString(fileList.value));
    proxy.$modal.closeLoading();
  }
}

function handleUploadError() {
  proxy.$message.error('上传图片失败');
  proxy.$modal.closeLoading();
}

function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
}

function listToString(list, separator = ',') {
  return list
    .filter(item => item.url && !item.url.startsWith('blob:'))
    .map(item => item.url)
    .join(separator);
}
</script>

<style scoped lang="scss">
:deep(.hide .el-upload--picture-card) {
  display: none;
}
</style>
