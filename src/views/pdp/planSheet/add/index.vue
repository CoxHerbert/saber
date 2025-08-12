<template>
  <el-drawer v-model="visible" size="50%" class="plan-add-drawer" title="新增计划" @close="close">
    <div class="page-plan-sheet-add">
      <AddOrEdit v-if="visible" v-bind="props" mode="add" @close="close" />
    </div>
  </el-drawer>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue';
import AddOrEdit from '../cpns/add-or-edit.vue';

const emit = defineEmits(['closed']);

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

const open = () => {
  visible.value = true;
};

const close = () => {
  emit('closed');
  visible.value = false;
};

defineExpose({
  open,
  close,
});
</script>
<style lang="scss" scoped>
.page-plan-sheet-add {
  width: 100%;
  height: 100%;
}
</style>
<style lang="scss">
.plan-add-drawer {
  .el-drawer__header {
    padding-bottom: 10px;
  }
}
</style>
