<template>
  <el-dialog
    class="dialog"
    v-model="open"
    :show-close="step === 1"
    width="1200"
    destroy-on-close
    append-to-body
    @close="closeDialog"
  >
    <template #header>
      <div class="step-1" v-if="step === 1">项目计划模板选择</div>
      <div class="step-2" v-if="step === 2">
        <el-icon @click="back" class="back-icon"><ArrowLeftBold /></el-icon>
        <el-button type="primary" @click="confirmToggleTemp">立即使用</el-button>
      </div>
    </template>
    <el-row class="template-container" :gutter="24" v-if="step === 1" v-loading="loading">
      <el-col
        class="template-item"
        :lg="8"
        :xl="8"
        :xs="8"
        :sm="8"
        :md="8"
        v-for="(template, index) in templateList"
        :key="index"
        @click="handleSelectTemp(template)"
      >
        <div class="template-item-wrap">
          <div class="template-name">
            {{ template.templateName }}
          </div>
          <div class="table-container">
            <el-image class="h-full w-full" :src="template.templateImageId" fit="cover" />
          </div>
        </div>
      </el-col>
    </el-row>
    <div class="template-content" v-else-if="step === 2">
      <div class="template-head">{{ selectedTemp?.templateName }}</div>
      <div class="template-about">
        <div class="template-about_label">模板介绍：</div>
        <div class="template-about_value">
          {{ selectedTemp?.templateIntroduction || '-' }}
        </div>
      </div>
      <div class="table-container">
        <el-table
          :data="dataList"
          row-key="id"
          lazy
          :load="load"
          :tree-props="{ children: 'children', hasChildren: 'isChild' }"
          height="100%"
        >
          <el-table-column prop="detailName" label="任务" width="240">
            <template #default="scoped">
              <span
                v-if="scoped.row.templateDetailTypeId"
                class="plan-type"
                :style="{
                  backgroundColor: getPlanTypeNameColor(scoped.row.detailName),
                }"
              >
                {{ scoped.row.templateDetailTypeId }}
              </span>
              {{ scoped.row.detailName }}
            </template>
          </el-table-column>
          <el-table-column prop="handlePersonId" label="处理人" width="180" align="center">
            <template #default="scoped">
              <dc-dict
                type="text"
                :options="DC_PMS_PROJECT_ROLE"
                :value="scoped.row.handlePersonId"
              />
            </template>
          </el-table-column>
          <el-table-column prop="planStatus" label="状态" align="center">
            <template #default="scoped">
              <dc-dict type="text" :options="DC_PMS_PLAN_STATUS" :value="scoped.row.planStatus" />
            </template>
          </el-table-column>
          <el-table-column prop="handleStartPeriod" label="开始日期" align="center" />
          <el-table-column prop="handleRestrictionPeriod" label="结束日期" align="center" />
          <el-table-column prop="isMilestone" label="是否里程碑" align="center">
            <template #default="scoped">
              <el-switch
                v-model="scoped.row.isMilestone"
                style="
                  --el-switch-on-color: rgba(35, 198, 159, 0.3);
                  --el-switch-off-color: #eff1f3;
                  --el-color-white: #23c69f;
                "
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column prop="handleResult" label="输出" align="center">
            <template #default="scoped">{{ scoped.row.handleResult || '-' }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>
<script setup name="SelectTemp">
import { reactive, toRefs } from 'vue';
import Api from '@/api/index';
import dayjs from 'dayjs';
import { getPlanTypeNameColor } from '@/utils/util';

const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();

const props = defineProps(['categoryId', 'projectId', 'projectCaseId']);

// 数据字典
const { DC_PMS_PLAN_STATUS, DC_PMS_PROJECT_ROLE } = proxy.useCache([
  { key: 'DC_PMS_PLAN_STATUS' },
  { key: 'DC_PMS_PROJECT_ROLE' },
]);

const compData = reactive({
  open: false,
  loading: false,
  selectedTemp: null,
  templateList: [],
  dataList: [],
});

const { open, loading, selectedTemp, templateList, dataList } = toRefs(compData);

const step = computed(() => {
  if (selectedTemp.value) return 2;
  return 1;
});

