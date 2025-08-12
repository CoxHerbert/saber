<template>
  <div class="wrap-left-form" v-loading="loading">
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :inline="true"
      loading="loading"
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
            :disabled="show"
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
          <el-table-column fixed="right" label="操作" align="center" width="100">
            <template #default="scoped">
              <el-button link type="primary" size="small" @click="handleUpdate(scoped.row)">
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item class="form-itme-width_100">
        <div class="form-itme-btn">
          <el-button type="primary" @click="submitAudit">通过</el-button>
          <el-button type="primary" @click="submitReject">驳回</el-button>
          <el-button @click="cancelSubmit">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>

  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <el-form ref="formRef" :model="formDataTable" :rules="rules" label-width="86px">
      <el-form-item label="物料编号" prop="productCode">
        <el-input
          v-model="formDataTable.productCode"
          placeholder="产品编码"
          clearable
          :disabled="show"
        />
      </el-form-item>
      <el-form-item label="物料名称" prop="productName">
        <el-input
          v-model="formDataTable.productName"
          placeholder="产品名称"
          clearable
          :disabled="show"
        />
      </el-form-item>
      <el-form-item label="规格型号" prop="productSpec">
        <el-input
          v-model="formDataTable.productSpec"
          placeholder="规格型号"
          clearable
          :disabled="show"
        />
      </el-form-item>
      <el-form-item label="数量" prop="productQty">
        <el-input-number v-model="formDataTable.productQty" disabled />
      </el-form-item>
      <el-form-item label="单位" prop="productUnit">
        <el-select v-model="formDataTable.productUnit" placeholder="请选择单位" :disabled="show">
          <el-option
            v-for="item in unitList"
            :key="item.unitName"
            :label="item.unitName"
            :value="item.unitName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓位编号" prop="locationId">
        <dc-select-dialog
          v-model="formDataTable.locationId"
          placeholder="请点击仓位编号"
          objectName="warehouseLocation"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :clearable="true"
          :params="{
            warehouseId: props.info.warehouseId,
          }"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitFormTable">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted, watch } from 'vue';
import Api from '@/api';
import { useRouter, useRoute } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
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
  loading: false,
  formData: {},
  open: false,
  title: '',
  editIndex: null,
  formDataTable: {},
  show: true,
});

const { loading, rules, formData, open, title, editIndex, formDataTable, show } = toRefs(pageData);
onMounted(() => {
  formData.value = props.info;
});

// 审核
const submitAudit = () => {
  proxy.$refs.ruleFormRef.validate(async valid => {
    if (valid) {
      loading.value = true;
      try {
        const res = await Api.wms.warehousingEntry.submitAudit({
          ...formData.value,
        });
        const { code, msg } = res.data;
        if (code === 200) {
          proxy.$message({ type: 'success', message: '审核成功' });
          loading.value = false;
          router.push({
            path: '/wms/warehouseRecord/warehousingEntry',
            params: {},
          });
        }
      } catch (error) {
        loading.value = false;
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
      const res = await Api.wms.warehousingEntry.reject(form);
      const { code, msg } = res.data;

      if (code === 200) {
        proxy.$message.success(msg);
        router.push({
          path: '/wms/warehouseRecord/warehousingEntry',
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
  router.push({
    path: '/wms/warehouseRecord/warehousingEntry',
    params: {},
  });
};

// 表格编辑
const handleUpdate = row => {
  editIndex.value = formData.value.detailList.findIndex(item => item === row);
  if (editIndex.value !== -1) {
    open.value = true;
    formDataTable.value = { ...row }; // 创建一个新对象，避免直接修改引用
  }
};

// 提交修改
const submitFormTable = async () => {
  if (editIndex.value !== null && editIndex.value !== -1) {
    // 编辑模式：更新原列表中的数据
    formData.value.detailList[editIndex.value] = { ...formDataTable.value };
    editIndex.value = null;
  } else {
    // 新增模式
    formData.value.detailList.push({ ...formDataTable.value });
  }
  formDataTable.value = {}; // 清空表单
  open.value = false; // 关闭抽屉
};
</script>
<style lang="scss" scoped>
.tabel-border {
  border: 1px solid #edeae8;
}
</style>
