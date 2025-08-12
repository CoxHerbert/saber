<template>
  <div class="content-warp">
    <div class="card-box">
      <div class="top-box row">
        <div class="logo-box"></div>
        <div class="right-box">
          <div class="title-box row">
            <div class="title">
              {{ infoDetail.fullname || '-' }}
            </div>
            <div class="btn-box">
              <el-button type="primary" @click="handleDemandAdd">创建需求表</el-button>
              <el-button @click="handleAddOpps">添加商机</el-button>
              <el-button @click="handleAdd">添加跟进</el-button>
              <el-popover placement="bottom">
                <template #default>
                  <dc-select-user
                    v-if="['1853709453308252161'].includes(infoDetail.cusShareType)"
                    v-model="infoDetail.sharerUser"
                    :multipleLimit="9999"
                    @change="sharedconfirm"
                  >
                    <template #default>
                      <el-button type="text" class="btn-more-item">加入共享</el-button>
                    </template>
                  </dc-select-user>
                  <el-button v-else @click="handlerPivate" class="btn-more-item" type="text"
                    >移至私有</el-button
                  >
                  <el-button @click="handleUpdata" class="btn-more-item" type="text"
                    >编辑</el-button
                  >
                  <el-button @click="handleDelete" class="btn-more-item" type="text"
                    >删除</el-button
                  >
                </template>
                <template #reference>
                  <el-button class="btn-more">更多...</el-button>
                </template>
              </el-popover>
            </div>
          </div>
          <div class="info-row">
            <div class="info-row-item">
              <div class="label">负责人</div>
              <div class="value">
                <dc-view
                  v-model="infoDetail.personInChargeUser"
                  objectName="user"
                  showKey="realName"
                />
              </div>
            </div>
            <div class="info-row-item">
              <div class="label">客户分类</div>
              <div class="value">
                <dc-dict
                  type="text"
                  :options="DC_CRM_CUS_CATEGORY"
                  :value="infoDetail.cusCategory"
                />
              </div>
            </div>
            <div class="info-row-item">
              <div class="label">法定代表人</div>
              <div class="value">
                {{ infoDetail.legalPerson || '-' }}
              </div>
            </div>
            <div class="info-row-item">
              <div class="label">客户级别</div>
              <div class="value">
                <dc-dict type="text" :options="DC_CRM_CUS_LEVEL" :value="infoDetail.cusLevel" />
              </div>
            </div>
          </div>
          <div class="count-row">
            <div class="count-row-item" v-for="(item, i) in topCountItems" :key="i">
              <div class="label">{{ item.label }}</div>
              <div class="value">{{ infoDetail[item.prop] || '0' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-content-box row">
      <div class="card-box left">
        <el-tabs class="tabs-main" v-model="activeName">
          <el-tab-pane label="详情" name="detail"> </el-tab-pane>
          <el-tab-pane label="客户需求表" name="demand"> </el-tab-pane>
          <el-tab-pane label="跟进记录" name="record"> </el-tab-pane>
          <el-tab-pane label="联系人关系" name="concatRelation"> </el-tab-pane>
          <!--  -->
        </el-tabs>
        <DetailComp v-if="activeName === 'detail'" :infoDetail="infoDetail"></DetailComp>
        <DemandComp v-if="activeName === 'demand'" ref="demandComp"></DemandComp>
        <RecordComp v-if="activeName === 'record'" ref="recordComp"></RecordComp>
        <ConcatRelation
          v-if="activeName === 'concatRelation'"
          ref="concatRelation"
        ></ConcatRelation>
      </div>
      <div class="card-box right">
        <div class="title">操作日志</div>
        <div class="log-line">
          <el-timeline style="max-width: 600px">
            <el-timeline-item
              v-for="(activity, index) in logListData"
              :class="getItemIcon(activity.operationFunction)"
              :key="index"
            >
              <template #default>
                <div class="row">
                  <div class="item-title">{{ activity.operationFunction }}</div>
                  <div class="time">{{ activity.createTime }}</div>
                </div>
                <div class="row info">
                  <div class="from">
                    <div class="label">来自客户：</div>
                    <div class="value">
                      <div class="value-set">{{ infoDetail.fullname }}</div>
                    </div>
                  </div>
                  <div class="user">
                    <span class="label">操作人：</span>
                    <dc-view objectName="user" v-model="activity.createUser" />
                  </div>
                </div>
              </template>
            </el-timeline-item>
            <template v-if="logListData?.length < 3">
              <el-timeline-item class="no-set-data" :key="index">
                <template #default>
                  <div class="row">
                    <div class="item-title">--</div>
                    <div class="time">--</div>
                  </div>
                  <div class="row info">
                    <div class="from">
                      <div class="label">来自客户：</div>
                      <div class="value">
                        <div class="value-set">--</div>
                      </div>
                    </div>
                    <div class="user">
                      <span class="label">操作人：</span>
                      <span class="dc-view">--</span>
                    </div>
                  </div>
                </template>
              </el-timeline-item>
              <el-timeline-item class="no-set-data" :key="index">
                <template #default>
                  <div class="row">
                    <div class="item-title">--</div>
                    <div class="time">--</div>
                  </div>
                  <div class="row info">
                    <div class="from">
                      <div class="label">来自客户：</div>
                      <div class="value">
                        <div class="value-set">--</div>
                      </div>
                    </div>
                    <div class="user">
                      <span class="label">操作人：</span>
                      <span class="dc-view">--</span>
                    </div>
                  </div>
                </template>
              </el-timeline-item>
            </template>
          </el-timeline>
        </div>
      </div>
    </div>
  </div>

  <el-drawer v-model="open.dialogVisible" width="600px" :title="open.title" @close="cancel">
    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="关联商机" id="oppsId" prop="oppsId">
        <dc-select-dialog
          v-model="formData.oppsId"
          type="input"
          objectName="opps"
          placeholder="请选择关联商机"
          :multiple="false"
          :params="{
            customerId: route.params.id,
          }"
        />
      </el-form-item>

      <el-form-item label="跟进时间" prop="followDate">
        <el-date-picker
          v-model="formData.followDate"
          type="datetime"
          placeholder="请选择"
          format="YYYY/MM/DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          clearable
          class="form-item-row"
        />
      </el-form-item>
      <el-form-item label="跟进类型" prop="followId">
        <el-select v-model="formData.followId" clearable placeholder="请选择">
          <el-option
            v-for="item in DC_CRM_FOLLOW_TYPE"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="上传附件" id="attachments" prop="attachments">
        <dc-upload
          v-model="formData.attachments"
          :limit="10"
          :targetType="Const.targetType.CUSTOMER"
        />
      </el-form-item>
      <el-form-item label="跟进详情" prop="followContent">
        <el-input
          v-model="formData.followContent"
          type="textarea"
          placeholder="请输入备注信息"
          :autosize="{ minRows: 5 }"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
  </el-drawer>

  <el-drawer
    v-model="demandOpen.demandDialog"
    width="600px"
    :title="demandOpen.demandTitle"
    @close="cancel"
  >
    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="需求编码" prop="followDate">
        <div>由系统生成</div>
      </el-form-item>
      <el-form-item label="需求名称" prop="rlistName">
        <el-input v-model="formData.rlistName" placeholder="请输入需求名称" />
      </el-form-item>
      <el-form-item label="关联商机" id="oppsId" prop="oppsId">
        <dc-select-dialog
          v-model="formData.oppsId"
          type="input"
          objectName="opps"
          placeholder="请选择关联商机"
          :multiple="false"
          :params="{
            customerId: route.params.id,
          }"
        />
      </el-form-item>
      <el-form-item label="上传附件" id="attachments" prop="attachments">
        <dc-upload
          v-model="formData.attachments"
          :limit="10"
          :targetType="Const.targetType.CUSTOMER"
        />
      </el-form-item>
      <el-form-item label="备注信息" prop="followContent">
        <el-input
          v-model="formData.followContent"
          type="textarea"
          placeholder="请输入备注信息"
          :autosize="{ minRows: 5 }"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup name="MyClientsDetail">
