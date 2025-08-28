<template>
  <div class="list-page page-warehous-entry-index">
    <!-- 入库单 -->
    <div class="header">
      <div class="title">
        <el-tabs v-model="applyStatus" @tab-click="handleClick">
          <el-tab-pane label="全部" name=""> </el-tab-pane>
          <el-tab-pane
            :label="item.label"
            :name="item.dictKey"
            v-for="(item, index) in DC_WMS_IN_STATUS"
            :key="index"
          ></el-tab-pane>
        </el-tabs>
      </div>
      <div class="search-area">
        <dc-search-group :config="searchConfig" @search="handleSearch">
          <template #btn-sub="scoped">
            <el-button @click="handleReset(scoped)">重置</el-button></template
          >
        </dc-search-group>
      </div>
    </div>
    <div class="action-banner">
      <el-button
        type="primary"
        icon="el-icon-plus"
        v-permission="{ id: 'WAREHOUSE_ENTRY_ADD' }"
        @click="handleClickAdd"
        >新增入库单</el-button
      >
    </div>
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="dataList"
        @selection-change="handleSelectionChange"
        @row-dblclick="handleRowDblClick"
      >
        <template v-for="(col, i) in columns">
          <!-- 多选 -->
          <el-table-column
            v-if="col.type === 'selection'"
            :key="i"
            type="selection"
            :width="col.width"
          />
          <!-- 序号类型 -->
          <el-table-column
            v-else-if="col.type === 'index'"
            :key="'index' + i"
            label="序号"
            :width="col.width"
          >
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <!-- 普通文字类型 -->
          <el-table-column
            v-else-if="col.type === 'rowText'"
            :key="'rowText' + i"
            :label="col.label"
            :width="col.width"
            :prop="col.prop"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
          </el-table-column>
          <!-- 人员类型 -->
          <el-table-column
            v-else-if="col.type === 'dc-view'"
            :label="col.label"
            :align="col.align ? col.align : 'center'"
            prop="purchaserId"
          >
            <template #default="scoped">
              <dc-view
                :modelValue="
                  [null, undefined, ''].includes(scoped.row[col.prop])
                    ? undefined
                    : `${scoped.row[col.prop]}`
                "
                :objectName="col.objectName"
                :showKey="col.showKey"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.type === 'dc-dict'"
            :key="'dc-dict' + i"
            :label="col.label"
            :width="col.width"
            :prop="col.prop"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-dict :value="scoped.row[col.prop]" :options="dictCache[col.dictKey].value" />
            </template>
          </el-table-column>
          <!-- 字典类型 -->
          <el-table-column
            v-else-if="col.type === 'dict'"
            :key="'dict' + i"
            :label="col.label"
            :width="col.width"
            :prop="col.prop"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-dict-key :value="scoped.row[col.prop]" :options="dictCache[col.dictKey].value" />
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.type === 'actions'"
            :key="'option' + i"
            :fixed="col.fixed"
            :label="col.label"
            :width="col.width ? col.width : 180"
            :align="col.align ? col.align : 'center'"
          >
            <template #default="scoped">
              <el-button
                v-for="(btn, j) in col.children"
                :key="j"
                link
                v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                v-permission="
                  !btn.showFunc || (btn.showFunc && btn.showFunc(scoped))
                    ? { id: btn.permissionId, row: scoped.row }
                    : undefined
                "
                type="primary"
                @click="doAction(btn.action, scoped)"
                >{{ btn.label }}</el-button
              >
            </template>
          </el-table-column>
        </template>
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
<script setup name="page-warehous-entry-index">
import { onMounted, ref } from 'vue';
import Api from '@/api/index';
import options from './utils';
import { useRouter } from 'vue-router';

const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  columns: options.columns,
  queryParams: {
    keyword: '',
    current: 1,
    size: 10,
  },
  batchDelete: [],
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  applyStatus: '',
});

const dictCache = proxy.useCache([
  // { key: 'DC_WMS_IN_TYPE' },
  { key: 'DC_WMS_IN_TYPE_SCM' },
  { key: 'SCMORG_LIST_CACHE' },
  // { key: 'DC_SCM_IN_STOCK_AUDIT_STATUS' },
  { key: 'DC_WMS_IN_STATUS' },
  // { key: 'DC_FLAG_STATUS' },
]);

const {
  // DC_WMS_IN_TYPE,
  DC_WMS_IN_TYPE_SCM,
  // DC_FLAG_STATUS,
  DC_WMS_IN_STATUS,
  // DC_SCM_IN_STOCK_AUDIT_STATUS,
} = dictCache;

const { batchDelete, queryParams, dataList, loading, total, applyStatus, columns } = toRefs(data);
const searchConfig = ref({
  paramType: {
    // keyword: {
    //   label: '默认',
    //   type: 'input',
    //   placeholder: '请输入关键词搜索',
    //   paramKey: 'keyword',
    // },
    inType: {
      label: '入库类型',
      type: 'select',
      options: DC_WMS_IN_TYPE_SCM,
      labelKey: 'dictValue',
      placeholder: '请选择入库类型',
      valueKey: 'dictKey',
      paramKey: 'inType',
    },
    inStockCode: {
      label: '入库单号',
      type: 'input',
      placeholder: '请输入入库单号',
      paramKey: 'inStockCode',
    },
    mtono: {
      label: '专案号',
      type: 'input',
      placeholder: '请输入专案号',
      paramKey: 'mtono',
    },
  },
});
onMounted(() => {
  getData();
});

// 点击tab
const handleClick = e => {
  console.log(e.props.name);
  queryParams.value = {
    current: 1,
    size: 10,
    inStockStatus: e.props.name,
  };
  nextTick(() => {
    getData();
  });
};

/** 新增数据 */
const handleClickAdd = () => {
  doAction('add');
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

const handleRowDblClick = row => {
  doAction('detail', { row: row });
};

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  // 编辑
  if (action === 'edit') {
    router.push({
      path: '/scm/inventoryMng/warehousEntry/addorEdit',
      query: {
        id: row.id,
        type: 'edit',
      },
    });
    // 添加
  } else if (action === 'add') {
    router.push({
      path: '/scm/inventoryMng/warehousEntry/addorEdit',
      query: {
        type: 'add',
      },
    });
  } else if (action === 'audit') {
    router.push({
      path: '/scm/inventoryMng/warehousEntry/addorEdit',
      query: {
        id: row.id,
        type: 'audit',
      },
    });
  } else if (action === 'detail') {
    router.push({
      path: '/scm/inventoryMng/warehousEntry/addorEdit',
      query: {
        id: row.id,
        type: 'look',
      },
    });
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

const handleReset = scoped => {
  Object.keys(scoped.queryParams).forEach(key => {
    scoped.queryParams[key] = null;
  });
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.scm.wareHouse.getList(dataparam);
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
</script>
