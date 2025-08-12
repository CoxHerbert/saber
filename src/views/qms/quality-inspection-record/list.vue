<template>
  <basic-container>
    <div class="content-warp page-quality-inspection-record-list">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner"></div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          @selection-change="handleSelectionChange"
          @row-dblclick="rowDblClick"
        >
          <template v-for="(col, i) in columns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :align="col.align"
              :width="col.width"
            />
            <!-- 序号类型 -->
            <el-table-column
              v-else-if="col.type === 'index'"
              :key="'index' + i"
              label="序号"
              :align="col.align"
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
              <template #default="scoped">
                {{
                  [null, undefined, ''].includes(scoped.row[col.prop]) ? '-' : scoped.row[col.prop]
                }}
              </template>
            </el-table-column>
            <!-- 人员类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :label="col.label"
              :width="col.width"
              :align="col.align ? col.align : 'center'"
              prop="purchaserId"
            >
              <template #default="scoped">
                <dc-view
                  v-model="scoped.row[col.prop]"
                  :objectName="col.objectName"
                  :showKey="col.showKey"
                />
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
                <dc-dict
                  v-if="pageData[col.dictKey]"
                  type="text"
                  :options="pageData[col.dictKey]"
                  :value="scoped.row[col.prop]"
                ></dc-dict>
                <span v-else>-</span>
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
                  v-permission="{ id: btn.permissionId, row: scoped.row }"
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
  </basic-container>
</template>
<script setup>
import { reactive, toRefs } from 'vue';
import Api from '@/api/index';
import pageConfig from './utils';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchConfig = ref({
  searchItemConfig: {
    paramType: pageConfig.columns
      .filter(col => col.search)
      .reduce((rec, item) => {
        rec[item.prop] = {
          label: item.label,
          type: 'input',
          placeholder: `请输入${item.label}`,
          paramKey: item.prop,
        };
        return rec;
      }, {}),
  },
});

const pageData = reactive({
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  dataList: [],
  columns: pageConfig.columns,
  loading: false,
});

const { queryParams, loading, columns, dataList, total } = toRefs(pageData);
//;

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = {
    ...queryParams.value,
    materialNum: undefined,
    materialNumQuery: queryParams.value.materialNum,
  };
  const res = await Api.qms.sip.getInspectionRecordOrderList(dataparam);
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

const handleSearch = () => {
  getData();
};

const handleReset = () => {
  getData();
};

onMounted(() => {
  getData();
});

const rowDblClick = row => {
  router.push({
    path: '/qms/quality-inspection-record/detail',
    query: {
      id: row.id,
    },
  });
};

const doAction = (action, scoped) => {
  if (action === 'detail') {
    router.push({
      path: '/qms/quality-inspection-record/detail',
      query: {
        id: scoped.row.id,
      },
    });
  }
};
</script>
<style lang="scss" scoped>
.page-quality-inspection-record-list {
  .header {
    padding-bottom: 6px;
    border-bottom: none;
  }
}
</style>