import { ref, reactive, onMounted, toRefs, getCurrentInstance } from 'vue';
import Api from '@/api/index';

import DetailComp from './components/detail.vue';
import RecordComp from './components/record.vue';
import DemandComp from './components/demand.vue';
import ConcatRelation from './components/concat-relation.vue';
import { useRoute, useRouter } from 'vue-router';
import Const from '@/const';

const recordComp = ref();
const demandComp = ref();
const route = useRoute(); // 获取当前路由对象
const router = useRouter();

const { proxy } = getCurrentInstance();

const { DC_CRM_FOLLOW_TYPE, DC_CRM_CUS_CATEGORY, DC_CRM_CUS_LEVEL, DC_CRM_CUS_SHARE_TYPE } =
  proxy.useCache([
    { key: 'DC_CRM_FOLLOW_TYPE' },
    { key: 'DC_CRM_CUS_CATEGORY' },
    { key: 'DC_CRM_CUS_LEVEL' },
    { key: 'DC_CRM_CUS_SHARE_TYPE' },
  ]);

const pageData = reactive({
  infoDetail: {},
  topCountItems: [
    {
      label: '商机数量',
      prop: 'businessCount',
    },
    {
      label: '线索数量',
      prop: 'clueCount',
    },
    {
      label: '项目数量',
      prop: 'projectCount',
    },
    {
      label: '需求表数量',
      prop: 'demandCount',
    },
    {
      label: '商机金额',
      prop: 'businessAmount',
    },
  ],
  activeName: 'detail',
  open: {
    dialogVisible: false,
    title: '',
  },
  demandOpen: {
    demandDialog: false,
    demandTitle: '',
  },
  rules: {
    oppsId: [{ required: true, message: '请选择', trigger: 'blur' }],
    // attachments: [{ required: true, message: '请选择附件', trigger: 'blur' }],
  },
  formData: {},
  tableData: {},
  loading: false,

  // 客户需求表
  demandRef: null,
  demandConfig: {
    operate: {
      get: Api.system.user.getList,
    },
    column: [
      {
        label: '姓名',
        prop: 'realName',
        search: true,
      },
      {
        label: '所属部门',
        prop: 'deptName',
        search: true,
      },
      {
        label: '职务',
        prop: 'postName',
      },
    ],
  },
});
const {
  topCountItems,
  activeName,
  infoDetail,
  open,
  rules,
  formData,
  tableData,
  loading,
  demandOpen,
} = toRefs(pageData);

