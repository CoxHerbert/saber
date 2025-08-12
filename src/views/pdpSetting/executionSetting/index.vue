<template>
  <div class="app-container">
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <!-- 在此添加搜索项 -->
      <el-form-item label="项目名称" prop="feaItemType">
        <el-input v-model="queryParams.projectName" placeholder="请输入项目名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          icon="Plus"
          v-permission="{ id: 'DC_EXECUTION_SETTING_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="项目名称" prop="projectName" align="center" />
          <!-- <el-table-column label="单据类型" prop="fBillTypeName" align="center" /> -->
          <el-table-column label="创建人" prop="createUser" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createTime" align="center" />
          <el-table-column label="更新人" prop="updateUser" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.updateUser" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column label="更新时间" prop="updateTime" align="center" />
          <!-- 在此添加其他列 -->
          <el-table-column width="240" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'DC_EXECUTION_SETTING_EDIT', row: scoped.row }"
                @click="handleEditSubmit(scoped.row)"
                >编辑
              </el-button>
              <el-button
                link
                type="primary"
                icon="Delete"
                v-permission="{ id: 'DC_EXECUTION_SETTING_DEL', row: scoped.row }"
                @click="handleDelete(scoped.row)"
                >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
    <!-- <submit ref="submitRef" @confirm="getData" /> -->
  </div>
  <el-drawer
    v-model="open"
    :title="title"
    destroy-on-close
    append-to-body
    @close="closeDrawer"
    size="600px"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="项目名称" prop="projectId">
        <dc-select-dialog
          v-model="formData.projectId"
          objectName="project"
          returnType="string"
          placeholder="请点击选择项目名称"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :params="{
            itSADraft: true,
          }"
          @change="changeProject"
        >
        </dc-select-dialog>
      </el-form-item>
      <el-form-item label="销售组织" prop="fSaleOrgId">
        <el-select
          v-model="formData.fSaleOrgDictId"
          placeholder="请选择销售组织"
          @change="handleFSaleOrgIdChange"
        >
          <el-option
            v-for="item in ORG_LIST_CACHE"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="预测组织" prop="fForeOrgId" v-else>
        <el-select
          v-model="formData.fForeOrgDictId"
          placeholder="请选择预测组织"
          @change="handleFForeOrgIdChange"
        >
          <el-option
            v-for="item in ORG_LIST_CACHE"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="销售员" prop="fSalerId">
        <el-select
          v-model="formData.fSalerName"
          placeholder="请选择销售员"
          @change="handleFSalerchange"
          filterable
          clearable
        >
          <el-option
            v-for="item in fSalerList"
            :key="item.id"
            :label="item.fname"
            :value="item.fnumber"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="销售部门" prop="fSaleDeptId">
        <el-input v-model="formData.fSaleDeptName" placeholder="销售部门" disabled />
      </el-form-item>
      <el-form-item label="客户" id="fCustId" prop="fCustId">
        <el-select
          v-model="formData.fCustId"
          filterable
          remote
          reserve-keyword
          placeholder="请输入客户进行搜索"
          :remote-method="remoteCustomerOptions"
          @change="handleCustomerChange"
          clearable
        >
          <el-option
            v-for="item in fCustList"
            :key="item.customerFNumber"
            :label="item.customerFName"
            :value="item.customerFNumber"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收款条件" id="fRecConditionId" prop="fRecConditionId">
        <el-select
          v-model="formData.fRecConditionId"
          filterable
          placeholder="请输入收款条件进行搜索"
          @change="handleFRecConditionChange"
          clearable
          fit-input-width
        >
          <el-option
            v-for="item in fRecConditionList"
            :key="item.id"
            :label="item.fname"
            :value="item.fcode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="结算币种" id="fSettleCurrId" prop="fSettleCurrId">
        <el-select
          v-model="formData.fSettleCurrId"
          filterable
          placeholder="请输入结算币种进行搜索"
          @change="handleFSettleCurrChange"
          clearable
        >
          <el-option
            v-for="item in fSettleCurrList"
            :key="item.id"
            :label="item.currencyName"
            :value="item.currencyCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="终端客户" id="fOraBase" prop="fOraBase">
        <el-select
          v-model="formData.fOraBase"
          filterable
          remote
          reserve-keyword
          placeholder="请输入终端客户进行搜索"
          :remote-method="remoteCustomerOptions"
          @change="handleFOraBaseChange"
          clearable
        >
          <el-option
            v-for="item in fCustList"
            :key="item.customerFNumber"
            :label="item.customerFName"
            :value="item.customerFNumber"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="TPM" id="fTpm" prop="fTpm">
        <el-select
          filterable
          v-model="formData.fTpmName"
          placeholder="请选择TPM"
          @change="handleFtpmChange"
        >
          <el-option
            v-for="item in tpmList"
            :key="item.fmasterId"
            :label="item.fname"
            :value="item.fnumber"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运营跟单" id="fOraText3" prop="fOraText3">
        <el-select
          v-model="formData.fOraText3Name"
          placeholder="请选择运营跟单"
          @change="handleFOraText3Change"
        >
          <el-option
            v-for="item in documentariesList"
            :key="item.fmasterId"
            :label="item.fname"
            :value="item.fnumber"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="项目编号" id="fBdkBase" prop="fBdkBase">
        <el-select
          v-model="formData.fBdkBase"
          filterable
          remote
          reserve-keyword
          placeholder="请输入项目编号进行搜索"
          :remote-method="remoteProjectNumbersOptions"
          clearable
          @change="handleFBdkBaseChange"
          fit-input-width
        >
          <el-option
            v-for="item in projectNumbersList"
            :key="item.id"
            :label="item.fname"
            :value="item.fnumber"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单类型" id="fOraCombo" prop="fOraCombo">
        <el-select
          v-model="formData.fOraCombo"
          filterable
          placeholder="请选择订单类型"
          clearable
          @change="handleFOraComboChange"
        >
          <el-option
            v-for="item in DC_PMS_PROJECT_ORDER"
            :key="item.id"
            :label="item.label"
            :value="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目" id="fBdkText7" prop="fBdkText7">
        <el-select
          v-model="formData.fBdkText7"
          filterable
          placeholder="请选择项目"
          clearable
          @change="handleFBdkText7Change"
        >
          <el-option
            v-for="item in fBdkText7List"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="内部PM" id="fBdkText8" prop="fBdkText8">
        <dc-select-user
          v-model="formData.fBdkText8"
          placeholder="请选择内部PM"
          returnType="string"
          :multiple="false"
          :multiple-limit="1"
        />
      </el-form-item>
      <el-form-item label="机构工程" id="fBdkText9" prop="fBdkText9">
        <dc-select-user
          v-model="formData.fBdkText9"
          placeholder="请选择机构工程"
          returnType="string"
          :multiple="false"
          :multiple-limit="1"
        />
      </el-form-item>
      <el-form-item label="电气工程" id="fBdkText10" prop="fBdkText10">
        <dc-select-user
          v-model="formData.fBdkText10"
          placeholder="请选择电气工程"
          returnType="string"
          :multiple="false"
          :multiple-limit="1"
        />
      </el-form-item>
      <el-form-item label="电子工程" id="fBdkText11" prop="fBdkText11">
        <dc-select-user
          v-model="formData.fBdkText11"
          placeholder="请选择电子工程"
          returnType="string"
          :multiple="false"
          :multiple-limit="1"
        />
      </el-form-item>
      <el-form-item label="软件工程" id="fBdkText12" prop="fBdkText12">
        <dc-select-user
          v-model="formData.fBdkText12"
          placeholder="请选择软件工程"
          returnType="string"
          :multiple="false"
          :multiple-limit="1"
        />
      </el-form-item>
      <el-form-item label="产品系列" id="fEwProducSeriesId" prop="fEwProducSeriesId">
        <el-select
          v-model="formData.fEwProducSeriesId"
          filterable
          remote
          reserve-keyword
          placeholder="请输入产品系列进行搜索"
          :remote-method="remoteFEwProducSeriesOptions"
          @change="handleFEwProducSeriesChange"
          clearable
        >
          <el-option
            v-for="item in fEwProducSeriesList"
            :key="item.id"
            :label="item.fname"
            :value="item.fnumber"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="阶段" id="fEwPhase" prop="fEwPhase">
        <el-select
          v-model="formData.fEwPhase"
          filterable
          placeholder="请选择阶段"
          @change="handleFEwPhaseChange"
          clearable
        >
          <el-option
            v-for="item in fEwPhaseList"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称" id="fOraAssistant1" prop="fOraAssistant1">
        <el-select
          v-model="formData.fOraAssistant1"
          filterable
          remote
          reserve-keyword
          placeholder="请输入项目名称进行搜索"
          :remote-method="remoteFOraAssistant1Options"
          @change="handleFOraAssistant1Change"
          clearable
          fit-input-width
        >
          <el-option
            v-for="item in fOraAssistant1List"
            :key="item.id"
            :label="item.fname"
            :value="item.fnumber"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="成本归属专案" id="fCostAttrMtoNo" prop="fCostAttrMtoNo">
        <el-select
          v-model="formData.fCostAttrMtoNo"
          filterable
          remote
          reserve-keyword
          placeholder="请输入成本归属专案进行搜索"
          :remote-method="remoteFCostAttrMtoNoOptions"
          @change="handleFCostAttrMtoNoChange"
          clearable
          fit-input-width
        >
          <el-option
            v-for="item in fCostAttrMtoNoList"
            :key="item.id"
            :label="item.fname"
            :value="item.fnumber"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="成本类型" id="fEwCostType" prop="fEwCostType">
        <el-select
          v-model="formData.fEwCostType"
          filterable
          placeholder="请选择成本类型"
          @change="handleFEwCostTypeChange"
          clearable
        >
          <el-option
            v-for="item in fEwCostTypeList"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="免费原因" id="fEwFreeReason" prop="fEwFreeReason">
        <el-select
          v-model="formData.fEwFreeReason"
          filterable
          placeholder="请选择免费原因"
          @change="handleFEwFreeReasonChange"
          clearable
        >
          <el-option
            v-for="item in fEwFreeReasonList"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备属性" id="fEwDeviceAttribute" prop="fEwDeviceAttribute">
        <el-select
          v-model="formData.fEwDeviceAttribute"
          filterable
          placeholder="请选择设备属性"
          @change="handleFEwDeviceAttributeChange"
          clearable
        >
          <el-option
            v-for="item in fEwDeviceAttributeList"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目类型" id="fEwProjectType" prop="fEwProjectType">
        <el-select
          v-model="formData.fEwProjectType"
          filterable
          placeholder="请选择项目类型"
          @change="handleFEwProjectTypeChange"
          clearable
        >
          <el-option
            v-for="item in fEwProjectTypeList"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户产品" id="fEwCustomerProduct" prop="fEwCustomerProduct">
        <el-select
          v-model="formData.fEwCustomerProduct"
          filterable
          placeholder="请选择项目类型"
          @change="handleFEwCustomerProductChange"
          clearable
        >
          <el-option
            v-for="item in fEwCustomerProductList"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="均化类型" id="fAveraType" prop="fAveraType">
        <el-select
          v-model="formData.fAveraType"
          filterable
          placeholder="请选择均化类型"
          @change="handleFAveraTypeChange"
          clearable
        >
          <el-option
            v-for="item in fAveraTypeList"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="预留类型" id="fReserveType" prop="fReserveType">
        <el-select
          v-model="formData.fReserveType"
          filterable
          placeholder="请选择预留类型"
          @change="handleFReserveTypeChange"
          clearable
        >
          <el-option
            v-for="item in fReserveTypeList"
            :key="item.id"
            :label="item.bizValue"
            :value="item.bizKey"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">关闭</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="ComponentName">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入

