<template>
  <el-drawer v-model="visible" size="50%" class="plan-edit-drawer" @close="close">
    <template #header>
      <div>
        <span class="title">编辑计划</span>
        <span v-if="formData" class="top-info">
          由&nbsp;<dc-view v-model="formData.createUser" objectName="user"></dc-view
          >&nbsp;更新于&nbsp; {{ formData.updateTime }}&nbsp;<dc-dict
            v-if="formData.DC_PMS_PLAN_STATUS"
            :value="formData.planStatusId"
            :options="formData.DC_PMS_PLAN_STATUS"
        /></span>
      </div>
    </template>
    <div class="page-plan-sheet-edit">
      <AddOrEdit
        v-bind="props"
        mode="edit"
        @close="close"
        @editRow="editRow"
        @detailInfo="handleGetDetailInfo"
        @addChild="handleAddChild"
      />
    </div>
  </el-drawer>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue';
import AddOrEdit from '../cpns/add-or-edit.vue';

const emit = defineEmits(['closed', 'editRow', 'addChild']);

const props = defineProps({
  id: {
    type: String,
    default() {
      return '';
    },
  },
  parentId: {
    type: String,
    default() {
      return '';
    },
  },
  from: {
    type: String,
    default() {
      return '';
    },
  },
  projectId: {
    type: String,
    default() {
      return '';
    },
  },
  projectCode: {
    type: String,
    default() {
      return '';
    },
  },
  projectCaseId: {
    type: String,
    default() {
      return '';
    },
  },
});

const visible = ref(false);
// 仅仅用于展示标题
const formData = ref({});

const handleGetDetailInfo = data => {
  formData.value = data;
};

const handleAddChild = data => {
  emit('addChild', data);
};

const open = () => {
  visible.value = true;
};

const close = () => {
  emit('closed');
  visible.value = false;
};
const editRow = data => {
  emit('editRow', data);
};
defineExpose({
  open,
  close,
});
</script>
<style lang="scss" scoped>
.page-plan-sheet-edit {
  width: 100%;
  height: 100%;
}
.top-info {
  font-weight: normal;
  font-size: 14px;
  color: #333;

  :deep(.dict) {
    transform: translateY(5px);
  }
}
</style>
<style lang="scss">
.plan-edit-drawer {
  .el-drawer__header {
    padding-bottom: 10px;
  }
}
</style>