onMounted(() => {
  if (route.params.id !== 'create') getData(route.params.id);
  const time = setTimeout(() => {
    getData();
    clearTimeout(time);
  });
});

// 详情数据
const getData = async () => {
  const RouteParams = {
    id: route.params.id,
  };
  const res = await Api.crm.customer.getDetail(RouteParams);
  const { code, data } = res.data;
  if (code === 200) {
    infoDetail.value = data;
    getLogList(data.associatedBusinessIds);
  }
};

const logListData = ref([]);

const getLogList = ids => {
  Api.crm.customer.getLog(ids).then(res => {
    const { code, data } = res.data;
    if (code === 200) {
      logListData.value = data.map(d => JSON.parse(d.logData));
    }
  });
};

const handleUpdata = () => {
  router.push({
    name: '编辑客户',
    params: { id: route.params.id },
  });
};

const handleDelete = () => {
  const configIds = { ids: route.params.id };
  proxy
    .$confirm('是否确认删除参数编号为"' + configIds.ids + '"的数据项？')
    .then(async () => {
      return await Api.crm.customer.deleteCustomerRemove(configIds);
    })
    .then(() => {
      router.push('/crm/myClients/list');
      proxy.$modale.msgSuccess('删除成功');
    })
    .catch(() => {});
};

const handlerPivate = async () => {
  //   私有
  const form = {
    ...infoDetail.value,
    cusShareType: DC_CRM_CUS_SHARE_TYPE.value[1].id,
  };
  const res = await Api.crm.customer.postCustomerSubmit(form);
  const { code, msg } = res.data;
  if (code === 200) {
    proxy.$message.success(msg);
    getData();
  }
};

