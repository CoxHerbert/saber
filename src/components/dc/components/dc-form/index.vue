<template>
  <div class="app-container">
    <div class="body-container">
      <div class="operate-container">
        <el-button type="primary" @click="handleCreate">新增</el-button>
        <el-button type="danger" @click="handleDeletes">删除</el-button>
      </div>
      <div class="table-container">
        <el-table
          :data="tableData"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          row-key="id"
          height="100%"
        >
          <el-table-column type="selection" width="40" :reserve-selection="true" />
          <el-table-column label="序号" width="80" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-for="(column, index) in currentObject?.column || []"
            :prop="column?.prop"
            :label="column?.label"
            :align="column?.align || 'center'"
            :show-overflow-tooltip="!!column?.tooltip"
            :key="index"
          >
            <template #default="scoped">
              <dc-view
                v-model="scoped.row[column?.prop]"
                :objectName="column?.objectName"
                v-if="column?.component === 'dc-view'"
              />
              <span v-else>{{ scoped.row[column?.prop] }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="160"
            align="center"
            fixed="right"
            v-if="!!currentObject?.dialogEdit || !!currentObject?.dialogRemove"
          >
            <template #default="scoped">
              <el-button
                type="primary"
                text
                @click="handleEdit(scoped.row)"
                v-if="!!currentObject?.dialogEdit"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                text
                @click="handleRemove(scoped.row)"
                v-if="!!currentObject?.dialogRemove"
              >
                删除
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
  </div>
  <el-dialog :title="submitTitle" append-to-body v-model="openSubmit" width="800px">
    <avue-form :option="currentObject" v-model="formData" @submit="submitForm" />
  </el-dialog>
</template>

<script setup>
import { reactive, toRefs } from 'vue';
import cacheData from './../../constant/cacheData';
const { proxy } = getCurrentInstance();
const props = defineProps({
  // 类的名称
  objectName: {
    type: String,
    default: '',
    validator: value => Object.keys(cacheData).includes(value),
  },
  // 查询参数
  params: {
    type: Object,
    default: null,
  },
});
const componentData = reactive({
  open: false,
  // 总条数
  total: 0,
  // 查询参数
  queryParams: {
    current: 1,
    size: 20,
  },
  // 列表数据
  tableData: [],
  // 创建弹窗
  openSubmit: false,
  // 提交弹窗标题
  submitTitle: '',
  // 表单
  formData: {},
  // 选中行的id
  ids: [],
});
const { total, queryParams, tableData, openSubmit, submitTitle, formData, ids } =
  toRefs(componentData);

const currentObject = computed(() => cacheData[props.objectName]);

onMounted(() => {
  getData();
});

// 获取数据
const getData = async () => {
  const res = await currentObject.value?.dialogGet({ ...queryParams.value, ...props.params });
  const { code, data: resData } = res.data;
  if (code === 200) {
    tableData.value = resData?.records || resData;
    total.value = resData?.total || 0;
  }
};
// 处理创建
const handleCreate = () => {
  submitTitle.value = `创建${currentObject.value?.submitTitle}`;
  openSubmit.value = true;
};
// 处理编辑
const handleEdit = row => {
  submitTitle.value = `编辑${currentObject.value?.submitTitle}`;
  if (Array.isArray(currentObject.value?.column)) {
    currentObject.value.column.forEach(({ prop }) => (formData.value[prop] = row[prop]));
  }
  formData.value.id = row.id;
  openSubmit.value = true;
};
// 处理删除
const handleRemove = row => {
  const ids = row.id;
  proxy
    .$confirm(`确认是否删除"${row[currentObject.value?.defaultLabel]}"为的数据项？`)
    .then(async () => {
      return await currentObject.value?.dialogRemove({ ids });
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};
// 处理多选的删除
const handleDeletes = () => {
  const selectedIds = ids.value.join(',');
  proxy
    .$confirm(`确认是否删除"${selectedIds}"为的数据项？`)
    .then(async () => {
      return await currentObject.value?.dialogRemove({ ids: selectedIds });
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};
// 表单提交
const submitForm = async (form, done) => {
  const res = await currentObject.value?.dialogCreate(form);
  const { code } = res.data;
  if (code === 200) {
    proxy.$message.success('提交成功');
    getData();
  }
  openSubmit.value = false;
  done();
};
// 点击某一行
const handleRowClick = row => {};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  ids.value = selection.map(item => item.id);
};
</script>
<style lang="scss">
@use '../../styles/select-dialog.scss';
</style>
