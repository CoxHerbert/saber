<template>
  <basic-container class="business-container">
    <div class="wrap">
      <el-form
        class="custom-form"
        ref="ruleFormRef"
        :model="formData"
        :rules="rules"
        label-suffix=":"
        label-width="120px"
        runningStatus-icon
        :inline="true"
      >
        <div class="wrap-left">
          <div class="wrap-left-form">
            <div class="form-group-title">基本信息</div>
            <div class="form-item-info">
              <el-form-item
                class="form-itme-width_50"
                label="客户全称"
                id="fullname"
                prop="fullname"
              >
                <el-autocomplete
                  v-model="formData.fullname"
                  :fetch-suggestions="querySearch"
                  placeholder="请输入企业名称"
                  @select="handleSelect"
                  @input="handleInput"
                  clearable
                >
                  <template #append>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                  </template>
                </el-autocomplete>
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="客户编码"
                id="customerCode"
                prop="customerCode"
              >
                <el-input
                  v-model="formData.customerCode"
                  placeholder="请输入"
                  @input="handleCustomerCodeInput"
                >
                </el-input>
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="法定代表人"
                id="legalPerson"
                prop="legalPerson"
              >
                <el-input v-model="formData.legalPerson" placeholder="请输入" :disabled="isShow" />
              </el-form-item>
              <el-form-item class="form-itme-width_50" label="注册资本" id="regCap" prop="regCap">
                <el-input v-model="formData.regCap" placeholder="请输入" :disabled="isShow" />
              </el-form-item>
              <el-form-item class="form-itme-width_50" label="企业类型" id="regType" prop="regType">
                <el-input v-model="formData.regType" placeholder="请输入" :disabled="isShow" />
              </el-form-item>
              <el-form-item class="form-itme-width_50" label="社会信用代码" id="taxNo" prop="taxNo">
                <el-input v-model="formData.taxNo" placeholder="请输入" :disabled="isShow" />
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="经营状态"
                id="runningStatus"
                prop="runningStatus"
              >
                <el-select
                  v-model="formData.runningStatus"
                  clearable
                  placeholder="请选择"
                  :disabled="isShow"
                >
                  <el-option
                    v-for="item in DC_CRM_OPPS_runningStatus"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="企业注册号"
                id="regCode"
                prop="regCode"
              >
                <el-input v-model="formData.regCode" placeholder="请输入" :disabled="isShow" />
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="注册地址"
                id="regAddress"
                prop="regAddress"
              >
                <el-input v-model="formData.regAddress" placeholder="请输入" :disabled="isShow" />
              </el-form-item>
              <el-form-item class="form-itme-width_50" label="成立日期" id="regDate" prop="regDate">
                <el-date-picker
                  v-model="formData.regDate"
                  type="date"
                  placeholder="请选择"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  :disabled="isShow"
                />
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="注销日期"
                id="cancelDate"
                prop="cancelDate"
              >
                <el-date-picker
                  v-model="formData.cancelDate"
                  type="date"
                  placeholder="请选择"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  :disabled="isShow"
                />
              </el-form-item>

              <el-form-item
                class="form-itme-width_50"
                label="所属工商局"
                id="govBelong"
                prop="govBelong"
              >
                <el-input v-model="formData.govBelong" placeholder="请输入" :disabled="isShow" />
              </el-form-item>

              <el-form-item
                class="form-itme-width_100"
                label="经营范围"
                id="companyScope"
                prop="companyScope"
              >
                <el-input
                  v-model="formData.companyScope"
                  type="textarea"
                  placeholder="请输入"
                  :disabled="isShow"
                />
              </el-form-item>
            </div>
            <div class="form-group-title">客户属性</div>
            <el-form-item
              label="客户分类"
              class="form-itme-width_50"
              id="cusCategory"
              prop="cusCategory"
            >
              <el-select
                v-model="formData.cusCategory"
                clearable
                placeholder="请选择"
                :disabled="isShow"
                @change="handleCategoryChange"
              >
                <el-option
                  v-for="item in DC_CRM_CUS_CATEGORY"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="人员规模"
              class="form-itme-width_50"
              id="staffSize"
              prop="staffSize"
            >
              <el-select
                v-model="formData.staffSize"
                clearable
                placeholder="请选择"
                :disabled="isShow"
              >
                <el-option
                  v-for="item in DC_CRM_CUS_STAFF_SIZE"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="客户级别" class="form-itme-width_50" id="cusLevel" prop="cusLevel">
              <el-select
                v-model="formData.cusLevel"
                clearable
                placeholder="请选择"
                :disabled="isShow"
              >
                <el-option
                  v-for="item in DC_CRM_CUS_LEVEL"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              class="form-itme-width_50"
              label="负责人"
              id="personInChargeUser"
              prop="personInChargeUser"
            >
              <dc-select-user
                v-model="formData.personInChargeUser"
                placeholder="请选择"
                :multiple="false"
                :multiple-limit="1"
              />
            </el-form-item>
            <el-form-item
              label="共享方式"
              class="form-itme-width_50"
              id="cusShareType"
              prop="cusShareType"
            >
              <el-select
                v-model="formData.cusShareType"
                clearable
                placeholder="请选择"
                :disabled="isShow"
                @change="handleSectorChange"
              >
                <el-option
                  v-for="item in DC_CRM_CUS_SHARE_TYPE"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              class="form-itme-width_50"
              label="共享人"
              id="sharerUser"
              prop="sharerUser"
              disabled
              v-if="formDataOpen"
            >
              <dc-select-user
                v-model="formData.sharerUser"
                placeholder="请选择"
                :multiple="true"
                :multiple-limit="20"
              />
            </el-form-item>
            <el-form-item label="行业类别" class="form-itme-width_50" id="sector" prop="sector">
              <el-select
                v-model="formData.sector"
                clearable
                placeholder="请选择"
                :disabled="isShow"
              >
                <el-option
                  v-for="item in DC_CRM_SECTOR"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              class="form-itme-width_100"
              label="客户描述"
              id="customerDesc"
              prop="customerDesc"
            >
              <el-input
                v-model="formData.customerDesc"
                autosize
                type="textarea"
                placeholder="请输入"
                :disabled="isShow"
              />
            </el-form-item>

            <div class="form-group-title">厂区属性</div>
            <el-form-item label="是否为厂区" id="isCm" prop="isCm">
              <el-radio-group v-model="formData.isCm" @change="changeCM" :disabled="isShow">
                <el-radio :value="true" border>是CM</el-radio>
                <el-radio :value="false" border>不是CM</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="CM编码"
              class="form-itme-width_50"
              id="cmCode"
              prop="cmCode"
              v-if="formData.isCm"
            >
              <el-input
                class="w-full"
                v-model="formData.cmCode"
                placeholder="请输入CM编码"
                :disabled="isShow"
              />
            </el-form-item>
            <div class="form-group-title" v-if="formData.isCm">
              厂区
              <el-button type="primary" icon="CirclePlus" text @click="doAction('add')">
                添加厂区
              </el-button>
            </div>
            <el-form-item class="form-itme-width_100" v-if="formData.isCm">
              <el-table :data="formData.crmCustomerAreas" row-key="=id">
                <el-table-column prop="factoryCode" label="厂区编码" align="center" />
                <el-table-column prop="areaName" label="区域" align="center" />
                <el-table-column prop="address" label="详细地址" align="center" />
                <el-table-column fixed="right" label="操作" align="center" width="120">
                  <template #default="scoped">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.stop="doAction('edit', scoped)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.stop="doAction('delete', scoped)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <div class="form-group-title">银行信息</div>
            <el-form-item
              label="开户银行"
              class="form-itme-width_50"
              id="bankOfDeposit"
              prop="bankOfDeposit"
            >
              <el-input v-model="formData.bankOfDeposit" placeholder="请输入" :disabled="isShow" />
            </el-form-item>
            <el-form-item
              label="银行卡号"
              class="form-itme-width_50"
              id="bankAccount"
              prop="bankAccount"
            >
              <el-input v-model="formData.bankAccount" placeholder="请输入" :disabled="isShow" />
            </el-form-item>

            <div class="form-group-title">相关附件</div>
            <el-form-item class="form-itme-width_100" label="相关附件" prop="attachments">
              <dc-upload v-model="formData.attachments" :targetType="Const.targetType.CUSTOMER" />
            </el-form-item>
          </div>
        </div>
        <div class="wrap-right">
          <div class="wrap-right-scroll">
            <div class="wrap-right-content">
              <div class="wrap-right-content-title" @click="anchorPoint('fullname')">
                {{ formData.fullname || '-' }}
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('legalPerson')">
                <div class="label">法定代表人</div>
                <div class="value ellipsis">
                  {{ formData.legalPerson || '-' }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('runningStatus')">
                <div class="label">经营状态</div>
                <div class="value ellipsis">
                  {{ formData.runningStatus }}
                </div>
              </div>
              <div class="wrap-right-content-title">基本信息</div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('fullname')">
                <div class="label">客户全称</div>
                <div class="value ellipsis">
                  {{ formData.fullname || '-' }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('legalPerson')">
                <div class="label">法定代表人</div>
                <div class="value ellipsis">
                  {{ formData.legalPerson }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('regCap')">
                <div class="label">注册资本</div>
                <div class="value ellipsis">
                  {{ formData.regCap }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('regType')">
                <div class="label">企业类型</div>
                <div class="value ellipsis">
                  {{ formData.regType || '-' }}
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('taxNo')">
                <div class="label">社会信用代码</div>
                <div class="value ellipsis">
                  {{ formData.taxNo }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('runningStatus')">
                <div class="label">经营状态</div>
                <div class="value ellipsis">
                  {{ formData.runningStatus }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('regCode')">
                <div class="label">企业注册号</div>
                <div class="value ellipsis">
                  {{ formData.regCode }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('regAddress')">
                <div class="label">注册地址</div>
                <div class="value ellipsis">
                  {{ formData.regAddress }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('regDate')">
                <div class="label">成立日期</div>
                <div class="value ellipsis">
                  {{ formData.regDate }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('cancelDate')">
                <div class="label">注销日期</div>
                <div class="value ellipsis">
                  {{ formData.cancelDate || '-' }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('govBelong')">
                <div class="label">所属工商局</div>
                <div class="value ellipsis">
                  {{ formData.govBelong || '-' }}
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('companyScope')">
                <div class="label">经营范围</div>
                <div class="value ellipsis">
                  {{ formData.companyScope }}
                </div>
              </div>
              <div class="wrap-right-content-title">客户属性</div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('cusCategory')">
                <div class="label">客户分类</div>
                <div class="value ellipsis">
                  <dc-dict
                    type="text"
                    :options="DC_CRM_CUS_CATEGORY"
                    :value="formData.cusCategory"
                  />
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('staffSize')">
                <div class="label">人员规模</div>
                <div class="value ellipsis">
                  <dc-dict
                    type="text"
                    :options="DC_CRM_CUS_STAFF_SIZE"
                    :value="formData.staffSize"
                  />
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('cusLevel')">
                <div class="label">客户级别</div>
                <div class="value ellipsis">
                  <dc-dict type="text" :options="DC_CRM_CUS_LEVEL" :value="formData.cusLevel" />
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('personInChargeUser')">
                <div class="label">负责人</div>
                <div class="value ellipsis">
                  <dc-view
                    v-model="formData.personInChargeUser"
                    objectName="user"
                    showKey="realName"
                  />
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('cusShareType')">
                <div class="label">共享方式</div>
                <div class="value ellipsis">
                  <dc-dict
                    type="text"
                    :options="DC_CRM_CUS_SHARE_TYPE"
                    :value="formData.cusShareType"
                  />
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('sharerUser')">
                <div class="label">共享人</div>
                <div class="value ellipsis">
                  <dc-view v-model="formData.sharerUser" objectName="user" showKey="realName" />
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('sector')">
                <div class="label">行业类别</div>
                <div class="value ellipsis">
                  <dc-dict type="text" :options="DC_CRM_SECTOR" :value="formData.sector" />
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('customerDesc')">
                <div class="label">客户描述</div>
                <div class="value ellipsis">
                  {{ formData.customerDesc || '-' }}
                </div>
              </div>
              <div class="wrap-right-content-title">厂区属性</div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('isCm')">
                <div class="label">是否CM</div>
                <div class="value ellipsis">
                  {{ isCmEnum[formData.isCm] || '-' }}
                </div>
              </div>
              <div
                class="wrap-right-vicecontent"
                @click="anchorPoint('cmCode')"
                v-if="formData.isCm"
              >
                <div class="label">CM编码</div>
                <div class="value ellipsis">
                  {{ formData.cmCode || '-' }}
                </div>
              </div>

              <div class="wrap-right-content-title">银行信息</div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('bankOfDeposit')">
                <div class="label">开户银行</div>
                <div class="value ellipsis">
                  {{ formData.bankOfDeposit || '-' }}
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('bankAccount')">
                <div class="label">银行卡号</div>
                <div class="value ellipsis">
                  {{ formData.bankAccount || '-' }}
                </div>
              </div>
            </div>
          </div>

          <div class="wrap-right-footer">
            <div class="wrap-right-footer-top">
              <el-popover placement="top" title="信息不完整" :width="300" trigger="click">
                <template #default>
                  <div class="unfilled-group">
                    <div
                      class="unfilled-item"
                      v-for="(item, index) in unfilledItems"
                      :key="index"
                      @click="anchorPoint(item.key)"
                    >
                      <div class="unfilled-item_label">{{ item.keyName }}</div>
                      <div class="unfilled-item_value ellipsis">信息为空，请选择</div>
                    </div>
                  </div>
                </template>

                <template #reference>
                  <div class="unfilled-box">
                    {{ unfilledItems.length }}项不完善
                    <el-icon class="arrow-up-icon">
                      <ArrowUp />
                    </el-icon>
                  </div>
                </template>
              </el-popover>
              <el-checkbox
                v-model="uploadChecked"
                :label="`是否进行客户${route.params.id ? '创建' : '保存'}，提交客户信息`"
                size="large"
              />
            </div>
            <div class="wrap-right-footer-btn">
              <el-button type="primary" @click="submitForm"
                >{{ route.params.id === 'create' ? '创建客户' : '保存客户' }}
              </el-button>
              <el-button @click="handleDraft">存草稿</el-button>
              <el-button @click="submitback">取消</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <el-dialog
      :title="cmData.title"
      append-to-body
      v-model="cmData.open"
      width="800px"
      @close="doAction('colse')"
      class="submit-dialog"
    >
      <el-form ref="formRef" :model="cmData.formData" label-width="110px" :rules="cmData.rules">
        <el-form-item label="厂区编码" prop="factoryCode">
          <el-input v-model="cmData.formData.factoryCode" placeholder="请输入厂区编码" clearable />
        </el-form-item>
        <el-form-item label="区域" prop="areaCode">
          <el-cascader
            class="w-full"
            v-model="cmData.formData.areaCode"
            placeholder="请输入区域"
            :options="areaOptions"
            :props="{
              value: 'id',
              label: 'title',
            }"
            clearable
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="cmData.formData.address"
            placeholder="请输入详细地址"
            type="textarea"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="doAction('submit')">确定</el-button>
        <el-button @click="doAction('close')">关闭</el-button>
      </template>
    </el-dialog>
  </basic-container>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, onMounted, getCurrentInstance, computed } from 'vue';
import Api from '@/api/index';
import { useRouter, useRoute } from 'vue-router';
import Const from '@/const';

const router = useRouter();
const route = useRoute(); // 获取当前路由对象

const { proxy } = getCurrentInstance();

// 数据字典
const {
  DC_CRM_OPPS_runningStatus,
  DC_CRM_CUS_CATEGORY,
  DC_CRM_CUS_STAFF_SIZE,
  DC_CRM_CUS_LEVEL,
  DC_CRM_CUS_SHARE_TYPE,
  DC_CRM_SECTOR,
  DC_CUMMON_CREATE_STATUS,
} = proxy.useCache([
  { key: 'DC_CRM_OPPS_runningStatus' },
  { key: 'DC_CRM_CUS_CATEGORY' },
  { key: 'DC_CRM_CUS_STAFF_SIZE' },
  { key: 'DC_CRM_CUS_LEVEL' },
  { key: 'DC_CRM_CUS_SHARE_TYPE' },
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_CUMMON_CREATE_STATUS' },
]);

const pageData = reactive({
  rules: {
    fullname: [{ required: true, message: '请输入', trigger: 'blur' }],
    personInChargeUser: [{ required: true, message: '请选择', trigger: 'blur' }],
    cusCategory: [{ required: true, message: '请输入', trigger: 'blur' }],
    cusLevel: [{ required: true, message: '请输入', trigger: 'blur' }],
    customerDesc: [{ required: true, message: '请选择', trigger: 'blur' }],
    isCm: [{ required: true, message: '请选择', trigger: 'blur' }],
    cmCode: [{ required: true, message: '请选择', trigger: 'blur' }],
  },
  keyNames: {
    fullname: '客户全称',
    cusCategory: '客户分类',
    cusLevel: '客户级别',
    customerDesc: '客户描述',
    personInChargeUser: '负责人',
    isCm: '是否CM',
  },
  formData: {},
  isCmEnum: {
    true: '是CM',
    false: '不是CM',
  },
  formDataList: {
    value: '',
  },
  areaOptions: [], // 区域编码
  suggestions: [],
  isShow: false,
  loading: true,
  uploadChecked: true,
  sharerUserOpen: {
    sharerUserDialog: false,
    sharerUserTitle: undefined,
  },
  formDataOpen: true,
});

const cmData = reactive({
  open: false,
  title: '',
  rules: {
    areaCode: [{ required: true, message: '请选择区域', trigger: 'blur' }],
    factoryCode: [{ required: true, message: '请输入厂区编码', trigger: 'blur' }],
  },
  formData: {},
});

const {
  rules,
  formData,
  isCmEnum,
  keyNames,
  isShow,
  loading,
  uploadChecked,
  areaOptions,
  suggestions,
  formDataList,
  formDataOpen,
} = toRefs(pageData);

watch(
  () => formData.value,
  newVal => {
    if (newVal.isCm) {
      keyNames.value.cmCode = 'CM编码';
    } else {
      delete keyNames.value.cmCode;
    }
  },
  { deep: true }
);

// 未填项
const unfilledItems = computed(() => {
  return Object.keys(keyNames.value)
    .filter(key => {
      if (formData.value[key] instanceof Array && formData.value[key].length === 0) return true;
      if (typeof formData.value[key] === 'string' && !formData.value[key]) return true;
      if (!formData.value[key]) return true;
      return false;
    })
    .map(key => {
      formData.value[key];
      return {
        key,
        keyName: keyNames.value[key],
      };
    });
});

onMounted(async () => {
  getTree();
  if (route.params.id !== 'create') {
    await getDetail(route.params.id);
  } else {
    formData.value.personInChargeUser = proxy.$store.getters.userInfo.user_id;
  }
});

const getTree = async () => {
  const res = await Api.system.region.getLazyTreegetList();
  const { code, data } = res.data;
  if (code === 200) {
    areaOptions.value = data;
  }
};

// 详情数据
const getDetail = async id => {
  try {
    const params = {
      id,
    };
    const res = await Api.crm.customer.getDetail(params);
    const { code, data } = res.data;
    if (code == 200) {
      formData.value = data;
    }
  } catch (error) {
    proxy.$message.error(`错误`);
  }
};

// 获取企业名称列表
const getData = async queryString => {
  try {
    const query = {
      enterpriseName: queryString,
      skip: 0,
    };
    const res = await Api.crm.customer.getCustomerFuzzySearchForEnterpriseName(query);
    return res.data.data.map(item => ({
      value: item.name,
      id: item.id,
    }));
  } catch (error) {
    console.error('获取数据失败', error);
    return [];
  }
};

// 保存 确认创建
const submitForm = () => {
  if (unfilledItems.value.length != 0) {
    proxy.$message.error(`还有${unfilledItems.value.length}条未填写`);
  }
  loading.value = true;
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      if (!uploadChecked.value)
        return proxy.$message.error(
          `请勾选 是否进行客户${route.params.id ? '创建' : '保存'}，提交客户信息`
        );
      // 附件ids
      const idString = proxy.arrayToIdsString({
        array: formData.value.attachments,
      });
      const form = {
        ...formData.value,
        orgId: '100006',
        attachments: idString ?? undefined,
        createStatus: DC_CUMMON_CREATE_STATUS.value[0].id,
      };
      const res = await Api.crm.customer.postCustomerSubmit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        formData.value = {};
        router.push('/crm/myClients/list');
      }
    }
  });
  loading.value = false;
};

// 存草稿
const handleDraft = async () => {
  loading.value = true;
  if (formData.value.fullname == undefined) {
    proxy.$message.error(`必须填客户全称`);
  } else {
    // 附件ids
    const idString = proxy.arrayToIdsString({
      array: formData.value.attachments,
    });
    const form = {
      ...formData.value,
      orgId: '100006',
      attachments: idString,
      createStatus: DC_CUMMON_CREATE_STATUS.value[1].id,
    };
    const res = await Api.crm.customer.postCustomerSubmit(form);
    const { code } = res.data;
    if (code === 200) {
      formData.value = {};
      router.push('/crm/myClients/list');
      loading.value = false;
    }
  }
};

// 自动补全搜索方法
const querySearch = async (queryString, cb) => {
  if (!queryString) {
    cb([]);
    return;
  }
  const results = await getData(queryString);
  suggestions.value = results; // 缓存建议结果
  cb(results);
};

// 选择企业后的处理
const handleSelect = async item => {
  try {
    const params = {
      enterpriseName: item.value,
    };
    const res = await Api.crm.customer.getCustomerEnterpriseBusinessLicenseInquiry(params);
    const { code, data } = res.data;
    if (code == 200) {
      Object.assign(formData.value, {
        fullname: data.format_name,
        legalPerson: data.operName,
        regCap: data.registCapi,
        regType: data.econKind,
        taxNo: data.creditNo,
        runningStatus: data.status,
        regCode: data.regNo,
        regAddress: data.address,
        regDate: data.startDate,
        cancelDate: data.endDate,
        govBelong: data.belongOrg,
        companyScope: data.scope,
      });
    }
  } catch (error) {
    proxy.$message.error(`错误`);
  }
};

const handleCustomerCodeInput = val => {
  formData.value.customerCode = val.replace(/[\u4e00-\u9fff\s]/g, '');
};

// 手动查询
const handleSearch = () => {
  if (!formDataList.value) {
    return;
  }
  const selected = suggestions.value.find(item => item.value === formDataList.value);
  if (selected) {
    handleSelect(selected);
  } else {
    console.log('未找到匹配的企业');
  }
};

// 输入事件
const handleInput = input => {
  // 如果输入框清空，重置基本信息
  if (input === '') {
    Object.assign(formData.value, {
      legalPerson: undefined,
      regCap: undefined,
      regType: undefined,
      taxNo: undefined,
      runningStatus: undefined,
      regCode: undefined,
      regAddress: undefined,
      regDate: undefined,
      cancelDate: undefined,
      govBelong: undefined,
      companyScope: undefined,
    });
  }
};

const submitback = () => {
  router.push('/crm/myClients/list');
};

const anchorPoint = id => {
  proxy.$refs['ruleFormRef'].clearValidate();
  window.location.hash = id;
  proxy.$refs['ruleFormRef'].validateField(id);
};

// 客户分类如果选公海客户，那么共享方式自动默认共享
// 客户分类如果选私有，那么共享方式自动默认私有，并让共享人不显示
const handleCategoryChange = () => {
  if (formData.value.cusCategory === DC_CRM_CUS_CATEGORY.value[0].id) {
    formData.value.cusShareType = '1853709453308252161';
    formDataOpen.value = true;
  } else {
    formData.value.cusShareType = '1853709518596788226';
    formData.value.sharerUser = null;
    formDataOpen.value = false;
  }
};

// 共享方式选择私用清空共享人
const handleSectorChange = () => {
  if (formData.value.cusShareType == DC_CRM_CUS_SHARE_TYPE.value[1].id) {
    formData.value.sharerUser = null;
  }
};

const changeCM = () => {
  if (formData.value.isCm === false) {
    formData.value.cmCode = undefined;
    formData.value.crmCustomerAreas = [];
  }
};

// 处理编辑
const doAction = (action, scope) => {
  const row = scope?.row;
  switch (action) {
    case 'add':
      cmData.title = '添加厂区';
      cmData.formData = {
        areaCode: null,
        address: null,
        factoryCode: null,
      };
      cmData.open = true;
      return;
    case 'edit':
      cmData.title = '编辑厂区';
      cmData.formData = {
        ...row,
        areaCode: row.areaCode.split(','),
      };
      cmData.open = true;
      return;
    case 'delete':
      const ids = row.id;
      proxy
        .$confirm(`确认是否删除编号"${ids}"为的数据项？`)
        .then(() => Api.crm.crmCustomerArea.remove({ ids }))
        .then(() => {
          proxy.$message.success('删除成功');
          formData.value.crmCustomerAreas.splice(scope.$index, 1);
        })
        .catch(() => {});
      return;
    case 'submit':
      submitFormCm();
      return;
    case 'close':
      close();
      return;
  }
};

const close = () => {
  cmData.open = false;
  cmData.formData = {
    areaCode: null,
    address: null,
    factoryCode: null,
  };
};

const submitFormCm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...cmData.formData,
        customerId: formData.value.id,
        areaCode: cmData.formData.areaCode.join(','),
        areaName: findRegionName(cmData.formData.areaCode, areaOptions.value).join(','),
      };
      const res = await Api.crm.crmCustomerArea.submit(form);
      const { code, data } = res.data;
      if (code === 200) {
        if (form.id) {
          const index = formData.value.crmCustomerAreas.findIndex(item => item.id === form.id);
          formData.value.crmCustomerAreas[index] = data;
        } else {
          if (!Array.isArray(formData.value.crmCustomerAreas)) formData.value.crmCustomerAreas = [];
          formData.value.crmCustomerAreas.push(data);
        }
        proxy.$message.success('提交成功');
      }
      cmData.open = false;
    }
  });
};
function findRegionName(ids, regions) {
  const result = [];

  function search(tree) {
    for (const node of tree) {
      if (ids.includes(node.id)) {
        result.push(node.title);
      }
      if (node.children) {
        search(node.children);
      }
    }
  }

  search(regions);
  return result;
}
</script>
<style lang="scss">
.business-container {
  .wrap {
    .custom-form {
      display: flex;
      flex-wrap: wrap;

      .form-item-info {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
      }

      .form-itme-width {
        &_50 {
          width: 50%;
          margin-right: 0;
        }

        &_100 {
          width: 100%;
          margin-right: 0;
        }
      }

      .tag-group {
        padding: 0 12px;
        width: 100%;
        overflow: auto;

        .placeholder {
          color: var(--el-text-color-placeholder);
        }
      }
    }
  }

  .basic-container__card {
    background-color: transparent;

    .el-card__body {
      padding: 0 !important;
    }
  }
}
@media (max-width: 1360px) {
  .form-itme-width_50 {
    width: 100% !important;
    margin-right: 0;
  }
}
</style>
<style scoped lang="scss">
.wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;

  &-left {
    flex: 1;
    height: 100%;
    overflow: auto;
    background: #fff;
    margin-right: 16px;

    &-form {
      margin: auto;
      padding-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
      width: 80%;
    }

    .form-center {
      display: flex;
      flex-wrap: wrap;
    }

    .form-group-title {
      display: flex;
      align-items: center;
      width: 100%;
      margin: 28px 0 32px 0;
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

      .add-box {
        display: inline-flex;
        align-items: center;
        margin-left: 40px;
        font-weight: 400;
        font-size: 14px;
        color: #f78431;
        cursor: pointer;
      }
    }

    .form-item-row {
      width: 93% !important;
    }

    .form-item-width {
      width: 100%;
    }
  }

  &-right {
    width: 460px;
    height: 100%;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    :deep(.el-form-item__label) {
      width: 80px !important;
    }

    &-scroll {
      overflow: auto;
      flex: 1;
    }

    &-content {
      display: flex;
      flex-direction: column;
      padding: 20px;
      gap: 12px;

      &-title {
        height: 32px;
        font-weight: 600;
        font-size: 16px;
        color: #333;
        line-height: 32px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    &-vicecontent {
      display: flex;
      align-items: center;
      width: 100%;
      height: 32px;
      line-height: 32px;
      font-weight: 400;
      font-size: 14px;
      color: #333;

      &:hover {
        background-color: rgba(250, 111, 12, 0.05);

        &::after {
          margin-right: 20px;
          content: '点击可进行锚点定位';
          font-weight: 400;
          font-size: 12px;
          color: #333;
        }
      }

      .label {
        width: 110px;

        &::after {
          content: '：';
        }
      }

      .value {
        flex: 1;
        font-weight: 500;
      }
    }

    &-footer {
      padding-left: 20px;
      border-radius: 8px;
      box-shadow: 4px 0 10px 0 rgba(0, 0, 0, 0.15);

      &-top {
        display: flex;
        align-items: center;
        padding: 10px;
      }

      &-btn {
        border-top: 1px solid #e5e5e5;
        padding: 16px 0;
      }
    }
  }
}

.show-dialog {
  margin-top: 20px;
  float: right;
}

.backList {
  margin-bottom: 15px;
}

.headeAdd {
  margin-bottom: 15px;
}

.unfilled-box {
  margin-right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 99px;
  height: 24px;
  background: rgba(225, 33, 55, 0.1);
  font-size: 12px;
  color: #e12137;
  cursor: pointer;

  .arrow-up-icon {
    margin-left: 5px;
  }
}

.unfilled-group {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  .unfilled-item {
    box-sizing: border-box;
    padding: 0 8px;
    display: flex;
    align-items: center;
    width: 277px;
    height: 32px;
    background-color: #f6f8fa;

    &_label {
      width: 90px;
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    &_value {
      flex: 1;
      cursor: pointer;
    }
  }
}
</style>