const handleAdd = async () => {
  open.value.dialogVisible = true;
  open.value.title = '添加跟进记录';
  formData.value = {};
  activeName.value = 'record';
  const res = await Api.crm.opps.getOppsList();
  const { code, data } = res.data;
  if (code == 200) {
    tableData.value = data.records;
  }
};

// 保存 确认创建
const submitForm = () => {
  loading.value = true;
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        customerId: route.params.id,
        attachments: proxy.arrayToIdsString({
          array: formData.value.attachments,
        }),
      };
      if (activeName.value == 'demand') {
        const res = await Api.crm.customerRlist.postCustomerRlistSubmit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          demandOpen.value.demandDialog = false;
          proxy.$message.success(msg);
          formData.value = {};
          demandComp.value.getData();
        }
      } else if (activeName.value == 'record') {
        const res = await Api.crm.customerDetail.postContactRecordsSubmit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          open.value.dialogVisible = false;
          proxy.$message.success(msg);
          formData.value = {};
          recordComp.value.getData();
        }
      }
    }
  });
  loading.value = false;
};

const sharedconfirm = async () => {
  const form = {
    ...infoDetail.value,
    cusShareType: DC_CRM_CUS_SHARE_TYPE.value[0].id,
    attachments: proxy.arrayToIdsString({
      array: infoDetail.value.attachments,
    }),
  };
  if (!infoDetail.value.sharerUser) {
    proxy.$message.error('未选择人员');
  } else {
    const res = await Api.crm.customer.postCustomerSubmit(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message.success(msg);
      getData();
    }
  }
};

/** 添加客户需求表 */
const handleDemandAdd = () => {
  router.push({
    path: `/crm/client/demandSchedule/create`,
    query: { customerId: route.params.id },
  });
};

const cancel = () => {
  demandOpen.value.demandDialog = false;
  open.value.dialogVisible = false;
};

// 跳转新建商机
const handleAddOpps = () => {
  router.push({
    path: '/crm/businessOpportunities/business/create',
    query: { customerId: route.params.id, from: 'myClients' },
  });
};

