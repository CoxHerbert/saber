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
          <div class="left-head_title">
            <span
              class="plan-type"
              :style="{
                backgroundColor: getPlanTypeColor(info?.businessCategoryId),
              }"
            >
              <dc-dict
                type="text"
                :options="DC_PMS_TEMPITEM_TYPE"
                :value="info.businessCategoryId"
                v-if="info.businessCategoryId"
              />
            </span>
            {{ info.planName }}
          </div>
          <div class="left-head_info">
            <div class="info-value">
              <dc-view
                v-model="info.createUser"
                objectName="user"
                showKey="realName"
                v-if="info.createUser"
              />
              <span v-else>
                {{ userInfo?.real_name || '-' }}
              </span>
            </div>
            |
            <div class="info-value">
              <dc-view
                v-model="info.createUser"
                objectName="user"
                showKey="position"
                v-if="info.createUser"
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
              创建于 {{ info?.createTime || proxy.$dayjs().format('YYYY-MM-DD HH:mm:ss') }}
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
              <div class="info-container pl-12">
                <div class="info-group">
                  <div class="info-group_label">处理人：</div>
                  <div class="info-group_value">
                    <dc-view v-model="info.handlePersonId" objectName="user" showKey="realName" />
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
                    {{ info?.startDate || '——' }}
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">计划结束：</div>
                  <div class="info-group_value">
                    {{ info?.endDate || '——' }}
                  </div>
                </div>
                <div class="info-group">
                  <div class="info-group_label">附件：</div>
                  <div class="info-group_value">
                    <dc-upload
                      v-model="info.attachment"
                      :isRemove="false"
                      :isUpload="false"
                      v-if="info.attachment"
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
                :model="info"
                :rules="rules"
                label-width="100px"
                label-position="left"
              >
                <!-- 流程、业务类输出 -->
                <el-form-item
                  label="添加输出"
                  prop="output"
                  v-if="
                    info?.businessCategoryId === '1859779087373963266' ||
                    info?.businessCategoryId === '1862011185801105410'
                  "
                >
                  <el-button
                    type="primary"
                    icon="Plus"
                    @click="handleToCreate"
                    :disabled="!!info?.businessId"
                    >去创建</el-button
                  >
                  <el-button
                    type="primary"
                    icon="Switch"
                    plain
                    @click="handleView"
                    :disabled="!info?.funcViewUrl || !info?.businessId"
                    >关联任务</el-button
                  >
                </el-form-item>
                <!-- 文档类输出 -->
                <el-form-item
                  label="添加输出"
                  prop="output"
                  v-if="info?.businessCategoryId === '1859779038095085570'"
                >
                  <dc-upload v-model="formData.output" :targetType="Const.targetType.OPPS" />
                </el-form-item>
                <el-form-item label="任务反馈" prop="taskFeedback">
                  <el-input
                    v-model="info.taskFeedback"
                    placeholder="请输入任务反馈"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    type="textarea"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <!-- 阶段任务详情 -->
            <el-tab-pane
              :label="`子计划(${info?.children ? info?.children.length : 0})`"
              name="plan"
              v-if="isShowChild"
            >
              <editChildPlan :planData="info.children" :parentData="info" />
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="left-footer">
          <el-button
            type="primary"
            @click="submitOpt()"
            v-if="
              !!info?.id &&
              userInfo.user_id === info?.handlePersonId &&
              (info?.planStatusId === '1866034013076316162' ||
                info?.planStatusId === '1866034054994190338' ||
                info?.planStatusId === '1866034089697861633')
            "
            >提交</el-button
          >
          <el-button @click="closeDrawer">取消</el-button>
          <!-- 按钮显示逻辑必须为已创建，当前操作人不等于创建人，计划状态不能为 规划中 已完成 延期完成-->
          <el-button
            @click="handleSbmitChange"
            v-if="
              !!info.id &&
              userInfo.user_id !== info?.createUser &&
              info?.planStatusId !== '1866033974148980737' &&
              info?.planStatusId !== '1866034129325645826' &&
              info?.planStatusId !== '1866034176666755073'
            "
            >变更申请</el-button
          >
          <!-- <el-button @click="handleSbmitChange">变更申请</el-button> -->
        </div>
      </div>
      <div class="layout-process-right">
        <div class="right-title">基础信息</div>
        <div class="info-container">
          <div class="info-group">
            <div class="info-group_label">项目：</div>
            <div class="info-group_value" v-if="!!projectInfo?.projectName">
              {{ projectInfo?.projectName }}
            </div>
            <dc-view v-model="info.projectId" objectName="project" v-else />
          </div>
          <div class="info-group">
            <div class="info-group_label">状态：</div>
            <div class="info-group_value">
              <dc-dict :options="DC_PMS_PLAN_STATUS" :value="info.planStatusId" />
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">父任务：</div>
            <div class="info-group_value">
              {{ info?.planName || '——' }}
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
              {{ info?.startDate || '——' }}
            </div>
          </div>
          <div class="info-group">
            <div class="info-group_label">计划结束：</div>
            <div class="info-group_value">
              {{ info?.endDate || '——' }}
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
        <div class="right-title">变更记录</div>
        <div class="info-container">
          <div class="info-group" v-for="(item, index) in changeData" :key="index">
            <div class="info-group_label">FAEDRI：</div>
            <div class="info-group_value">
              <dc-view v-model="item.formerChargePersonId" objectName="user" showKey="realName" />
              <el-icon><Right /></el-icon>
              <dc-view v-model="item.currentChargePersonId" objectName="user" showKey="realName" />
            </div>
          </div>
          <div class="info-group" v-for="(item, index) in changeData" :key="index">
            <div class="info-group_label">计划开始：</div>
            <div class="info-group_value">
              {{ dayjs(item.formerStartDate).format('YYYY-MM-DD') }}<el-icon><Right /></el-icon
              >{{ dayjs(item.currentStartDate).format('YYYY-MM-DD') }}
            </div>
          </div>
          <div class="info-group" v-for="(item, index) in changeData" :key="index">
            <div class="info-group_label">计划结束：</div>
            <div class="info-group_value">
              {{ dayjs(item.formerEndDate).format('YYYY-MM-DD') }}<el-icon><Right /></el-icon
              >{{ dayjs(item.currentEndDate).format('YYYY-MM-DD') }}
            </div>
          </div>
          <div class="info-group" v-for="(item, index) in changeData" :key="index">
            <div class="info-group_label">变更时间：</div>
            <div class="info-group_value">{{ item.updateTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <changeSubmit ref="changeSubmitRef" />
  </el-drawer>
</template>
<script setup>
import { reactive } from 'vue';
import Api from '@/api/index';
import Const from '@/const';
import store from '@/store/index';
import editChildPlan from './editChildPlan.vue';
import changeSubmit from './changeSubmit.vue';
import { deepClone } from '@/utils/util';
import dayjs from 'dayjs';
import { getPlanTypeColor } from '@/utils/util';

const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();
const router = useRouter();
// 用户信息
const userInfo = computed(() => store.getters.userInfo);

const props = defineProps({
  projectInfo: {
    type: Object,
    default: {},
  },
  isShowChild: {
    type: Boolean,
    default: true,
  },
});

const compData = reactive({
  open: false,
  info: {},
  activeTab: 'info',
  processCorrelationOptions: [],
  formData: {},
  rules: {},
  changeData: {},
});

const { open, info, activeTab, processCorrelationOptions, formData, rules, changeData } =
  toRefs(compData);

const { DC_PMS_TEMPITEM_TYPE, DC_PMS_PLAN_STATUS, DC_PMS_DOCUMENT_TYPE, DC_FOLDER_TYPE } =
  proxy.useCache([
    { key: 'DC_PMS_TEMPITEM_TYPE' },
    { key: 'DC_PMS_PLAN_STATUS' },
    { key: 'DC_PMS_DOCUMENT_TYPE' },
    { key: 'DC_FOLDER_TYPE' },
  ]);

// 保存提交
const submitOpt = async () => {
  // 保存后执行
  proxy
    .$confirm(`确认是否提交执行?`, {
      confirmButtonText: '提交执行',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(async () => {
      const res = await Api.pdp.planItem.submit(formData.value);
      const { code } = res.data;
      if (code === 200)
        return await Api.pdp.planItem.optSubmit({ dcPmsPlanItemIds: info.value.id });
    })
    .then(res => {
      const { msg } = res.data;
      proxy.$message({ type: 'success', message: msg });
      closeDrawer();
      proxy.$store.dispatch('UpdateWorkCountStatistic');
    });
};

// 变更申请
const handleSbmitChange = () => {
  proxy.getRef('changeSubmitRef').openDialog(info.value);
};

// 处理去创建
const handleToCreate = async () => {
  if (info?.businessCategoryId === '1859779087373963266') {
    const res = await Api.pdp.workflow.getWorkflow({
      processId: info.value.processId,
    });
    const { code, data } = res.data;
    if (code === 200) router.push(`/workflow/process/start/${data}`);
  } else if (info.value?.businessCategoryId === '1862011185801105410') {
    router.push({
      path: info.value?.funcUrl,
      query: {
        planId: info.value?.id,
      },
    });
  }
};

// 查看详情
const handleView = () => {
  router.push({
    path: `${info.value?.funcViewUrl}${info.value?.businessId}`,
  });
};

// 取消
const closeDrawer = () => {
  activeTab.value = 'info';
  info.value = {};
  formData.value = {};
  processCorrelationOptions.value = {};
  emit('confirm');
  open.value = false;
};

// 打开抽屉
const openDrawer = async plan => {
  info.value = deepClone(plan);
  formData.value.id = info.value.id;
  if (info.value.businessCategoryId === '1859779038095085570')
    rules.value.output = [{ required: true, message: '请输入参考资料', trigger: 'blur' }];
  await getOptions();
  await getChangeList();
  open.value = true;
};

const getChangeList = async () => {
  const res = await Api.pdp.changeRecord.list({
    size: 999,
    current: 1,
    businessId: info.value.id,
  });
  const { code, data } = res.data;
  if (code === 200) {
    changeData.value = data.records;
  }
};

const getOptions = async () => {
  const res = await Api.system.processCorrelation.list({
    businessCategoryId: info.value.businessCategoryId,
    size: 999999,
    current: 1,
  });
  const { code, data } = res.data;
  if (code === 200) {
    processCorrelationOptions.value = data.records;
  }
};

defineExpose({
  openDrawer,
});
</script>
<style lang="scss" scoped>
@use '@/styles/projectDrawer';
</style>