const { proxy } = getCurrentInstance();

// 缓存
const { DC_BILL_TYPE, ORG_LIST_CACHE, DC_PMS_PROJECT_ORDER } = proxy.useCache([
  { key: 'DC_BILL_TYPE' },
  { key: 'ORG_LIST_CACHE' },
  { key: 'DC_PMS_PROJECT_ORDER' },
]);

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
  open: false,
  title: '',
  rules: {},
  formData: {},
  // 销售员接口
  fSalerList: null,
  // tpm接口
  tpmList: null,
  // 运营跟单
  documentariesList: null,
  // 客户
  fCustList: [],
  // 收款条件
  fRecConditionList: null,
  // 结算币种
  fSettleCurrList: null,
  // 项目编号
  projectNumbersList: [],
  // 项目
  fBdkText7List: null,
  // 产品系列
  fEwProducSeriesList: [],
  // 阶段
  fEwPhaseList: [],
  // 项目名称
  fOraAssistant1List: [],
  // 成本归属专案
  fCostAttrMtoNoList: [],
  // 成本类型
  fEwCostTypeList: [],
  // 免费原因
  fEwFreeReasonList: [],
  // 设备属性
  fEwDeviceAttributeList: [],
  // 项目类型
  fEwProjectTypeList: [],
  // 客户产品
  fEwCustomerProductList: [],
  // 均化类型
  fAveraTypeList: [],
  // 预留类型
  fReserveTypeList: [],
});

