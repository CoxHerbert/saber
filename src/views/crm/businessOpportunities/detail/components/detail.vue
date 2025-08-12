<template>
  <div class="desc-title">基本信息</div>
  <el-descriptions :column="4">
    <el-descriptions-item label="商机名称" :width="descItemWidth"
      >{{ infoDetail.oppsName || '-' }}
    </el-descriptions-item>
    <el-descriptions-item label="商机来源" :width="descItemWidth">
      <dc-dict type="text" :options="DC_CRM_OPPS_FROM" :value="infoDetail.fromId" />
    </el-descriptions-item>
    <el-descriptions-item label="来源详情" :width="descItemWidth">
      <el-tooltip effect="dark" :content="infoDetail.fromDesc" placement="bottom">
        {{ infoDetail.fromDesc || '-' }}
      </el-tooltip>
    </el-descriptions-item>
    <el-descriptions-item label="行业类别" :width="descItemWidth">
      <dc-dict type="text" :options="DC_CRM_SECTOR" :value="infoDetail.sectorId" />
    </el-descriptions-item>
    <el-descriptions-item label="商机级别" :width="descItemWidth">
      <dc-dict type="text" :options="DC_CRM_OPPS_LEVEL" :value="infoDetail.oppsLevelId" />
    </el-descriptions-item>
    <el-descriptions-item label="商机状态" :width="descItemWidth">
      <dc-dict type="text" :options="DC_CRM_OPPS_STATUS" :value="infoDetail.oppsStatusId" />
    </el-descriptions-item>
    <el-descriptions-item label="BD" :width="descItemWidth">
      <dc-view v-model="infoDetail.bdUserId" objectName="user" showKey="realName" />
    </el-descriptions-item>
    <el-descriptions-item label="TPM" :width="descItemWidth">
      <dc-view v-model="infoDetail.tpmUserId" objectName="user" showKey="realName" />
    </el-descriptions-item>
    <el-descriptions-item label="所属组织" :width="descItemWidth">
      <dc-view v-model="scoped.row.oppsOrgId" objectName="org" />
    </el-descriptions-item>
    <el-descriptions-item label="商机背景" :width="descItemWidth"
      >{{ infoDetail.oppsBackground || '-' }}
    </el-descriptions-item>
    <el-descriptions-item label="进度描述" :width="descItemWidth">
      <el-tooltip effect="dark" :content="infoDetail.progressDesc" placement="bottom">
        {{ infoDetail.progressDesc || '-' }}
      </el-tooltip>
    </el-descriptions-item>

    <el-descriptions-item label="共享方式" :width="descItemWidth">
      <dc-dict type="text" :options="DC_CRM_CUS_SHARE_TYPE" :value="infoDetail.oppsSharingMethod" />
    </el-descriptions-item>
    <el-descriptions-item label="共享人" :width="descItemWidth">
      <dc-view v-model="infoDetail.oppsSharingUserIds" objectName="user" showKey="realName" />
    </el-descriptions-item>
  </el-descriptions>
  <div class="desc-title">客户联系</div>
  <dc-select-dialog
    v-model="props.infoDetail.customerContactIds"
    objectName="customerContact"
    returnType="object"
    :multipleLimit="10"
  />
  <el-table
    :data="infoDetail.customerContactIds"
    v-if="Array.isArray(infoDetail.customerContactIds)"
  >
    <el-table-column prop="contactsName" label="联系人姓名" />
    <el-table-column prop="contactsPhoneNumber" label="联系人方式" />
    <el-table-column prop="contactsDeptName" label="部门" />
    <el-table-column prop="contactsPost" label="职务" />
  </el-table>
  <div class="desc-title">竞争对手</div>
  <el-descriptions :column="1">
    <el-descriptions-item label="竞争对手">
      {{ infoDetail.oppsCompetitor || '-' }}
    </el-descriptions-item>
  </el-descriptions>
  <div class="desc-title">代工厂</div>
  <dc-select-dialog
    v-model="infoDetail.foundryIds"
    objectName="foundry"
    returnType="object"
    :multipleLimit="10"
  />
  <el-table :data="infoDetail.foundryIds">
    <el-table-column property="foundryName" label="代工厂名称" />
    <el-table-column property="foundryDesc" label="代工厂说明" />
  </el-table>
  <div class="desc-title">预期信息</div>
  <el-descriptions :column="1">
    <el-descriptions-item label="预计成交日期">
      {{ infoDetail.oppsExpectedTransactionDate || '-' }}
    </el-descriptions-item>
  </el-descriptions>
  <div class="desc-title">附件</div>
  <el-descriptions :column="1">
    <el-descriptions-item label="相关附件">
      <dc-upload
        v-model="infoDetail.oppsAttachmentIds"
        :limit="10"
        :isUpload="false"
        :isRemove="false"
        :targetType="Const.targetType.OPPS"
      />
    </el-descriptions-item>
  </el-descriptions>
</template>
<script setup name="OppDetail">
import { reactive } from 'vue';
import Const from '@/const';

const props = defineProps({
  infoDetail: {
    type: Object,
    default: null,
  },
});

const { proxy } = getCurrentInstance();

const data = reactive({
  descItemWidth: '25%',
});

const { descItemWidth } = toRefs(data);
// 数据字典
const {
  DC_CRM_CUS_SHARE_TYPE,
  DC_CRM_SECTOR,
  DC_CRM_OPPS_FROM,
  DC_CRM_OPPS_STATUS,
  DC_CRM_OPPS_LEVEL,
} = proxy.useCache([
  { key: 'DC_CRM_CUS_SHARE_TYPE' },
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_CRM_OPPS_FROM' },
  { key: 'DC_CRM_OPPS_STATUS' },
  { key: 'DC_CRM_OPPS_LEVEL' },
]);
</script>
<style lang="scss" scoped>
.desc-title {
  margin: 20px 0;
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
</style>
