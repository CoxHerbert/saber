<template>
  <!-- 计划列表/详情内部 -->
  <el-drawer
    class="project-drawer"
    v-model="open"
    destroy-on-close
    append-to-body
    @close="closeDrawer"
  >
    <div class="close-icon" @click="closeDrawer">
      <el-icon><Close /></el-icon>
    </div>

    <div class="layout-process">
      <div class="layout-process-left">
        <div class="left-head">
          <div class="left-head_title">
            {{ title }}
          </div>
          <div class="left-head_info">
            <div class="info-value">
              <dc-view
                v-model="formData.createUser"
                objectName="user"
                showKey="realName"
                v-if="formData.createUser"
              />
              <span v-else>
                {{ userInfo?.real_name || '-' }}
              </span>
            </div>
            |
            <div class="info-value">
              <dc-view
                v-model="formData.createUser"
                objectName="user"
                showKey="position"
                v-if="formData.createUser"
              />
              <dc-view
                v-model="userInfo.user_id"
                objectName="user"
                showKey="position"
                v-else-if="userInfo.user_id"
              />
              <span v-else>-</span>
            </div>
            |
            <div class="info-value">
              创建于 {{ formData?.createTime || proxy.$dayjs().format('YYYY-MM-DD HH:mm:ss') }}
            </div>
          </div>
        </div>
        <div class="left-body">
          <el-tabs v-model="activeTab" class="w-full">
            <el-tab-pane label="详细信息" name="info">
              <div class="left-body-title">
                <el-icon><CaretBottom /></el-icon>
                任务信息
              </div>
              <el-form
                class="pl-12"
                ref="formRef"
                style="max-width: 580px"
                :model="formData"
                :rules="rules"
                label-suffix=":"
                label-width="100px"
                label-position="left"
              >
                <el-form-item label="计划名称" prop="planName">
                  <el-input v-model="formData.planName" placeholder="计划名称" />
                </el-form-item>
                <el-form-item label="处理人" prop="handlePersonId">
                  <dc-select-user
                    v-model="formData.handlePersonId"
                    placeholder="请选择"
                    :multiple="false"
                    :multiple-limit="1"
                  />
                </el-form-item>
                <el-form-item label="计划类型" prop="businessCategoryId">
                  <el-radio-group
                    class="plan-type-radio-group"
                    v-model="formData.businessCategoryId"
                    @change="handleBusinessCategoryIdChange"
                  >
                    <el-radio-button
                      :label="dict.label"
                      :value="dict.id"
                      v-for="dict in DC_PMS_TEMPITEM_TYPE"
                      :key="dict"
                      @change="getOptions"
                      :style="{
                        backgroundColor: getPlanTypeNameColor(dict.label),
                        color: '#fff',
                      }"
                    />
                  </el-radio-group>
                </el-form-item>
                <el-form-item
                  label="业务名称"
                  prop="businessType"
                  v-if="
                    !!formData.businessCategoryId &&
                    !['1878644432190779393', '1917109206417195010'].includes(
                      formData.businessCategoryId
                    )
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

                <div v-if="formData.businessCategoryId === '1859779038095085570'">
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
                  <el-form-item label="文档模板" prop="docTemplate">
                    <dc-upload
                      v-model="formData.docTemplate"
                      :targetType="Const.targetType.SYSTEM"
                      :isUpload="true"
                      :isRemove="true"
                    />
                  </el-form-item>
                </div>
                <div v-if="formData.businessCategoryId === '1862011185801105410'">
                  <el-form-item label="业务功能名称" prop="funcName">
                    <el-input
                      v-model="formData.funcName"
                      placeholder="请输入业务功能名称"
                      disabled
                    />
                  </el-form-item>

                  <el-form-item label="业务功能类型" prop="funcType">
                    <el-input
                      v-model="formData.funcType"
                      placeholder="请输入业务功能类型"
                      disabled
                    />
                  </el-form-item>

                  <el-form-item label="系统功能地址" prop="funcUrl">
                    <el-input
                      v-model="formData.funcUrl"
                      placeholder="请输入系统功能地址"
                      disabled
                    />
                  </el-form-item>
                </div>

                <el-form-item
                  label="流程"
                  prop="processId"
                  v-if="formData.businessCategoryId === '1859779087373963266'"
                >
                  <el-input v-model="formData.processId" placeholder="请输入流程key" disabled />
                </el-form-item>
                <div v-if="formData.businessCategoryId === '1867000908414631938'">
                  <el-form-item label="系统代码方法" prop="systemCodeMethod">
                    <el-input
                      v-model="formData.systemCodeMethod"
                      placeholder="请输入系统代码方法"
                      disabled
                    />
                  </el-form-item>

                  <el-form-item label="系统代码名称" prop="systemCodeName">
                    <el-input
                      v-model="formData.systemCodeName"
                      placeholder="请输入系统代码名称"
                      disabled
                    />
                  </el-form-item>

                  <el-form-item label="系统代码地址" prop="systemCodePath">
                    <el-input
                      v-model="formData.systemCodePath"
                      placeholder="请输入系统代码地址"
                      disabled
                    />
                  </el-form-item>

                  <el-form-item label="系统代码类型" prop="systemCodeType">
                    <el-input
                      v-model="formData.systemCodeType"
                      placeholder="请输入系统代码类型"
                      disabled
                    />
                  </el-form-item>
                </div>
                <el-form-item label="计划开始" prop="startDate">
                  <el-date-picker
                    v-model="formData.startDate"
                    type="date"
                    placeholder="计划结束"
                    format="YYYY/MM/DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
                <el-form-item label="计划结束" prop="endDate">
                  <el-date-picker
                    v-model="formData.endDate"
                    type="date"
                    placeholder="计划结束"
                    format="YYYY/MM/DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
                <el-form-item label="附件上传" prop="attachment">
                  <dc-upload
                    v-model="formData.attachment"
                    :targetType="Const.targetType.P_PROJECT"
                  />
                </el-form-item>
                <el-form-item label="任务说明" prop="taskDescription">
                  <el-input
                    v-model="formData.taskDescription"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    type="textarea"
                    placeholder="任务说明"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane
              :label="`子计划(${info?.children ? info?.children.length : 0})`"
              name="plan"
              v-if="!!formData.id"
            >
              <editChildPlan :planData="info.children" :parentData="info" />
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="left-footer">
          <!-- 按钮显示逻辑必须为已创建，为创建人，计划状态为规划中显示下达按钮 -->
          <el-button
            type="primary"
            @click="sendDownPlan()"
            v-if="
              !!formData?.id &&
              userInfo.user_id === formData?.createUser &&
              formData?.planStatusId === '1866033974148980737'
            "
            >下达</el-button
          >
          <!-- 按钮显示逻辑必须为新建（无id）或者计划状态为规划中显示保存按钮 -->
          <el-button
            type="primary"
            plain
            @click="saveSubmitForm()"
            v-if="!formData?.id || formData?.planStatusId === '1866033974148980737'"
            >保存</el-button
          >
          <el-button @click="closeDrawer">取消</el-button>
          <!-- 按钮显示逻辑必须为已创建，当前操作人不等于创建人，计划状态不能为 规划中 已完成 延期完成-->
          <!-- <el-button
            @click="closeDrawer"
            v-if="
              !!formData.id &&
              userInfo.user_id !== formData?.createUser &&
              formData?.planStatusId !== '1866033974148980737' &&
              formData?.planStatusId !== '1866034129325645826' &&
              formData?.planStatusId !== '1866034176666755073'
            "
            >变更申请</el-button
          > -->
        </div>
      </div>
      <div class="layout-process-right">
        <div class="right-title">基础信息</div>
        <div class="process-content info-container">
          <div class="info-group">
            <div class="info-group_label">项目：</div>
            <div class="info-group_value">{{ projectInfo?.projectName }}</div>
          </div>
          <div class="info-group">
            <div class="info-group_label">状态：</div>
            <div class="info-group_value">
              <dc-dict :options="DC_PMS_PLAN_STATUS" :value="formData.planStatusId" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script setup>
