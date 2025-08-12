<template>
  <div class="content-warp">
    <div class="card-box">
      <div class="content-warp_title">{{ infoDetail?.oppsName || '-' }}</div>
      <div class="content-warp-subtitle">
        <div class="content-warp_title-item">
          <div class="content-warp_title-item-label">商机来源</div>
          <div class="content-warp_title-item-value">
            <dc-dict type="text" :options="DC_CRM_OPPS_FROM" :value="infoDetail?.fromId" />
          </div>
        </div>
        <div class="content-warp_title-item">
          <div class="content-warp_title-item-label">商机级别</div>
          <div class="content-warp_title-item-value">
            <dc-dict type="text" :options="DC_CRM_OPPS_LEVEL" :value="infoDetail?.oppsLevelId" />
          </div>
        </div>
        <div class="content-warp_title-item">
          <div class="content-warp_title-item-label">行业类别</div>
          <div class="content-warp_title-item-value">
            <dc-dict type="text" :options="DC_CRM_SECTOR" :value="infoDetail?.sectorId" />
          </div>
        </div>
      </div>
      <div class="operate-container">
        <el-button type="primary" @click="handleAdd">添加跟进记录</el-button>

        <dc-select-user
          v-if="['1853709453308252161'].includes(infoDetail?.oppsSharingMethod)"
          v-model="infoDetail.oppsAttachmentIds"
          :multipleLimit="9999"
          @change="sharedconfirm"
        >
          <template #default>
            <el-button>加入共享</el-button>
          </template>
        </dc-select-user>

        <el-button v-else @click="handlerPivate">移至私有</el-button>
        <el-button @click="handleUpdate">编辑</el-button>
        <el-button @click="handleDelete">删除</el-button>
      </div>
    </div>
    <div class="card-box">
      <el-tabs v-model="activeName">
        <el-tab-pane label="详情" name="detail">
          <DetailComp :infoDetail="infoDetail"></DetailComp>
        </el-tab-pane>
        <el-tab-pane label="跟进记录" name="record">
          <RecordComp ref="recordComp"></RecordComp>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <el-drawer v-model="open.dialogVisible" width="600px" :title="open.title" @close="cancel">
    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="80px">
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

      <el-form-item label="跟进详情" prop="followContent">
        <el-input v-model="formData.followContent" type="textarea" placeholder="请输入备注信息" />
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
<script setup name="BusinessOpportunitiesDetail">
import { reactive, onMounted, toRefs, getCurrentInstance, ref } from 'vue';
import Api from '@/api/index';
import { useRoute } from 'vue-router';
import DetailComp from './components/detail.vue';
import RecordComp from './components/record.vue';
import { useRouter } from 'vue-router';

const recordComp = ref();
const router = useRouter();
const route = useRoute();

const pageData = reactive({
  infoDetail: {},
  activeName: 'detail',
  open: {
    dialogVisible: false,
    title: '',
  },
  formData: {},
  loading: false,
  rules: {
    followDate: [{ required: true, message: '请选择', trigger: 'blur' }],
    followId: [{ required: true, message: '请选择', trigger: 'blur' }],
  },
  userRef: null,
});
const { activeName, infoDetail, open, formData, loading, rules, userRef } = toRefs(pageData);
const { proxy } = getCurrentInstance();

// 数据字典
const { DC_CRM_SECTOR, DC_CRM_OPPS_LEVEL, DC_CRM_OPPS_FROM, DC_CRM_FOLLOW_TYPE } = proxy.useCache([
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_CRM_OPPS_LEVEL' },
  { key: 'DC_CRM_OPPS_FROM' },
  { key: 'DC_CRM_FOLLOW_TYPE' },
]);

onMounted(() => {
  getData();
});

// 详情数据
const getData = async () => {
  const RouteParams = {
    id: route.params.id,
  };
  const res = await Api.crm.opps.getOppDsetail(RouteParams);
  const { code, data } = res.data;
  if (code === 200) {
    infoDetail.value = data;
  }
};

/** 修改按钮操作 */
const handleUpdate = () => {
  router.push({
    path: `/crm/businessOpportunities/edit/${route.params.id}`,
  });
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = { ids: route.params.id };
  proxy
    .$confirm('是否确认删除参数编号为"' + configIds.ids + '"的数据项？')
    .then(async () => {
      return await Api.crm.opps.DeleteOppsRemove(configIds);
    })
    .then(() => {
      getData();
      proxy.$message.success('删除成功');
    })
    .catch(() => {});
};

/** 添加跟进记录按钮操作 */
const handleAdd = async () => {
  open.value.dialogVisible = true;
  open.value.title = '添加跟进记录';
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
        oppsId: route.params.id,
        customerId: infoDetail.value.customerId,
      };
      const res = await Api.crm.customerDetail.postContactRecordsSubmit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        open.value.dialogVisible = false;
        proxy.$message.success(msg);
        formData.value = {};
        recordComp.value.getData();
      }
    }
  });
  loading.value = false;
};

const handlerPivate = async () => {
  //   私有
  const form = {
    ...infoDetail.value,
    oppsSharingMethod: '1853709518596788226',
  };
  const res = await Api.crm.opps.postOppsSubmit(form);
  const { code, msg } = res.data;
  if (code === 200) {
    proxy.$message.success(msg);
    getData();
  }
};

const sharedconfirm = async val => {
  const form = {
    ...infoDetail.value,
    oppsSharingMethod: '1853709453308252161',
  };
  if (!infoDetail.value.oppsSharingUserIds) {
    proxy.$message.error('未选择人员');
  } else {
    const res = await Api.crm.opps.postOppsSubmit(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message.success(msg);
      getData();
    }
  }
};

const cancel = () => {
  open.value.dialogVisible = false;
};
</script>
<style lang="scss" scoped>
.content-warp {
  padding: 0;
  background: transparent;
  gap: 16px;

  &_title {
    margin-bottom: 24px;
    font-weight: bold;
    font-size: 32px;
    color: #333;
    line-height: 32px;
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
    width: 90px;
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
</style>
