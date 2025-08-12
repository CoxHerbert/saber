<template>
  <span class="add-plan" @click="addChildPlan">
    <el-icon class="plus-icon"><Plus /></el-icon>快速添加子需求
  </span>

  <el-table :data="planData" max-height="288px">
    <el-table-column width="20" type="">
      <template #default="scoped">
        <el-popover
          placement="bottom-start"
          :width="112"
          trigger="click"
          popper-style="padding-left: 0;padding-right: 0;"
        >
          <template #reference>
            <el-icon class="more-filled"><MoreFilled /></el-icon>
          </template>
          <ul class="list-group">
            <li class="list-item" @click="handleSave(scoped.row, '1866034013076316162')">
              <div class="list-item_name">计划下达</div>
            </li>
            <li class="list-item" @click="removePlan(scoped.row)">
              <div class="list-item_name">删除计划</div>
            </li>
          </ul>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column prop="planName" label="任务" width="160">
      <template #default="scoped">
        <el-input v-model="scoped.row.planName" placeholder="计划名称" v-if="scoped.row.isEdit" />
        <span v-else>{{ scoped.row.planName }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="handlePersonName" label="处理人" width="140" align="center">
      <template #default="scoped">
        <dc-select-user
          v-model="scoped.row.handlePersonId"
          placeholder="请选择处理人"
          :multiple="false"
          :multiple-limit="1"
          :disabled="!scoped.row.isEdit"
        />
      </template>
    </el-table-column>
    <el-table-column prop="businessCategoryId" label="计划类型" width="100" align="center">
      <template #default="scoped">
        <el-select
          v-model="scoped.row.businessCategoryId"
          placeholder="请选择"
          @change="getOptions"
          v-if="scoped.row.isEdit"
        >
          <el-option
            :label="dict.label"
            :value="dict.id"
            v-for="dict in DC_PMS_TEMPITEM_TYPE"
            :key="dict"
          />
        </el-select>
        <span v-else>
          <dc-dict :options="DC_PMS_TEMPITEM_TYPE" :value="scoped.row.businessCategoryId" />
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="businessType" label="业务名称" width="120" align="center">
      <template #default="scoped">
        <el-select
          v-model="scoped.row.businessType"
          placeholder="请选择"
          @change="changeOption"
          v-if="scoped.row.isEdit"
        >
          <el-option
            v-for="(option, index) in processCorrelationOptions"
            :label="option.businessTypeName"
            :value="option.id"
            :key="index"
          />
        </el-select>
        <span v-else>
          <dc-view
            v-model="scoped.row.businessType"
            objectName="processCorrelation"
            showKey="businessTypeName"
          />
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="startDate" label="开始日期" width="140" align="center">
      <template #default="scoped">
        <el-date-picker
          v-model="scoped.row.startDate"
          type="date"
          placeholder="开始日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          v-if="scoped.row.isEdit"
        />
        <span v-else>{{ scoped.row.startDate }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="endDate" label="结束日期" width="140" align="center">
      <template #default="scoped">
        <el-date-picker
          v-model="scoped.row.endDate"
          type="date"
          placeholder="结束日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          v-if="scoped.row.isEdit"
        />
        <span v-else>{{ scoped.row.endDate }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="endDate" label="输出" width="100" align="center">
      <template #default="scoped">
        <el-date-picker
          v-model="scoped.row.endDate"
          type="date"
          placeholder="结束日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          v-if="scoped.row.isEdit"
        />
        <span v-else>{{ scoped.row.endDate }}</span>
      </template>
    </el-table-column>
    <el-table-column fixed="right" align="center" width="120">
      <template #default="scoped">
        <el-button type="primary" link @click="handleEdit(scoped.row)" v-if="!scoped.row.isEdit">
          编辑
        </el-button>
        <el-button
          type="primary"
          link
          @click="handleSave(scoped.row, '1866033974148980737')"
          v-if="scoped.row.isEdit"
        >
          确定
        </el-button>
        <el-button link @click="handleCancel(scoped)" v-if="scoped.row.isEdit"> 取消 </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script setup>
import { reactive } from 'vue';
import Api from '@/api/index';

const emit = defineEmits(['confirm']);
const { proxy } = getCurrentInstance();

const props = defineProps({
  parentData: {
    type: Object,
    default: {},
  },
  planData: {
    type: Array,
    default: [],
  },
});

const compData = reactive({
  selected: null,
  processCorrelationOptions: [],
  fields: [
    'businessTypeName',
    'processId',
    'docTypeId',
    'docFolder',
    'docTemplate',
    'funcType',
    'funcName',
    'funcUrl',
    'funcViewUrl',
    'systemCodeType',
    'systemCodeName',
    'systemCodePath',
    'systemCodeMethod',
  ],
});

const { selected, processCorrelationOptions, fields } = toRefs(compData);

const { DC_PMS_TEMPITEM_TYPE, DC_PMS_PLAN_STATUS, DC_PMS_DOCUMENT_TYPE } = proxy.useCache([
  { key: 'DC_PMS_TEMPITEM_TYPE' },
  { key: 'DC_PMS_PLAN_STATUS' },
  { key: 'DC_PMS_DOCUMENT_TYPE' },
]);

// 添加子计划
const addChildPlan = () => {
  if (selected.value)
    return proxy.$message({
      type: 'error',
      message: '请先保存编辑中的的计划后在新增子计划',
    });
  selected.value = {
    planName: null,
    startDate: null,
    endDate: null,
    handlePersonId: null,
    isEdit: true,
  };
  props.planData.unshift({
    planName: null,
    startDate: null,
    endDate: null,
    handlePersonId: null,
    isEdit: true,
  });
};

// 处理保存
const handleSave = async (row, planStatusId) => {
  if (!row.planName) return proxy.$message({ type: 'error', message: '请输入任务名称' });
  if (!row.handlePersonId) return proxy.$message({ type: 'error', message: '请选择处理人' });
  if (!row.startDate) return proxy.$message({ type: 'error', message: '请选择开始日期' });
  if (!row.endDate) return proxy.$message({ type: 'error', message: '请选择结束日期' });
  const form = {
    ...row,
    parentId: props.parentData.id,
    projectId: props.parentData.projectId,
    projectCode: props.parentData.projectCode,
    planName: row.planName,
    planStatusId: row.planStatusId,
    startDate: row.startDate,
    endDate: row.endDate,
    handlePersonId: row.handlePersonId,
    planStatusId,
  };
  const res = await Api.pdp.planItem.submit(form);
  const { code, data } = res.data;
  if (code === 200) {
    proxy.$message({ type: 'success', message: row.id ? '编辑成功' : '创建成功' });
    row.id = data.id;
    row.isEdit = false;
    selected.value = null;
  }
};

// 处理编辑
const handleEdit = row => {
  selected.value = JSON.parse(JSON.stringify(row));
  row.isEdit = !row.isEdit;
  getEditOption();
};

// 处理取消
const handleCancel = scoped => {
  proxy
    .$confirm(`确认是取消任务名称为“${scoped.row.planName}”的计划?`, {
      confirmButtonText: '取消保存',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(() => {
      if (scoped.row.id) {
        selected.value.isEdit = false;
        props.planData[scoped.$index] = selected.value;
      } else {
        props.planData.splice(scoped.$index, 1);
      }
      selected.value = null;
    });
};

// 删除计划
const removePlan = row => {
  proxy
    .$confirm(`确认是否删除任务名称为“${row.planName}”的计划?`, {
      confirmButtonText: '删除',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(async () => {
      if (row.id) return await Api.pdp.planItem.remove({ ids: row.id });
      else return;
    })
    .then(() => {
      props.planData.splice(
        props.planData.findIndex(item => item.id === row.id),
        1
      );
      if (selected.value?.id === row.id) {
        selected.value = null;
      }
      proxy.$message({
        type: 'success',
        message: '删除成功!',
      });
    });
};

const getEditOption = async () => {
  const item = props.planData.find(item => item.isEdit);
  if (item) {
    const res = await Api.system.processCorrelation.list({
      businessCategoryId: item.businessCategoryId,
      size: 999999,
      current: 1,
    });
    const { code, data } = res.data;
    if (code === 200) {
      processCorrelationOptions.value = data.records;
    }
  }
};

const getOptions = async () => {
  const item = props.planData.find(item => item.isEdit);
  const res = await Api.system.processCorrelation.list({
    businessCategoryId: item.businessCategoryId,
    size: 999999,
    current: 1,
  });
  const { code, data } = res.data;
  if (code === 200) {
    processCorrelationOptions.value = data.records;
  }
  item.businessType = null;
  fields.value.forEach(key => {
    item[key] = null;
  });
};

// option选择变化
const changeOption = () => {
  const item = props.planData.find(item => item.isEdit);
  const option = processCorrelationOptions.value.find(option => option.id === item.businessType);
  if (option) {
    fields.value.forEach(key => {
      item[key] = option[key];
    });
  } else {
    fields.value.forEach(key => {
      item[key] = null;
    });
  }
};
defineExpose({});
</script>
<style lang="scss">
@use '@/styles/projectDrawer';
</style>