import { computed, reactive } from 'vue';
import Api from '@/api/index';
import Const from '@/const';
import store from '@/store/index';
import editChildPlan from './editChildPlan.vue';
import { deepClone } from '@/utils/util';

const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();

// 用户信息
const userInfo = computed(() => store.getters.userInfo);

const props = defineProps({
  projectInfo: {
    type: Object,
    default: {},
  },
  projectId: {
    type: String,
    default: '',
  },
  projectCaseId: {
    type: String,
    default: '',
  },
});

const compData = reactive({
  open: false,
  title: '',
  info: {},
  activeTab: 'info',
  processCorrelationOptions: [],
  formData: {},
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
  ],
});

const { open, title, info, activeTab, processCorrelationOptions, formData, fields } =
  toRefs(compData);

const rules = computed(() => {
  return {
    planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
    handlePersonId: [{ required: true, message: '请选择处理人', trigger: 'blur' }],
    businessCategoryId: [{ required: true, message: '请选择计划类型', trigger: 'blur' }],
    documentTypeId: [{ required: true, message: '请选择文档类型', trigger: 'blur' }],
    startDate:
      formData?.value?.businessCategoryId === '1917109206417195010'
        ? undefined
        : [{ required: true, message: '请选择计划开始日期', trigger: 'blur' }],
    endDate:
      formData?.value?.businessCategoryId === '1917109206417195010'
        ? undefined
        : [{ required: true, message: '请选择计划结束日期', trigger: 'blur' }],
    businessType: [{ required: true, message: '请输入业务类型编码', trigger: 'blur' }],
    docFolder: [{ required: true, message: '请选择文档文件夹', trigger: 'change' }],
    docTypeId: [{ required: true, message: '请选择文档类型', trigger: 'change' }],
    funcName: [{ required: true, message: '请输入业务功能名称', trigger: 'blur' }],
    funcType: [{ required: true, message: '请输入业务功能类型', trigger: 'blur' }],
    funcUrl: [{ required: true, message: '请输入业务功能 URL', trigger: 'blur' }],
    processId: [{ required: true, message: '请输入流程', trigger: 'blur' }],
    systemCodeMethod: [{ required: true, message: '请输入系统代码方法', trigger: 'blur' }],
    systemCodeName: [{ required: true, message: '请输入系统代码名称', trigger: 'blur' }],
    systemCodePath: [{ required: true, message: '请输入系统代码自定义路径', trigger: 'blur' }],
    systemCodeType: [{ required: true, message: '请输入系统代码类型', trigger: 'blur' }],
  };
});

