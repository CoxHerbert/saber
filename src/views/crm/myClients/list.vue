<template>
  <div class="content-warp page-myClients-list">
    <div class="header">
      <div class="title">客户</div>
      <div class="search-area">
        <dc-search-group :config="searchConfig" @search="handleSearch" />
      </div>
    </div>
    <div ref="content" class="content-body">
      <dc-drag-panel :height="treeHeight + 'px'">
        <template #left>
          <div class="query-tree">
            <el-scrollbar :height="treeHeight + 'px'">
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
                icon="Plus"
                @click="handleAdd"
                v-permission="{
                  id: 'CUSTOMER_ADD',
                }"
                >新增客户</el-button
              >
              <el-button
                icon="Delete"
                @click="handleBatchDelete"
                v-permission="{
                  id: 'CUSTOMER_BATCH_DEL',
                }"
                >批量删除</el-button
              >
            </div>
            <div class="table-container">
              <el-table
                :data="tableData"
                @selection-change="handleSelectionChange"
                :height="treeHeight - 100 + 'px'"
                @row-dblclick="handleRowDblClick"
              >
                <el-table-column type="selection" width="55" />

                <el-table-column
                  prop="fullname"
                  label="客户全称"
                  align="left"
                  min-width="220"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="customerCode"
                  label="客户编码"
                  align="center"
                  width="100"
                  show-overflow-tooltip
                >
                  <template #default="scoped">{{ scoped.row.customerCode || '-' }}</template>
                </el-table-column>
                <!-- <el-table-column
                  prop="legalPerson"
                  label="法定代表人"
                  align="center"
                  width="100"
                  show-overflow-tooltip
                /> -->
                <el-table-column
                  prop="customerDesc"
                  label="客户描述"
                  align="center"
                  min-width="160"
                  show-overflow-tooltip
                />

                <el-table-column
                  prop="cusCategory"
                  label="客户分类"
                  align="center"
                  min-width="100"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-dict :options="DC_CRM_CUS_CATEGORY" :value="scoped.row.cusCategory" />
                  </template>
                </el-table-column>

                <el-table-column
                  prop="staffSize"
                  label="人员规模"
                  align="center"
                  min-width="100"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-dict :options="DC_CRM_CUS_STAFF_SIZE" :value="scoped.row.staffSize" />
                  </template>
                </el-table-column>

                <el-table-column
                  prop="cusLevel"
                  label="客户级别"
                  align="center"
                  min-width="100"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-dict :options="DC_CRM_CUS_LEVEL" :value="scoped.row.cusLevel" />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="isCm"
                  label="是否CM厂商"
                  align="center"
                  min-width="100"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    {{ scoped.row.isCm ? '是' : '否' }}
                  </template>
                </el-table-column>

                <el-table-column
                  prop="createStatus"
                  label="当前状态"
                  align="center"
                  min-width="100"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-dict :options="DC_CUMMON_CREATE_STATUS" :value="scoped.row.createStatus" />
                  </template>
                </el-table-column>

                <el-table-column
                  prop="cusShareType"
                  label="共享方式"
                  align="center"
                  min-width="80"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-dict :options="DC_CRM_CUS_SHARE_TYPE" :value="scoped.row.cusShareType" />
                  </template>
                </el-table-column>

                <!-- <el-table-column
                  prop="runningStatus"
                  label="经营状态"
                  align="center"
                  width="100"
                  show-overflow-tooltip
                /> -->

                <el-table-column
                  prop="personInChargeUser"
                  label="负责人"
                  align="center"
                  min-width="80"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-view
                      v-model="scoped.row.personInChargeUser"
                      objectName="user"
                      showKey="realName"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  label="创建时间"
                  align="center"
                  min-width="140"
                  show-overflow-tooltip
                >
                  <template #default="scoped"> {{ scoped.row.createTime }}</template>
                </el-table-column>

                <el-table-column label="操作" align="center" fixed="right" min-width="150">
                  <template #default="scoped">
                    <el-button
                      link
                      type="primary"
                      v-permission="{ id: 'CUSTOMER_EDIT', row: scoped.row }"
                      @click="handleUpdate(scoped.row)"
                      v-if="scoped.row.createStatus === '1862658115265175553'"
                    >
                      去完善
                    </el-button>

                    <el-button
                      link
                      type="primary"
                      v-permission="{ id: 'CUSTOMER_EDIT', row: scoped.row }"
                      @click="handleUpdate(scoped.row)"
                      v-else
                    >
                      修改
                    </el-button>
                    <el-button
                      link
                      type="primary"
                      @click="handleDelete(scoped.row)"
                      v-if="userInfo.role_name.includes('admin')"
                      v-permission="{ id: 'DC_CRM_DELETE', row: scoped.row }"
                      >删除
                    </el-button>
                    <el-button
                      link
                      type="primary"
                      @click="handleDetail(scoped.row)"
                      v-if="scoped.row.createStatus !== '1862658115265175553 '"
                      v-permission="{ id: 'CUSTOMER_DETAIL', row: scoped.row }"
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

