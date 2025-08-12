<template>
  <div class="content-warp">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfigProps"
        @reset="resetQuery"
        @search="handleQuery"
      ></dc-search>
    </div>
    <!-- <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          :model="queryParams"
          ref="queryRef"
          :inline="true"
          @keyup.enter="handleQuery"
        >
          <el-form-item label="项目" prop="projectId">
            <dc-select-dialog
              v-model="queryParams.projectId"
              placeholder="请选择项目"
              objectName="project"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            />
          </el-form-item>
          <el-form-item label="处理人" prop="handlePersonId">
            <dc-select-user
              v-model="queryParams.handlePersonId"
              :multiple="false"
              placeholder="请选择处理人"
            />
          </el-form-item>
          <el-form-item label="计划名称" prop="planName">
            <el-input v-model="queryParams.planName" placeholder="请输入计划名称" clearable />
          </el-form-item>
          <el-form-item label="状态" prop="planStatusId">
            <el-select v-model="queryParams.planStatusId" clearable placeholder="请选择状态">
              <el-option
                v-for="item in DC_PMS_PLAN_STATUS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查找</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </div>
    </div> -->
    <div class="body-container">
      <div class="table-container" v-loading="loading">
        <el-table
          :data="tableData"
          :tree-props="treeProps"
          row-key="id"
          height="100%"
          @row-click="openPlanPerformRef"
        >
          <template #empty>
            <div class="no-data">
              <img class="no-data-img" src="/img/views/pdp/no-data.png" alt="" />
              <div class="no-data-desc">暂无项目计划数据</div>
            </div>
          </template>
          <el-table-column label="序号" min-width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="projectCode" label="项目编码" align="center" min-width="140">
            <template #default="scoped">
              {{ scoped.row.projectCode || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="projectName" label="项目名称" align="center" min-width="140">
            <template #default="scoped">
              <dc-view v-model="scoped.row.projectId" objectName="project" />
            </template>
          </el-table-column>
          <el-table-column prop="planName" label="计划名称" min-width="200">
            <template #default="scoped">
              <span class="plan-name">
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
                {{ scoped.row.planName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="handlePersonId" label="处理人" min-width="100" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.handlePersonId" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column prop="planStatus" label="状态" align="center" min-width="100">
            <template #default="scoped">
              <dc-dict :options="DC_PMS_PLAN_STATUS" :value="scoped.row.planStatusId" />
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" align="center" min-width="100" />
          <el-table-column prop="endDate" label="结束日期" align="center" min-width="100" />
          <el-table-column prop="isMilestone" label="是否里程碑" align="center" min-width="100">
            <template #default="scoped">
              {{ scoped.row.isMilestone ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column prop="output" label="输出" align="center" min-width="100">
            <template #default="scoped">{{ scoped.row.output || '-' }}</template>
          </el-table-column>
        </el-table>
      </div>
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
  <planPerform ref="planPerformRef" @confirm="getData()" :projectInfo="info" :isShowChild="false" />
</template>
<script setup name="Plans">
import { reactive, toRefs, onMounted, computed } from 'vue';
import Api from '@/api/index';
import { arrayToTree } from '@/utils/util';
import planPerform from './detail/components/plan/components/planPerform.vue';
import { getPlanTypeColor } from '@/utils/util';

const { proxy } = getCurrentInstance();

const { DC_PMS_PLAN_STATUS, DC_PMS_TEMPITEM_TYPE } = proxy.useCache([
  { key: 'DC_PMS_PLAN_STATUS' },
  { key: 'DC_PMS_TEMPITEM_TYPE' },
]);

const compData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  tableData: [],
  treeProps: {
    checkStrictly: false,
  },
  info: {},
  planPerformRef: null,
});

const { loading, queryParams, total, tableData, treeProps, info, planPerformRef } =
  toRefs(compData);

onMounted(() => {
  getData();
});

// 详情
const getData = async () => {
  try {
    loading.value = true;
    const params = {
      ...queryParams.value,
      projectId: queryParams.value.projectId?.id
        ? queryParams.value.projectId.id
        : queryParams.value.projectId,
      isPlan: true,
    };
    const res = await Api.pdp.planItem.getProjectPlanList(params);
    const { code, data } = res.data;
    if (code === 200) {
      const arr = data.records.map(item => {
        item.isMilestone = item.isMilestone === 0 ? true : false;
        return item;
      });
      tableData.value = arrayToTree(arr);
      total.value = data.total;
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};

const searchConfigProps = computed(() => {
  return {
    resetExcludeKeys: ['page', 'current'],
    searchItemConfig: {
      paramType: {
        projectId: {
          label: '项目',
          type: 'dc-select-dialog',
          props: {
            objectName: 'project',
            type: 'input',
            multiple: false,
            multipleLimit: 1,
            // returnType: 'string',
          },
          paramKey: 'projectId',
        },
        handlePersonId: {
          label: '处理人',
          type: 'dc-select-user',
          paramKey: 'handlePersonId',
          props: {
            type: 'input',
            multiple: false,
            multipleLimit: 1,
            // returnType: 'string',
          },
        },
        planName: {
          label: '计划名称',
          type: 'input',
          paramKey: 'planName',
          props: {
            placeholder: '请输入计划名称',
          },
        },
      },
    },
  };
});

// 处理计划执行
const openPlanPerformRef = plan => {
  planPerformRef.value.openDrawer(plan);
};

const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};
</script>
<style lang="scss" scoped>
.content-warp {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  .header {
    margin-bottom: 8px;
  }
  .body-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    .table-container {
      .plan-name {
        cursor: pointer;
      }
    }
  }
}
</style>