const getItemIcon = data => {
  let result = 'xinjiansdhangji';
  switch (data) {
    case '新增/编辑客户联系人':
      result = 'lanxikehu';
      break;
    case '新增/编辑客户需求':
      result = 'xinjiansdhangji';
      break;
    case '新增/修改商机':
    case '新增客户根据记录':
      result = 'genjin';
      break;
    default:
      break;
  }
  return result;
};
</script>
<style lang="scss" scoped>
.btn-more-item {
  width: 100%;
  text-align: center;
  margin-right: 0;
  margin-left: 0;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
.log-line {
  padding-top: 32px;
}
.el-timeline-item {
  :deep(.el-timeline-item__tail) {
    height: calc(100% - 40px);
    left: 16px;
    top: 38px;
    border-left: 2px dashed var(--el-color-primary);
  }
  &.no-set-data {
    :deep(.el-timeline-item__node) {
      width: 36px;
      height: 36px;
      border-radius: 0;
      background-color: transparent;
      background-image: url('./img/no-set-data.png');
      background-repeat: no-repeat;
    }
    :deep(.el-timeline-item__tail) {
      border-left-color: #dadbe0;
    }
  }
  &.lanxikehu {
    :deep(.el-timeline-item__node) {
      width: 36px;
      height: 36px;
      border-radius: 0;
      background-color: transparent;
      background-image: url('./img/lanxikehu.png');
      background-repeat: no-repeat;
    }
  }
  &.xinjiansdhangji {
    :deep(.el-timeline-item__node) {
      width: 36px;
      height: 36px;
      border-radius: 0;
      background-color: transparent;
      background-image: url('./img/xinjiansdhangji.png');
      background-repeat: no-repeat;
    }
  }

  &.genjin {
    :deep(.el-timeline-item__node) {
      width: 36px;
      height: 36px;
      border-radius: 0;
      background-color: transparent;
      background-image: url('./img/genjin.png');
      background-repeat: no-repeat;
    }
  }

  :deep(.el-timeline-item__wrapper) {
    padding-left: 50px;

    .el-timeline-item__content {
      padding: 20px 16px;
      background: #f6f8fa;
      border-radius: 4px 4px 4px 4px;
    }
    .row {
      width: 100%;
      display: flex;
    }
    .from,
    .user {
      display: flex;
      flex-flow: row nowrap;
      font-size: 12px;
      color: #848488;
      line-height: 14px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
    .info {
      margin-top: 10px;
      width: 100%;
      .from {
        flex: 1;
      }
    }
    .value,
    .label {
      white-space: nowrap;
    }
    .value {
      flex: 1;
      overflow: hidden;
      position: relative;

      .value-set {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 8px;
      }
    }
    .user {
      display: flex;

      .dc-view {
        white-space: nowrap;
      }
    }
    .time {
      justify-self: flex-end;
      font-size: 12px;
      color: #848488;
      line-height: 14px;
      text-align: right;
      font-style: normal;
      text-transform: none;
    }
    .item-title {
      flex: 1;
      font-weight: bold;
      font-size: 14px;
      color: #333333;
      line-height: 14px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }
}
.content-warp {
  padding: 0;
  background: transparent;
  gap: 16px;
  .row {
    display: flex;
    flex-flow: row nowrap;
  }
  .top-box {
    .logo-box {
      width: 178px;
      height: 178px;
      background: linear-gradient(to bottom, #f7f7f7 0%, #efefef 100%);
      border-radius: 9px;
    }
    .right-box {
      flex: 1;
      overflow: hidden;
      padding-left: 12px;
    }

    .title-box {
      .title {
        padding-right: 20px;
        overflow: hidden;
        word-break: break-all;
        text-overflow: ellipsis;
        flex: 1;
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: bold;
        font-size: 32px;
        color: #333333;
        line-height: 32px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        white-space: nowrap;
      }
      .btn-more {
        width: 60px;
      }
    }

    .info-row {
      display: inline-flex;
      background-color: rgba(246, 248, 250, 1);
      padding: 12px 24px;
      margin-top: 16px;
      .info-row-item {
        display: flex;
        margin-right: 16px;

        .label {
          &::after {
            content: '：';
          }
          font-size: 16px;
          color: #666666;
          line-height: 16px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
        .value {
          font-weight: 500;
          font-size: 16px;
          color: #333333;
          line-height: 16px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
      }
    }
    .count-row {
      margin-top: 14px;
      border-top: 1px solid rgba(218, 219, 224, 1);
      display: flex;
      padding-top: 14px;

      .count-row-item {
        margin-right: 56px;
        .label {
          font-size: 16px;
          color: #666666;
          line-height: 24px;
          text-align: left;
          font-style: normal;
          text-transform: none;
          margin-bottom: 8px;
        }
        .value {
          text-align: left;
          font-weight: 500;
          font-size: 24px;
          color: #333333;
          line-height: 32px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
      }
    }
  }
  .page-content-box {
    flex: 1;
    .left {
      flex: 1;
      margin-right: 16px;
      padding-top: 10px;
      display: flex;
      flex-flow: column nowrap;
    }
    .right {
      width: 395px;
      min-height: 100px;

      .title {
        font-weight: 600;
        font-size: 16px;
        color: #333333;
        line-height: 16px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        border-left: 3px solid #f78431;
        padding-left: 8px;
        box-sizing: border-box;
      }
    }
  }

  &_title {
    margin-bottom: 24px;
    font-weight: bold;
    font-size: 32px;
    color: #333;
    line-height: 32px;
  }

  &-item {
    background: red;
  }

  .operate-container {
    display: inline-flex;
    padding: 24px;
    border: 1px dashed #333;
    border-radius: 8px;
    background: #f6f8fa;
    gap: 12px;
  }

  :deep(.el-descriptions__label) {
    width: 110px;
    text-align: right;
    font-size: 14px;
    color: #333;
    font-weight: 600;
  }

  :deep(.el-descriptions__cell) {
    display: inline-flex;
  }
  :deep(.el-descriptions__content) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.el-tooltip__trigger {
  width: 100%;
}
</style>
