<template>
  <el-steps :active="active" finish-status="success" direction="vertical">
    <el-step
      v-for="(item, index) in listData"
      :key="index"
      :title="formatDate(item[0].followDate)"
      class="active-line"
    >
      <template #icon>
        <img src="/img/crm/businessOpportunities/step-icon.svg" alt="" />
      </template>
      <template #description>
        <div v-for="(items, indexs) in item" :key="indexs" class="records-item">
          <div class="records-item-dot">
            <img src="/img/crm/clients/iconDots.png" alt="" />
          </div>
          <div class="records-item-header">
            <div class="records-item-header-title">
              <dc-view v-model="items.updateUser" objectName="user" showKey="realName" />
              (
              <dc-view v-model="items.followId" objectName="user" showKey="realName" />
              )
            </div>
            <div class="records-item-header-timer">{{ items.followDate }}</div>
            <div>
              <el-button @click="handleUpdata(items.id)">编辑</el-button>
              <el-button @click="handleDelete(items.id)">删除</el-button>
            </div>
          </div>
          <div class="remarks">
            <div class="remarks-label">备注信息</div>
            <div class="remarks-value">{{ items.followContent }}</div>
          </div>
          <div>
            <dc-upload
              v-model="items.attachments"
              :isUpload="false"
              :isRemove="false"
              :targetType="Const.targetType.CUSTOMER"
            />
          </div>
        </div>
      </template>
    </el-step>
  </el-steps>

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
<script setup name="OppRecord">
import { getCurrentInstance, onMounted, reactive, toRefs } from 'vue';
import Api from '@/api/index';
import { useRoute } from 'vue-router';
import Const from '@/const';

const route = useRoute(); // 获取当前路由对象
const { proxy } = getCurrentInstance();

// 数据字典
const { DC_CRM_FOLLOW_TYPE } = proxy.useCache([{ key: 'DC_CRM_FOLLOW_TYPE' }]);

const data = reactive({
  active: 0,
  query: {
    current: 10,
    size: 1,
  },
  listData: [],
  open: {
    dialogVisible: false,
    title: '',
  },
  rules: {
    followDate: [{ required: true, message: '请选择', trigger: 'blur' }],
    followId: [{ required: true, message: '请选择', trigger: 'blur' }],
  },
  formData: {},
  loading: false,
});
const { active, query, listData, open, rules, formData, loading } = toRefs(data);

onMounted(() => {
  getData();
});

const getData = async () => {
  const queryParams = {
    ...query.value,
    oppsId: route.params.id,
  };
  const res = await Api.crm.customerDetail.getContactRecordsGetLitMap(queryParams);
  const { code, data } = res.data;
  if (code == 200) {
    listData.value = data;
  }
};

const handleDelete = id => {
  const configIds = { ids: id };
  proxy
    .$confirm('是否确认删除参数编号为"' + configIds.ids + '"的数据项？')
    .then(async () => {
      return await Api.crm.customerDetail.deleteContactRecordsRemove(configIds);
    })
    .then(() => {
      getData();
      proxy.$message.success('删除成功');
    })
    .catch(() => {});
};

// 只显示日期 不显示时分秒
const formatDate = datetime => {
  if (!datetime) return '';
  return datetime.split(' ')[0]; // 按空格分割，只保留日期部分
};

const handleUpdata = async id => {
  open.value.dialogVisible = true;
  open.value.title = '编辑客户需求表';

  const query = {
    id: id,
  };
  const res = await Api.crm.customerDetail.getContactRecordsDetail(query);
  const { code, data } = res.data;
  if (code == 200) {
    formData.value = data;
  }
};

// 保存 确认创建
const submitForm = () => {
  loading.value = true;
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        oppsId: formData.value.oppsId.id,
      };
      const res = await Api.crm.customerDetail.postContactRecordsSubmit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        open.value.dialogVisible = false;
        proxy.$message.success(msg);
        formData.value = {};
        getData();
      }
    }
  });
  loading.value = false;
};

const cancel = () => {
  open.value.dialogVisible = false;
};

defineExpose({ getData });
</script>
<style lang="scss" scoped>
.records-item {
  padding: 15px;
  width: 924px;
  background: #f6f8fa;
  border-radius: 8px;
  margin-top: 24px;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-contest {
      display: flex;
    }
  }
}
:deep(.el-step.is-vertical .el-step__title) {
  padding: 0;
}
.el-tooltip__trigger {
  width: 100%;
}
</style>
