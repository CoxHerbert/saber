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
        <el-form-item class="form-itme-width_50" label="出库类型" prop="outStockType">
          <el-select
            v-model="formData.outStockType"
            clearable
            placeholder="请选择出库类型"
            :disabled="isShow"
          >
            <el-option
              v-for="item in DC_WMS_OUT_TYPE_WMS"
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
            :disabled="isShow"
            @change="handleWarehouseChange"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="申请人" prop="applicantId">
          <dc-select-user
            v-model="formData.applicantId"
            placeholder="请选择"
            :multipleLimit="1"
            :disabled="isShow"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="处理人" prop="processingPersonnel">
          <dc-select-user
            v-model="formData.processingPersonnel"
            placeholder="请选择"
            :multipleLimit="1"
            :disabled="isShow"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="备注" prop="applicant">
          <el-input
            v-model="formData.remark"
            :rows="2"
            type="textarea"
            placeholder="请输入备注"
            :disabled="isShow"
          />
        </el-form-item>
      </div>
      <div class="form-group-title">出库明细</div>
      <el-form-item class="form-itme-width_100 tabel-border">
        <el-table :data="formData.detailList" :height="300">
          <el-table-column prop="productName" label="物料名称" align="center" min-width="150" />
          <el-table-column prop="productCode" label="物料编码" align="center" min-width="150" />
          <el-table-column prop="productSpec" label="规格型号" align="center" min-width="150" />
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
          <el-button type="primary" @click="submitAudit">审核</el-button>
          <el-button type="primary" @click="submitReject">驳回</el-button>
          <el-button @click="cancelSubmit">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted, watch } from 'vue';
import Api from '@/api';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance();
const router = useRouter();
// 子组件调用父组件方法
const emit = defineEmits(['detail']);
const detail = () => {
  emit('detail');
};
const { DC_WMS_OUT_TYPE_WMS } = proxy.useCache([{ key: 'DC_WMS_OUT_TYPE_WMS' }]);
const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});
const pageData = reactive({
  loading: false,
  rules: {},
  formData: {},
  isShow: true,
});

const { loading, rules, formData, isShow } = toRefs(pageData);
onMounted(() => {
  formData.value = props.info;
});

// 审核
const submitAudit = () => {
  proxy.$refs.ruleFormRef.validate(async valid => {
    if (valid) {
      const res = await Api.wms.outboundOrder.submitAudit({
        ...formData.value,
      });
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '审核成功' });
        router.push({
          path: '/wms/warehouseRecord/outboundOrder',
          params: {},
        });
      }
    }
  });
};

// 驳回
const submitReject = async () => {
  try {
    const rejectValue = await ElMessageBox.prompt('请输入驳回原因', '驳回原因', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    loading.value = true;
    const form = {
      ...formData.value,
      reject: rejectValue.value,
    };
    try {
      const res = await Api.wms.outboundOrder.reject(form);
      const { code, msg } = res.data;

      if (code === 200) {
        proxy.$message.success(msg);
        router.push({
          path: '/wms/warehouseRecord/outboundOrder',
          params: {},
        });
      }
    } catch (error) {
      console.error('API 调用失败:', error);
    } finally {
      loading.value = false;
    }
  } catch {
    // 用户点击“取消”
    ElMessage({
      type: 'info',
      message: '取消驳回',
    });
  }
};

// 取消
const cancelSubmit = () => {
  router.go('-1');
  // router.push({
  //   path: '/wms/warehouseRecord/InventoryManage',
  //   params: {},
  // });
};
</script>
<style lang="scss" scoped>
.tabel-border {
  border: 1px solid #edeae8;
}
</style>