const {
  loading,
  queryParams,
  dataList,
  total,
  open,
  title,
  rules,
  formData,
  fSalerList,
  tpmList,
  documentariesList,
  fCustList,
  fRecConditionList,
  fSettleCurrList,
  projectNumbersList,
  fBdkText7List,
  fEwProducSeriesList,
  fEwPhaseList,
  fOraAssistant1List,
  fCostAttrMtoNoList,
  fEwCostTypeList,
  fEwFreeReasonList,
  fEwDeviceAttributeList,
  fEwProjectTypeList,
  fEwCustomerProductList,
  fAveraTypeList,
  fReserveTypeList,
} = toRefs(pageData);

onMounted(() => {
  getData();
  // 远程字典
  getDict();
  // 收款条件
  getfRecCondition();
  // 结算币种
  getFSettleCurr();
});

const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.erpOrderConfigure.list(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 调用字典
const getDict = async () => {
  loading.value = true;
  try {
    const res = await Api.pdp.dcErporder.dict();
    const { code, data } = res.data;
    if (code == 200) {
      fBdkText7List.value = data.项目类型;
      fEwPhaseList.value = data.阶段;
      fEwCostTypeList.value = data.成本类型;
      fEwFreeReasonList.value = data.免费原因;
      fEwDeviceAttributeList.value = data.设备属性;
      fEwProjectTypeList.value = data.项目类型;
      fEwCustomerProductList.value = data.客户产品;
      fAveraTypeList.value = data.均化类型;
      fReserveTypeList.value = data.预留类型;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

// 销售员接口
const getFSaler = async id => {
  const form = {
    orgId: id || 100006,
  };
  const res = await Api.pdp.erpSelect.salers(form);
  const { code, data } = res.data;
  if (code === 200) {
    fSalerList.value = data;
  }
};
// 收款条件
const getfRecCondition = async () => {
  const res = await Api.pdp.erpSelect.collectionTerms();
  const { code, data } = res.data;
  if (code === 200) {
    fRecConditionList.value = data;
  }
};
// 结算币种
const getFSettleCurr = async () => {
  const res = await Api.pdp.erpSelect.currencies();
  const { code, data } = res.data;
  if (code === 200) {
    fSettleCurrList.value = data;
  }
};

// TPM接口
const getTpm = async id => {
  const form = {
    orgId: id || 100006,
  };
  const res = await Api.pdp.erpSelect.tpm(form);
  const { code, data } = res.data;
  if (code === 200) {
    tpmList.value = data;
  }
};

// 运营跟单接口
const getDocumentaries = async id => {
  const form = {
    orgId: id || 100006,
  };
  const res = await Api.pdp.erpSelect.documentaries(form);
  const { code, data } = res.data;
  if (code === 200) {
    documentariesList.value = data;
  }
};

// 保存提交
const submitForm = async () => {
  // formRef.value.validate(async valid => {
  //   if (valid) {
  delete formData.value.fBillTypeDictId;
  delete formData.value.fBillTypeId;
  delete formData.value.fBillTypeName;

  const res = await Api.pdp.erpOrderConfigure.submit(formData.value);
  const { code, msg } = res.data;
  if (code === 200) {
    proxy.$message({ type: 'success', message: msg });
    getData();
    closeDrawer();
  }
  //   }
  // });
};

// 关闭抽屉
const closeDrawer = () => {
  open.value = false;
  formData.value = {};
};

const handleSubmit = () => {
  // 处理新增或编辑逻辑
  formData.value = {};
  open.value = true;
  title.value = '新增';
  // 默认带销售组织
  formData.value.fSaleOrgId = 'JL';
  formData.value.fSaleOrgDictId = '100006';
  // 默认带预测组织
  formData.value.fForeOrgId = 'JL';
  formData.value.fForeOrgDictId = '100006';
};

const handleEditSubmit = async row => {
  // 处理新增或编辑逻辑
  open.value = true;
  title.value = '修改';
  const id = {
    id: row.id,
  };
  const res = await Api.pdp.erpOrderConfigure.detail(id);
  const { code, data } = res.data;
  if (code === 200) {
    formData.value = data;
    formData.value.fBillTypeDictParent = '1870708016893067265';
    showData();
    // 销售员
    getFSaler(formData.value.fSaleOrgDictId);
    // TPM
    getTpm(formData.value.fSaleOrgDictId);
    // 运营跟单
    getDocumentaries(formData.value.fSaleOrgDictId);
  }
};

const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.pdp.erpOrderConfigure.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
};

const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };

  proxy.resetForm('queryRef');
  getData();
};

// change事件
// 单据类型change事件
// const handlefBillTypeChange = value => {
//   const fBillTypeData = DC_BILL_TYPE.value.find(item => item.dictKey === value);
//   formData.value.fBillTypeDictId = fBillTypeData.id;
//   formData.value.fBillTypeId = fBillTypeData.dictKey;
//   formData.value.fBillTypeName = fBillTypeData.dictValue;
//   formData.value.fBillTypeDictParent = fBillTypeData.parentId;
// };
// 销售组织change事件
const handleFSaleOrgIdChange = value => {
  const fSaleOrgData = ORG_LIST_CACHE.value.find(item => item.value === value);
  // 销售组织
  formData.value.fSaleOrgId = fSaleOrgData.orgCode;
  formData.value.fSaleOrgDictId = fSaleOrgData.value;
  formData.value.fSaleOrgName = fSaleOrgData.label;
  // 预测组织
  formData.value.fForeOrgId = fSaleOrgData.orgCode;
  formData.value.fForeOrgDictId = fSaleOrgData.value;
  formData.value.fForeOrgName = fSaleOrgData.label;
  // 组织
  formData.value.realFOrgId = fSaleOrgData.value;
  // 接口传参
  getFSaler(formData.value.fSaleOrgDictId);
  getTpm(formData.value.fSaleOrgDictId);
  getDocumentaries(formData.value.fSaleOrgDictId);
  // 切换部门 清空数据
  // 清空销售员
  formData.value.fSalerId = null;
  formData.value.fSalerName = null;
  // 清空TPM
  formData.value.fTpm = null;
  formData.value.fTpmName = null;
  // 清空运营跟单
  formData.value.fOraText3 = null;
  formData.value.fOraText3Name = null;
  // 清空销售部门
  formData.value.fSaleDeptId = null;
  formData.value.fSaleDeptName = null;
  // 清空客户 终端客户
  formData.value.fCustId = null;
  formData.value.fCustName = null;
  formData.value.fOraBase = null;
  formData.value.fOraBaseName = null;
  fCustList.value = [];
  // 清空收款条件
  formData.value.fRecConditionId = null;
  formData.value.fRecConditionName = null;
  // 清空结算币种
  formData.value.fSettleCurrId = null;
  formData.value.fSettleCurrName = null;
  // 清空项目编号
  formData.value.fBdkBase = null;
  formData.value.fBdkBaseName = null;
  projectNumbersList.value = [];
};

// 预测组织change事件
// const handleFForeOrgIdChange = value => {
//   const fForeOrgData = ORG_LIST_CACHE.value.find(item => item.value === value);

//   // 组织
//   formData.value.realFOrgId = fForeOrgData.value;
//   // 接口传参
//   getFSaler(formData.value.fSaleOrgDictId);
//   getTpm(formData.value.fSaleOrgDictId);
//   getDocumentaries(formData.value.fSaleOrgDictId);
//   // 切换部门 清空数据
//   // 清空销售员
//   formData.value.fSalerId = null;
//   formData.value.fSalerName = null;
//   // 清空TPM
//   formData.value.fTpm = null;
//   formData.value.fTpmName = null;
//   // 清空运营跟单
//   formData.value.fOraText3 = null;
//   formData.value.fOraText3Name = null;
//   // 清空销售部门
//   formData.value.fSaleDeptId = null;
//   formData.value.fSaleDeptName = null;
//   // 清空客户 终端客户
//   formData.value.fCustId = null;
//   formData.value.fCustName = null;
//   formData.value.fOraBase = null;
//   formData.value.fOraBaseName = null;
//   fCustList.value = [];
//   // 清空收款条件
//   formData.value.fRecConditionId = null;
//   formData.value.fRecConditionName = null;
//   // 清空结算币种
//   formData.value.fSettleCurrId = null;
//   formData.value.fSettleCurrName = null;
//   // 清空项目编号
//   formData.value.fBdkBase = null;
//   formData.value.fBdkBaseName = null;
//   projectNumbersList.value = [];
// };

// 销售员change事件
const handleFSalerchange = value => {
  const fSalerIdData = fSalerList.value.find(item => item.fnumber === value);
  // 销售员
  formData.value.fSalerId = fSalerIdData.fnumber;
  formData.value.fSalerName = fSalerIdData.fname;
  // 销售部门
  formData.value.fSaleDeptId = fSalerIdData.fdeptCode;
  formData.value.fSaleDeptName = fSalerIdData.fdeptName;
};

// 客户change事件
const handleCustomerChange = value => {
  const fCustIdData = fCustList.value.find(item => item.customerFNumber === value);
  // 客户
  formData.value.fCustId = fCustIdData.customerFNumber;
  formData.value.fCustName = fCustIdData.customerFName;
  // 收款条件
  formData.value.fRecConditionId = fCustIdData.collectionTermICode;
  formData.value.fRecConditionName = fCustIdData.collectionTermIName;
  // 结算币种
  formData.value.fSettleCurrId = fCustIdData.currencyCode;
  formData.value.fSettleCurrName = fCustIdData.currencyName;
  // 汇率
  formData.value.fExchangeRate = fCustIdData.exchangeRate;
  // 税率
  formData.value.fOraTaxRate = fCustIdData.taxRateName;
};

// 收款条件change事件
const handleFRecConditionChange = value => {
  const fRecConditionData = fRecConditionList.value.find(item => item.fcode === value);
  // 收款条件
  formData.value.fRecConditionId = fRecConditionData.fcode;
  formData.value.fRecConditionName = fRecConditionData.fname;
};

// 结算币种change事件
const handleFSettleCurrChange = value => {
  const fSettleCurrData = fSettleCurrList.value.find(item => item.currencyCode === value);
  // 结算币种
  formData.value.fSettleCurrId = fSettleCurrData.currencyCode;
  formData.value.fSettleCurrName = fSettleCurrData.currencyName;
};

// 终端客户change事件
const handleFOraBaseChange = value => {
  const fCustIdData = fCustList.value.find(item => item.customerFNumber === value);
  // 终端客户
  formData.value.fOraBase = fCustIdData.customerFNumber;
  formData.value.fOraBaseName = fCustIdData.customerFName;
};

// TPM change事件
const handleFtpmChange = value => {
  const fTpmData = tpmList.value.find(item => item.fnumber === value);
  // TPM
  formData.value.fTpm = fTpmData.fnumber;
  formData.value.fTpmName = fTpmData.fname;
};

// 运营跟单change事件
const handleFOraText3Change = value => {
  const documentariesData = documentariesList.value.find(item => item.fnumber === value);
  // 运营跟单
  formData.value.fOraText3 = documentariesData.fnumber;
  formData.value.fOraText3Name = documentariesData.fname;
};

// 项目编号change事件
const handleFBdkBaseChange = value => {
  const fBdkBaseData = projectNumbersList.value.find(item => item.fnumber === value);
  formData.value.fBdkBase = fBdkBaseData.fnumber;
  formData.value.fBdkBaseName = fBdkBaseData.fname;
};

// 订单类型change事件
const handleFOraComboChange = value => {
  const FOraComboData = DC_PMS_PROJECT_ORDER.value.find(item => item.label === value);
  formData.value.fOraCombo = FOraComboData.label;
  formData.value.fOraComboDictId = FOraComboData.value;
};

// 项目change事件
const handleFBdkText7Change = value => {
  const fBdkText7Data = fBdkText7List.value.find(item => item.bizKey === value);
  formData.value.fBdkText7 = fBdkText7Data.bizKey;
  formData.value.fBdkText7Name = fBdkText7Data.bizValue;
};

// 产品系列 change事件
const handleFEwProducSeriesChange = value => {
  const fEwProducSeriesData = fEwProducSeriesList.value.find(item => item.fnumber === value);
  formData.value.fEwProducSeriesId = fEwProducSeriesData.fnumber;
  formData.value.fEwProducSeriesName = fEwProducSeriesData.fname;
};

// 阶段 change事件
const handleFEwPhaseChange = value => {
  const fEwPhaseData = fEwPhaseList.value.find(item => item.bizKey === value);
  formData.value.fEwPhase = fEwPhaseData.bizKey;
  formData.value.fEwPhaseName = fEwPhaseData.bizValue;
};

// 项目名称 change事件
const handleFOraAssistant1Change = value => {
  const fOraAssistant1Data = fOraAssistant1List.value.find(item => item.fnumber === value);
  formData.value.fOraAssistant1 = fOraAssistant1Data.fnumber;
  formData.value.fOraAssistant1Name = fOraAssistant1Data.fname;
};

// 成本归属专案 change事件
const handleFCostAttrMtoNoChange = value => {
  const fCostAttrMtoNoData = fCostAttrMtoNoList.value.find(item => item.fnumber === value);
  formData.value.fCostAttrMtoNo = fCostAttrMtoNoData.fnumber;
  formData.value.fCostAttrMtoNoName = fCostAttrMtoNoData.fname;
};

// 成本类型change事件
const handleFEwCostTypeChange = value => {
  const fEwCostTypeData = fEwCostTypeList.value.find(item => item.bizKey === value);
  formData.value.fEwCostType = fEwCostTypeData.bizKey;
  formData.value.fEwCostTypeName = fEwCostTypeData.bizValue;
};

// 免费原因change事件
const handleFEwFreeReasonChange = value => {
  const fEwFreeReasonData = fEwFreeReasonList.value.find(item => item.bizKey === value);
  formData.value.fEwFreeReason = fEwFreeReasonData.bizKey;
  formData.value.fEwFreeReasonName = fEwFreeReasonData.bizValue;
};

// 设备属性change事件
const handleFEwDeviceAttributeChange = value => {
  const fEwDeviceAttributeData = fEwDeviceAttributeList.value.find(item => item.bizKey === value);
  formData.value.fEwDeviceAttribute = fEwDeviceAttributeData.bizKey;
  formData.value.fEwDeviceAttributeName = fEwDeviceAttributeData.bizValue;
};

// 项目类型
const handleFEwProjectTypeChange = value => {
  const fEwProjectTypeData = fEwProjectTypeList.value.find(item => item.bizKey === value);
  formData.value.fEwProjectType = fEwProjectTypeData.bizKey;
  formData.value.fEwProjectTypeName = fEwProjectTypeData.bizValue;
};

// 客户产品change事件
const handleFEwCustomerProductChange = value => {
  const fEwCustomerProductData = fEwCustomerProductList.value.find(item => item.bizKey === value);
  formData.value.fEwCustomerProduct = fEwCustomerProductData.bizKey;
  formData.value.fEwCustomerProductName = fEwCustomerProductData.bizValue;
};

// 均化类型change 事件
const handleFAveraTypeChange = value => {
  const fAveraTypeData = fAveraTypeList.value.find(item => item.bizKey === value);
  formData.value.fAveraType = fAveraTypeData.bizKey;
  formData.value.fAveraTypeName = fAveraTypeData.bizValue;
};

// 预留类型change 事件
const handleFReserveTypeChange = value => {
  const fReserveTypeData = fReserveTypeList.value.find(item => item.bizKey === value);
  formData.value.fReserveType = fReserveTypeData.bizKey;
  formData.value.fReserveTypeName = fReserveTypeData.bizValue;
};

// 远程搜索事件
// 远程搜索获取客户列表
const remoteCustomerOptions = async fullname => {
  if (!fullname) return;
  if (fullname.length < 2) return;
  const form = {
    orgId: formData.value.fSaleOrgDictId || 100006,
    name: fullname,
  };

  const res = await Api.pdp.erpSelect.customers(form);
  const { code, data } = res.data;
  if (code === 200) {
    fCustList.value = data;
  }
};

// 远程搜索获取项目编号列表
const remoteProjectNumbersOptions = async fullname => {
  if (!fullname) return;
  if (fullname.length < 2) return;
  const form = {
    orgId: formData.value.fSaleOrgDictId || 100006,
    name: fullname,
  };
  const res = await Api.pdp.erpSelect.projectNumbers(form);
  const { code, data } = res.data;
  if (code === 200) {
    projectNumbersList.value = data;
  }
};

// 远程搜索获取产品系类列表
const remoteFEwProducSeriesOptions = async fullname => {
  const form = {
    name: fullname,
  };
  const res = await Api.pdp.erpSelect.productSeriation(form);
  const { code, data } = res.data;
  if (code === 200) {
    fEwProducSeriesList.value = data;
  }
};

// 远程搜索获取项目名称列表
const remoteFOraAssistant1Options = async fullname => {
  if (!fullname) return;
  if (fullname.length < 2) return;
  const form = {
    name: fullname,
  };
  const res = await Api.pdp.erpSelect.projectNames(form);
  const { code, data } = res.data;
  if (code === 200) {
    fOraAssistant1List.value = data;
  }
};

// 远程搜索获取成本归属专案列表
const remoteFCostAttrMtoNoOptions = async fullname => {
  if (!fullname) return;
  if (fullname.length < 5) return;
  const form = {
    number: fullname,
  };
  const res = await Api.pdp.erpSelect.projectNumbers(form);
  const { code, data } = res.data;
  if (code === 200) {
    fCostAttrMtoNoList.value = data;
  }
};

// 确认项目名称
const changeProject = project => {
  // 项目 id 编码 名称
  formData.value.projectId = project.id;
  formData.value.projectCode = project.projectCode;
  formData.value.projectName = project.projectName;
};

// 回显方法
const showData = () => {
  // 客户
  fCustList.value.push({
    customerFNumber: formData.value.fCustId,
    customerFName: formData.value.fCustName,
  });
  // 终端客户
  fCustList.value.push({
    customerFNumber: formData.value.fOraBase,
    customerFName: formData.value.fOraBaseName,
  });
  // 项目编号
  projectNumbersList.value.push({
    fnumber: formData.value.fBdkBase,
    fname: formData.value.fBdkBaseName,
  });
  // 项目名称
  fOraAssistant1List.value.push({
    fnumber: formData.value.fOraAssistant1,
    fname: formData.value.fOraAssistant1Name,
  });
  // 成本归属专案
  fCostAttrMtoNoList.value.push({
    fnumber: formData.value.fCostAttrMtoNo,
    fname: formData.value.fCostAttrMtoNoName,
  });
};
</script>

<style lang="scss" scoped></style>
