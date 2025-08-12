<template>
  <el-drawer
    class="plan-temp-submit"
    v-model="open"
    :title="title"
    destroy-on-close
    append-to-body
    @close="closeDrawer"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="135px">
      <el-form-item label="明细名称" prop="detailName">
        <el-input v-model="formData.detailName" placeholder="请输入明细名称" clearable />
      </el-form-item>
      <el-form-item label="处理人" prop="handlePersonId">
        <el-select v-model="formData.handlePersonId" placeholder="请选择处理人" clearable>
          <el-option
            v-for="item in DC_PMS_PROJECT_ROLE"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="tempitemOrder">
        <el-input-number v-model="formData.tempitemOrder" />
      </el-form-item>
      <el-form-item label="是否里程碑" prop="isMilestone">
        <el-switch v-model="formData.isMilestone" active-text="是" inactive-text="否" />
      </el-form-item>

      <el-form-item label="计划模板明细类型" prop="businessCategoryId">
        <el-radio-group v-model="formData.businessCategoryId">
          <el-radio-button
            :label="dict.label"
            :value="dict.id"
            v-for="dict in DC_PMS_TEMPITEM_TYPE"
            :key="dict"
            @change="getOptions"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="阶段类型"
        prop="phaseType"
        v-if="
          !!formData.businessCategoryId && formData.businessCategoryId === '1917109206417195010'
        "
      >
        <el-select v-model="formData.phaseType" placeholder="请选择阶段类型" clearable>
          <el-option
            v-for="(dict, i) in DC_PDP_PHASE_TYPE"
            :label="dict.label"
            :value="dict.value"
            :key="i"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="业务名称"
        prop="businessType"
        v-if="
          !!formData.businessCategoryId && formData.businessCategoryId !== '1878644432190779393'
        "
      >
        <el-select
          v-model="formData.businessType"
          placeholder="请选择业务配置表"
          @change="changeOption"
          clearable
        >
          <el-option
            v-for="(option, index) in processCorrelationOptions"
            :label="option.businessTypeName"
            :value="option.id"
            :key="index"
          />
        </el-select>
      </el-form-item>

      <div v-if="formData.businessCategoryId === '1859779038095085570' && !!formData.businessType">
        <el-form-item label="文件夹" prop="docFolder">
          <el-select v-model="formData.docFolder" placeholder="请选择文档类型" disabled>
            <el-option
              v-for="item in DC_FOLDER_TYPE"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="文件类型" prop="docTypeId">
          <el-select v-model="formData.docTypeId" placeholder="请选择文档类型" disabled>
            <el-option
              v-for="item in DC_PMS_DOCUMENT_TYPE"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文档模板" prop="docTemplateId">
          <dc-upload
            v-model="formData.docTemplateId"
            :targetType="Const.targetType.SYSTEM"
            :isUpload="true"
            :isRemove="true"
          />
        </el-form-item>
        <el-form-item label="流程">
          <el-input v-model="formData.processId" placeholder="请输入流程key" disabled />
        </el-form-item>
      </div>
      <div v-if="formData.businessCategoryId === '1862011185801105410' && !!formData.businessType">
        <el-form-item label="业务功能名称" prop="funcName">
          <el-input v-model="formData.funcName" placeholder="请输入业务功能名称" disabled />
        </el-form-item>

        <el-form-item label="业务功能类型" prop="funcType">
          <el-input v-model="formData.funcType" placeholder="请输入业务功能类型" disabled />
        </el-form-item>

        <el-form-item label="系统功能地址" prop="funcUrl">
          <el-input v-model="formData.funcUrl" placeholder="请输入系统功能地址" disabled />
        </el-form-item>
      </div>

      <el-form-item
        label="流程"
        prop="processId"
        v-if="formData.businessCategoryId === '1859779087373963266' && !!formData.businessType"
      >
        <el-input v-model="formData.processId" placeholder="请输入流程key" disabled />
      </el-form-item>
      <div v-if="formData.businessCategoryId === '1867000908414631938' && !!formData.businessType">
        <el-form-item label="系统代码方法" prop="systemCodeMethod">
          <el-input v-model="formData.systemCodeMethod" placeholder="请输入系统代码方法" disabled />
        </el-form-item>

        <el-form-item label="系统代码名称" prop="systemCodeName">
          <el-input v-model="formData.systemCodeName" placeholder="请输入系统代码名称" disabled />
        </el-form-item>

        <el-form-item label="系统代码地址" prop="systemCodePath">
          <el-input v-model="formData.systemCodePath" placeholder="请输入系统代码地址" disabled />
        </el-form-item>

        <el-form-item label="系统代码类型" prop="systemCodeType">
          <el-input v-model="formData.systemCodeType" placeholder="请输入系统代码类型" disabled />
        </el-form-item>
      </div>
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
import Const from '@/const';

const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();

const {
  DC_CRM_PLAN,
  DC_CRM_SECTOR,
  DC_PMS_PLAN_STATUS,
  DC_FOLDER_TYPE,
  DC_PMS_DOCUMENT_TYPE,
  DC_PMS_TEMPITEM_TYPE,
  DC_PMS_PROJECT_ROLE,
  DC_PDP_PHASE_TYPE,
} = proxy.useCache([
  { key: 'DC_CRM_PLAN' },
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_PMS_PLAN_STATUS' },
  { key: 'DC_FOLDER_TYPE' },
  { key: 'DC_PMS_DOCUMENT_TYPE' },
  { key: 'DC_PMS_TEMPITEM_TYPE' },
  { key: 'DC_PMS_PROJECT_ROLE' },
  { key: 'DC_PDP_PHASE_TYPE' },
]);