const { DC_PMS_TEMPITEM_TYPE, DC_PMS_PLAN_STATUS, DC_PMS_DOCUMENT_TYPE, DC_FOLDER_TYPE } =
  proxy.useCache([
    { key: 'DC_PMS_TEMPITEM_TYPE' },
    { key: 'DC_PMS_PLAN_STATUS' },
    { key: 'DC_PMS_DOCUMENT_TYPE' },
    { key: 'DC_FOLDER_TYPE' },
  ]);

// 保存提交
const saveSubmitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        projectId: props.projectInfo.id,
        projectCode: props.projectInfo.projectCode,
      };
      if (form.id) {
        form.isMilestone = form.isMilestone ? 0 : 1;
        form.planStatusId = formData.value.planStatusId;
      } else {
        form.projectId = props.projectId;
        form.projectCaseId = props.projectCaseId;
      }
      if (Array.isArray(form.docTemplate)) {
        form.docTemplate = form.docTemplate.map(item => item.id).join(',');
      }
      if (Array.isArray(formData.value.attachment)) {
        form.attachment = formData.value.attachment.map(({ id }) => id).join(',');
      }
      delete form.children;
      const res = await Api.pdp.planItem.submit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: msg });
        closeDrawer();
      }
    }
  });
};

const sendDownPlan = async id => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        projectId: props.projectInfo.id,
        projectCode: props.projectInfo.projectCode,
      };
      if (form.id) {
        form.isMilestone = form.isMilestone ? 0 : 1;
        form.planStatusId = formData.value.planStatusId;
      }
      if (Array.isArray(form.docTemplate)) {
        form.docTemplate = form.docTemplate.map(item => item.id).join(',');
      }
      if (Array.isArray(formData.value.attachment)) {
        form.attachment = formData.value.attachment.map(({ id }) => id).join(',');
      }
      delete form.children;
      const res = await Api.pdp.planItem.submit(form);
      const resData = res.data;
      if (resData.code === 200) {
        const res = await Api.pdp.planItem.sendDownPlan({ dcPmsPlanItemIds: resData.data.id });
        const { code, msg } = res.data;
        if (code === 200) {
          proxy.$message({ type: 'success', message: msg });
        }
      }
    }
  });
};

// 取消
const closeDrawer = () => {
  emit('confirm');
  open.value = false;
  info.value = {};
  formData.value = {
    planName: null,
    handlePersonId: null,
    businessCategoryId: null,
    documentTypeId: null,
    startDate: null,
    endDate: null,
    attachment: null,
    taskDescription: null,
  };
  activeTab.value = 'info';
};

// 打开抽屉
const openDrawer = async ({ plan, type }) => {
  switch (type) {
    case 'addMaster':
      title.value = '新增计划';
      formData.value.planStatusId = '1866033974148980737';
      break;
    case 'editMaster':
      title.value = '编辑计划';
      await getOptions();
      info.value = deepClone(plan);
      formData.value = deepClone(plan);
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

const handleBusinessCategoryIdChange = () => {
  setTimeout(() => {
    proxy.$refs['formRef'].clearValidate();
  }, 30);
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
defineExpose({
  openDrawer,
});
</script>
<style lang="scss">
@use '@/styles/projectDrawer';
</style>