<script setup name="MyClientsList">
import { reactive, toRefs, computed } from 'vue';
import Api from '@/api/index';
import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const { proxy } = getCurrentInstance();

// 数据字典
const {
  DC_CRM_CUS_CATEGORY,
  DC_CRM_CUS_LEVEL,
  DC_CRM_CUS_SHARE_TYPE,
  DC_CRM_CUS_STAFF_SIZE,
  DC_CUMMON_CREATE_STATUS,
} = proxy.useCache([
  { key: 'DC_CRM_CUS_CATEGORY' },
  { key: 'DC_CRM_CUS_LEVEL' },
  { key: 'DC_CRM_CUS_SHARE_TYPE' },
  { key: 'DC_CRM_CUS_STAFF_SIZE' },
  { key: 'DC_CUMMON_CREATE_STATUS' },
]);

const data = reactive({
  loading: true,
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  tableData: [],
  searchConfig: {
    paramType: {
      cusLevel: {
        label: '客户级别',
        type: 'select',
        options: DC_CRM_CUS_LEVEL,
        paramKey: 'cusLevel',
      },
      fullname: {
        label: '客户全称',
        type: 'input',
        paramKey: 'fullname',
      },
    },
  },
  batchDelete: [],
});

const { loading, queryParams, total, tableData, searchConfig, batchDelete } = toRefs(data);

// 树妆列表
const treeData = computed(() => {
  return [
    {
      label: '全部',
    },
    {
      label: '客户分类',
      children: DC_CRM_CUS_CATEGORY,
    },
    {
      label: '客户级别',
      children: DC_CRM_CUS_LEVEL,
    },
    {
      label: '共享方式',
      children: DC_CRM_CUS_SHARE_TYPE,
    },
    {
      label: '当前状态',
      children: DC_CUMMON_CREATE_STATUS,
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

const store = useStore();

const userInfo = computed(() => store.getters.userInfo);

/** 查询参数列表 */
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.crm.customer.getCustomerList(queryParams.value);
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
    name: '新增客户',
    params: { id: 'create' },
  });
};

/** 修改按钮操作 */
const handleUpdate = row => {
  router.push({
    name: '编辑客户',
    params: { id: row.id },
  });
};

/**  进入详情操作*/
const handleDetail = row => {
  router.push({
    name: '客户详情',
    path: 'myClientsDetail',
    params: { id: row.id },
  });
};

// 删除and批量删除接口
const handleDeleteCommon = (ids, message, deleteApi) => {
  proxy
    .$confirm(message)
    .then(async () => {
      const configIds = { ids };
      await deleteApi(configIds); // 调用传入的删除接口
    })
    .then(() => {
      getData(); // 更新数据
      proxy.$message.success('删除成功');
    })
    .catch(() => {
      // 错误处理
    });
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

// 双击行数据
const handleRowDblClick = row => {
  const hasPermission = proxy.hasPermissionCommon('CUSTOMER_DETAIL', row);
  if (!hasPermission) {
    proxy.$message.error('当前用户无编辑权限');
    return;
  } else {
    handleDetail(row);
    // handleUpdate(row);
  }
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = row.id;
  const message = `是否确认删除选中的数据项？`;
  handleDeleteCommon(configIds, message, Api.crm.customer.deleteCustomerRemove);
};

/** 批量删除 */
const handleBatchDelete = () => {
  if (batchDelete.value.length === 0) {
    proxy.$message.error('请选择要删除的客户');
    return;
  }
  const ids = batchDelete.value.map(item => item.id).join(',');
  const message = `是否确认删除选中的数据项？`;
  handleDeleteCommon(ids, message, Api.crm.customer.deleteCustomerRemove);
};

/** 树状点击事件 */
// cusCategory; //客户分类
// cusLevel //客户级别
// cusShareType //共享方式
// createStatus  //当前状态
const handleNodeClick = node => {
  if (node.label === '全部') {
    (queryParams.value = {
      current: 1,
      size: 10,
    }),
      getData();
  } else {
    if (!node.code) return;
    const keys = ['cusCategory', 'cusLevel', 'cusShareType'];
    keys.forEach(key => (queryParams.value[key] = null));
    if (node.code === 'DC_CRM_CUS_CATEGORY') queryParams.value.cusCategory = node.id;
    if (node.code === 'DC_CRM_CUS_LEVEL') queryParams.value.cusLevel = node.id;
    if (node.code === 'DC_CRM_CUS_SHARE_TYPE') queryParams.value.cusShareType = node.id;
    if (node.code === 'DC_CUMMON_CREATE_STATUS') queryParams.value.createStatus = node.id;
    queryParams.value.current = 1;
    getData();
  }
};
</script>
<style lang="scss" scoped>
.page-myClients-list {
  .query-tree {
    width: 100%;
    border-right-color: transparent;
  }

  .search-area {
    width: calc(100% - 80px);
  }
}
</style>
