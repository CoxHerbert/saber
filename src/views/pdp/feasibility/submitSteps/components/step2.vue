<template>
  <div class="wrap-left-form form-step-2" v-loading="loading">
    <el-form
      class="custom-form"
      ref="formRef"
      :model="formData"
      label-suffix=":"
      label-width="120px"
      :inline="true"
      :rules="rules"
    >
      <div class="form-group-title" id="detail">基本信息</div>
      <div class="group-box">
        <el-form-item class="form-itme-width_100" label="需求单" prop="rlistName">
          {{ info.rlistName || '-' }}
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="相关附件" prop="relatedAttachments">
          <dc-upload
            v-model="info.relatedAttachments"
            :limit="10"
            pain
            :isUpload="false"
            :isRemove="false"
            :targetType="Const.targetType.CUSTOMER_RLIST"
            v-if="info.relatedAttachments"
          />
          <span v-else>-</span>
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="评估名称">
          {{ info.feaName || '-' }}
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="评估类型">
          <dc-dict type="text" :options="DC_FEA_TYPE" :value="info.feaType" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="商机名称">
          <dc-view v-model="info.oppsId" objectName="opps" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="客户">
          <dc-view v-model="info.customerId" objectName="customer" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="产品类别">
          <dc-dict
            type="text"
            :options="DC_CRM_SECTOR"
            :value="info.productCategoryId"
            v-if="info.productCategoryId"
          />

          <span v-else>-</span>
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="单据日期">
          <div>{{ info.documentTime || '-' }}</div>
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="评估说明">
          <div>{{ info.feaDesc || '-' }}</div>
        </el-form-item>
      </div>

      <div class="group-box" :id="item.id" v-for="(item, index) in info.feaEvaluation" :key="index">
        <div class="form-group-title">
          <dc-dict type="text" :options="DC_FEA_ITEM_TYPE" :value="item.feaItemType" />
        </div>
        <div class="group-box-head">
          <dc-view v-model="item.feaEvaluator" objectName="user" />
          |
          <dc-view v-model="item.feaEvaluationDept" objectName="dept" showKey="deptName" />
          |
          <span class="head-value">计划完成时间： {{ item.feaCompleteTime || '-' }}</span>
          <el-tag type="primary" v-if="item.feaEvaluatorPosition"
            >{{ item.feaEvaluatorPosition || '-' }}
          </el-tag>
          |
          <span class="head-value">{{ item.evaluatorTimeout || '-' }}</span>
        </div>

        <el-form-item class="form-itme-width_100" label="评估结论">
          <feasibilityCom :value="item.feaEvaluationConclusion" />
        </el-form-item>
      </div>

      <div class="group-box" id="bd-review" v-if="info.bdApproved">
        <div class="form-group-title">审核信息</div>
        {{ info.feaFianlResult }} {{ info.passValue }}
        <el-form-item class="form-itme-width_100" label="是否通过">
          <div
            class="form-item-btn"
            :class="{
              'form-item-btn_active': info.passValue === true,
            }"
          >
            通过
          </div>
          <div
            class="form-item-btn"
            :class="{
              'form-item-btn_active': info.passValue === false,
            }"
          >
            不通过
          </div>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup name="CustomerSubmit">
import { reactive, toRefs, getCurrentInstance } from 'vue';
import Const from '@/const';
import feasibilityCom from './feasibility.vue';

const { proxy } = getCurrentInstance();

// 数据字典
const { DC_FEA_ITEM_TYPE, DC_FEA_TYPE, DC_FEA_FEASIBILITY, DC_CRM_SECTOR } = proxy.useCache([
  { key: 'DC_CRM_SECTOR' },
  { key: 'DC_FEA_ITEM_TYPE' },
  { key: 'DC_FEA_TYPE' },
  { key: 'DC_FEA_FEASIBILITY' },
]);

const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});

const pageData = reactive({
  loading: false,
  formData: {
    id: null, // 主键id
    passValue: null, //
  },
  rules: {},
});

const { loading, formData, rules } = toRefs(pageData);
</script>
<style lang="scss" scoped>
.form-step-2 {
  box-sizing: border-box;
  padding: 24px;

  :deep(.el-form) {
    margin: 0;
    padding: 0;
    width: 100%;
  }
}
</style>
