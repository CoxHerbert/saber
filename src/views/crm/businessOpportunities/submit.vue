<template>
  <basic-container class="business-container">
    <div class="wrap">
      <el-form
        class="custom-form"
        ref="ruleFormRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        status-icon
        :inline="true"
      >
        <div class="wrap-left">
          <div class="wrap-left-form">
            <div class="form-group-title">基本信息</div>
            <div class="form-item-info">
              <el-form-item
                class="form-itme-width_50"
                label="商机名称"
                id="oppsName"
                prop="oppsName"
              >
                <el-input v-model="formData.oppsName" placeholder="请输入" :disabled="isShow" />
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="商机客户"
                id="customerId"
                prop="customerId"
              >
                <dc-select-remote
                  v-model="formData.customerId"
                  placeholder="请输入客户名称进行搜索"
                  objectName="customer"
                  :multiple="false"
                  :multipleLimit="1"
                  @change="changeCustomer"
                  :clearable="true"
                  :params="{
                    createStatus: '1862657905210236930',
                  }"
                />
              </el-form-item>
              <el-form-item class="form-itme-width_50" label="商机来源" id="fromId" prop="fromId">
                <el-select
                  v-model="formData.fromId"
                  clearable
                  placeholder="请选择"
                  :disabled="isShow"
                >
                  <el-option
                    v-for="item in DC_CRM_OPPS_FROM"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="来源详情"
                id="fromDesc"
                prop="fromDesc"
              >
                <el-input v-model="formData.fromDesc" placeholder="请输入" :disabled="isShow" />
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="行业类别"
                id="sectorId"
                prop="sectorId"
              >
                <el-select
                  v-model="formData.sectorId"
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
                class="form-itme-width_50"
                label="商机级别"
                id="oppsLevelId"
                prop="oppsLevelId"
              >
                <el-select
                  v-model="formData.oppsLevelId"
                  clearable
                  placeholder="请选择"
                  :disabled="isShow"
                >
                  <el-option
                    v-for="item in DC_CRM_OPPS_LEVEL"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item class="form-itme-width_50" label="BD" id="bdUserId" prop="bdUserId">
                <dc-select-user
                  v-model="formData.bdUserId"
                  placeholder="请选择"
                  :multiple="false"
                  :multiple-limit="1"
                />
              </el-form-item>
              <el-form-item class="form-itme-width_50" label="TPM" id="tpmUserId" prop="tpmUserId">
                <dc-select-user
                  v-model="formData.tpmUserId"
                  placeholder="请选择"
                  :multiple="false"
                  :multiple-limit="1"
                />
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="所属组织"
                id="oppsOrgId"
                prop="oppsOrgId"
              >
                <dc-select
                  v-model="formData.oppsOrgId"
                  objectName="org"
                  placeholder="请选择"
                  :disabled="isShow"
                />
              </el-form-item>

              <el-form-item
                class="form-itme-width_100"
                label="商机背景"
                id="oppsBackground"
                prop="oppsBackground"
              >
                <el-input
                  v-model="formData.oppsBackground"
                  autosize
                  type="textarea"
                  placeholder="请输入"
                  :disabled="isShow"
                />
              </el-form-item>
              <el-form-item
                class="form-itme-width_100"
                label="进度描述"
                id="progressDesc"
                prop="progressDesc"
              >
                <el-input
                  v-model="formData.progressDesc"
                  autosize
                  type="textarea"
                  placeholder="请输入"
                  :disabled="isShow"
                />
              </el-form-item>
              <el-form-item
                class="form-itme-width_50"
                label="共享方式"
                id="oppsSharingMethod"
                prop="oppsSharingMethod"
              >
                <el-select
                  v-model="formData.oppsSharingMethod"
                  clearable
                  placeholder="请选择"
                  :disabled="isShow"
                  @change="changeOppsSharingMethod"
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
                id="oppsSharingUserIds"
                prop="oppsSharingUserIds"
              >
                <dc-select-user
                  v-model="formData.oppsSharingUserIds"
                  placeholder="请选择"
                  :multiple="true"
                  :multiple-limit="0"
                />
              </el-form-item>
            </div>
            <div class="form-group-title">
              <dc-select-dialog
                v-model="formData.customerContactIds"
                objectName="customerContact"
                returnType="object"
                :multipleLimit="10"
              >
                <template #default>
                  客户联系<span class="add-box">
                    <el-icon><CirclePlus /></el-icon>
                    添加客户联系人（{{ formData.customerContactIds?.length }}/10）
                  </span>
                </template>
              </dc-select-dialog>
            </div>
            <el-form-item label="客户联系人" class="form-itme-width_100">
              <el-table
                :data="formData.customerContactIds"
                v-if="formData.customerContactIds instanceof Array === true"
              >
                <el-table-column
                  prop="contactsName"
                  label="联系人姓名"
                  align="center"
                  min-width="150"
                />
                <el-table-column
                  prop="contactsPhoneNumber"
                  label="联系人方式"
                  align="center"
                  min-width="150"
                />
                <el-table-column
                  prop="contactsDeptName"
                  label="部门"
                  align="center"
                  min-width="150"
                />
                <el-table-column prop="contactsPost" label="职务" align="center" min-width="150" />
                <el-table-column fixed="right" label="操作" align="center" width="100">
                  <template #default="scoped">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click="formData.customerContactIds.splice(scoped.$index, 1)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <div class="form-group-title">竞争对手</div>
            <el-form-item
              class="form-itme-width_100"
              id="oppsCompetitor"
              label="竞争情况"
              prop="oppsCompetitor"
            >
              <el-input
                v-model="formData.oppsCompetitor"
                autosize
                type="textarea"
                placeholder="请输入"
                :disabled="isShow"
              />
            </el-form-item>
            <div class="form-group-title">
              <dc-select-dialog
                v-model="formData.foundryIds"
                objectName="foundry"
                returnType="object"
                :multipleLimit="10"
              >
                <template #default>
                  代工厂
                  <span class="add-box">
                    <el-icon><CirclePlus /></el-icon>
                    添加代工厂（{{ formData.foundryIds?.length || 0 }}/10）
                  </span>
                </template>
              </dc-select-dialog>
            </div>
            <el-form-item label="代工厂" class="form-itme-width_100">
              <el-table :data="formData.foundryIds" v-if="formData.foundryIds instanceof Array">
                <el-table-column prop="foundryName" label="代工厂名称" align="center" width="200" />
                <el-table-column
                  prop="foundryDesc"
                  label="代工厂说明"
                  align="center"
                  min-width="200"
                />
                <el-table-column fixed="right" label="操作" align="center" width="100">
                  <template #default="scoped">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click="formData.foundryIds.splice(scoped.$index, 1)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <div class="form-group-title">预期信息</div>
            <el-form-item
              class="form-itme-width_50"
              label="预计成交日期"
              prop="oppsExpectedTransactionDate"
              id="oppsExpectedTransactionDate"
            >
              <el-date-picker
                v-model="formData.oppsExpectedTransactionDate"
                type="date"
                placeholder="请选择"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                clearable
                class="form-item-row"
                :disabled="isShow"
              />
            </el-form-item>
            <div class="form-group-title">相关附件</div>

            <el-form-item class="form-itme-width_100" label="相关附件" prop="oppsAttachmentId">
              <dc-upload
                v-model="formData.oppsAttachmentIds"
                :limit="10"
                :targetType="Const.targetType.OPPS"
              />
            </el-form-item>
          </div>
        </div>
        <div class="wrap-right">
          <div class="wrap-right-scroll">
            <div class="wrap-right-content">
              <div class="wrap-right-content-title" @click="anchorPoint('oppsName')">
                {{ formData.oppsName || '-' }}
              </div>
              <el-form-item label="商机状态" id="oppsStatusId" prop="oppsStatusId">
                <el-select
                  v-model="formData.oppsStatusId"
                  clearable
                  placeholder="请选择"
                  :disabled="isShow"
                >
                  <el-option
                    v-for="item in DC_CRM_OPPS_STATUS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <div class="wrap-right-content-title">基本信息</div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('customerId')">
                <div class="label">商机客户</div>
                <div class="value ellipsis">
                  <dc-view v-model="formData.customerId" objectName="customer" />
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('fromId')">
                <div class="label">商机来源</div>
                <div class="value ellipsis">
                  <dc-dict
                    type="text"
                    :options="DC_CRM_OPPS_FROM"
                    :value="formData.fromId"
                    v-if="formData.fromId"
                  />
                  <span v-else>-</span>
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('fromDesc')">
                <div class="label">来源详情</div>
                <div class="value ellipsis">
                  {{ formData.fromDesc || '-' }}
                </div>
              </div>

              <div class="wrap-right-vicecontent" @click="anchorPoint('sectorId')">
                <div class="label">行业类别</div>
                <div class="value ellipsis">
                  <dc-dict
                    type="text"
                    :options="DC_CRM_SECTOR"
                    :value="formData.sectorId"
                    v-if="formData.sectorId"
                  />
                  <span v-else>-</span>
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('oppsLevelId')">
                <div class="label">商机级别</div>
                <div class="value ellipsis">
                  <dc-dict
                    type="text"
                    :options="DC_CRM_OPPS_LEVEL"
                    :value="formData.oppsLevelId"
                    v-if="formData.oppsLevelId"
                  />
                  <span v-else>-</span>
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('bdUserId')">
                <div class="label">BD</div>
                <div class="value ellipsis">
                  <dc-view v-model="formData.bdUserId" objectName="user" showKey="realName" />
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('tpmUserId')">
                <div class="label">TPM</div>
                <div class="value ellipsis">
                  <dc-view v-model="formData.tpmUserId" objectName="user" showKey="realName" />
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('oppsOrgId')">
                <div class="label">所属组织</div>
                <div class="value ellipsis">
                  <dc-view v-model="formData.oppsOrgId" objectName="org" />
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('oppsBackground')">
                <div class="label">商机背景</div>
                <div class="value ellipsis">
                  {{ formData.oppsBackground || '-' }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('progressDesc')">
                <div class="label">进度描述</div>
                <div class="value ellipsis">
                  {{ formData.progressDesc || '-' }}
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('oppsSharingMethod')">
                <div class="label">共享方式</div>
                <div class="value ellipsis">
                  <dc-dict
                    type="text"
                    :options="DC_CRM_CUS_SHARE_TYPE"
                    :value="formData.oppsSharingMethod"
                    v-if="formData.oppsSharingMethod"
                  />
                  <span v-else>-</span>
                </div>
              </div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('oppsSharingUserIds')">
                <div class="label">共享人</div>
                <div class="value ellipsis">
                  <dc-view
                    v-model="formData.oppsSharingUserIds"
                    objectName="user"
                    showKey="realName"
                  />
                </div>
              </div>
              <div class="wrap-right-content-title">竞争对手</div>
              <div class="wrap-right-vicecontent" @click="anchorPoint('oppsCompetitor')">
                <div class="label">竞争情况</div>
                <div class="value ellipsis">
                  {{ formData.oppsCompetitor || '-' }}
                </div>
              </div>
              <div class="wrap-right-content-title">预期信息</div>
              <div
                class="wrap-right-vicecontent"
                @click="anchorPoint('oppsExpectedTransactionDate')"
              >
                <div class="label">预计成交日期</div>
                <div class="value ellipsis">
                  {{ formData.oppsExpectedTransactionDate || '-' }}
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
                :label="`是否进行商机${route.params.id ? '创建' : '保存'}，提交商机信息`"
                size="large"
              />
            </div>
            <div class="wrap-right-footer-btn">
              <el-button type="primary" @click="submitForm">
                {{ route.params.id ? '保存商机' : '创建商机' }}
              </el-button>
              <el-button @click="handleDraft">存草稿</el-button>
              <el-button @click="cancel">取消</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </div>
  </basic-container>
</template>

<script setup name="BusinessOpportunitiesSubmit">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';
import Const from '@/const';

const router = useRouter();
const route = useRoute(); // 获取当前路由对象

const { proxy } = getCurrentInstance();

// 数据字典
const {
  DC_CRM_OPPS_STATUS,
  DC_CRM_OPPS_LEVEL,
  DC_CRM_OPPS_FROM,
  DC_CRM_SECTOR,
  DC_CRM_CUS_SHARE_TYPE,
} = proxy.useCache([
  { key: 'DC_CRM_OPPS_STATUS' },
  { key: 'DC_CRM_OPPS_LEVEL' },
  { key: 'DC_CRM_OPPS_FROM' },
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_CRM_CUS_SHARE_TYPE' },
]);

const pageData = reactive({
  rules: {
    oppsName: [{ required: true, message: '请输入', trigger: 'blur' }],
    customerId: [{ required: true, message: '请输入', trigger: 'blur' }],
    sectorId: [{ required: true, message: '请选择', trigger: 'blur' }],
    oppsLevelId: [{ required: true, message: '请选择', trigger: 'blur' }],
    bdUserId: [{ required: true, message: '请输入', trigger: 'blur' }],
    tpmUserId: [{ required: true, message: '请输入', trigger: 'blur' }],
    oppsOrgId: [{ required: true, message: '请输入', trigger: 'blur' }],
    oppsExpectedTransactionDate: [{ required: true, message: '请输入', trigger: 'blur' }],
    // oppsSharingUserIds: [{ required: true, message: '请输入', trigger: 'blur' }],
    oppsStatusId: [{ required: true, message: '请选择', trigger: 'blur' }],
  },
  keyNames: {
    oppsName: '商机名称',
    customerId: '商机客户',
    sectorId: '行业类别',
    oppsLevelId: '商机级别',
    bdUserId: 'BD',
    tpmUserId: 'TPM',
    oppsOrgId: '所属组织',
    oppsExpectedTransactionDate: '预计成交日期',
    oppsSharingUserIds: '共享人',
  },
  formData: {
    oppsName: undefined, //商机名称
    customerId: undefined, //商机客户
    fromId: undefined, //商机来源
    fromDesc: undefined, //来源详情
    sectorId: undefined, //行业类别
    oppsLevelId: undefined, // 商机级别
    oppsStatusId: '1853703748035596289', // 商机状态
    bdUserId: undefined, //BD
    tpmUserId: undefined, //TPM
    oppsOrgId: undefined, //所属组织
    oppsBackground: undefined, //商机背景
    progressDesc: undefined, //进度描述
    oppsSharingMethod: undefined, //共享方式
    oppsSharingUserIds: [], //共享人
    oppsCompetitor: undefined, //竞争对手
    oppsExpectedTransactionDate: undefined, //预计成交日期
    foundryIds: [], //代工厂
    customerContactIds: [], // 客户联系人
    createUser: undefined, //登记人
    createDept: undefined, //登记部门
    createTime: undefined, //登记时间
    updateUser: undefined, //修改人
    updateTime: undefined, //修改时间
    updateDept: undefined, //修改人部门
  },
  isShow: false,
  loading: true,
  uploadChecked: true,
  // 弹窗标题
  title: undefined,
});

const { rules, formData, keyNames, isShow, loading, uploadChecked, title } = toRefs(pageData);

// 未填项
const unfilledItems = computed(() => {
  return Object.keys(rules.value)
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

// 用户信息
const userinfo = computed(() => proxy.$store.getters.userInfo);

onMounted(async () => {
  if (route.params.id) {
    await getDetail(route.params.id);
    initDetail();
  } else if (route.query.customerId) {
    formData.value.customerId = route.query.customerId;
  } else {
    initCreate();
  }
});

const changeOppsSharingMethod = () => {
  if (formData.value.oppsSharingMethod == '1853709453308252161') {
    rules.value.oppsSharingUserIds = [{ required: true, message: '请输入', trigger: 'blur' }];
  } else {
    delete rules.value.oppsSharingUserIds;
  }
};

// 初始化创建
const initCreate = () => {
  formData.value.createUser = userinfo.value.user_id;
  formData.value.createDept = userinfo.value.dept_id;
  formData.value.createTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
};

// 初始化详情
const initDetail = () => {
  const timer = setTimeout(() => {
    formData.value.oppsSharingUserIds = formData.value.oppsSharingUserIds;

    formData.value.bdUserId = formData.value.bdUserId;

    formData.value.tpmUserId = formData.value.tpmUserId;
    clearTimeout(timer);
  });
};

// 获取详情
const getDetail = async id => {
  const params = {
    id,
  };
  const res = await Api.crm.opps.getOppsDetail(params);
  const { code, data } = res.data;
  if (code === 200) {
    formData.value = data;
  }
};

// 保存 确认创建
const submitForm = () => {
  if (!uploadChecked.value)
    return proxy.$message.error(`是否进行商机${route.params.id ? '创建' : '保存'}，提交商机信息`);
  loading.value = true;
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      if (formData.value.oppsStatusId === '1853703748035596289') {
        formData.value.oppsStatusId = '1853703803098419201';
      }
      const form = {
        ...formData.value,
        foundryIds: proxy.arrayToIdsString({
          array: formData.value.foundryIds,
        }),
        customerContactIds: proxy.arrayToIdsString({
          array: formData.value.customerContactIds,
        }),
        oppsAttachmentIds: proxy.arrayToIdsString({
          array: formData.value.oppsAttachmentIds,
        }),
        oppsSharingUserIds: formData.value.oppsSharingUserIds?.join
          ? formData.value.oppsSharingUserIds.join(',')
          : formData.value.oppsSharingUserIds,
      };
      const res = await Api.crm.opps.postOppsSubmit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
        cancel();
      }
    }
  });
  loading.value = false;
};

