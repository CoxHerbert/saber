<template>
  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <el-form ref="formRef" :model="formData" :rules="rules" label-suffix=":" label-width="90px">
      <el-form-item label="名称" prop="templateName">
        <el-input v-model="formData.templateName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="类型" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择类型">
          <!-- Options for DC_CRM_PLAN -->
          <el-option
            v-for="item in DC_CRM_PLAN"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="行业类别" prop="sectorId">
        <el-select v-model="formData.sectorId" placeholder="请选择行业类别">
          <!-- Options for DC_CRM_SECTOR -->
          <el-option
            v-for="item in DC_CRM_SECTOR"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模版ID" prop="templateNameId" v-if="isCloneDom">
        <el-select v-model="formData.templateId" placeholder="请选择模版ID">
          <!-- Options for DC_CRM_SECTOR -->
          <el-option
            v-for="item in dataListSelect"
            :key="item.id"
            :label="item.templateName"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="缩略图" prop="templateImageId">
        <dc-upload-img v-model="formData.templateImageId" :limit="1" />
      </el-form-item>

      <el-form-item label="描述" prop="templateIntroduction">
        <el-input
          v-model="formData.templateIntroduction"
          type="textarea"
          :rows="2"
          placeholder="请输入描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">关闭</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup>
import { reactive, ref, toRefs, getCurrentInstance } from 'vue';
import Api from '@/api/index';

const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();

const { DC_CRM_PLAN, DC_CRM_SECTOR, DC_PMS_PLAN_STATUS } = proxy.useCache([
  { key: 'DC_CRM_PLAN' },
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_PMS_PLAN_STATUS' },
]);

const compData = reactive({
  open: false,
  title: '',
  rules: {
    categoryId: [{ required: true, message: '请选择类型', trigger: 'change' }],
    sectorId: [{ required: true, message: '请选择行业类别', trigger: 'change' }],
    templateName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    templateId: [{ required: true, message: '请选择模版ID', trigger: 'change' }],

    templateIntroduction: [{ min: 0, max: 200, message: '描述不能超过200个字符', trigger: 'blur' }],
  },
  formData: {
    categoryId: null,
    sectorId: null,
    templateImageId: null,
    templateIntroduction: '',
    templateName: '',
    templateId: null,
  },
});

const { open, title, rules, formData } = toRefs(compData);
const formRef = ref(null);

// 保存提交
const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      let res = null;
      if (isCloneDom.value) {
        res = await Api.pdp.planTemplate.queryListByTemIdClone(formData.value);
      } else {
        res = await Api.pdp.planTemplate.submit(formData.value);
      }
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: msg });
        closeDrawer();
        emit('confirm');
      }
    }
  });
};

const isCloneDom = ref(false);
const dataListSelect = ref(null);
// 打开抽屉
const openDrawer = (row, options = {}, dataList) => {
  const { isClone = false } = options;

  // console.log('row', row);

  if (isClone) {
    // console.log('dataList', dataList);
    dataListSelect.value = dataList;
    console.log('dataListSelect', dataListSelect.value);
    isCloneDom.value = isClone;
    title.value = '克隆模板';
    // 克隆时复制所有字段但清除id，这样会创建新记录
    Object.keys(formData.value).forEach(key => (formData.value[key] = row[key]));
    formData.value.id = undefined; // 清除id以创建新记录
    formData.value.templateName = row.templateName || '计划模版' + ' (副本)'; // 添加副本标识
  } else {
    title.value = row?.id ? '修改模板' : '新增模板';
    if (row?.id) {
      Object.keys(formData.value).forEach(key => (formData.value[key] = row[key]));
      formData.value.id = row?.id;
    }
  }
  open.value = true;
};

// 关闭抽屉
const closeDrawer = () => {
  open.value = false;
  formData.value = {
    categoryId: null,
    sectorId: null,
    templateImageId: null,
    templateIntroduction: '',
    templateName: '',
  };
};

defineExpose({
  openDrawer,
});
</script>
