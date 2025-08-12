<template>
  <div
    class="system-upload-file"
    :class="{
      pain: !!pain,
      disabled: $attrs.disabled || !isUpload,
      'has-no-data': fileList?.length < 1,
    }"
  >
    <div class="file-list">
      <div class="file-item" v-for="(item, index) in fileList" :key="index">
        <div class="file-item-type">
          <svg class="file-item-type_icon" aria-hidden="true">
            <use :xlink:href="getFileIconByUrl(item.name)"></use>
          </svg>
          <div class="file-item-type_operate">
            <el-icon @click="handleDelete(item)" v-if="!$attrs.disabled && isRemove">
              <DeleteFilled />
            </el-icon>
          </div>
        </div>
        <el-tooltip effect="dark" :content="item.name" placement="bottom">
          <div class="file-item_name">
            {{ item.name }}
          </div>
        </el-tooltip>
      </div>
    </div>
    <div class="common-upload-box" v-if="isShowHead || isUpload">
      <div class="upload-head" v-if="isShowHead">
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
        accept="*"
        :limit="limit"
        ref="fileUpload"
        :before-remove="handleDelete"
        :show-file-list="true"
        :file-list="fileList"
        :class="{ hide: fileList.length >= limit }"
        :auto-upload="false"
        :on-change="handleChange"
        drag
      >
        <div class="upload__tip">请选择文件</div>
      </el-upload>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getFileIconByUrl } from '@/utils/util';

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
const emit = defineEmits('');
const fileList = ref([]);

watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    fileList.value = newVal || [];
  },
  { immediate: true, deep: true } // 根据需要添加
);

const acceptTypes = computed(() => {
  return Array.isArray(props.fileType) ? `.${(props.fileType || []).join(',.')}` : '';
});

const handleChange = (file, files) => {
  fileList.value = files;
  emit('update:modelValue', files);
};

function handleDelete(file) {
  const index = fileList.value.findIndex(f => f.id === file.id);
  if (index > -1) {
    fileList.value.splice(index, 1);
    emit('update:modelValue', fileList.value);
    return false;
  }
}

const claer = () => {
  fileList.value = [];
  emit('update:modelValue', []);
};
</script>

<style lang="scss">
.system-upload-file {
  width: 100%;
  border-radius: 8px;
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
    border-radius: 8px 8px 0 0;
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
  .el-upload__tip {
    margin-top: 0;
  }

  .el-upload-dragger {
    padding: 0;
    display: flex;
    flex-direction: column;
    border: none;
    border-radius: 8px;
  }

  .upload__tip {
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
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
        border-radius: 6px;
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
