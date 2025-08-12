<template>
  <div class="content-warp">
    <el-tabs v-model="queryParams.feaStatus" @tab-change="handleClick">
      <el-tab-pane label="全部" :name="''"></el-tab-pane>
      <el-tab-pane
        :label="tab.label"
        :name="tab.value"
        v-for="(tab, index) in DC_FEA_STATUS"
        :key="index"
      ></el-tab-pane>
    </el-tabs>
    <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          :model="queryParams"
          ref="queryRef"
          :inline="true"
          @keyup.enter="handleQuery"
        >
          <el-form-item label="评估名称" prop="feaName">
            <el-input v-model="queryParams.feaName" placeholder="请输入评估名称" clearable />
          </el-form-item>
          <el-form-item label="创建人" prop="createUser">
            <dc-select-user
              v-model="queryParams.createUser"
              placeholder="请选择创建人"
              returnType="string"
              :multiple="false"
              :multiple-limit="1"
            />
          </el-form-item>
          <el-form-item label="评估类型" prop="feaType">
            <el-select v-model="queryParams.feaType" placeholder="请选择评估类型" clearable>
              <el-option
                v-for="item in DC_FEA_TYPE"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="发起时间" prop="startTime">
            <el-date-picker
              v-model="queryParams.startTime"
              type="date"
              placeholder="请选择发起时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-form-item class="form-item-actions">
          <el-button type="primary" @click="getData">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </div>
    </div>
    <div class="operate-container">
      <el-button
        type="primary"
        v-permission="{ id: 'DC_PDP_FEAS_LIST_ADD' }"
        @click="handleRouterAdd"
        >发起可行性评估</el-button
      >
    </div>
    <div class="table-container">
      <el-table :data="tableData" :row-style="{ height: '48px' }">
        <el-table-column label="序号" width="60" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="feaName" label="评估名称" min-width="160" show-overflow-tooltip />
        <el-table-column
          prop="createUser"
          label="创建人"
          align="center"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
          </template>
        </el-table-column>
        <el-table-column
          prop="documentTime"
          label="单据日期"
          min-width="160"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column prop="feaType" label="评估类型" min-width="120">
          <template #default="scoped">
            <dc-dict :options="DC_FEA_TYPE" :value="scoped.row.feaType" />
          </template>
        </el-table-column>
        <el-table-column prop="feaStatus" label="当前状态" min-width="160">
          <template #default="scoped">
            <div :class="getClass(scoped.row.feaStatus)">
              <dc-dict :options="DC_FEA_STATUS" :value="scoped.row.feaStatus" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="feaStatus" label="是否通过" min-width="160">
          <template #default="scoped">
            <dc-dict :options="DC_FEA_FEASIBILITY" :value="scoped.row.feaFianlResult" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="140">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              @click="handleDetail(scoped.row)"
              v-permission="{ id: 'DC_PDP_FEAS_LIST_DETAIL', row: scoped.row }"
              >查看
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
</template>

<script setup name="MyClientsList">
import { getCurrentInstance, reactive, toRefs } from 'vue';
import Api from '@/api';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { proxy } = getCurrentInstance();

// 数据字典
const { DC_FEA_STATUS, DC_FEA_TYPE, DC_FEA_FEASIBILITY } = proxy.useCache([
  { key: 'DC_FEA_STATUS' },
  { key: 'DC_FEA_TYPE' },
  { key: 'DC_FEA_FEASIBILITY' },
]);

const data = reactive({
  loading: true,
  queryParams: {
    feaStatus: '',
    current: 1,
    size: 10,
  },
  total: 0,
  tableData: [],
});

const { loading, queryParams, total, tableData } = toRefs(data);

onMounted(() => {
  getData();
});

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.dcFea.list({
      feaStatus: queryParams.value.feaStatus ? queryParams.value.feaStatus : undefined,
      current: queryParams.value.current,
      size: queryParams.value.size,
      startTime: queryParams.value.startTime,
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

// 获取class名称
const getClass = stateId => {
  if (stateId === '1856617546025967618') return 'process-state_finish';
  if (stateId === '1856617500593266689') return 'process-state_processing';
};

/** 搜索 **/
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
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
  getData();
};

/** 编辑 */
const handleDetail = row => {
  router.push({
    path: `/pdp/feasibility/steps/${row.id}`,
  });
};

/** 新增 */
const handleRouterAdd = () => {
  router.push({
    path: '/pdp/feasibility/steps/create',
  });
};
</script>
<style lang="scss" scoped>
.process-state_finish {
  color: #23c69f;
}
.process-state_processing {
  color: #e12137;
}
</style>
