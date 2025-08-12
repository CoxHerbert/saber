<template>
  <div class="addorEdite">
    <div class="title">
      <img
        src="../../../../../public/img/back.png"
        alt=""
        class="back-img"
        @click="$router.go(-1)"
      />{{ title }}供应商

      <div class="title-btns">
        <el-button
          type="primary"
          @click="submitForReview('提交审核')"
          v-if="formData.flagStatusDict == 0 && title != '查看'"
          >提交审核</el-button
        >
        <el-button v-if="formData.flagStatusDict == 1" @click="submitForReview('取消审核')"
          >取消审核</el-button
        >
        <el-button
          v-if="(formData.flagStatusDict == 0 || !formData.id) && title != '查看'"
          type="primary"
          @click="submitForm(ruleFormRef)"
          >保存</el-button
        >
      </div>
    </div>
    <el-form
      ref="ruleFormRef"
      :rules="rules"
      :model="formData"
      label-suffix=":"
      label-width="auto"
      style="overflow-x: hidden"
    >
      <div class="form-group-title">基础信息</div>
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="供应商名称" prop="supplierName">
            <el-input
              v-model="formData.supplierName"
              placeholder="请输入供应商名称"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="供应商分类" prop="supplierClassifyDict">
            <el-select
              style="width: 100%"
              v-model="formData.supplierClassifyDict"
              placeholder="请选择供应商分类"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in DC_SCM_SUPPLIER"
                :key="index"
                :value="item.dictKey"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="供应商编码" prop="supplierNotext">
            <el-input
              v-model="formData.supplierNotext"
              placeholder="请输入供应商编码"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="签约开始日期" prop="startDate">
            <el-date-picker
              style="width: 100%"
              v-model="formData.startDate"
              type="date"
              placeholder="签约开始日期："
              format="YYYY/MM/DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              @click.stop
              :disabled="isDisabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="签约结束日期" prop="endDate">
            <el-date-picker
              style="width: 100%"
              v-model="formData.endDate"
              type="date"
              placeholder="签约结束日期"
              format="YYYY/MM/DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              @click.stop
              :disabled="isDisabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结算方式" prop="paytermsDict">
            <el-select
              v-model="formData.paytermsDict"
              placeholder="请选择结算方式"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in DC_SUPPLIER_PAYTERMS"
                :key="index"
                :value="item.dictKey"
                :label="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="组织" prop="orgId">
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
          <el-form-item label="供应商地址" prop="supplierAddress">
            <el-input
              v-model="formData.supplierAddress"
              placeholder="请输入供应商地址"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="form-group-title">财务信息</div>
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="发票抬头" prop="invoiceTitle">
            <el-input
              v-model="formData.invoiceTitle"
              placeholder="请输入发票抬头"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发票税号" prop="invoiceTaxNumber">
            <el-input
              v-model="formData.invoiceTaxNumber"
              placeholder="请输入发票抬头"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发票类型" prop="taxCategoriesDict">
            <el-select
              v-model="formData.taxCategoriesDict"
              placeholder="请选择发票类型"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in DC_TAX_CATEGORIES"
                :key="index"
                :value="item.dictKey"
                :label="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="增值税率" prop="taxRate">
            <el-input
              v-model="formData.taxRate"
              placeholder="请输入增值税率"
              :disabled="isDisabled"
            >
              <template #append>%</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开户银行" prop="bank">
            <el-input
              v-model="formData.bank"
              placeholder="请输入开户银行"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="银行账号" prop="bankAccount">
            <el-input
              v-model="formData.bankAccount"
              placeholder="请输入银行账号"
              :disabled="isDisabled"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="币种" prop="currency">
            <el-select
              v-model="formData.currency"
              placeholder="请选择币种"
              clearable
              :disabled="isDisabled"
            >
              <el-option
                v-for="(item, index) in DC_FINANCE_CURRENCY"
                :key="index"
                :value="item.dictKey"
                :label="item.dictValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="form-group-title">相关附件</div>
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item prop="pictureId" class="uppicture">
            <dc-upload
              v-model="formData.contractFileId"
              :limit="10"
              :targetType="Const.targetType.CUSTOMER_RLIST"
              :isUpload="!isDisabled"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="form-group-title">联系人明细</div>
      <el-button
        type="primary"
        plain
        style="margin: -5px 0px 10px"
        @click="addRow"
        v-if="!isDisabled"
        >新增</el-button
      >
      <el-table :data="contacts" style="width: 100%">
        <el-table-column label="" width="60" v-if="!isDisabled">
          <template #default="scope">
            <el-button
              type="text"
              icon="el-icon-minus"
              circle
              @click="deleteRow(scope.$index, contacts)"
              :disabled="isDisabled"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index" width="60px" align="center">
          <template #default="scoped">
            <span>{{ scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contactName" label="姓名" width="120" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.contactName" v-if="!isDisabled" />
            <div v-else>{{ scope.row.contactName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" align="center" width="100">
          <template #default="scope">
            <el-select v-model="scope.row.gender" v-if="!isDisabled" placeholder="性别">
              <el-option label="男" value="男"></el-option>
              <el-option label="女" value="女"></el-option>
            </el-select>
            <div v-else>{{ scope.row.gender }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="contactPosition" label="职务" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.contactPosition" v-if="!isDisabled" />
            <div v-else>{{ scope.row.contactPosition }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="contactPhone" label="电话" align="center">
          <template #default="scope">
            <el-input
              type="number"
              v-model="scope.row.contactPhone"
              :disabled="isDisabled"
              v-if="!isDisabled"
            />
            <div v-else>{{ scope.row.contactPhone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="telephone" label="手机号" align="center">
          <template #default="scope">
            <el-input type="number" v-model="scope.row.telephone" v-if="!isDisabled" />
            <div v-else>{{ scope.row.telephone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="facsimile" label="传真" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.facsimile" v-if="!isDisabled" />
            <div v-else>{{ scope.row.facsimile }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="电子邮箱" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.email" v-if="!isDisabled" />
            <div v-else>{{ scope.row.email }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="defaultContact" label="默认联系人" align="center" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.defaultContact"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0"
              @change="e => changeDefaultContact(e, scope.$index)"
              v-if="!isDisabled"
            >
            </el-switch>
            <div v-else>{{ scope.row.defaultContact == 1 ? '是' : '否' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center">
          <template #default="scope">
            <el-input v-model="scope.row.remark" v-if="!isDisabled" />
            <div v-else>{{ scope.row.remark }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="disable" label="禁用状态" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.disable"
              active-value="1"
              inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              v-if="!isDisabled"
            >
            </el-switch>
            <div v-else>{{ scope.row.disable == 1 ? '是' : '否' }}</div>
          </template>
        </el-table-column>
      </el-table>
      <div class="form-group-title">基础信息</div>

      <el-row :gutter="24" style="width: 100%">
        <el-col :span="6">
          <el-form-item label="创建人">
            <dc-view v-model="baseInfo.createUser" objectName="user" :disabled="isDisabled" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建时间">
            {{ baseInfo.createTime }}
          </el-form-item>
        </el-col>
        <el-col :span="6" v-if="formData.flagStatusDict == 1">
          <el-form-item label="审核人">
            <dc-view v-model="formData.flagUserId" objectName="user" :disabled="isDisabled" />
          </el-form-item>
        </el-col>
        <el-col :span="6" v-if="formData.flagStatusDict == 1">
          <el-form-item label="审核时间">
            {{ formData.flagTime }}
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue';
import Api from '@/api/index';
import dayjs from 'dayjs';
import Const from '@/const';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
const route = useRoute(); // 获取当前路由对象
const store = useStore();
const router = useRouter();
const { proxy } = getCurrentInstance();
// 数据字典
const {
  DC_SCM_SUPPLIER,
  SCMORG_LIST_CACHE,
  DC_SUPPLIER_PAYTERMS,
  DC_TAX_CATEGORIES,
  DC_FINANCE_CURRENCY,
} = proxy.useCache([
  { key: 'DC_SCM_SUPPLIER' },
  { key: 'SCMORG_LIST_CACHE' },
  { key: 'DC_SUPPLIER_PAYTERMS' },
  { key: 'DC_TAX_CATEGORIES' },
  { key: 'DC_FINANCE_CURRENCY' },
]);

const data = reactive({
  loading: true,
  rules: {
    supplierName: [{ required: true, message: '供应商名称为必选项', trigger: 'change' }],
    supplierClassifyDict: [{ required: true, message: '供应商分类为必选项', trigger: 'change' }],
    orgId: [{ required: true, message: '组织为必选项', trigger: 'change' }],
    // invoiceTitle: [{ required: true, message: '发票抬头为必选项', trigger: 'change' }],
    // invoiceTaxNumber: [{ required: true, message: '发票税号为必选项', trigger: 'change' }],
    // taxCategoriesDict: [{ required: true, message: '发票类型为必选项', trigger: 'change' }],
    // taxRate: [{ required: true, message: '增值税率为必选项', trigger: 'change' }],
    // bank: [{ required: true, message: '开户银行为必选项', trigger: 'change' }],
    // bankAccount: [{ required: true, message: '银行账号为必选项', trigger: 'change' }],
    // currency: [{ required: true, message: '币种为必选项', trigger: 'change' }],
  },
  formData: {
    supplierNotext: '系统自动生成',
  },
  baseInfo: {
    createTime: dayjs().format('YYYY-MM-DD HH:mm'),
    createUser: store.getters.userInfo.user_id,
  },
  ids: [],
  isDisabled: false,
  title: '新增',
  // 联系人列表
  contacts: [],
});

const { rules, formData, title, contacts, baseInfo, isDisabled } = toRefs(data);
const ruleFormRef = ref(null);
const emit = defineEmits(['success']);

onMounted(() => {
  getDetail();
  isDisabled.value = route.query.type == 'look';
});

// 修改默认联系人
const changeDefaultContact = (e, index) => {
  if (e) {
    contacts.value.forEach((item, sindex) => {
      if (index != sindex) {
        item.defaultContact = '0';
      }
    });
  }
};

// 审核和反审核
const submitForReview = name => {
  proxy.$confirm(`确定${name}吗`).then(async () => {
    let form = new FormData();
    form.append('flagStatusDict', name == '提交审核' ? 1 : 0);
    form.append('id', formData.value.id);
    const res = await Api.scm.supplier.supplierUpdate(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message.success(msg);
      getDetail();
    }
  });
};

// 获取详情
const getDetail = async id => {
  proxy.resetForm('ruleFormRef');
  title.value = route.query.type == 'look' ? '查看' : route.query.id ? '编辑' : '新增';
  if (!route.query.id) return false;
  const res = await Api.scm.supplier.getDetail({
    id: route.query.id,
  });
  const { code, data } = res.data;
  if (code === 200) {
    reFormData(data);
  }
};

const reFormData = data => {
  contacts.value = data.contacts;
  formData.value = { ...data.finance, ...data };
  formData.value.supplierNotext = data.supplierNo;
  formData.value.orgId = parseInt(formData.value.orgId);
  baseInfo.value.createUser = data.createUser;
  baseInfo.value.createTime = data.createTime;
  isDisabled.value =
    formData.value.flagStatusDict == 1 || route.query.type == 'look' ? true : false;
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      let data = {
        ...formData.value,
        contacts: contacts.value,
        flagStatusDict: formData.value.flagStatusDict || 0,
        finance: {
          id: formData.value?.finance?.id || null,
          invoiceTitle: formData.value.invoiceTitle,
          invoiceTaxNumber: formData.value.invoiceTaxNumber,
          taxCategoriesDict: formData.value.taxCategoriesDict,
          taxRate: formData.value.taxRate,
          bank: formData.value.bank,
          bankAccount: formData.value.bankAccount,
          currency: formData.value.currency,
        },
      };

      for (let item of contacts.value) {
        if (!item.contactName) {
          proxy.$message.error('姓名不能为空【联系人明细】');
          return false;
        }
        if (!item.gender) {
          proxy.$message.error('性别不能为空【联系人明细】');
          return false;
        }
        if (!item.contactPosition) {
          proxy.$message.error('职务不能为空【联系人明细】');
          return false;
        }
        if (!item.telephone) {
          proxy.$message.error('手机号不能为空【联系人明细】');
          return false;
        }
      }

      if (
        Array.isArray(formData.value.contractFileId) &&
        formData.value.contractFileId.length > 0
      ) {
        let contractFileIdsList = formData.value.contractFileId.map(item => {
          return item.id;
        });
        data.contractFileId = contractFileIdsList.join(',');
      }
      const res = await Api.scm.supplier.submit(data);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
        isDisabled.value = false;
        router.go(-1);
        // reFormData(res.data.data);
      }
    }
  });
};

// 添加行
const addRow = () => {
  contacts.value.push({ inspectionItem: '', method: '' });
};

// 删除行
const deleteRow = (index, rows) => {
  rows.splice(index, 1);
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
