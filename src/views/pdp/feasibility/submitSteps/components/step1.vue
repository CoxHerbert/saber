<template>
  <div class="wrap-left-form form-step-1" v-loading="loading">
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-suffix=":"
      label-width="120px"
      :inline="true"
    >
      <div class="form-group-title">基本信息</div>
      <div class="form-item-info">
        <el-form-item class="form-itme-width_100" label="选择需求单" prop="customerRlistId">
          <wf-select-dialog
            v-model="formData.customerRlistId"
            placeholder="请选择需求单"
            objectName="customerRlist"
            @change="changeCustomerRlist"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="相关附件" prop="relatedAttachments">
          <dc-upload
            v-model="formData.relatedAttachments"
            :limit="10"
            :targetType="Const.targetType.CUSTOMER_RLIST"
          />
        </el-form-item>

        <el-form-item class="form-itme-width_50" label="评估名称" prop="feaName">
          <el-input v-model="formData.feaName" placeholder="请输入评估名称" disabled />
        </el-form-item>

        <el-form-item class="form-itme-width_50" label="评估类型" prop="feaType">
          <el-select v-model="formData.feaType" placeholder="请选择" clearable>
            <el-option
              v-for="item in DC_FEA_TYPE"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="form-itme-width_50" label="商机名称" prop="oppsId">
          <el-input placeholder="请选择需求单" :value="formData.oppsName" disabled />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="客户" prop="customerId">
          <el-input placeholder="请选择需求单" :value="formData.customerName" disabled />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="产品类别" prop="productCategoryId">
          <el-select v-model="formData.productCategoryId" clearable placeholder="请选择">
            <el-option
              v-for="item in DC_CRM_SECTOR"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="单据日期" prop="documentTime">
          <el-date-picker
            v-model="formData.documentTime"
            type="date"
            placeholder="请选择单据日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item class="form-itme-width_100" label="评估说明" prop="feaDesc">
          <el-input v-model="formData.feaDesc" autosize type="textarea" placeholder="请输入" />
        </el-form-item>
      </div>
      <div class="form-group-title">评估项分配</div>
      <el-form-item class="form-itme-width_100">
        <el-table :data="formData.feaEvaluationItemsVo">
          <el-table-column
            prop="feaEvaluationBizKey"
            label="评估类型"
            align="center"
            min-width="150"
          >
            <template #default="scoped">
              <dc-dict-key
                type="text"
                :options="DC_FEA_ITEM_TYPE"
                :value="scoped.row.feaEvaluationBizKey"
              />
            </template>
          </el-table-column>
          <el-table-column prop="feaEvaluator" label="评估人" align="center" min-width="150">
            <template #default="scoped">
              <el-form-item
                :prop="`feaEvaluationItemsVo.${scoped.$index}.feaEvaluator`"
                :rules="[{ required: true, message: '请选择评估人', trigger: 'change' }]"
              >
                <dc-select-user
                  v-model="scoped.row.feaEvaluator"
                  placeholder="请选择评估人"
                  @change="changeFeaEvaluator($event, scoped.row)"
                  returnType="object"
                  :multiple="false"
                  :multiple-limit="1"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
            prop="feaEvaluationDept"
            label="评估人部门"
            align="center"
            min-width="150"
          >
            <template #default="scoped">
              <dc-view v-model="scoped.row.feaEvaluationDept" objectName="dept" />
            </template>
          </el-table-column>
          <el-table-column
            prop="feaDeadlineForCompletion"
            label="完成截止日"
            align="center"
            min-width="150"
          >
            <template #default="scoped">
              <el-form-item
                :prop="`feaEvaluationItemsVo.${scoped.$index}.feaDeadlineForCompletion`"
                :rules="[{ required: true, message: '请选择评估人', trigger: 'blur' }]"
              >
                <el-date-picker
                  v-model="scoped.row.feaDeadlineForCompletion"
                  type="date"
                  placeholder="请选择时间"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <div class="form-group-title">BD信息</div>
      <el-form-item class="form-itme-width_50" label="BD责任人" prop="bdId">
        <dc-select-user v-model="formData.bdId" placeholder="请选择BD领导" :multiple="false" />
      </el-form-item>
      <el-form-item class="form-itme-width_100">
        <div class="form-itme-btn">
          <el-button type="primary" @click="submitForm">发起评估</el-button>
          <el-button @click="cancelSubmit">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted } from 'vue';
import Api from '@/api';
import Const from '@/const';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();

// 数据字典
const {
  OPPS_LIST_CACHE,
  CUSTOMER_LIST_CACHE,
  DC_CRM_SECTOR,
  DC_FEA_ITEM_TYPE,
  DC_FEA_TYPE,
  CUSTOMER_RLIST_MAP_CACHE,
  OPPS_MAP_MANGER,
} = proxy.useCache([
  { key: 'OPPS_LIST_CACHE' },
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_FEA_ITEM_TYPE' },
  { key: 'DC_FEA_TYPE' },
  { key: 'CUSTOMER_LIST_CACHE', keyName: 'id' },
  { key: 'CUSTOMER_RLIST_MAP_CACHE', keyName: 'id' },
  { key: 'OPPS_MAP_MANGER', keyName: 'id' },
]);

