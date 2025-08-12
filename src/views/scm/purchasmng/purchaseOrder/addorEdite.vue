<template>
  <div class="addorEdite">
    <div class="title">
      <img
        src="../../../../../public/img/back.png"
        alt=""
        class="back-img"
        @click="$router.go(-1)"
      />{{ title }}采购订单

      <div class="title-btns">
        <div v-if="title != '查看' || formData.processStatus == '审批中'">
          <el-button
            icon="el-icon-position"
            type="primary"
            v-if="formData.processStatus == '开立'"
            @click="doAction('提交审核')"
            >提交审核
          </el-button>

          <el-button
            icon="el-icon-position"
            type="primary"
            v-if="
              id && formData.processStatus == '审批中' && formData.currentTaskUserId == data.userId
            "
            @click="doAction('审核通过')"
          >
            审核通过
          </el-button>

          <el-button
            icon="el-icon-folder-add"
            @click="reject"
            v-if="
              id && formData.processStatus == '审批中' && formData.currentTaskUserId == data.userId
            "
            >驳回</el-button
          >

          <el-button
            icon="el-icon-folder-add"
            @click="submitForm(ruleFormRef)"
            v-if="formData.processStatus == '开立' || !id"
            >保存</el-button
          >
          <el-button
            icon="el-icon-folder-delete"
            @click="submitForReview('作废')"
            v-if="
              id && formData.processStatus == '审批中' && formData.currentTaskUserId == data.userId
            "
            >作废</el-button
          >
        </div>
      </div>
    </div>

    <div class="steps-wrapper">
      <el-steps :active="step">
        <el-step v-for="(item, index) in filteredSteps" :key="index">
          <template #icon>
            <div class="step-item" :class="getCalss(index)">
              <span class="step-num">
                <span v-if="index >= step">{{ index + 1 }}</span>
                <el-icon v-else><Check /></el-icon>
              </span>
              <span class="step-title" :class="index == 0 ? 'mr20' : ''"
                >{{ item.dictValue }} <br />
                <span class="step-desc" v-if="step == 1 && index == 1">
                  <div>{{ formData.currentTask }}</div>
                  <dc-view v-model="formData.currentTaskUserId" objectName="user" />
                </span>
                <span class="step-desc" v-if="item.dictValue == '已驳回' && index == 2"
                  >驳回原因:{{ formData.comment }}</span
                >
              </span>
            </div>
          </template>
        </el-step>
      </el-steps>
    </div>
    <el-form
      ref="ruleFormRef"
      :rules="rules"
      :model="formData"
      label-width="auto"
      label-suffix=":"
      style="overflow-x: hidden"
    >
      <div class="form-group-title">基础信息</div>
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="申请采购单" prop="sourceId">
            <dc-select-dialog
              v-model="formData.sourceId"
              placeholder="请选择申请采购单"
              objectName="purchaseRequest"
              type="input"
              :params="{ processStatus: '审批结束' }"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
              :disabled="isDisabled"
              @change="handlePRequestChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="组织" prop="orgId">
            <el-select
              v-model="formData.orgId"
              placeholder="请选择组织"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in SCMORG_LIST_CACHE"
                :key="index"
                :value="item.id"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="采购订单编号" prop="supplierNotext">
            <el-input
              v-model="formData.supplierNotext"
              placeholder="请输入采购订单编号"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="采购类型" prop="billtypeDict">
            <el-select
              style="width: 100%"
              v-model="formData.billtypeDict"
              placeholder="请选择采购类型"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in DC_PURCHASE_REQUEST_DICT"
                :key="index"
                :value="item.dictKey"
                :label="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="采购日期" prop="purchaseDate">
            <el-date-picker
              style="width: 100%"
              v-model="formData.purchaseDate"
              type="date"
              placeholder="采购日期"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              @click.stop
              :disabled="isDisabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="采购员" prop="purchaserId">
            <dc-select-user
              v-model="formData.purchaserId"
              placeholder="请选择采购员"
              :multiple="false"
              :multiple-limit="0"
              :disabled="isDisabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="form-itme-width" label="供应商" prop="supplierId">
            <dc-select-dialog
              v-model="formData.supplierId"
              placeholder="请选择供应商"
              objectName="scmSupplier"
              type="input"
              :params="{ flagStatusDict: 1 }"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
              @change="handleSupplierChange"
              :disabled="isDisabled"
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item class="form-itme-width" label="税率" prop="taxRate">
            <el-input v-model="formData.taxRate" placeholder="请选择供应商" disabled>
              <template #append>%</template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="币种" prop="currency">
            <el-select v-model="formData.currency" placeholder="请选择供应商" clearable disabled>
              <el-option
                v-for="(item, index) in DC_FINANCE_CURRENCY"
                :key="index"
                :value="item.dictKey"
                :label="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="专案号" prop="mtono">
            <el-input
              v-model="formData.mtono"
              placeholder="请输入专案号"
              clearable
              :disabled="isDisabled"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item class="form-itme-width" label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              type="textarea"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="form-group-title">采购物料明细</div>
      <el-button
        type="primary"
        plain
        style="margin: -5px 0px 10px"
        @click="addRow"
        v-if="!isDisabled"
        >新增</el-button
      >
      <el-table :data="scmPoMaterialList" style="width: 100%" border>
        <el-table-column label="" width="60" v-if="!isDisabled">
          <template #default="scope">
            <el-button
              type="primary"
              icon="el-icon-minus"
              circle
              plain
              size="small"
              @click="deleteRow(scope.$index, scmPoMaterialList)"
              :disabled="isDisabled"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index" width="60px" align="center">
          <template #default="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="materialId" label="物料名称" width="150" align="center">
          <template #default="scope">
            <dc-select-dialog
              v-model="scope.row.materialId"
              placeholder="请选择物料"
              objectName="scmMaterial"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
              :disabled="scope.row.disabled"
              @change="e => handleSelectMaterial(e, scope.$index)"
              v-if="!isDisabled"
            />
            <div v-else>{{ scope.row.materialName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="materialNumber" label="物料编码" width="150" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.materialNumber" disabled v-if="!isDisabled" />
            <div v-else>{{ scope.row.materialNumber }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌" align="center" width="130">
          <template #default="scope">
            <el-input v-model="scope.row.brand" disabled v-if="!isDisabled" />
            <div v-else>{{ scope.row.brand }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格型号" align="center" width="130">
          <template #default="scope">
            <el-input v-model="scope.row.specification" disabled v-if="!isDisabled" />
            <div v-else>{{ scope.row.specification }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="unitDict" label="单位" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.unitDict" disabled v-if="!isDisabled" />
            <div v-else>{{ scope.row.unitDict }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="采购数量" align="center" width="130">
          <template #default="scope">
            <el-input-number
              style="width: 100%"
              :min="0"
              :precision="2"
              :controls="false"
              v-model="scope.row.quantity"
              v-if="!isDisabled"
            />
            <div v-else>{{ scope.row.quantity }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryDate" label="交货日期" align="center" width="200px">
          <template #default="scope">
            <el-date-picker
              style="width: 100%"
              v-model="scope.row.deliveryDate"
              type="date"
              placeholder="交货日期"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              @click.stop
              v-if="!isDisabled"
            />
            <div v-else>{{ scope.row.deliveryDate }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="taxPrice" label="含税单价" align="center" width="130">
          <template #default="scope">
            <el-input v-model="scope.row.taxPrice" type="number" disabled v-if="!isDisabled" />
            <div v-else>{{ scope.row.taxPrice }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="未税单价" align="center" min-width="100">
          <template #default="scope">
            <el-input-number
              style="width: 100%"
              :min="0"
              :precision="2"
              :controls="false"
              v-model="scope.row.price"
              v-if="!isDisabled"
            />
            <div v-else>{{ scope.row.price }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="taxTotal" label="含税总价" align="center" width="130">
          <template #default="scope">
            <el-input v-model="scope.row.taxTotal" type="number" disabled v-if="!isDisabled" />
            <div v-else>{{ scope.row.taxTotal }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="未税总价" align="center" width="130">
          <template #default="scope">
            <el-input v-model="scope.row.total" type="number" disabled v-if="!isDisabled" />
            <div v-else>{{ scope.row.total }}</div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <AuditUser ref="auditUserRef" @success="getDetail()" />
    <!-- <div class="btm-wrapper" v-if="title != '查看' || formData.processStatus == '审批中'">
      <el-button
        icon="el-icon-position"
        type="primary"
        v-if="formData.processStatus == '开立' || formData.currentTaskUserId == data.userId"
        @click="submitForReview('提交审核')"
        >{{ formData.processStatus == '审批中' ? '审核通过' : '提交审核' }}</el-button
      >

      <el-button
        icon="el-icon-folder-add"
        @click="reject"
        v-if="id && formData.processStatus == '审批中' && formData.currentTaskUserId == data.userId"
        >驳回</el-button
      >

      <el-button
        icon="el-icon-folder-add"
        @click="submitForm(ruleFormRef)"
        v-if="formData.processStatus == '开立' || !id"
        >保存</el-button
      >
      <el-button
        icon="el-icon-folder-delete"
        @click="submitForReview('作废')"
        v-if="id && formData.processStatus == '审批中' && formData.currentTaskUserId == data.userId"
        >作废</el-button
      >
    </div> -->
  </div>
</template>

<script setup>
import { ref, watch, reactive, toRefs, getCurrentInstance, onMounted } from 'vue';
import Api from '@/api/index';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import dayjs from 'dayjs';
import { ElMessageBox } from 'element-plus';
import AuditUser from './../../components/auditUser.vue';

const store = useStore();
const route = useRoute(); // 获取当前路由对象
const { proxy } = getCurrentInstance();
const auditUserRef = ref(null);
// 数据字典
const { DC_PURCHASE_REQUEST_DICT, SCMORG_LIST_CACHE, DC_FINANCE_CURRENCY } = proxy.useCache([
  { key: 'DC_PURCHASE_REQUEST_DICT' },
  { key: 'SCMORG_LIST_CACHE' },
  { key: 'DC_FINANCE_CURRENCY' },
]);

const data = reactive({
  loading: true,
  rules: {
    orgId: [{ required: true, message: '组织为必选项', trigger: 'change' }],
    billtypeDict: [{ required: true, message: '采购类型为必选项', trigger: 'change' }],
    purchaseDate: [{ required: true, message: '采购日期为必选项', trigger: 'change' }],
    purchaserId: [{ required: true, message: '采购员为必选项', trigger: 'change' }],
    supplierId: [{ required: true, message: '供应商为必选项', trigger: 'change' }],
    sourceId: [{ required: true, message: '申请采购单为必选项', trigger: 'change' }],
  },
  formData: {
    supplierNotext: '系统自动生成',
    purchaserId: store.getters.userInfo.user_id,
    billtypeDict: '1',
    purchaseDate: dayjs().format('YYYY-MM-DD'),
  },
  id: '',
  userId: store.getters.userInfo.user_id,
  isDisabled: false,
  title: '新增',
  // 联系人列表
  scmPoMaterialList: [],
  filteredSteps: [
    {
      dictValue: '新增采购订单',
    },
    {
      dictValue: '审批中',
    },
    {
      dictValue: '审批完成',
    },
  ],
  step: 0,
});

const { rules, formData, title, scmPoMaterialList, isDisabled, id, filteredSteps, step } =
  toRefs(data);
const ruleFormRef = ref(null);
const emit = defineEmits(['success']);

onMounted(() => {
  isDisabled.value = route.query.type == 'look';
  id.value = route.query.id;
  getDetail();
});

const getCalss = index => {
  if (step.value === index) return 'step-item-process';
  if (step.value < index) return 'step-item-wait';
  if (step.value > index) return 'step-item-finish';
};

watch(
  () => formData.value.sourceId,
  (newVal, oldVal) => {
    if (!newVal) {
      data.scmPoMaterialList = [];
    }
  }
);

// 驳回
const reject = () => {
  ElMessageBox.prompt(null, '驳回原因', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.+$/,
    inputErrorMessage: '请输入驳回原因',
  }).then(async ({ value }) => {
    let form = {
      id: formData.value.id,
      status: 0,
      comment: value,
      isPass: 0,
    };
    let res = await Api.scm.purchaseOrder.toExamine(form);
    const { code } = res.data;
    if (code == 200) {
      proxy.$message.success('驳回成功');
      getDetail();
    }
  });
};

// 提交审核和作废
const submitForReview = name => {
  proxy.$confirm(`确定${name}吗`).then(async () => {
    let form = {
      id: formData.value.id,
    };
    let res = '';
    if (name == '作废') {
      res = await Api.scm.purchaseOrder.invalid(form);
    }
    const { code } = res.data;
    if (code == 200) {
      proxy.$message.success('操作成功');
      getDetail();
    }
  });
};
// 物料选择
const handleSelectMaterial = (row, index) => {
  scmPoMaterialList.value[index].materialId = row.id;
  scmPoMaterialList.value[index].materialName = row.materialName;
  scmPoMaterialList.value[index].materialNumber = row.materialNumber;
  scmPoMaterialList.value[index].brand = row.brand;
  scmPoMaterialList.value[index].specification = row.specification;
  scmPoMaterialList.value[index].unitDict = row.unitDict;
};

// 获取详情
const getDetail = async () => {
  proxy.resetForm('ruleFormRef');
  title.value = route.query.type == 'look' ? '查看' : route.query.id ? '编辑' : '新增';
  if (!id.value) return false;
  const res = await Api.scm.purchaseOrder.getDetail({
    id: id.value,
  });
  const { code, data } = res.data;
  if (code === 200) {
    reFormData(data);
  }
};

// 选择申请单
const handlePRequestChange = async e => {
  formData.value.sourceId = e.id;
  const res = await Api.scm.application.getDetail({
    id: e.id,
  });
  const { code, data } = res.data;
  if (code === 200 && data.scmPrMaterialList.length > 0) {
    data.scmPrMaterialList.forEach(item => {
      let addData = {
        materialId: item.materialId,
        materialNumber: item.materialNumber,
        brand: item.brand,
        materialName: item.materialName,
        specification: item.specification,
        unitDict: item.unitDict,
        quantity: item.quantity,
        disabled: true,
        deliveryDate: dayjs().format('YYYY-MM-DD'),
      };
      scmPoMaterialList.value.push(addData);
    });
  }
};

// 选择供应商
const handleSupplierChange = async e => {
  const res = await Api.scm.supplier.getDetail({
    id: e.id,
  });
  const { code, data } = res.data;
  if (code === 200) {
    formData.value.taxRate = data.finance.taxRate;
    formData.value.currency = data.finance.currency;
  }
};

watch(
  () => [scmPoMaterialList.value, formData.value.supplierId],
  newValue => {
    scmPoMaterialList.value.forEach(item => {
      item.total = item.quantity * item.price;
      item.taxPrice = (item.price * (1 + formData.value.taxRate / 100)).toFixed(2);
      item.taxTotal = (item.quantity * item.price * (1 + formData.value.taxRate / 100)).toFixed(2);
    });
  },
  { deep: true }
);

// 详情回显
const reFormData = data => {
  id.value = data.id;
  formData.value = data;
  scmPoMaterialList.value = data.scmPoMaterialList || [];
  formData.value.supplierNotext = data.no;
  formData.value.orgId = parseInt(formData.value.orgId);
  step.value =
    formData.value.processStatus == '审批中'
      ? 1
      : formData.value.processStatus == '审批结束' || formData.value.processStatus == '已作废'
      ? 2
      : formData.value.processStatus == '开立' && formData.value.isPass != 0
      ? 0
      : formData.value.processStatus == '开立' && formData.value.isPass == 0
      ? 2
      : '';
  isDisabled.value =
    formData.value.processStatus == '审批中' ||
    formData.value.processStatus == '已作废' ||
    route.query.type == 'look'
      ? true
      : false;
  if (formData.value.processStatus == '审批中') {
    filteredSteps.value[2].dictValue = '审批结束';
  }
  if (formData.value.processStatus == '已作废') {
    filteredSteps.value[2].dictValue = '已作废';
  }
  if (formData.value.processStatus == '开立' && formData.value.isPass == 0) {
    filteredSteps.value[2].dictValue = '已驳回';
  }
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      for (let item of scmPoMaterialList.value) {
        if (!item.materialId) {
          proxy.$message.error('物料名称不能为空【采购物料明细】');
          return false;
        }
        if (!item.quantity) {
          proxy.$message.error('采购数量不能为空【采购物料明细】');
          return false;
        }
        if (!item.deliveryDate) {
          proxy.$message.error('交货日期不能为空【采购物料明细】');
          return false;
        }
        if (!item.price) {
          proxy.$message.error('未税单价不能为空【采购物料明细】');
          return false;
        }
      }

      let data = {
        ...formData.value,
        scmPoMaterialList: scmPoMaterialList.value,
        processStatus: formData.value.processStatus || '开立',
        currentTask: formData.value.currentTask || '开始',
        status: formData.value.status || 1,
      };
      const res = await Api.scm.purchaseOrder.submit(data);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
        isDisabled.value = false;
        reFormData(res.data.data);
      }
    }
  });
};

// 添加行
const addRow = () => {
  if (!formData.value.supplierId) {
    proxy.$message.error('请先在基本信息选择供应商');
    ruleFormRef.value.validateField('supplierId');
    return false;
  }
  scmPoMaterialList.value.push({
    disabled: false,
    deliveryDate: dayjs().format('YYYY-MM-DD'),
  });
};

// 删除行
const deleteRow = (index, rows) => {
  rows.splice(index, 1);
};
/** 操作 **/
const doAction = action => {
  switch (action) {
    case '提交审核':
      const dialogOptions = [
        {
          label: '审核人',
          type: 'el-select',
          prop: 'currentTaskUserId',
          labelKey: 'realName',
          valueKey: 'id',
          options: formData.value.auditUserList,
          required: true,
          props: {
            placeholder: '请选择审核人',
          },
        },
      ];
      auditUserRef.value.openDialog(
        { ...formData.value, isPass: 1 },
        Api.scm.purchaseOrder.toExamine,
        dialogOptions
      );
      return;
    case '审核通过':
      proxy
        .$confirm(`确定是否通过审核?`, {
          confirmButtonText: '通过',
          cancelButtonText: '取消',
        })
        .then(() => {
          return Api.scm.purchaseOrder.toExamine({
            ...formData.value,
            isPass: 1,
          });
        })
        .then(res => {
          const { msg } = res.data;
          proxy.$message({
            type: 'success',
            message: msg,
          });
          getDetail();
        });
      return;
  }
};
</script>

<style scoped lang="scss">
.addorEdite {
  background-color: #fff;
  padding: 0px 19px 19px;
  box-sizing: border-box;
  height: 100%;
  position: relative;
  overflow-y: scroll;
  .mr20 {
    margin-right: 20px;
  }

  .currencySpan {
    display: inline-flex;
    align-items: center;

    .dict-text {
      color: #606266;
    }
  }
  .step-desc {
    font-size: 14px;
    color: #999;
    font-weight: 400;
  }
  .title {
    display: flex;
    height: 58px;
    align-items: center;
    border-bottom: 1px solid #dadbe0;
    margin-bottom: 20px;
    position: sticky;
    width: 100%;
    top: 0px;
    background-color: #fff;
    z-index: 99;
    .back-img {
      width: 22px;
      height: 22px;
      margin-right: 8px;
      cursor: pointer;
    }
    .title-btns {
      position: absolute;
      right: 0px;
      top: 0px;
      bottom: 0px;
      margin: auto;
      display: flex;
      align-items: center;
    }
  }
  .steps-wrapper {
    padding: 10px 30%;
    box-sizing: border-box;
  }

  .btm-wrapper {
    background-color: #fff;
    width: 100%;
    position: absolute;
    bottom: 0px;
    left: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    box-shadow: inset 0px 1px 0px 0px #e5e5e5;
    z-index: 9;
  }
}

.uppicture :deep(.component-upload-image) {
  .el-upload--picture-card {
    width: 160px; /* 设置上传按钮的宽度 */
    height: 120px; /* 设置上传按钮的高度 */
    line-height: 120px; /* 设置上传按钮的行高 */
  }

  .el-upload-list--picture-card .el-upload-list__item {
    width: 160px; /* 设置图片项的宽度 */
    height: 120px; /* 设置图片项的高度 */
  }

  .hide .el-upload--picture-card {
    display: none;
  }
}
.form-group-title {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 10px 0px 20px;
  font-weight: 600;
  font-size: 16px;
  color: #333;

  &::before {
    margin-right: 4px;
    display: block;
    content: '';
    width: 4px;
    height: 13px;
    background-color: #f78431;
  }
}

.report-info {
  width: 100%;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #dadbe0;
  padding: 8px 16px;
  box-sizing: border-box;
  margin: 16px 0px 20px;
  background-color: #f6f8fa;
  color: #848488;
  font-size: 14px;
  .report-info-item {
    display: flex;
    align-items: center;
    line-height: 24px;
  }
}
</style>