// 获取模板列表
const getTempData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.planTemplate.list({
      size: 99999,
      current: 1,
      categoryId: props.categoryId,
    });
    const { code, data } = res.data;
    if (code === 200) {
      templateList.value = data.records;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

// 返回
const back = () => {
  selectedTemp.value = null;
  dataList.value = [];
};

// 打开弹窗
const openDialog = () => {
  open.value = true;
  getTempData();
};

// 关闭弹窗
const closeDialog = () => {
  open.value = false;
  selectedTemp.value = null;
  templateList.value = [];
  dataList.value = [];
  loading.value = false;
};

// 选择模板
const handleSelectTemp = type => {
  selectedTemp.value = type;
  getTemplate();
};

// 确认切换模板
const confirmToggleTemp = () => {
  proxy
    .$confirm(`确认是否使用"${selectedTemp.value?.templateName}""模板?`)
    .then(async () => {
      return await Api.pdp.planTempItem.synPlanByPlanOrder({
        templateId: selectedTemp.value.id,
        planOrderId: props.projectId,
        projectCaseId: props.projectCaseId,
      });
    })
    .then(() => {
      closeDialog();
      proxy.$message.success('使用成功');
      emit('confirm');
    })
    .catch(() => {});
};

// 获取模板
const getTemplate = async () => {
  loading.value = true;
  const res = await Api.pdp.planTempItem.list({
    templateId: selectedTemp.value.id,
    current: 1,
    size: 99999,
  });
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(item => {
      item.handleStartPeriod = item.handleStartPeriod
        ? dayjs(item.handleStartPeriod).format('YYYY/MM/DD')
        : '-';
      item.handleRestrictionPeriod = item.handleRestrictionPeriod
        ? dayjs(item.handleRestrictionPeriod).format('YYYY/MM/DD')
        : '-';
      item.isMilestone = item.isMilestone === 0 ? true : false;
      return item;
    });
  }
  loading.value = false;
};

const load = async (row, treeNode, resolve) => {
  try {
    loading.value = true;
    const res = await Api.pdp.planTempItem.list({
      size: 99999,
      current: 1,
      parentId: row.id,
    });
    const { code, data } = res.data;
    if (code === 200) {
      resolve(data.records || []);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

defineExpose({
  openDialog,
});
</script>
<style lang="scss">
.dialog {
  padding: 0 !important;
  overflow: hidden;
  background-color: #f5f5f5 !important;
  border-radius: 16px !important;
  .el-dialog {
    &__header {
      display: flex;
      align-items: center;
      margin: 0 !important;
      padding: 0 24px !important;
      height: 74px;
      background: #fff;
      box-shadow: inset 0px 0px 0px 0px #dedbd9;
    }
    &__headerbtn {
      height: 74px;
    }
    &__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 27px;
      height: 27px;
      background: #bbb;
      border-radius: 50%;
      color: #fff;
      font-size: 18px;
      font-weight: 800;
    }
    &__body {
      display: flex;
      flex-direction: column;
      padding: 24px;
      overflow: auto;
    }
  }
  .el-progress-bar__inner {
    background: linear-gradient(90deg, #ffd1ac 0%, #f29346 100%);
  }
}
</style>
<style lang="scss" scoped>
.dialog {
  .step-2 {
    font-weight: bold;
    font-size: 18px;
    color: #333;
    line-height: 18px;
  }
  .step-2 {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .back-icon {
      cursor: pointer;
    }
  }
  .template-container {
    margin: 0 !important;
    width: 100%;
    .template-item {
      padding: 0 8px !important;
      margin-bottom: 16px !important;
      &-wrap {
        display: flex;
        flex-direction: column;
        height: 265px;
        padding: 16px;
        background-color: #fff;
        border-radius: 8px;
        cursor: pointer;
        .template-name {
          margin-bottom: 16px;
          font-weight: bold;
          font-size: 16px;
          color: #333;
          line-height: 16px;
        }
        .table-container {
          display: flex;
          justify-content: center; /* 水平居中 */
          align-items: center; /* 垂直居中 */
          flex: 1;
          width: 100%;
          overflow: hidden;
          & > img {
            height: 100%;
          }
          // transform: scale(0.5, 0.5);
        }
      }
    }
  }
  .template-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 16px;
    overflow: hidden;
    .template-head {
      font-weight: bold;
      font-size: 18px;
      color: #333;
      line-height: 18px;
    }
    .template-about {
      display: flex;
      align-items: flex-start;
      &_label {
        width: 80px;
      }
      &_value {
        width: 703px;
      }
    }
    .card-box {
      padding: 0 8px !important;
      margin-bottom: 0 !important;
      &-content {
        display: flex;
        flex-direction: column;
        padding: 18px 24px;
        background-color: #fff;
        border-radius: 8px;
        .statistics {
          &-label {
            font-weight: 400;
            font-size: 12px;
            color: #666;
            height: 14px;
            line-height: 14px;
          }
          &-value {
            margin-top: 5px;
            margin-bottom: 10px;
            font-weight: bold;
            font-size: 16px;
            color: #333;
            height: 24px;
            line-height: 24px;
          }
          &-desc {
            display: flex;
            align-items: center;
            font-weight: 400;
            font-size: 12px;
            color: #666;
            height: 12px;
            line-height: 12px;
          }
        }
      }
    }
    .table-container {
      padding: 16px;
      flex: 1;
      width: 100%;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
    }
  }
}
</style>
