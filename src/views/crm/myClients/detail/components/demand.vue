<template>
  <div class="desc-title">客户需求表</div>
  <el-steps :active="active" finish-status="success" direction="vertical">
    <el-step
      v-for="groupData in listData"
      :key="groupData.createTime"
      :title="formatDate(groupData.createTime)"
      class="active-line"
    >
      <template #icon>
        <img src="/img/crm/businessOpportunities/step-icon.svg" alt="" />
      </template>
      <template #description>
        <div v-for="item in groupData.data" :key="item.id" class="records-item">
          <div class="records-item-dot">
            <img src="/img/crm/clients/iconDots.png" alt="" />
          </div>
          <div class="records-item-header">
            <div class="records-item-header-title">
              {{ item.rlistName }} （{{ item.rlistCode }} ）
            </div>
            <div class="records-item-header-contest">
              <div>版本号:</div>
              <div class="records-item-header-contest-user">
                {{ item.updateVersion }}
              </div>
            </div>
            <div class="records-item-header-contest">
              <div>操作人员:</div>
              <div class="records-item-header-contest-user">
                <dc-view v-model="item.updateUser" objectName="user" showKey="realName" />
              </div>
            </div>
            <div>{{ item.followDate }}</div>
            <div v-if="item.editStatus">
              <el-button type="primary" @click="handleUpgrade(item.id)">升版</el-button>
              <el-button @click="handleFeasibilityAssessment(item.id)">发起评估</el-button>
              <el-tooltip effect="light" placement="bottom">
                <el-button>...</el-button>
                <template #content>
                  <div class="mt-3 text-center">
                    <el-button text @click="handleUpdata(item.id)">编辑</el-button>
                  </div>
                  <div class="mt-3 text-center">
                    <el-button text @click="handleDelete(item.id)">删除</el-button>
                  </div>
                  <div class="mt-3 text-center">
                    <el-button text @click="handleHistory(item.rlistCode)">历史版本</el-button>
                  </div>
                </template>
              </el-tooltip>
            </div>
            <div v-else>
              <el-button @click="handleHistory(item.rlistCode)">历史版本</el-button>
            </div>
          </div>
          <div class="remarks">
            <div class="remarks-label">更新时间：</div>
            <div class="remarks-value">{{ item.updateTime }}</div>
          </div>
          <div class="remarks">
            <div class="remarks-label">备注信息：</div>
            <div class="remarks-value">{{ item.followContent }}</div>
          </div>

          <div>
            <dc-upload
              v-model="item.attachments"
              :isUpload="false"
              :isRemove="false"
              :targetType="Const.targetType.CUSTOMER_RLIST"
            />
          </div>
          <div class="evaluateImg">
            <img :src="item.evaluateImgUrl" alt="" srcset="" />
          </div>
        </div>
      </template>
    </el-step>
  </el-steps>
  <el-drawer v-model="open.dialogVisible" width="600px" :title="open.title" @close="cancel">
    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="需求编码" prop="followDate">
        <div>由系统生成</div>
      </el-form-item>
      <el-form-item label="需求名称" prop="rlistName">
        <el-input v-model="formData.rlistName" />
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
          :targetType="Const.targetType.CUSTOMER_RLIST"
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
      :targetType="Const.targetType.CUSTOMER_RLIST"
      v-model="files"
    />
    <template #footer>
      <el-button @click="handleConfig">确定</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="historyVisible" title="历史版本" width="1200">
    <el-steps :active="active" finish-status="success" direction="vertical" class="ml-16">
      <el-step
        v-for="(itemGroup, index) in historyListData"
        :key="index"
        :title="formatDate(itemGroup.createTime)"
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
                {{ item.rlistName }} （{{ item.rlistCode }} ）
              </div>
              <div class="records-item-header-contest">
                <div>版本号:</div>
                <div class="records-item-header-contest-user">
                  {{ item.updateVersion }}
                </div>
              </div>
              <div class="records-item-header-contest">
                <div>操作人员:</div>
                <div class="records-item-header-contest-user">
                  <dc-view v-model="item.updateUser" objectName="user" showKey="realName" />
                </div>
              </div>
              <div>{{ item.followDate }}</div>
            </div>
            <div class="remarks">
              <div class="remarks-label">更新时间：</div>
              <div class="remarks-value">{{ item.updateTime }}</div>
            </div>
            <div class="remarks">
              <div class="remarks-label">备注信息：</div>
              <div class="remarks-value">{{ item.followContent }}</div>
            </div>
            <div>
              <dc-upload
                v-model="item.attachments"
                :isUpload="false"
                :isRemove="false"
                :targetType="Const.targetType.CUSTOMER_RLIST"
              />
            </div>
          </div>
        </template>
      </el-step>
    </el-steps>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="historyVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="uploadOpen.dialogTableVisible" title="添加附件" width="800">
    <dc-upload
      :disabledUpload="false"
      :limit="10"
      :targetType="Const.targetType.CUSTOMER_RLIST"
      v-model="files"
    />
    <template #footer>
      <el-button @click="handleConfig">确定</el-button>
    </template>
  </el-dialog>
