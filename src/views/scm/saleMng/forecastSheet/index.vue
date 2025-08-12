<template>
  <basic-container>
    <div class="content-warp">
      <div class="header">
        <div class="title">
          <el-tabs v-model="applyStatus" @tab-click="handleClick">
            <el-tab-pane
              :label="item.label"
              :name="item.value"
              v-for="(item, index) in statusList"
              :key="index"
            ></el-tab-pane>
          </el-tabs>
        </div>
        <div class="search-area">
          <el-button
            type="primary"
            v-permission="{ id: 'FORECAST_SHEET_ADD' }"
            icon="el-icon-plus"
            @click="handleAddEdite"
            >新增预测单
          </el-button>
        </div>
      </div>

      <div class="search">
        <div class="search-left">
          <el-form :model="queryParams" ref="queryRef" :inline="true" @keyup.enter="handleQuery">
            <el-form-item label="单据编号" prop="no">
              <el-input
                type="text"
                v-model="queryParams.no"
                placeholder="请输入单据编号"
              ></el-input>
            </el-form-item>

            <el-form-item label="专案号" prop="mtono">
              <el-input
                type="text"
                v-model="queryParams.mtono"
                placeholder="请输入专案号"
              ></el-input>
            </el-form-item>

            <el-form-item label="单据类型" prop="billtypeDict">
              <el-select v-model="queryParams.billtypeDict" placeholder="请选择单据类型" clearable>
                <el-option
                  v-for="(item, index) in DC_SCM_FORECAST_TYPE"
                  :key="index"
                  :value="item.dictKey"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="日期" prop="date">
              <el-date-picker
                style="width: 100%"
                v-model="queryParams.date"
                type="date"
                placeholder="请选择日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                @click.stop
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="search-right">
          <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @row-dblclick="lookReport">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>

          <el-table-column label="组织" align="center" prop="orgId">
            <template #default="scoped">
              <dc-dict type="text" :options="SCMORG_LIST_CACHE" :value="scoped.row.orgId" />
            </template>
          </el-table-column>

          <el-table-column label="单据类型" align="center" prop="billtypeDict" width="100">
            <template #default="scoped">
              <dc-dict-key
                type="text"
                color="#666"
                :options="DC_SCM_FORECAST_TYPE"
                :value="scoped.row.billtypeDict"
              />
            </template>
          </el-table-column>

          <el-table-column label="单据编号" prop="no" align="center" show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            label="专案号"
            prop="mtono"
            width="110"
            align="center"
            show-overflow-tooltip
          >
          </el-table-column>
          <el-table-column label="日期" align="center" prop="date"> </el-table-column>
          <el-table-column label="收PO日期" align="center" prop="poDate">
            <template #default="scoped">
              {{ scoped.row.poDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="收PO跟进记录"
            align="center"
            prop="followRecord"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.followRecord || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="审批状态" align="center" prop="currentTask"> </el-table-column>
          <el-table-column label="流程状态" align="center" prop="processStatus">
            <template #default="scoped">
              <div
                class="status"
                :class="
                  scoped.row.processStatus == '开立'
                    ? 'pendApproval'
                    : scoped.row.processStatus == '审批中'
                    ? 'inApproval'
                    : scoped.row.processStatus == '审批结束'
                    ? 'finished'
                    : 'red'
                "
              >
                {{ scoped.row.processStatus }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                v-permission="{ id: 'FORECAST_SHEET_DETAIL', row: scoped.row }"
                @click="lookReport(scoped.row)"
                >查看</el-button
              >
              <el-button
                link
                type="primary"
                @click="handleAddEdite(scoped.row)"
                v-if="scoped.row.processStatus == '开立' && scoped.row.createUser == userId"
                v-permission="{ id: 'FORECAST_SHEET_EDIT', row: scoped.row }"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                v-if="scoped.row.processStatus == '开立' && scoped.row.createUser == userId"
                v-permission="{ id: 'FORECAST_SHEET_DEL', row: scoped.row }"
                @click="handleDelete(scoped.row)"
                >删除</el-button
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
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
const store = useStore();
const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  statusList: [
    {
      label: '全部',
      value: '全部',
    },
    {
      label: '未审核',
      value: '审批中',
    },
    {
      label: '已审核',
      value: '审批结束',
    },
  ],
  applyStatus: '全部',
  userId: store.getters.userInfo.user_id,
});

const { queryParams, dataList, loading, total, statusList, applyStatus, userId } = toRefs(data);
// 数据字典
const { SCMORG_LIST_CACHE, DC_SCM_FORECAST_TYPE } = proxy.useCache([
  { key: 'SCMORG_LIST_CACHE' },
  { key: 'DC_SCM_FORECAST_TYPE' },
]);
onMounted(() => {
  getData();
});

// 点击tab
const handleClick = e => {
  console.log(e.props.name);
  applyStatus.value = e.props.name;
  queryParams.value = {
    current: 1,
    size: 10,
    processStatus: e.props.name == '全部' ? null : e.props.name,
  };
  nextTick(() => {
    getData();
  });
};

// 添加修改
const handleAddEdite = row => {
  router.push({
    path: '/scm/saleMng/forecastSheet/addorEdite',
    query: {
      id: row.id,
    },
  });
};

// 详情
const lookReport = row => {
  router.push({
    path: '/scm/saleMng/forecastSheet/addorEdite',
    query: {
      id: row.id,
      type: 'look',
    },
  });
};

// 删除
const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将 [${ids}] 数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      return Api.scm.forecastSheet.remove(ids);
    })
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '删除成功!',
      });
      getData();
    });
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  // dataparam.createUser = userId.value;
  const res = await Api.scm.forecastSheet.getList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
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
  };
  proxy.resetForm('queryRef');
  getData();
};
</script>

<style scoped lang="scss">
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      height: 50px;
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}

:deep(.el-tabs__nav-wrap):after {
  height: 0px !important;
}

:deep(.el-tabs__item) {
  height: 52px !important;
}
</style>
