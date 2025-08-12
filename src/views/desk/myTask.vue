<template>
  <div class="app-container content-warp" v-loading="loading">
    <div class="header">
      <dc-search
        v-bind="searchConfigProps"
        v-model="queryParams"
        @reset="handleReset"
        @search="handleSearch"
      >
        <template #dc-select-dialog-search-items="scoped">
          <div v-if="scoped.paramKey === 'projectId'" class="dialog-search-box">
            <el-form-item label-width="100px" label="项目名称">
              <el-input
                placeholder="请输入项目名称"
                clearable
                v-model="scoped.selectDialogScoped.queryParams.projectName"
              />
            </el-form-item>
            <el-form-item label-width="100px" label="项目编码">
              <el-input
                placeholder="请输入项目编码"
                clearable
                v-model="scoped.selectDialogScoped.queryParams.projectCode"
              />
            </el-form-item>
            <!-- <el-form-item label-width="100px" label="station">
              <el-input
                v-model="scoped.selectDialogScoped.queryParams.station"
                placeholder="请输入station"
                clearable
              />
            </el-form-item> -->
          </div>
        </template>
      </dc-search>
    </div>
    <div class="action-banner">
      <el-button
        @click="doAction('batchFinish')"
        type="primary"
        v-permission="{ id: 'TODO_TASKS_BATCH_EXECUTE' }"
        >批量完成</el-button
      >
    </div>
    <div class="body-container">
      <el-table :data="tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" width="60" :selectable="selectable" />

        <el-table-column label="序号" width="60" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="planName" label="任务" min-width="200" show-overflow-tooltip>
          <template #default="scoped">
            <span
              class="plan-type"
              :style="{ backgroundColor: getPlanTypeColor(scoped.row.businessCategoryId) }"
            >
              <dc-dict
                type="text"
                :options="DC_PMS_TEMPITEM_TYPE"
                :value="scoped.row.businessCategoryId"
                v-if="scoped.row.businessCategoryId"
              />
            </span>
            <span class="plan-name">
              {{ scoped.row.planName }}
            </span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="projectId" label="所属项目" min-width="200" show-overflow-tooltip>
          <template #default="scoped">
            <span class="plan-name">
              <dc-view v-model="scoped.row.projectId" objectName="project" />
            </span>
          </template>
        </el-table-column> -->
        <el-table-column prop="projectCode" label="项目编码" min-width="120" show-overflow-tooltip>
          <template #default="scoped">
            {{ scoped.row.projectCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="projectCaseCode"
          label="计划跟踪号"
          min-width="120"
          show-overflow-tooltip
        >
          <template #default="scoped">
            {{ scoped.row.projectCaseCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="planOrderCode"
          label="计划单编号"
          min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="handlePersonId" label="处理人" width="140" align="center">
          <template #default="scoped">
            <dc-view v-model="scoped.row.handlePersonId" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column prop="planStatus" label="状态" align="center" width="120">
          <template #default="scoped">
            <dc-dict :options="DC_PMS_PLAN_STATUS" :value="scoped.row.planStatusId" />
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" align="center" width="120" />
        <el-table-column prop="endDate" label="结束日期" align="center" width="120" />
        <el-table-column prop="isMilestone" label="是否里程碑" align="center" width="120">
          <template #default="scoped">
            {{ scoped.row.isMilestone ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="output" label="输出" align="center" width="140">
          <template #default="scoped">{{ scoped.row.output || '-' }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="140">
          <template #default="scoped">
            <el-button
              type="primary"
              text
              @click="handlePerform(scoped.row)"
              v-permission="{ id: 'TODO_TASKS_BATCH_EXECUTE', row: scoped.row }"
            >
              执行
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </div>
  <!-- 计划执行 -->
  <planPerform ref="planPerformRef" mode="myTask" @confirm="getData()" :projectInfo="info" />
</template>
<script setup name="MyTask">
import { reactive, toRefs, onMounted } from 'vue';
import Api from '@/api/index';
import planPerform from '@/views/pdp/project/detail/components/plan/components/planPerform.vue';
import { getPlanTypeColor } from '@/utils/util';

const { proxy } = getCurrentInstance();

const { DC_PMS_PLAN_STATUS, DC_PMS_TEMPITEM_TYPE } = proxy.useCache([
  { key: 'DC_PMS_PLAN_STATUS' },
  { key: 'DC_PMS_TEMPITEM_TYPE' },
]);
const route = useRoute();

const pageData = reactive({
  loading: false,
  queryParams: { size: 10, current: 1, taskType: '待办' },
  planPerformRef: null,
  tableData: [],
  info: {},
  total: 0,
  batchSelectRows: [],
});

const { loading, queryParams, planPerformRef, tableData, info, total, batchSelectRows } =
  toRefs(pageData);

onMounted(() => {
  if (route.query?.taskType) {
    queryParams.value.taskType = route.query.taskType;
  }
  getData();
});

// 详情
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.planItem.getPlanitemList({
      ...queryParams.value,
      // projectId: route.params.id,
      isMyPlan: true,
      // planStatusId: '1866034013076316162',
    });
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};

const searchConfigProps = computed(() => {
  return {
    resetExcludeKeys: ['page', 'current', 'taskType'],
    tabConfig: {
      prop: 'taskType',
      items: [
        { label: '全部', value: '全部' },
        { label: '待办', value: '待办' },
        { label: '超时', value: '超时' },
        { label: '已办', value: '已办' },
      ],
    },
    searchItemConfig: {
      paramType: {
        planName: {
          label: '任务名称',
          type: 'input',
          placeholder: '请输入任务名称',
          paramKey: 'planName',
        },
        projectId: {
          label: '项目编码',
          type: 'dc-select-dialog',
          placeholder: '请输入项目编码',
          paramKey: 'projectId',
          props: {
            type: 'input',
            showKey: 'projectCode',
            labelKey: 'projectCode',
            objectName: 'pdpProject',
            multiple: false,
            multipleLimit: 1,
            returnType: 'string',
          },
        },
        planOrderId: {
          label: '计划单',
          type: 'dc-select-dialog',
          placeholder: '请选择计划单',
          paramKey: 'planOrderId',
          props: {
            type: 'input',
            objectName: 'mmrPlanOrder',
            multiple: false,
            multipleLimit: 1,
            returnType: 'string',
          },
        },
      },
    },
  };
});

// 处理计划执行
const handlePerform = async plan => {
  loading.value = true;
  Api.pdp.project
    .detail({ id: plan.projectId })
    .then(res => {
      const { code, data } = res.data;
      info.value = data;
      planPerformRef.value.openDrawer(plan);
      loading.value = false;
    })
    .catch(err => {
      loading.value = false;
    });
};

const handleSearch = () => {
  queryParams.value.current = 1;
  getData();
};

const handleReset = () => {
  queryParams.value.current = 1;
  queryParams.value.size = 10;
  // queryParams.value.projectName = '';
  // queryParams.value.planName = '';
  getData();
};

const selectable = row => {
  return ['1862011232290770945'].includes(row.businessCategoryId);
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchSelectRows.value = selection;
};

const handleBatchFinish = () => {
  if (batchSelectRows.value.length <= 0) {
    return proxy.$message({
      type: 'warning',
      message: '请至少选择1条数据进行操作!',
    });
  }
  const ids = batchSelectRows.value.map(item => item.id).join(',');
  const message = `确定要完成数据id为[${ids}]的数据项？`;
  proxy
    .$confirm(message)
    .then(() => Api.pdp.mmrPlanOrderItem.batchComplete({ ids }))
    .then(() => {
      getData();
      this.$store.dispatch('UpdateWorkCountStatistic');
      proxy.$message.success('操作成功');
    })
    .catch(() => {});
};

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  switch (action) {
    case 'batchFinish':
      handleBatchFinish();
      return;
    case 'rowFinish':
      planPerformRef.value.openDrawer(row);
      return;
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }
  .header {
    margin-bottom: 6px;
  }
}
.dialog-search-box {
  width: 900px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 30%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 100px);
    }
  }
}
</style>
