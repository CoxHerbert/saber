<template>
  <div class="wrap-left-form" v-loading="loading">
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      :inline="true"
    >
      <div class="form-group-title">基本信息</div>
      <div class="form-item-info">
        <el-form-item class="form-itme-width_50" label="出库类型" prop="outStockType">
          <el-select v-model="formData.outStockType" clearable placeholder="请选择入库类型">
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
            :params="{
              stockType: getStockType(formData.outStockType),
            }"
            @change="handleWarehouseChange"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="申请人" prop="applicantId">
          <dc-select-user v-model="formData.applicantId" placeholder="请选择" :multipleLimit="1" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="处理人" prop="processingPersonnel">
          <dc-select-user
            v-model="formData.processingPersonnel"
            placeholder="请选择"
            :multipleLimit="1"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="备注" prop="applicant">
          <el-input v-model="formData.remark" :rows="2" type="textarea" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item
          v-if="formData.reject"
          class="form-itme-width_100"
          label="驳回原因"
          id="reject"
          prop="reject"
        >
          <el-input text v-model="formData.reject" clearable disabled :rows="2" type="textarea" />
        </el-form-item>
      </div>
      <div class="form-group-title">出库明细</div>
      <dc-select-dialog-v2
        v-if="formData.warehouseId"
        objectName="warehouseCount"
        :multiple="true"
        :multiple-limit="0"
        :clearable="true"
        :params="{ warehouseId: ids }"
        @change="handleSerchDetail"
      >
        <template #search-items="{ queryParams, currentObject }">
          <div class="dialog-search-box">
            <el-form-item label-width="100px" label="计划跟踪号">
              <el-input placeholder="请输入计划跟踪号" v-model="queryParams.mtoNo" />
            </el-form-item>
            <el-form-item label-width="100px" label="物料名称">
              <el-input
                v-model="queryParams[currentObject?.defaultLabel]"
                :placeholder="currentObject?.placeholder"
                prefix-icon="Search"
                clearable
              />
            </el-form-item>
          </div>
        </template>
        <el-button class="mb-5" type="primary">查询明细</el-button></dc-select-dialog-v2
      >
      <el-button v-else class="mb-5" @click="handleClickQueryDetail" type="primary"
        >查询明细</el-button
      >
      <el-form-item class="form-itme-width_100 tabel-border">
        <el-table :data="formData.detailList" :height="280">
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
          <el-table-column fixed="right" label="操作" align="center" width="100">
            <template #default="scoped">
              <el-button link type="primary" size="small" @click="handleUpdate(scoped.row)">
                编辑
              </el-button>
              <el-button link type="primary" size="small" @click="removeEvaluate(scoped.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item class="form-itme-width_100">
        <div class="form-itme-btn">
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button type="primary" @click="submitAudit">审核</el-button>
          <el-button @click="cancelSubmit">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <el-form ref="formRef" :model="formDataTable" :rules="rules" label-width="86px">
      <el-form-item label="物料名称" prop="productName">
        <el-input v-model="formDataTable.productName" placeholder="物料名称" clearable disabled />
      </el-form-item>
      <el-form-item label="物料编码" prop="productCode">
        <el-input v-model="formDataTable.productCode" placeholder="物料编码" clearable disabled />
      </el-form-item>
      <el-form-item label="规格型号" prop="productSpec">
        <el-input v-model="formDataTable.productSpec" placeholder="规格型号" clearable disabled />
      </el-form-item>
      <el-form-item label="数量" prop="productQty">
        <el-input-number v-model="formDataTable.productQty" min="1" :max="numbers" />
      </el-form-item>
      <el-form-item label="单位" prop="productUnit">
        <el-input v-model="formDataTable.productUnit" placeholder="单位" clearable disabled />
      </el-form-item>
      <el-form-item label="仓位编号" prop="locationId">
        <dc-view
          v-model="formDataTable.locationId"
          objectName="warehouseLocation"
          showKey="locationName"
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
import { reactive, toRefs, getCurrentInstance } from 'vue';
import Api from '@/api';
import { useRouter, useRoute } from 'vue-router';

/*
 {
            "id": "1899337926232064001",
            "tenantId": "000000",
            "parentId": "1907004340336377858",
            "code": "DC_WMS_OUT_TYPE_WMS",
            "dictKey": "",
            "dictValue": "领用出库",
            "sort": 0,
            "remark": "领用出库",
            "isSealed": null,
            "status": null,
            "isDeleted": null,
            "listClass": "dict-6"
        },
        {
            "id": "1899338015847563266",
            "tenantId": "000000",
            "parentId": "1907004340336377858",
            "code": "DC_WMS_OUT_TYPE_WMS",
            "dictKey": "",
            "dictValue": "其他",
            "sort": 1,
            "remark": "其他出库",
            "isSealed": null,
            "status": null,
            "isDeleted": null,
            "listClass": "dict-7"
        },
        {
            "id": "1910144345372827650",
            "tenantId": "000000",
            "parentId": "1899337611537629185",
            "code": "DC_WMS_OUT_TYPE_WMS",
            "dictKey": "",
            "dictValue": "现场出库",
            "sort": 1,
            "remark": "",
            "isSealed": null,
            "status": null,
            "isDeleted": null,
            "listClass": "dict-text"
        },
        {
            "id": "1910144484778909697",
            "tenantId": "000000",
            "parentId": "1899337611537629185",
            "code": "DC_WMS_OUT_TYPE_WMS",
            "dictKey": "ff",
            "dictValue": "线边仓出库",
            "sort": 2,
            "remark": "",
            "isSealed": null,
            "status": null,
            "isDeleted": null,
            "listClass": "dict-text"
        }
*/

