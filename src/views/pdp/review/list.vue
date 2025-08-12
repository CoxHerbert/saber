<template>
  <div class="content-warp">
    <div class="header none-border ht">
      <div class="title w-full">
        <el-tabs v-model="activeName" @tab-change="handleClick">
          <el-tab-pane label="全部" name=""></el-tab-pane>
          <el-tab-pane
            :label="tab.label"
            :name="tab.value"
            v-for="(tab, index) in DC_REVIEW_STAGE"
            :key="index"
          ></el-tab-pane>
        </el-tabs>
      </div>
      <el-button
        type="primary"
        icon="Plus"
        v-permission="{ id: 'DC_PDP_TR_LIST_ADD' }"
        @click="handleRouterAdd"
        >新增</el-button
      >
    </div>
    <el-form class="search-container" :model="queryParams" ref="queryRef" :inline="true">
      <div class="search">
        <div class="search-left">
          <el-form-item label="发起人" prop="createUser">
            <dc-select-user
              v-model="queryParams.createUser"
              placeholder="请选择发起人"
              :multiple="false"
              :multiple-limit="1"
            />
          </el-form-item>
          <el-form-item label="评审类型" prop="dimensionId">
            <el-select v-model="queryParams.dimensionId" placeholder="请选择评审类型" clearable>
              <el-option
                v-for="item in reviewTypeList"
                :key="item.dimensionName"
                :label="item.dimensionName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="发起时间" prop="reviewInitTime">
            <el-date-picker
              v-model="queryParams.reviewInitTime"
              type="daterange"
              start-placeholder="请选择"
              end-placeholder="请选择"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD 00:00:00"
            />
          </el-form-item>
        </div>
        <div class="search-right">
          <el-form-item>
            <el-button type="primary" @click="getData">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <div class="table-container" v-loading="loading">
      <el-table :data="tableData" :row-style="{ height: '48px' }" @row-dblclick="onRowDblClick">
        <el-table-column label="序号" width="100" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reviewProjectId" label="项目名称" min-width="200">
          <template #default="scoped">
            <dc-view v-model="scoped.row.reviewProjectId" objectName="pdpProject" />
          </template>
        </el-table-column>
        <el-table-column
          prop="dimensionName"
          label="评审类型"
          show-overflow-tooltip
          min-width="100"
        />

        <el-table-column
          prop="createUser"
          label="发起人"
          align="center"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="发起时间"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="reviewStage" label="状态" min-width="100">
          <template #default="scoped">
            <dc-dict :options="DC_REVIEW_STAGE" :value="scoped.row.reviewStage" />
          </template>
        </el-table-column>
        <el-table-column
          prop="reviewReviewee"
          label="受评人"
          min-width="100"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.reviewReviewee" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column
          prop="reviewRecordUser"
          label="记录人"
          min-width="100"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.reviewRecordUser" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column
          prop="reviewResult"
          label="评审细节及结论"
          min-width="120"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-dict type="text" :options="DC_REVIEW_RESULT" :value="scoped.row.reviewResult" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="140">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              v-if="
                [
                  '1866289940546142209',
                  '1866289986884812801',
                  '1866290036931248129',
                  '1868604812022956033',
                ].includes(scoped.row.reviewStage)
              "
              @click="handleEdit(scoped.row)"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              v-permission="{ id: 'DC_PDP_TR_LIST_DETAIL', row: scoped.row }"
              @click="handleDetail(scoped.row)"
              >查看</el-button
            >
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
</template>

<script setup name="MyClientsList">
import { getCurrentInstance, reactive, toRefs } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { proxy } = getCurrentInstance();

// 数据字典
const { DC_REVIEW_STAGE, DC_REVIEW_RESULT } = proxy.useCache([
  { key: 'DC_REVIEW_STAGE' },
  { key: 'DC_REVIEW_RESULT' },
]);

const data = reactive({
  loading: false,
  activeName: '',
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  tableData: [],
  reviewTypeList: [],
});

const { loading, queryParams, total, activeName, tableData, reviewTypeList } = toRefs(data);

onMounted(() => {
  getType();
  getData();
});

// 获取评审下拉列表
const getType = async () => {
  const res = await Api.pdp.dcReview.reviewType();
  const { code, data } = res.data;
  if (code === 200) {
    reviewTypeList.value = data;
  }
};

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.dcReview.list({
      ...queryParams.value,
      reviewInitTime: undefined,
      cycleTime: queryParams.value.reviewInitTime?.[0]
        ? [
            queryParams.value.reviewInitTime[0],
            queryParams.value.reviewInitTime[1].replace('00:00:00', '23:59:59'),
          ]
        : undefined,
    });
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

const onRowDblClick = row => {
  handleDetail(row);
};

/** 重置搜索 **/
const handleReset = () => {
  queryParams.value.current = 1;
  proxy.resetForm('queryRef');
  getData();
};

// tab切换方法
const handleClick = () => {
  queryParams.value.current = 1;
  queryParams.value.reviewStage = activeName.value;
  getData();
};

/** 查看 */
const handleDetail = row => {
  router.push({
    path: `/pdp/review/detail/${row.id}`,
  });
};

const handleEdit = row => {
  router.push({
    path: `/pdp/review/steps/${row.id}`,
  });
};
/** 新增 */
const handleRouterAdd = () => {
  router.push({
    path: '/pdp/review/start',
  });
};
</script>
<style lang="scss" scoped>
.content-warp {
  .ht {
    height: 70px;
  }
}
</style>
