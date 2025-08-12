<template>
  <div class="wrap-box" v-loading="loading">
    <div class="wrap-left">
      <div class="step-box">
        <el-steps :active="step">
          <el-step v-for="(item, index) in steps" :key="index">
            <template #icon>
              <div class="step-item" :class="getCalss(index)">
                <span class="step-num">
                  <span v-if="index >= step">{{ index + 1 }}</span>
                  <el-icon v-else><Check /></el-icon>
                </span>
                <span class="step-title">{{ item.title }}</span>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
      <step1 v-if="steps2 === 0"></step1>
      <step2 v-if="steps2 === 1" :info="info"></step2>
      <step2 v-if="steps2 === 2" :info="info"></step2>
      <step3 v-if="steps2 === 3" :info="info"></step3>
    </div>
    <div class="wrap-right" v-if="steps2 > 0">
      <div class="nav-wrap" v-if="steps2 > 0">
        <div class="nav-item" @click="anchorPoint('detail')">基本信息</div>
        <div v-for="(item, index) in info.feaEvaluation" :key="index" @click="anchorPoint(item.id)">
          <div class="nav-item">
            <dc-dict type="text" :value="item.feaItemType" :options="DC_FEA_ITEM_TYPE" />
            <span class="process-state" :class="getClass(item.statusId)">
              （<dc-dict type="text" :options="DC_PROCESS_STATUS" :value="item.statusId" />）
            </span>
          </div>
        </div>
        <div class="nav-item" @click="anchorPoint('bd-review')" v-if="info.bdApproved">
          审核信息
          <span
            class="process-state"
            v-if="info.passValue !== null"
            :class="getClass(info.feaFianlResult)"
            >(已完成)</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="CustomerSubmit">
import { reactive, toRefs, onBeforeMount } from 'vue';
import step1 from './components/step1.vue';
import step2 from './components/step2.vue';
import step3 from './components/step3.vue';
import { useRoute } from 'vue-router';
import Api from '@/api/index';

const route = useRoute();

const { proxy } = getCurrentInstance();

// 数据字典
const { DC_FEA_ITEM_TYPE, DC_PROCESS_STATUS } = proxy.useCache([
  { key: 'DC_FEA_ITEM_TYPE' },
  { key: 'DC_PROCESS_STATUS' },
]);

const pageData = reactive({
  loading: false,
  step: 0,
  pageId: null,
  steps: [
    {
      title: '创建评估',
    },
    {
      title: '评估中',
    },
    {
      title: '最终评审',
    },
    {
      title: '评估完成',
    },
  ],
  info: {},
});

const { loading, step, pageId, steps, info } = toRefs(pageData);

const steps2 = computed(() => {
  if (route.params.id !== 'create') {
    step.value = 1;
    pageId.value = route.params.id;
    if (info.value.finalReview) {
    }
    if (info.value.feaStatus === '1856617546025967618') {
      step.value = 2;
    }
    if (info.value.feaAvaluationStatus === '1873932036566544386') {
      step.value = 3;
    }
  }

  return step.value;
});

onBeforeMount(() => {
  pageId.value = route.params.id;
  if (route.params.id !== 'create') getDetail();
});

const getCalss = index => {
  if (step.value === index) return 'step-item-process';
  if (step.value < index) return 'step-item-wait';
  if (step.value > index) return 'step-item-finish';
};

// 获取需求单map
const getCustomerRlist = async id => {
  const res = await Api.crm.customerRlist.detail({ id });
  const { code, data } = res.data;
  if (code === 200) {
    info.value.rlistName = data?.rlistName;
  }
};

// 多明细-配合可行性评估展示界面
const getFeaEvaluation = async () => {
  const ids = {
    ids: info.value.feaEvaluationItemIds,
  };
  const res = await Api.pdp.feaEvaluation.details(ids);
  const { code, data } = res.data;
  if (code == 200) {
    info.value.feaEvaluation = data || [];
  }
};

const getDetail = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.dcFea.detail({ id: pageId.value });
    const { code, msg, data } = res.data;
    if (code === 200) {
      info.value = data;
      getCustomerRlist(data.customerRlistId);
      getFeaEvaluation();
    } else {
      proxy.$message({
        type: 'warning',
        message: msg,
      });
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 锚点并且检验 form-item
const anchorPoint = id => {
  window.location.hash = id;
};

// 获取class名称
const getClass = stateId => {
  if (stateId === '1858798189544181761') return 'process-state_finish';
  if (stateId === '1858798087584845826') return 'process-state_processing';
  if (stateId === '1856853675153231874') return 'process-state_finish';
};
</script>
<style lang="scss">
.wrap-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background: #f5f5f5;
  .step-box {
    padding-top: 24px;
    margin: 0 auto;
    width: auto;
    max-width: 800px;
  }
  .wrap-left {
    padding: 0;
    flex: 1;
    height: 100%;
    overflow: auto;
    background: #fff;
    margin-right: 16px;
    .wrap-left-form {
      display: flex;
      justify-content: center;
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
        display: flex;
        align-items: center;
        margin-left: 40px;
        font-weight: 400;
        font-size: 14px;
        color: #f78431;
        cursor: pointer;
      }
    }
  }
  .wrap-right {
    width: 240px;
    .nav-wrap {
      width: 100%;
      background: #fff;
      border-radius: 8px;
      .nav-item {
        padding: 24px 0 24px 25px;
        font-weight: 500;
        font-size: 14px;
        color: #333;
        line-height: 14px;
        cursor: pointer;
        user-select: none;
        .process-state {
          &_finish {
            color: #f78431;
          }
          &_processing {
            color: #e12137;
          }
        }
      }
    }
  }
  .custom-form {
    display: flex;
    flex-wrap: wrap;

    .form-item-info {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }

    .group-box {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      &-item {
        width: 100%;
      }
      &-head {
        padding-left: 50px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 11px;
        font-weight: 400;
        font-size: 14px;
        color: #848488;
        line-height: 14px;
      }

      .form-item-btn {
        padding: 8px 8px 8px 10px;
        display: inline-flex;
        box-sizing: border-box;
        flex-direction: column;
        justify-content: space-between;
        width: 120px;
        height: 48px;
        background: #f6f8fa;
        border-radius: 2px;
        border: 1px solid #dadbe0;
        margin-right: 20px;
        cursor: pointer;
        user-select: none;
        font-size: 14px;
        color: #333;
        line-height: 14px;
        align-items: center;
        justify-content: center;
        &:last-child {
          margin-right: 0;
        }

        &_active {
          background: rgba(247, 132, 49, 0.1);
          border-radius: 2px;
          border: 1px solid #dadbe0;
        }
      }
    }

    .form-itme-width {
      &_50 {
        width: 50%;
        margin-right: 0;

        .form-item-value {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
      }

      &_100 {
        width: 100%;
        margin-right: 0;

        .form-itme-btn {
          padding-top: 20px;
          border-top: 1px solid #dadbe0;
          width: 100%;
          display: flex;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>
