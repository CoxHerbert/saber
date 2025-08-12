<template>
  <el-dialog
    v-model="visible"
    v-loading="loading"
    :title="title"
    destroy-on-close
    append-to-body
    width="800px"
    class="dialog-setting"
    @close="handleClose"
  >
    <div class="content">
      <el-form :model="formData" label-suffix=":" label-width="140px">
        <el-form-item
          v-for="(col, j) in columns"
          :key="j"
          :label="col.label"
          :prop="col.prop"
          :rules="getItemRule(col)"
        >
          <el-select v-if="col.formType === 'el-select'" v-model="formData[col.prop]">
            <el-option
              v-for="(op, i) in dictOptions[col.dictKey] || []"
              :key="i"
              :label="op.dictValue"
              :value="op.dictKey"
            ></el-option>
          </el-select>
          <el-input-number
            v-else-if="col.formType === 'el-input-nubmer'"
            :placeholder="`请输入${col.label}`"
            v-model="formData[col.prop]"
            v-bind="col.props"
          ></el-input-number>
          <el-switch v-else-if="col.formType === 'switch'" v-model="formData[col.prop]"></el-switch>
          <el-input v-else v-model="formData[col.prop]" :placeholder="`请输入${col.label}`" />
        </el-form-item>
      </el-form>
    </div>
    <div class="footer">
      <el-button type="primary" @click="doAction('submit')">提交</el-button>
      <el-button @click="doAction('cancel')">取消</el-button>
    </div>
  </el-dialog>
</template>
<script setup>
import Api from '@/api';
import options from '../utils/index';
import { computed, reactive, toRefs } from 'vue';

const emit = defineEmits(['close']);

const pageData = reactive({
  loading: false,
  visible: false,
  formData: {},
  mode: 'add',
  columns: options.columns.filter(c => !['index', 'actions'].includes(c.type)),
});

const props = defineProps({
  dictOptions: {
    type: Object,
    default() {
      return {};
    },
  },
});

const { loading, formData, columns, visible, mode } = toRefs(pageData);

const handleClose = () => {
  visible.value = false;
};

const titleMaps = {
  add: '新增流程执行单配置',
  edit: '编辑流程执行单配置',
  view: '查看流程执行单配置',
};

const title = computed(() => {
  return titleMaps[mode.value];
});

const getItemRule = col => {
  return [
    {
      required: true,
      message: `请输入${col.label}`,
      trigger: ['change', 'blur'],
    },
  ];
};

const doAction = action => {
  if (action === 'cancel') {
    emit('close');
    visible.value = false;
  } else if (action === 'submit') {
    loading.value = true;
    Api.scm.exchangeRate
      .submit({
        ...formData.value,
      })
      .then(res => {
        const { code } = res.data;
        if (code === 200) {
          doAction('cancel');
        }
      });
  }
};

defineExpose({
  show(data, modeSet) {
    if (data) {
      formData.value = JSON.parse(JSON.stringify(data));
    }
    mode.value = modeSet;
    visible.value = true;
  },
});
</script>

<style lang="scss">
.dialog-setting {
  .content {
    padding-top: 30px;
  }

  .footer {
    text-align: center;
    margin-top: 100px;
  }
}
</style>
