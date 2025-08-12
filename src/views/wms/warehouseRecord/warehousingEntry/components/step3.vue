<template>
  <div class="wrap-left-form" v-loading="loading">
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :inline="true"
    >
      <div class="form-group-title">基本信息</div>
      <div class="form-item-info">
        <el-form-item class="form-itme-width_50" label="入库类型" prop="inType">
          <el-select
            v-model="formData.inType"
            clearable
            placeholder="请选择入库类型"
            @change="hangleInTypeChange"
            disabled
          >
            <el-option
              v-for="item in DC_WMS_IN_TYPE_WMS"
              :key="item.dictKey"
              :label="item.dictValue"
              :value="item.dictKey"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="仓库名称" prop="warehouseId">
          <dc-select-dialog
            v-model="formData.warehouseId"
            placeholder="请点击选择仓库"
            objectName="warehouse"
            type="input"
            :multiple="false"
            :multiple-limit="1"
            :clearable="true"
            disabled="show"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="来源单号" prop="inSourceNumber">
          <el-input
            v-model="formData.inSourceNumber"
            placeholder="请输入来源单号点击查询"
            clearable
            disabled
          >
            <template #append>
              <el-button :icon="Search" @click="handleSerch" disabled />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="申请人" prop="applicantId">
          <dc-select-user
            v-model="formData.applicantId"
            placeholder="请选择"
            :multipleLimit="1"
            disabled
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="处理人" prop="processingPersonnel">
          <dc-select-user
            v-model="formData.processingPersonnel"
            placeholder="请选择"
            :multipleLimit="1"
            disabled
          />
        </el-form-item>
      </div>
      <div class="form-group-title">入库明细</div>
      <el-form-item class="form-itme-width_100 tabel-border">
        <el-button class="mb-5" type="primary" @click="addRow" v-if="btnOpen">新增</el-button>
        <el-table :data="formData.detailList" :height="300">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="productCode" label="物料编号" align="center" min-width="150" />
          <el-table-column prop="productName" label="物料名称" align="center" min-width="150" />
          <el-table-column
            prop="productSpec"
            label="规格型号"
            align="center"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column prop="productQty" label="数量" align="center" min-width="150" />
          <el-table-column prop="productUnit" label="单位" align="center" min-width="150" />
          <el-table-column prop="locationId" label="仓位编号" align="center" min-width="150">
            <template #default="scoped">
              <dc-view
                v-model="scoped.row.locationId"
                objectName="warehouseLocation"
                showKey="locationName"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item class="form-itme-width_100">
        <div class="form-itme-btn">
          <el-button @click="cancelSubmit">返回</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted, watch } from 'vue';
import Api from '@/api';
import { useRouter, useRoute } from 'vue-router';
import { Search } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
// 子组件调用父组件方法
const emit = defineEmits(['detail']);
const detail = () => {
  emit('detail');
};
const { DC_WMS_IN_TYPE_WMS } = proxy.useCache([{ key: 'DC_WMS_IN_TYPE_WMS' }]);
const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});
const pageData = reactive({
  formData: {},
});

const { formData } = toRefs(pageData);
onMounted(() => {
  formData.value = props.info;
});

// 取消
const cancelSubmit = () => {
  router.push({
    path: '/wms/warehouseRecord/warehousingEntry',
    params: {},
  });
};
</script>
<style lang="scss" scoped>
.tabel-border {
  border: 1px solid #edeae8;
}
</style>