const outStockTypeMap = {
  // 现场出库
  DC_WMS_OUT_TYPE_SCENE: 'DC_WMS_STOCK_TYPE_SCENE', //        现场仓
  // 线边仓出库
  DC_WMS_OUT_TYPE_LINE_EDGE: 'DC_WMS_STOCK_TYPE_LINE_EDGE', //         线边仓
  // 其他出库
  DC_WMS_OUT_TYPE_OTHER: '', // 'DC_WMS_STOCK_TYPE_COMMON', //         普通仓
  // 领用出库
  DC_WMS_OUT_TYPE_USE: '',
};

// 获取入库类型
const getStockType = outType => {
  return outType && outStockTypeMap[outType] ? outStockTypeMap[outType] : undefined;
};

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const userinfo = computed(() => proxy.$store.getters.userInfo);
const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});
const { DC_WMS_OUT_TYPE_WMS } = proxy.useCache([{ key: 'DC_WMS_OUT_TYPE_WMS' }]);

const pageData = reactive({
  loading: false,
  formRules: {
    warehouseId: [
      {
        required: true,
        validator(_, value, callback) {
          if ([null, undefined, ''].includes(value)) {
            callback(new Error('请选择仓库名称'));
          } else {
            callback();
          }
        },
        trigger: ['blur'],
      },
    ],
    processingPersonnel: [
      {
        required: true,
        validator(_, value, callback) {
          if ([null, '', undefined].includes(value)) {
            callback(new Error('请选择处理人'));
          }
          if (value && value?.split?.(',')?.length > 1) {
            callback(new Error('不允许有多个处理人'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
    outStockType: [
      {
        required: true,
        validator(_, value, callback) {
          if ([null, undefined, ''].includes(value)) {
            callback(new Error('请选择出库类型'));
          } else {
            callback();
          }
        },
        trigger: ['blur'],
      },
    ],
  },
  rules: {},
  formData: {
    outStockType: 'DC_WMS_OUT_TYPE_OTHER',
  },
  formDataTable: {},
  open: false,
  title: '',
  editIndex: null,
  isDisabled: true,
  ids: null,
  numbers: null,
});

const {
  loading,
  formRules,
  rules,
  formData,
  formDataTable,
  open,
  title,
  editIndex,
  isDisabled,
  ids,
  numbers,
} = toRefs(pageData);

onMounted(() => {
  formData.value.applicantId = userinfo.value.user_id;
  if (route.params.id != 'create') {
    const timer = setTimeout(() => {
      formData.value = props.info;
      clearTimeout(timer);
    }, 300);
  }
});

// 确认创建
const submitForm = async () => {
  proxy.$refs.ruleFormRef.validate(async valid => {
    if (valid) {
      const warehouseId =
        typeof formData.value.warehouseId === 'object'
          ? formData.value.warehouseId?.id
          : formData.value.warehouseId;
      const form = {
        ...formData.value,
        warehouseId: warehouseId,
      };

      const res = await Api.wms.outboundOrder.submit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        router.push({
          path: '/wms/warehouseRecord/outboundOrder',
          params: {},
        });
      }
    }
  });
};
// 审核
const submitAudit = () => {
  proxy.$refs.ruleFormRef.validate(async valid => {
    if (valid) {
      const warehouseId =
        typeof formData.value.warehouseId === 'object'
          ? formData.value.warehouseId?.id
          : formData.value.warehouseId;
      const form = {
        ...formData.value,
        warehouseId: warehouseId,
      };

      const res = await Api.wms.outboundOrder.submitAudit(form);
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

// 表格编辑
const handleUpdate = row => {
  editIndex.value = formData.value.detailList.findIndex(item => item === row);
  if (editIndex.value !== -1) {
    open.value = true;
    numbers.value = row.productQty;
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

// 表格删除
const removeEvaluate = async row => {
  const index = formData.value.detailList.findIndex(item => item === row);
  if (index !== -1) {
    formData.value.detailList.splice(index, 1);
  }
};

// 抽屉取消
const closeDrawer = () => {
  formDataTable.value = {};
  open.value = false;
};
// 取消
const cancelSubmit = () => {
  router.push({
    path: '/wms/warehouseRecord/outboundOrder',
    params: {},
  });
};

//仓库监听事件
const handleWarehouseChange = async row => {
  formData.value.processingPersonnel = row.warehouseSupervisor;
  isDisabled.value = false;
  ids.value = row.id;
};

// 查询明细
const handleSerchDetail = row => {
  formData.value.detailList = row;
  formData.value.detailList = row.map(item => ({
    warehouseId: item.warehouseId,
    productName: item.productName,
    productCode: item.productCode,
    productSpec: item.productSpec,
    productQty: item.number,
    productUnit: item.unit,
    outStockId: item.locationId,
    warehouseCountId: item.id,
    locationId: item.locationId,
    productVersion: item.productVersion,
    mtoNo: item.mtoNo,
  }));
};

/** 查询详情点击 */
const handleClickQueryDetail = () => {
  if (!formData.value.warehouseId) {
    proxy.$refs.ruleFormRef.validateField(['warehouseId']);
    proxy.$message.error('请先选择基本信息里的仓库名称');
  }
};
</script>
<style lang="scss" scoped>
.tabel-border {
  border: 1px solid #edeae8;
}
.dialog-search-box {
  width: 600px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 50%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 120px);
    }
  }
}
</style>
