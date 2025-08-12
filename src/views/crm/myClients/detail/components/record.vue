<template>
  <div class="desc-title">跟进记录</div>
  <el-steps :active="active" finish-status="success" direction="vertical">
    <el-step
      v-for="(itemGroup, index) in listData"
      :key="index"
      :title="formatDate(itemGroup.followDate)"
      class="active-line"
    >
      <template #icon>
        <img src="/img/crm/businessOpportunities/step-icon.svg" alt="" />
      </template>
      <template #description>
        <div v-for="(item, indexs) in itemGroup.data" :key="indexs" class="records-item">
          <div class="records-item-dot">
            <img src="/img/crm/clients/iconDots.png" alt="" />
          </div>
          <div class="records-item-header">
            <div class="records-item-header-title">
              <!--              <dc-dict type="text" :options="OPPS_LIST_CACHE" :value="items.oppsId" />-->
              <dc-view v-model="item.updateUser" objectName="user" showKey="realName" />
              <span class="records-item-header-span"
                >跟进 (
                <dc-dict type="text" :options="DC_CRM_FOLLOW_TYPE" :value="item.followId" />
                )</span
              >
            </div>
            <div class="records-item-header-timer">{{ item.followDate }}</div>
            <div>
              <el-button @click="handleUpdata(item.id)">编辑</el-button>
              <el-button @click="handleDelete(item.id)">删除</el-button>
            </div>
          </div>
          <div class="remarks">
            <div class="remarks-label">备注信息</div>
            <div class="remarks-value">{{ item.followContent }}</div>
          </div>
          <div>
            <dc-upload
              v-model="item.attachments"
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
      <el-form-item label="上传附件" id="attachments" prop="attachments">
        <dc-upload
          v-model="formData.attachments"
          :limit="10"
          :targetType="Const.targetType.CUSTOMER"
        />
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
  <el-dialog v-model="uploadOpen.dialogTableVisible" title="添加附件" width="800">
    <dc-upload
      :disabledUpload="false"
      :limit="10"
      :targetType="Const.targetType.CUSTOMER"
      v-model="files"
    />
    <template #footer>
      <el-button @click="handleConfig">确定</el-button>
    </template>
  </el-dialog>
</template>
<script setup name="ClientRecord">
import { onMounted } from 'vue';
import Api from '@/api/index';
import { useRoute } from 'vue-router';
import Const from '@/const/index';

const route = useRoute(); // 获取当前路由对象
const { proxy } = getCurrentInstance();

// 数据字典
const { DC_CRM_OPPS_STATUS, DC_CRM_OPPS_LEVEL, DC_CRM_FOLLOW_TYPE } = proxy.useCache([
  { key: 'DC_CRM_OPPS_STATUS' },
  { key: 'DC_CRM_OPPS_LEVEL' },
  { key: 'DC_CRM_FOLLOW_TYPE' },
]);

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
  uploadOpen: {
    dialogVisible: false,
    title: '',
  },
  rules: {
    followDate: [{ required: true, message: '请选择', trigger: 'blur' }],
    followId: [{ required: true, message: '请选择', trigger: 'blur' }],
  },
  formData: {},
  tableData: [],
  loading: false,
  files: [
    {
      id: '1859909249885474818',
      name: 'http://192.168.30.102:31627/000000-bip2-dev/upload/20241122/67f03841a079738dc7e28a11266f14d8.jpg',
      url: 'http://192.168.30.102:31627/000000-bip2-dev/upload/20241122/67f03841a079738dc7e28a11266f14d8.jpg',
      originalName: '测试211111.jpg',
      uid: 1732271895992,
      status: 'success',
    },
  ],
});
const { active, query, listData, open, rules, formData, loading, uploadOpen, files } = toRefs(data);

onMounted(() => {
  getData();
});

const getData = async () => {
  const queryParams = {
    ...query.value,
    customerId: route.params.id,
  };
  const res = await Api.crm.customerDetail.getContactRecordsGetLitMap(queryParams);
  const { code, data } = res.data;
  if (code == 200) {
    listData.value = data;
  }
};

// 只显示日期 不显示时分秒
const formatDate = datetime => {
  if (!datetime) return '';
  return datetime.split(' ')[0]; // 按空格分割，只保留日期部分
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

const handleUpdata = async id => {
  open.value.dialogVisible = true;
  open.value.title = '编辑跟进记录';

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
      const idString = proxy.arrayToIdsString({
        array: formData.value.attachments,
      });
      const form = {
        ...formData.value,
        oppsId: formData.value.oppsId.id,
        attachments: idString,
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

const handleConfig = () => {
  uploadOpen.value.dialogTableVisible = false;
};

defineExpose({ getData });
</script>

<style lang="scss" scoped>
.desc-title {
  margin: 20px 0 28px 0;
  font-weight: 600;
  font-size: 16px;
  color: #333;
  line-height: 16px;
  text-align: left;
  font-style: normal;
  text-transform: none;

  &::before {
    margin-right: 4px;
    display: inline-block;
    content: '';
    background: #f78431;
    width: 4px;
    height: 13px;
  }
}
:deep(.el-step.is-vertical .el-step__title) {
  padding: 0;
}
</style>
