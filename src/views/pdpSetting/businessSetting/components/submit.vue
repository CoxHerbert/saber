<template>
  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="业务类别" prop="businessCategoryId">
        <el-select v-model="formData.businessCategoryId" placeholder="请选择业务类别">
          <el-option
            v-for="item in DC_PMS_TEMPITEM_TYPE"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型编码" prop="businessType">
        <el-input
          v-model="formData.businessType"
          placeholder="请输入业务类型编码"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="业务类型" prop="businessTypeName">
        <el-input
          v-model="formData.businessTypeName"
          placeholder="请输入业务类型名称"
          clearable
        ></el-input>
      </el-form-item>
      <div v-if="formData.businessCategoryId === '1859779038095085570'">
        <el-form-item label="文档类型" prop="docTypeId">
          <el-select v-model="formData.docTypeId" placeholder="请选择文档类型">
            <el-option
              v-for="item in DC_PMS_DOCUMENT_TYPE"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文档文件夹" prop="docFolder">
          <el-select v-model="formData.docFolder" placeholder="请选择文档类型">
            <el-option
              v-for="item in DC_FOLDER_TYPE"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文档模板" prop="docTemplateId">
          <dc-upload v-model="formData.docTemplateId" :targetType="Const.targetType.SYSTEM" />
        </el-form-item>
        <el-form-item label="流程">
          <el-input v-model="formData.processId" placeholder="请输入流程" clearable></el-input>
        </el-form-item>
      </div>
      <el-form-item
        label="流程"
        prop="processId"
        v-if="formData.businessCategoryId === '1859779087373963266'"
      >
        <dc-select-dialog-v2
          v-model="formData.processId"
          :multiple="false"
          :multiple-limit="1"
          :params="{
            serviceCallback_notnull: 123,
          }"
          returnType="string"
          @change="handleProcessIdChange"
          objectName="processModel"
        >
          <el-input
            :modelValue="formData.processId?.id || formData.processId"
            placeholder="请输入流程"
            clearable
          ></el-input>
        </dc-select-dialog-v2>
        <!-- <el-input v-model="formData.processId" placeholder="请输入流程" clearable></el-input> -->
      </el-form-item>
      <div v-if="formData.businessCategoryId === '1862011185801105410'">
        <el-form-item label="业务功能类型" prop="funcType">
          <el-input
            v-model="formData.funcType"
            placeholder="请输入业务功能类型"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="业务功能名称" prop="funcName">
          <el-input
            v-model="formData.funcName"
            placeholder="请输入业务功能名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="业务功能URL" prop="funcUrl">
          <el-input v-model="formData.funcUrl" placeholder="请输入业务功能URL" clearable></el-input>
        </el-form-item>
        <el-form-item label="业务功能详情页URL" prop="funcViewUrl">
          <el-input
            v-model="formData.funcViewUrl"
            placeholder="请输入业务功能详情页URL"
            clearable
          ></el-input>
        </el-form-item>
      </div>
      <div v-if="formData.businessCategoryId === '1867000908414631938'">
        <el-form-item label="系统代码类型" prop="systemCodeType">
          <el-input
            v-model="formData.systemCodeType"
            placeholder="请输入系统代码类型"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="系统代码名称" prop="systemCodeName">
          <el-input
            v-model="formData.systemCodeName"
            placeholder="请输入系统代码名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="系统代码方法" prop="systemCodeMethod">
          <el-input
            v-model="formData.systemCodeMethod"
            placeholder="请输入系统代码方法"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="系统代码自定义路径" prop="systemCodePath">
          <el-input
            v-model="formData.systemCodePath"
            placeholder="请输入系统代码自定义路径"
            clearable
          ></el-input>
        </el-form-item>
      </div>
      <div v-if="formData.businessCategoryId === '1862011232290770945'">
        <el-form-item label="是否进度任务" prop="businessTypeName">
          <el-select v-model="formData.progressTask" placeholder="请选择是否进度任务">
            <el-option
              v-for="item in progressTaskList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
import { reactive } from 'vue';
import Api from '@/api/index';
import Const from '@/const';

const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();

