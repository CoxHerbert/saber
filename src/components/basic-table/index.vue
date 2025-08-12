<template>
  <div class="basic-table">
    <div class="header">
      <div class="title">{{ config.name }}</div>
    </div>

    <div class="body">
      <div class="tree" v-if="config.tree.isShow"></div>
      <div class="table">
        <el-form :inline="true">
          <el-form-item
            v-for="(el, i) in queryParams.filter"
            :key="i"
            :label="el.label"
            class="form-item"
          >
            <el-input v-model="el.value" :placeholder="`请输入${el.label}`" clearable />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="getData">查询</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="tableData" v-loading="loading" :show-header="config.table.showHeader">
          <el-table-column type="selection" width="55" v-if="config.table.hasCheck" />
          <el-table-column
            v-for="(el, i) in tableColumn"
            :key="i"
            :prop="el.field"
            :label="el.label"
            :fixed="el.fixed"
            :align="el.align"
            :width="el.width"
            :sortable="el.sortable"
            :show-overflow-tooltip="el.tooltip"
          />
        </el-table>
        <dc-pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.current"
          v-model:limit="queryParams.size"
          @pagination="getData"
        />
      </div>
    </div>
  </div>
</template>

<script setup name="basic-table">
import request from '@/axios';

const props = defineProps({
  config: {
    type: Object,
    default: {},
  },
});

const loading = ref(true);
const queryParams = ref({
  current: 1,
  size: 20,
  filter: [],
});
const total = ref(0);
const tableData = ref([]);
const tableColumn = ref([]);

onMounted(() => {
  init();
  getData();
});

const init = () => {
  const columns = props.config.table.columns;
  tableColumn.value = props.config.table.columns;
  queryParams.value.current = props.config.table.page.current;
  queryParams.value.size = props.config.table.page.size;
  queryParams.value.filter = columns
    .filter(item => item.filter)
    .map(el => ({
      field: el.field,
      label: el.label,
      value: null,
    }));
};

const getData = async () => {
  try {
    loading.value = true;
    const res = await request({
      url: props.config.table.apiPath,
      method: 'get',
      params: queryParams.value,
    });

    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss">
.basic-table {
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  overflow: auto;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  .header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #dadbe0;
    min-height: 40px;
    .title {
      font-weight: bold;
      font-size: 16px;
      color: #333333;
    }
  }

  .body {
    flex: 1;
    display: flex;

    .tree {
      width: 200px;
      border-right: 1px solid #dadbe0;
      height: 100%;
    }

    .table {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      padding: 16px;
      box-sizing: border-box;

      .el-table {
        width: 100%;
        height: 100%;
      }
      .pagination-container {
        margin-top: 10px;
      }
    }
  }
}
</style>