const props = defineProps({
  templateId: {
    type: String,
    default: null,
  },
});

const compData = reactive({
  open: false,
  title: '',
  rules: {
    // businessType: [{ required: true, message: '请输入业务配置表', trigger: 'blur' }],
    tempitemOrder: [{ required: true, message: '请输入序号', trigger: 'blur' }],
    businessTypeName: [{ required: true, message: '请输入业务名称', trigger: 'blur' }],
    detailName: [{ required: true, message: '请输入明细名称', trigger: 'blur' }],
    docFolder: [{ required: true, message: '请选择文件夹', trigger: 'change' }],
    docTypeId: [{ required: true, message: '请选择文件类型', trigger: 'change' }],
    funcName: [{ required: true, message: '请输入业务功能名称', trigger: 'blur' }],
    funcType: [{ required: true, message: '请输入系统功能', trigger: 'blur' }],
    funcUrl: [{ required: true, message: '请输入系统功能地址', trigger: 'blur' }],
    handlePersonId: [{ required: true, message: '请选择处理人', trigger: 'change' }],
    // isMilestone: [{ required: true, message: '请选择是否里程碑', trigger: 'change' }],
    planStatus: [{ required: true, message: '请输入计划状态', trigger: 'blur' }],
    processId: [{ required: true, message: '请输入流程key', trigger: 'blur' }],
    systemCodeMethod: [{ required: true, message: '请输入系统代码方法', trigger: 'blur' }],
    systemCodeName: [{ required: true, message: '请输入系统代码名称', trigger: 'blur' }],
    systemCodePath: [{ required: true, message: '请输入系统代码地址', trigger: 'blur' }],
    systemCodeType: [{ required: true, message: '请输入系统代码类型', trigger: 'blur' }],
    businessCategoryId: [{ required: true, message: '请选择计划模板明细类型', trigger: 'change' }],
  },
  formData: {
    businessType: '',
    businessType: '',
    businessTypeName: '',
    detailName: '',
    docFolder: null,
    docRealfile: '',
    docTemplate: '',
    docTypeId: null,
    funcName: '',
    funcType: '',
    funcUrl: '',
    funcViewUrl: '',
    handlePersonId: null,
    isMilestone: null,
    planStatus: '1866033974148980737',
    processId: '',
    systemCodeMethod: '',
    systemCodeName: '',
    systemCodePath: '',
    systemCodeType: '',
    businessCategoryId: null,
    parentId: null,
    tempitemOrder: '1',
  },
  processCorrelationOptions: [],
  fields: [
    'businessTypeName',
    'processId',
    'docTypeId',
    'docFolder',
    'docTemplate',
    'funcType',
    'funcName',
    'funcUrl',
    'funcViewUrl',
    'systemCodeType',
    'systemCodeName',
    'systemCodePath',
    'systemCodeMethod',
  ],
});

const { open, title, rules, formData, processCorrelationOptions, fields } = toRefs(compData);
const formRef = ref(null);

// 保存提交
const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      const res = await Api.pdp.planTempItem.submit({
        ...formData.value,
        isMilestone: formData.value.isMilestone ? 0 : 1,
        templateId: props.templateId,
      });
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: msg });
        closeDrawer();
        emit('confirm');
      }
    }
  });
};

// 打开抽屉
const openDrawer = (row, type) => {
  title.value = row?.id ? '修改计划模板明细' : '新增计划模板明细';
  switch (type) {
    case 'addChild':
      formData.value.parentId = row?.id;
      break;
    case 'edit':
      formData.value = JSON.parse(JSON.stringify(row));
      formData.value.id = row?.id;
      getOptions();
      break;
  }
  open.value = true;
};

const getOptions = async () => {
  const res = await Api.system.processCorrelation.list({
    businessCategoryId: formData.value.businessCategoryId,
    size: 999999,
    current: 1,
  });
  const { code, data } = res.data;
  if (code === 200) {
    processCorrelationOptions.value = data.records;
  }
  formData.value.businessType = null;
  fields.value.forEach(key => {
    formData.value[key] = null;
  });
};

// option选择变化
const changeOption = () => {
  const option = processCorrelationOptions.value.find(
    option => option.id === formData.value.businessType
  );
  if (option) {
    fields.value.forEach(key => {
      formData.value[key] = option[key];
    });
  } else {
    fields.value.forEach(key => {
      formData.value[key] = null;
    });
  }
};

// 关闭抽屉
const closeDrawer = () => {
  open.value = false;
  formData.value = {
    businessType: '',
    businessType: '',
    businessTypeName: '',
    detailName: '',
    docFolder: null,
    docRealfile: '',
    docTemplate: '',
    docTypeId: null,
    funcName: '',
    funcType: '',
    funcUrl: '',
    tempitemOrder: '',
    funcViewUrl: '',
    handlePersonId: null,
    isMilestone: null,
    planStatus: '1866033974148980737',
    processId: '',
    systemCodeMethod: '',
    systemCodeName: '',
    systemCodePath: '',
    systemCodeType: '',
    businessCategoryId: null,
    parentId: null,
  };
};

defineExpose({
  openDrawer,
});
</script>
<style lang="scss">
.plan-temp-submit {
  width: 600px !important;
}
</style>