const compData = reactive({
  open: false,
  title: '',
  rules: {
    businessCategoryId: [{ required: true, message: '请选择业务类别', trigger: 'change' }],
    businessType: [{ required: true, message: '请输入业务类型编码', trigger: 'blur' }],
    businessTypeName: [{ required: true, message: '请输入业务类型名称', trigger: 'blur' }],
    docTypeId: [{ required: true, message: '请选择文档类型', trigger: 'change' }],
    docFolder: [{ required: true, message: '请选择文档文件夹', trigger: 'change' }],
    docTemplateId: [{ required: true, message: '请上传文档模板', trigger: 'change' }],
    processId: [{ required: true, message: '请输入流程', trigger: 'blur' }],
    funcType: [{ required: true, message: '请输入业务功能类型', trigger: 'blur' }],
    funcName: [{ required: true, message: '请输入业务功能名称', trigger: 'blur' }],
    funcUrl: [{ required: true, message: '请输入业务功能 URL', trigger: 'blur' }],
    funcViewUrl: [{ required: true, message: '请输入业务功能详情页 URL', trigger: 'blur' }],
    systemCodeType: [{ required: true, message: '请输入系统代码类型', trigger: 'blur' }],
    systemCodeName: [{ required: true, message: '请输入系统代码名称', trigger: 'blur' }],
    systemCodeMethod: [{ required: true, message: '请输入系统代码方法', trigger: 'blur' }],
    systemCodePath: [{ required: true, message: '请输入系统代码自定义路径', trigger: 'blur' }],
  },
  formData: {
    id: '',
    businessCategoryId: '', // 业务类别
    businessType: '', // 业务类型编码
    businessTypeName: '', // 业务类型名称
    docTypeId: '', // 文档类型
    docFolder: '', // 文档文件夹
    docTemplateId: '', // 文档模板
    processId: '', // 流程
    funcType: '', // 业务功能类型
    funcName: '', // 业务功能名称
    funcUrl: '', // 业务功能URL
    funcViewUrl: '', // 业务功能详情页URL
    systemCodeType: '', // 系统代码类型
    systemCodeName: '', // 系统代码名称
    systemCodeMethod: '', // 系统代码方法
    systemCodePath: '', // 系统代码自定义路径
  },
  id: null,
  progressTaskList: [
    {
      label: '是',
      value: true,
    },
    {
      label: '否',
      value: false,
    },
  ],
});

const { open, title, rules, formData, id, progressTaskList } = toRefs(compData);

const { DC_PMS_TEMPITEM_TYPE, DC_PMS_DOCUMENT_TYPE, DC_FOLDER_TYPE } = proxy.useCache([
  { key: 'DC_PMS_TEMPITEM_TYPE' },
  { key: 'DC_PMS_DOCUMENT_TYPE' },
  { key: 'DC_FOLDER_TYPE' },
]);

// 监听 businessCategoryId 的变化
watch(
  () => formData.value.businessCategoryId,
  newValue => {
    if (newValue === '1859779038095085570') {
      rules.value.businessTypeName[0].required = false;
      rules.value.docTypeId[0].required = false;
      rules.value.docFolder[0].required = false;
      rules.value.docTemplateId[0].required = false;
    }
    if (newValue !== '1859779038095085570') {
      // 文档类型
      formData.value.docTypeId = '';
      formData.value.docFolder = '';
      formData.value.docTemplateId = '';
    }
    if (newValue !== '1859779087373963266') {
      formData.value.processId = '';
    }
    if (newValue !== '1862011185801105410') {
      formData.value.funcType = '';
      formData.value.funcName = '';
      formData.value.funcUrl = '';
      formData.value.funcViewUrl = '';
    }
    if (newValue !== '1867000908414631938') {
      formData.value.systemCodeType = '';
      formData.value.systemCodeName = '';
      formData.value.systemCodeMethod = '';
      formData.value.systemCodePath = '';
    }
  }
);

// 保存提交
const submitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const res = await Api.system.processCorrelation.submit({
        ...formData.value,
        processId: formData.value?.processId?.id || formData.value?.processId,
      });
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '创建成功' });
        closeDrawer();
        emit('confirm');
      }
    }
  });
};

// 打开抽屉
const openDrawer = row => {
  title.value = '新增业务参数';
  if (row?.id) {
    if (row.businessCategoryId === '1859779038095085570') {
      // 文档类型
      rules.value.businessTypeName[0].required = false;
      rules.value.docTypeId[0].required = false;
      rules.value.docFolder[0].required = false;
      rules.value.docTemplateId[0].required = false;
    }
    title.value = '修改业务参数';

    Object.keys(formData.value).forEach(key => {
      formData.value[key] = row[key];
    });
  }
  open.value = true;
};

// 关闭抽屉
const closeDrawer = () => {
  open.value = false;
  open.value = false;
  formData.value = {
    id: '',
    businessCategoryId: '', // 业务类别
    businessType: '', // 业务类型编码
    businessTypeName: '', // 业务类型名称
    docTypeId: '', // 文档类型
    docFolder: '', // 文档文件夹
    docTemplateId: '', // 文档模板
    processId: '', // 流程
    funcType: '', // 业务功能类型
    funcName: '', // 业务功能名称
    funcUrl: '', // 业务功能URL
    funcViewUrl: '', // 业务功能详情页URL
    systemCodeType: '', // 系统代码类型
    systemCodeName: '', // 系统代码名称
    systemCodeMethod: '', // 系统代码方法
    systemCodePath: '', // 系统代码自定义路径
    progressTask: '', //是否进度任务
  };
};

defineExpose({
  openDrawer,
});

const handleProcessIdChange = modelObj => {
  console.log('modelObj====>', modelObj);
};
</script>
