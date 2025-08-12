<template>
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
          <div class="left-head_title">{{ title }}</div>
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
                上级需求-方案设计
              </div>
              <div class="info-container pl-12">
                <div class="info-group">
                  <div class="info-group_label">处理人：</div>
                  <div class="info-group_value">
                    <dc-select-user
                      v-model="info.handlePersonId"
                      placeholder="请选择"
                      :multiple="false"
                      :multiple-limit="1"
                    />
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">计划类型：</div>
                  <div class="info-group_value">
                    <dc-dict
                      type="text"
                      :options="DC_PMS_TEMPITEM_TYPE"
                      :value="info?.businessCategoryId"
                    />
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">业务名称：</div>
                  <div class="info-group_value">
                    {{
                      proxy.findItem({
                        list: processCorrelationOptions,
                        id: info?.businessType,
                        key: 'businessTypeName',
                      }) || '-'
                    }}
                  </div>
                </div>

                <div
                  class="info-container"
                  v-if="info?.businessCategoryId === '1859779038095085570'"
                >
                  <div class="info-group">
                    <div class="info-group_label">文件夹：</div>
                    <div class="info-group_value">
                      <dc-dict type="text" :options="DC_FOLDER_TYPE" :value="info?.docFolder" />
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-group_label">文件类型：</div>
                    <div class="info-group_value">
                      <dc-dict
                        type="text"
                        :options="DC_PMS_DOCUMENT_TYPE"
                        :value="info?.docTypeId"
                      />
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-group_label">文档模板：</div>
                    <div class="info-group_value">
                      <dc-upload
                        v-model="info.docTemplate"
                        :targetType="Const.targetType.SYSTEM"
                        :isUpload="false"
                        :isRemove="false"
                        v-if="!!info?.docTemplate"
                      />
                      <span v-else>-</span>
                    </div>
                  </div>
                </div>
                <div
                  class="info-container"
                  v-if="info?.businessCategoryId === '1862011185801105410'"
                >
                  <div class="info-group">
                    <div class="info-group_label">业务功能名称：</div>
                    <div class="info-group_value">
                      {{ info?.funcName || '-' }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-group_label">业务功能类型：</div>
                    <div class="info-group_value">
                      {{ info?.funcType || '-' }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-group_label">系统功能地址：</div>
                    <div class="info-group_value">
                      {{ info?.funcUrl || '-' }}
                    </div>
                  </div>
                </div>

                <div class="info-group" v-if="info?.businessCategoryId === '1859779087373963266'">
                  <div class="info-group_label">系统功能地址：</div>
                  <div class="info-group_value">
                    {{ info?.processId || '-' }}
                  </div>
                </div>

                <div
                  class="info-container"
                  v-if="info?.businessCategoryId === '1867000908414631938'"
                >
                  <div class="info-group">
                    <div class="info-group_label">系统代码方法：</div>
                    <div class="info-group_value">
                      {{ info?.systemCodeMethod || '-' }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-group_label">系统代码名称：</div>
                    <div class="info-group_value">
                      {{ info?.systemCodeName || '-' }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-group_label">系统代码地址：</div>
                    <div class="info-group_value">
                      {{ info?.systemCodePath || '-' }}
                    </div>
                  </div>
                  <div class="info-group">
                    <div class="info-group_label">系统代码类型：</div>
                    <div class="info-group_value">
                      {{ info?.systemCodeType || '-' }}
                    </div>
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">计划开始：</div>
                  <div class="info-group_value">
                    {{ info?.startDate || '-' }}
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">计划结束：</div>
                  <div class="info-group_value">
                    {{ info?.endDate || '-' }}
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">附件：</div>
                  <div class="info-group_value">
                    <dc-upload
                      v-model="info.attachment"
                      :isRemove="false"
                      :isUpload="false"
                      v-if="info?.attachment"
                    />
                    <span v-else>-</span>
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">任务说明：</div>
                  <div class="info-group_value">
                    <el-input
                      v-model="info.taskDescription"
                      type="textarea"
                      placeholder="任务说明"
                      autosize
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div class="left-body-title">
                <el-icon><CaretBottom /></el-icon>
                执行信息
              </div>
              <el-form
                class="pl-12"
                ref="formRef"
                style="max-width: 580px"
                :model="formData"
                :rules="rules"
                label-width="100px"
                label-position="left"
              >
                <el-form-item label="计划名称" prop="planName">
                  <el-input v-model="formData.planName" placeholder="计划名称" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane
              :label="`子计划(${children ? children.length : 0})`"
              name="plan"
              v-if="!!formData.id"
            >
              <editChildPlan :planData="children" :parentData="formData" />
              <!-- <div class="left-body-title">
                <el-icon><CaretBottom /></el-icon>
                执行信息
              </div>
              <div class="info-container pl-12">
                <div class="info-group">
                  <div class="info-group_label">添加输出：</div>
                  <div class="info-group_value">
                    <el-button type="primary" icon="Plus">去创建</el-button>
                    <el-button type="primary" icon="Switch" plain>关联任务</el-button>
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">任务反馈：</div>
                  <div class="info-group_value">
                    <dc-dict :options="DC_PMS_PLAN_STATUS" :value="formData.planStatusId" />
                  </div>
                </div>
              </div> -->
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="left-footer">
          <!-- 按钮显示逻辑必须为已创建，为创建人，计划状态为规划中显示下达按钮 -->
          <el-button
            type="primary"
            @click="saveSubmitForm()"
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
          <el-button
            @click="saveSubmitForm()"
            v-if="
              !!formData.id &&
              userInfo.user_id !== formData?.createUser &&
              formData?.planStatusId !== '1866033974148980737' &&
              formData?.planStatusId !== '1866034129325645826' &&
              formData?.planStatusId !== '1866034176666755073'
            "
            >申请变更</el-button
          >
        </div>
      </div>
      <div class="layout-process-right">
        <div class="right-title">基础信息</div>
        <div class="info-container">
          <div class="info-group">
            <div class="info-group_label">项目：</div>
            <div class="info-group_value">{{ projectInfo?.projectName }}</div>
          </div>
          <div class="info-group">
            <div class="info-group_label">状态：</div>
            <div class="info-group_value">
              <dc-dict type="text" :options="DC_PMS_PLAN_STATUS" :value="formData.planStatusId" />
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">父任务：</div>
            <div class="info-group_value">
              {{ info?.planName || '-' }}
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">处理人：</div>
            <div class="info-group_value">
              <dc-view v-model="info.handlePersonId" objectName="user" showKey="realName" />
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">计划开始：</div>
            <div class="info-group_value">
              {{ info?.startDate || '-' }}
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">计划结束：</div>
            <div class="info-group_value">
              {{ info?.endDate || '-' }}
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">是否里程碑：</div>
            <div class="info-group_value">
              {{ info?.isMilestone ? '是' : '否' }}
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">创建人：</div>
            <div class="info-group_value">
              <dc-view v-model="info.createUser" objectName="user" showKey="realName" />
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">创建时间：</div>
            <div class="info-group_value">
              {{ info?.createTime || '-' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script setup>
import { reactive } from 'vue';
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
  info: {},
  children: [],
  title: '',
  activeTab: 'info',
  processCorrelationOptions: [],
  rules: {
    planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
    handlePersonId: [{ required: true, message: '请选择处理人', trigger: 'blur' }],
    businessCategoryId: [{ required: true, message: '请选择计划类型', trigger: 'blur' }],
    documentTypeId: [{ required: true, message: '请选择文档类型', trigger: 'blur' }],
    startDate: [{ required: true, message: '请选择计划开始日期', trigger: 'blur' }],
    endDate: [{ required: true, message: '请选择计划结束日期', trigger: 'blur' }],
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
  },
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
    'systemCodeMethod',
  ],
});

const {
  open,
  info,
  children,
  title,
  activeTab,
  processCorrelationOptions,
  rules,
  formData,
  fields,
} = toRefs(compData);

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
      if (Array.isArray(form.attachment)) {
        form.attachment = formData.value?.attachment.map(item => item.id).join(',');
      }
      delete form.children;
      const res = await Api.pdp.planItem.submit(form);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '创建成功' });
        closeDrawer();
      }
    }
  });
};

// 打开抽屉
const openDrawer = async ({ plan, type, parentPlan }) => {
  switch (type) {
    case 'addChild':
      title.value = '新增子计划';
      formData.value.parentId = plan.id;
      info.value = deepClone(plan);
      formData.value.planStatusId = '1866033974148980737';
      break;
    case 'editChild':
      title.value = '编辑子计划';
      await getOptions();
      formData.value = deepClone(plan);
      info.value = deepClone(parentPlan);
      children.value = deepClone(plan.children);
      break;
  }
  open.value = true;
};

// 关闭抽屉
const closeDrawer = () => {
  open.value = false;
  info.value = {};
  activeTab.value = 'info';
  children.value = [];
  formData.value = {};
  emit('confirm');
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

defineExpose({
  openDrawer,
});
</script>
<style lang="scss">
@use '@/styles/projectDrawer';
</style>
