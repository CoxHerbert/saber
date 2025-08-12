<template>
  <div class="content-warp page-businessOpportunities-list">
    <div class="header">
      <div class="title">商机</div>
      <div class="search-area">
        <dc-search-group :config="searchConfig" @search="handleSearch" />
      </div>
    </div>
    <div ref="content" class="content-body">
      <dc-drag-panel :height="treeHeight" :leftInitWidth="240">
        <template #left>
          <div class="query-tree">
            <el-scrollbar :height="treeHeight">
              <el-tree
                class="tree"
                :data="treeData"
                :props="{
                  children: 'children',
                  label: 'label',
                }"
                @node-click="handleNodeClick"
                :highlight-current="true"
                :default-expand-all="true"
              />
            </el-scrollbar>
          </div>
        </template>
        <template #right>
          <div class="content-area">
            <div class="operate-container">
              <el-button
                type="primary"
                v-permission="{ id: 'DC_CRM_CHANCE_LIST_ADD' }"
                icon="Plus"
                @click="handleAdd"
                >新增</el-button
              >
            </div>

            <div class="table-container">
              <el-table :data="dataList" @row-dblclick="onRowDblclick">
                <el-table-column
                  prop="oppsStatusId"
                  label="商机状态"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-dict :options="DC_CRM_OPPS_STATUS" :value="scoped.row.oppsStatusId" />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="oppsLevelId"
                  label="商机级别"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-dict :options="DC_CRM_OPPS_LEVEL" :value="scoped.row.oppsLevelId" />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="oppsName"
                  label="商机名称"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    {{ scoped.row.oppsName }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="customerId"
                  label="商机客户"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-view v-model="scoped.row.customerId" objectName="customer" />
                  </template>
                </el-table-column>
                <el-table-column prop="bdUserId" label="BD" align="center" show-overflow-tooltip>
                  <template #default="scoped">
                    <dc-view v-model="scoped.row.bdUserId" objectName="user" showKey="realName" />
                  </template>
                </el-table-column>
                <el-table-column prop="tpmUserId" label="TPM" align="center" show-overflow-tooltip>
                  <template #default="scoped">
                    <dc-view v-model="scoped.row.tpmUserId" objectName="user" showKey="realName" />
                  </template>
                </el-table-column>

                <el-table-column
                  prop="createTime"
                  label="登记时间"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    {{ scoped.row.createTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="oppsExpectedTransactionDate"
                  label="预计成交日期"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    {{ scoped.row.oppsExpectedTransactionDate }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createUser"
                  label="登记人"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="oppsOrgId"
                  label="所属组织"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-view v-model="scoped.row.oppsOrgId" objectName="org" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" fixed="right" width="180">
                  <template #default="scoped">
                    <el-button
                      link
                      type="primary"
                      v-permission="{ id: 'DC_CRM_CHANCE_LIST_GII', row: scoped.row }"
                      @click="handleUpdate(scoped.row)"
                      v-if="scoped.row.oppsStatusId === '1853703748035596289'"
                    >
                      去完善
                    </el-button>

                    <el-button
                      v-else
                      link
                      type="primary"
                      @click="handleUpdate(scoped.row)"
                      v-permission="{ id: 'DC_CRM_CHANCE_LIST_EDIT', row: scoped.row }"
                    >
                      修改
                    </el-button>
                    <el-button
                      link
                      type="primary"
                      @click="handleDelete(scoped.row)"
                      v-permission="{ id: 'DC_CRM_CHANCE_LIST_DEL', row: scoped.row }"
                      >删除</el-button
                    >
                    <el-button
                      link
                      type="primary"
                      @click="handleDetail(scoped.row)"
                      v-if="scoped.row.oppsStatusId !== '1853703748035596289'"
                      v-permission="{ id: 'DC_CRM_CHANCE_LIST_DETAIL', row: scoped.row }"
                      >详情
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
      </dc-drag-panel>
    </div>
  </div>
</template>

<script setup name="BusinessOpportunitiesList">
import { reactive, toRefs, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { onBeforeUnmount } from 'vue';

const router = useRouter();
const { proxy } = getCurrentInstance();

// 数据字典
const { DC_CRM_OPPS_STATUS, DC_CRM_OPPS_LEVEL, DC_CRM_OPPS_FROM, ORG_LIST_CACHE } = proxy.useCache([
  { key: 'DC_CRM_OPPS_STATUS' },
  { key: 'DC_CRM_OPPS_LEVEL' },
  { key: 'DC_CRM_OPPS_FROM' },
  { key: 'ORG_LIST_CACHE' },
]);

const data = reactive({
  loading: true,
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  dataList: [],
  searchConfig: {
    paramType: {
      oppsLevelId: {
        label: '商机级别',
        type: 'select',
        options: DC_CRM_OPPS_LEVEL,
        paramKey: 'oppsLevelId',
      },
      oppsName: {
        label: '商机名称',
        type: 'input',
        paramKey: 'oppsName',
      },
      // customerId: {
      //   label: '商机客户',
      //   type: 'select',
      //   options: [],
      //   paramKey: 'customerId',
      // },
      // bdUserId: {
      //   label: 'BD',
      //   type: 'select',
      //   options: [],
      //   paramKey: 'bdUserId',
      // },
      // tpmUserId: {
      //   label: 'TPM',
      //   type: 'select',
      //   options: [],
      //   paramKey: 'tpmUserId',
      // },
    },
  },
});

const { loading, queryParams, total, dataList, searchConfig } = toRefs(data);

// 树妆列表
const treeData = computed(() => {
  return [
    {
      label: '商机状态',
      children: DC_CRM_OPPS_STATUS,
    },
    {
      label: '商机来源',
      children: DC_CRM_OPPS_FROM,
    },
    {
      label: '所属组织',
      children: ORG_LIST_CACHE,
    },
  ];
});

// content dom元素
const content = ref(null);
// 用于存储高度
const contentHeight = ref('auto');

// 计算出侧边栏最大可用高度
const treeHeight = computed(() => {
  return contentHeight.value !== 'auto' ? contentHeight.value - 20 : 'auto';
});
/**
 * 计算高低
 */
const calcContentheight = () => {
  contentHeight.value = content.value.offsetHeight;
};

/**
 * 尺寸变化回调
 */
const resizeCallback = () => {
  calcContentheight();
};

/** 绑定window resize */
const bindWindowEvent = () => {
  window.addEventListener('resize', resizeCallback);
};

/** 解除绑定window resize */
const unBindWindowEvent = () => {
  window.removeEventListener('resize', resizeCallback);
};

onMounted(() => {
  getData();
  setTimeout(() => {
    calcContentheight();
    bindWindowEvent();
  }, 10);
});

onBeforeUnmount(() => {
  unBindWindowEvent();
});

/** 查询参数列表 */
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.crm.opps.getOppsList(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
const handleSearch = params => {
  queryParams.value = {
    ...queryParams.value,
    ...params,
  };
  getData();
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({
    name: '新建商机',
    path: '/crm/businessOpportunities/create',
  });
};

/** 修改按钮操作 */
const handleUpdate = row => {
  router.push({
    name: '编辑商机',
    path: '/crm/businessOpportunities/edit',
    params: { id: row.id },
  });
};

const onRowDblclick = row => {
  handleDetail(row);
};

/**  进入详情操作*/
const handleDetail = row => {
  router.push({
    name: '商机详情',
    path: 'oppDetail',
    params: { id: row.id },
  });
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = { ids: row.id };
  proxy
    .$confirm('是否确认删除参数编号为"' + configIds.ids + '"的数据项？')
    .then(async () => {
      return await Api.crm.opps.DeleteOppsRemove(configIds);
    })
    .then(() => {
      getData();
      proxy.$message.success('删除成功');
    })
    .catch(() => {});
};

/** 树状点击事件 */
// oppsStatusId; //商机状态
// fromId; // 商机来源
// oppsOrgId; //所属组织
const handleNodeClick = node => {
  if (!node.code) return;
  const keys = ['oppsStatusId', 'fromId', 'oppsOrgId'];
  keys.forEach(key => (queryParams.value[key] = null));
  if (node.code === 'DC_CRM_OPPS_STATUS') queryParams.value.oppsStatusId = node.id;
  if (node.code === 'DC_CRM_OPPS_FROM') queryParams.value.fromId = node.id;
  if (node.code === 'ORG_LIST_CACHE') queryParams.value.oppsOrgId = node.id;
  queryParams.value.current = 1;
  getData();
};
</script>
<style lang="scss" scoped>
.page-businessOpportunities-list {
  .query-tree {
    width: 100%;
    border-right-color: transparent;
  }

  .search-area {
    width: calc(100% - 80px);
  }
}
</style>