const handleDraft = async () => {
  loading.value = true;

  if (formData.value.oppsName == undefined) {
    proxy.$message.error(`必须填商机名称`);
  } else {
    const form = {
      ...formData.value,
      foundryIds: proxy.arrayToIdsString({
        array: formData.value.foundryIds,
      }),
      customerContactIds: proxy.arrayToIdsString({
        array: formData.value.customerContactIds,
      }),
      oppsAttachmentIds: proxy.arrayToIdsString({
        array: formData.value.oppsAttachmentIds,
      }),
      oppsSharingUserIds: formData.value.oppsSharingUserIds?.join
        ? formData.value.oppsSharingUserIds.join(',')
        : formData.value.oppsSharingUserIds,
      oppsStatusId: '1853703748035596289',
    };
    const res = await Api.crm.opps.postOppsSubmit(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message.success(msg);
      cancel();
    }
  }
  loading.value = false;
};

// 锚点并且检验 form-item
const anchorPoint = id => {
  try {
    proxy.$refs['ruleFormRef'].clearValidate();
    window.location.hash = id;
    proxy.$refs['ruleFormRef'].validateField(id);
  } catch (err) {}
};

// 客户变化
const changeCustomer = data => {
  if (data) {
    formData.value.sectorId = data?.sector || null;
    formData.value.oppsOrgId = String(data?.orgId) || null;
    formData.value.oppsSharingMethod = data?.cusShareType || null;
    formData.value.oppsSharingUserIds = data?.sharerUser || null;
  } else {
    formData.value.sectorId = null;
    formData.value.oppsOrgId = null;
    formData.value.oppsSharingMethod = null;
    formData.value.oppsSharingUserIds = null;
  }
};

// 点击取消跳转商机列表
const cancel = () => {
  const toPath =
    route.query.from === 'myClients' ? '/crm/myClients/list' : '/crm/businessOpportunities/list';
  router.push(toPath);
};
</script>
<style lang="scss">
.business-container {
  .basic-container__card {
    background-color: transparent;

    .el-card__body {
      padding: 0 !important;
    }
  }
}
</style>
<style lang="scss">
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
      width: 85px !important;
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