const pageData = reactive({
  loading: false,
  // 可行性表单提交规则
  rules: {
    customerRlistId: [{ required: true, message: '请选择需求单', trigger: 'blur' }],
    feaName: [{ required: true, message: '请输入评估名称', trigger: 'blur' }],
    feaType: [{ required: true, message: '请选择评估类型', trigger: 'blur' }],
    customerId: [{ required: true, message: '请选择需求单', trigger: 'blur' }],
    oppsId: [{ required: true, message: '请选择需求单', trigger: 'blur' }],
    productCategoryId: [{ required: true, message: '请选择产品类别', trigger: 'blur' }],
    documentTime: [{ required: true, message: '请选择单据日期', trigger: 'blur' }],
    bdId: [{ required: true, message: '请选择BD领导', trigger: 'blur' }],
  },
  // 可行性表单
  formData: {
    feaType: undefined, //可行性评估类型
    feaName: undefined, //评估名称
    customerRlistId: undefined, //需求id
    customerId: undefined, //客户id
    oppsId: undefined, //商机id
    productCategoryId: undefined, //产品类别
    documentTime: undefined, //单据日期
    feaDesc: undefined, //评估说明
    feaEvaluationItemsVo: [], // 评估项分配
    bdId: undefined, // BD领导
  },
});

const { rules, formData, loading } = toRefs(pageData);

onMounted(() => {
  initDetail();
  const timer = setInterval(() => {
    if (Array.isArray(DC_FEA_ITEM_TYPE.value) && DC_FEA_ITEM_TYPE.value.length) {
      formData.value.feaEvaluationItemsVo = DC_FEA_ITEM_TYPE.value.map(item => {
        return {
          feaEvaluationBizKey: item.dictKey,
        };
      });
      clearInterval(timer);
    }
  }, 500);
});

// 初始化详情
const initDetail = () => {
  loading.value = true;
  const timer = setTimeout(() => {
    // 获取需求
    const demandInfo = proxy.getKeyObject(CUSTOMER_RLIST_MAP_CACHE.value, route.query.demandId);
    formData.value.rlistCode = demandInfo ? demandInfo.rlistCode : null;
    formData.value.rlistName = demandInfo ? demandInfo.rlistName : null;
    formData.value.customerRlistId = demandInfo ? demandInfo.id : null;
    formData.value.oppsId = demandInfo ? demandInfo.oppsId : null;
    // 获取商机
    const oppsInfo = proxy.getKeyObject(OPPS_MAP_MANGER.value, formData.value.oppsId);
    formData.value.oppsName = oppsInfo ? oppsInfo.oppsName : null;
    formData.value.customerId = demandInfo ? demandInfo.customerId : null;
    formData.value.customerName = demandInfo ? demandInfo.customerName : null;
    formData.value.productCategoryId = oppsInfo ? oppsInfo.sectorId : null;
    formData.value.feaName = oppsInfo ? oppsInfo.oppsName : null;
    formData.value.bdId = oppsInfo ? oppsInfo.bdId : null;
    loading.value = false;
    clearTimeout(timer);
  }, 1000);
};

// 选择需求单
const changeCustomerRlist = customerRlist => {
  formData.value.rlistCode = customerRlist?.rlistCode || null;
  formData.value.rlistName = customerRlist?.rlistName || null;
  formData.value.customerRlistId = customerRlist?.id || null;
  formData.value.oppsId = customerRlist?.oppsId || null;
  formData.value.oppsName = customerRlist?.oppsName || null;
  formData.value.customerId = customerRlist?.customerId || null;
  formData.value.customerName = customerRlist?.customerName || null;
  formData.value.productCategoryId = customerRlist?.sectorId || null;
  formData.value.feaName = customerRlist?.oppsName || null;
};

// 处理评估人选择变化
const changeFeaEvaluator = (user, row) => {
  row.feaEvaluator = user?.id || null;
  row.feaEvaluationDept = user?.deptId || null;
};

const timer = ref(null);

// 提交
const submitForm = () => {
  try {
    proxy.$refs['ruleFormRef'].validate(async valid => {
      if (valid) {
        loading.value = true;
        clearTimeout(timer.value);
        timer.value = setTimeout(() => {
          loading.value = false;
        }, 3000);
        const form = {
          ...formData.value,
          relatedAttachments: proxy.arrayToIdsString({
            array: formData.value.relatedAttachments,
          }),
        };
        delete form.id;
        const res = await Api.pdp.dcFea.subimt(form);
        const { code, msg } = res.data;
        if (code === 200) {
          proxy.$message.success(msg);
          router.push('/pdp/feasibility/list');
        }
        loading.value = false;
      }
    });
  } catch (err) {
    loading.value = false;
  }
};

// 取消提交评估项
const cancelSubmit = () => {
  proxy
    .$confirm(`取消数据将会清空，确定是否取消?`, {
      confirmButtonText: '确定取消',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(() => {
      router.push('/pdp/feasibility/list');
    });
};
</script>
<style lang="scss" scoped>
.form-step-1 {
  width: 100%;
  margin: 0;
  padding: 24px !important;
  display: block;

  :deep(.el-form) {
    position: relative;
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  :deep(.el-table .el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-table .el-form-item__error) {
    position: relative;
    margin: 0;
    padding: 0;
    top: 0;
    text-align: left;
  }
}
</style>