</template>
<script setup name="ClientDemand">
import { onMounted } from 'vue';
import Api from '@/api/index';
import { useRoute, useRouter } from 'vue-router';
import Const from '@/const/index';

const route = useRoute(); // 获取当前路由对象
const router = useRouter();
const { proxy } = getCurrentInstance();

const data = reactive({
  active: 0,
  query: {
    current: 1,
    size: 100000,
  },
  listData: [],
  open: {
    dialogVisible: false,
    title: '',
  },
  rules: {
    oppsId: [{ required: true, message: '请选择', trigger: 'blur' }],
    // attachments: [{ required: true, message: '请选择附件', trigger: 'blur' }],
  },
  formData: {},
  loading: false,
  uploadOpen: {
    dialogVisible: false,
    title: '',
  },
  files: [],
  historyVisible: false,
  historyListData: [],
});

const {
  active,
  query,
  listData,
  open,
  rules,
  formData,
  loading,
  uploadOpen,
  files,
  historyVisible,
  historyListData,
} = toRefs(data);

onMounted(() => {
  getData();
});

const getData = async () => {
  const queryId = {
    ...query.value,
    customerId: route.params.id,
  };
  const res = await Api.crm.customerRlist.getMap(queryId);
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
      return await Api.crm.customerRlist.remove(configIds);
    })
    .then(() => {
      getData();
      proxy.$message.success('删除成功');
    })
    .catch(() => {});
};

// 处理升版
const handleUpdata = async id => {
  open.value.dialogVisible = true;
  open.value.title = '编辑客户需求表';
  const query = {
    id: id,
  };
  const res = await Api.crm.customerRlist.detail(query);
  const { code, data } = res.data;
  if (code == 200) {
    formData.value = data;
  }
};

const handleUpgrade = id => {
  router.push({ path: `/crm/client/demandSchedule/update/${id}` });
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
        oppsId: formData.value.oppsId,
        customerId: route.params.id,
        attachments: idString,
      };
      console.log(form);
      const res = await Api.crm.customerRlist.postCustomerRlistSubmit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        open.value.dialogVisible = false;
        proxy.$message.success(msg);
        getData();
      }
    }
  });
  loading.value = false;
};

const cancel = () => {
  open.value.dialogVisible = false;
};

// 只显示日期 不显示时分秒
const formatDate = datetime => {
  if (!datetime) return '';
  return datetime.split(' ')[0]; // 按空格分割，只保留日期部分
};

const handleConfig = () => {
  uploadOpen.value.dialogTableVisible = false;
};

// 可行性评估
const handleFeasibilityAssessment = id => {
  router.push({
    path: '/pdp/feasibility/steps/create',
    query: { demandId: id },
  });
};

// 历史版本
const handleHistory = async item => {
  historyVisible.value = true;
  const res = await Api.crm.customerRlist.history({ rlistCode: item });
  const { code, data } = res.data;
  if (code == 200) {
    historyListData.value = data;
  }
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

.remarks {
  &-label {
    width: 90px;
  }
}
.records-item {
  position: relative;
  min-height: 140px;
  .evaluateImg {
    position: absolute;
    right: 50px;
    top: 60px;
  }
}
.records-item-dot {
  position: absolute;
  left: -30px;
}
</style>
