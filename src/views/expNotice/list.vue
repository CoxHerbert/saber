<template>
  <basic-container>
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="通知名称" prop="settingTypeName" style="width: 200px">
        <el-select v-model="queryParams.settingTypeName" placeholder="请选择通知名称" clearable>
          <el-option
            v-for="(item, index) in DC_EXPNOTICE_TYPE"
            :key="index"
            :value="item.label"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="专案号" prop="mtono">
        <el-input
          v-model="queryParams.mtono"
          style="width: 120px"
          placeholder="请输入专案号"
          clearable
        />
      </el-form-item>
      <el-form-item label="编码" prop="noticeCode">
        <el-input
          v-model="queryParams.noticeCode"
          style="width: 120px"
          placeholder="请输入通知唯一编码"
          clearable
        />
      </el-form-item>
      <el-form-item label="通知阶段" prop="noticePhase" style="width: 200px">
        <el-select v-model="queryParams.noticePhase" placeholder="请选择通知阶段" clearable>
          <el-option
            v-for="(item, index) in noticePhaseList"
            :key="index"
            :value="item"
            :label="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- <div class="operate-container">
      <el-button type="primary" icon="CirclePlus" @click="handleAdd">新增</el-button>
    </div> -->

    <div class="table-container">
      <el-table v-loading="loading" :data="dataList">
        <el-table-column label="序号" width="60" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="90px"
          label="通知名称"
          align="center"
          prop="settingTypeName"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column min-width="80px" label="专案号" align="center" prop="mtono">
        </el-table-column>
        <el-table-column min-width="90px" label="物料/单号" align="center" prop="noticeCode">
        </el-table-column>
        <el-table-column min-width="40px" label="超时" align="center" prop="delayTimeInSeconds">
        </el-table-column>
        <el-table-column min-width="40px" label="阶段" align="center" prop="noticePhase">
        </el-table-column>
        <el-table-column min-width="120px" label="通知时间" align="center" prop="messageTime">
        </el-table-column>
        <el-table-column min-width="120px" label="最新通知人" align="center">
          <template #default="scope">
            {{ scope.row.latestMessageReceiverNames || scope.row.latestMessageReceiver }}
          </template>
        </el-table-column>

        <el-table-column
          min-width="120px"
          label="通知内容"
          align="center"
          prop="messageContent"
          show-overflow-tooltip
        />
        <!-- <el-table-column label="操作" align="center" width="300">
          <template #default="scoped">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scoped.row)"
              >删除</el-button
            >
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';

import {
  getExpectionNoticeList,
  removeExpectionNotice,
  getTenantList,
} from '@/api/system/expNotice';

const { proxy } = getCurrentInstance();

const data = reactive({
  tenantList: [],
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  loading: true,
  total: 0,
  noticePhaseList: [1, 2, 3, 4],
});

const { queryParams, dataList, loading, total, noticePhaseList } = toRefs(data);

// 数据字典
const { DC_EXPNOTICE_TYPE } = proxy.useCache([{ key: 'DC_EXPNOTICE_TYPE' }]);

onMounted(() => {
  getData();
  getTenantListFn();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await getExpectionNoticeList(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
      delayTimeInSeconds: parseFloat(record.delayTimeInSeconds / 3600).toFixed(2),
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
    workGroupName: undefined,
    areaName: undefined,
    chargePerson: undefined,
  };
  proxy.resetForm('queryRef');
  getData();
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = [row.id];
  proxy
    .$confirm('是否确认删除此数据项？')
    .then(async () => {
      return removeExpectionNotice(configIds);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 获取租户列表
const getTenantListFn = () => {
  getTenantList().then(res => {
    if (res.data.code === 200) {
      data.tenantList = res.data.data;
    }
  });
};
</script>
