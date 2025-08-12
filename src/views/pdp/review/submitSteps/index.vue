<template>
  <div class="wrap-box comp-review-step-box" v-loading="loading">
    <div class="wrap-left">
      <el-steps :active="step">
        <el-step v-for="(dict, index) in steps" :key="index">
          <template #icon>
            <div class="step-item" :class="getCalss(index)">
              <span class="step-num">
                <span v-if="index >= step">{{ index + 1 }}</span>
                <el-icon v-else><Check /></el-icon>
              </span>
              <span class="step-title">{{ dict.title }}</span>
            </div>
          </template>
        </el-step>
      </el-steps>
      <template v-if="inited">
        <step1 v-if="step === 0" :info="info"></step1>
        <step2 v-if="step === 1 && info.id" :info="info"></step2>
        <step3 v-if="step === 2 && info.id" :info="info"></step3>
        <step4 v-if="step === 3 && info.id" :info="info"></step4>
        <step5 v-if="step === 4 && info.id" :info="info"></step5>
        <step6 v-if="step === 5 && info.id" :info="info"></step6>
      </template>
    </div>
    <!-- <div class="wrap-right">
      <div class="nav-wrap" v-if="step > 0">
        <div class="nav-item" @click="anchorPoint('detail')">基本信息</div>
        <div
          class="nav-item"
          v-for="(item, index) in info.feaEvaluation"
          :key="index"
          @click="anchorPoint(item.id)"
        >
          {{
            proxy.findItem({
              list: DC_FEA_ITEM_TYPE,
              id: item.feaItemType,
              key: label,
            })
          }}
          <span class="process-state" :class="getClass(item.statusId)">
            （<dc-dict type="text" :options="DC_PROCESS_STATUS" :value="item.statusId" />）
          </span>
        </div>
        <div class="nav-item" @click="anchorPoint('conclusion-and-recommendations')">
          结论与建议
        </div>
        <div class="nav-item" @click="anchorPoint('final-review')" v-if="info.finalReview">
          最终判定
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup name="CustomerSubmit">
import { reactive, toRefs, onBeforeMount } from 'vue';
import step1 from './components/step1.vue';
import step2 from './components/step2.vue';
import step3 from './components/step3.vue';
import step4 from './components/step4.vue';
import step5 from './components/step5.vue';
import step6 from './components/step6.vue';

import { useRoute } from 'vue-router';
import Api from '@/api/index';

const route = useRoute();

const { proxy } = getCurrentInstance();

// 数据字典
const { DC_FEA_ITEM_TYPE, DC_PROCESS_STATUS, DC_REVIEW_STAGE } = proxy.useCache([
  { key: 'DC_FEA_ITEM_TYPE' },
  { key: 'DC_PROCESS_STATUS' },
  { key: 'DC_REVIEW_STAGE' },
]);

const pageData = reactive({
  loading: false,
  pageId: null,
  steps: [
    {
      title: '创建评审',
    },
    {
      title: '主管审核',
    },
    {
      title: '召集评审',
    },
    {
      title: '审评结论',
    },
    {
      title: '问题整改',
    },
    {
      title: '评估完成',
    },
  ],
  info: {},
  inited: false,
  infoStep1: {},
});

const { loading, pageId, steps, info, inited } = toRefs(pageData);

const step = computed(() => {
  let step = 0;
  if (route.params.id !== 'create') {
    switch (info.value?.reviewStage) {
      case '1866289940546142209':
        step = 0;
        break;
      case '1866289986884812801':
        step = 1;
        break;
      case '1866290036931248129':
        step = 2;
        break;
      case '1868604812022956033':
        step = 3;
        break;
      case '1866290092283478018':
        step = 4;
        break;
      case '1866290144095715330':
        step = 5;
        break;
      default:
        step = 0;
        break;
    }
  }
  return step;
});

onBeforeMount(async () => {
  pageId.value = route.params.id;
  if (route.params.id !== 'create') {
    await getDetail();
    inited.value = true;
  } else {
    info.value = {
      dimensionId: route.query.dimensionId,
      taskId: route.query.planId,
      edit: true,
    };
    if (route.query.planId) {
      await getProjectInfo();
    }
    await getWriteData();
    inited.value = true;
  }
});

// 如果url上带planId就查出来填进去
const getProjectInfo = async () => {
  const res = await Api.pdp.planItem.getPlanByIds([route.query.planId]);
  const { data, code } = res.data;
  if (code == 200) {
    info.value.reviewProjectId = data[0].projectId;
    info.value.taskId = data[0].id;
  }
};

const getCalss = index => {
  if (step.value === index) return 'step-item-process';
  if (step.value < index) return 'step-item-wait';
  if (step.value > index) return 'step-item-finish';
};

const getDetail = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.dcReview.detail({ id: pageId.value });
    const { code, msg, data } = res.data;
    if (code === 200) {
      info.value = {
        ...info.value,
        ...data,
      };
      inited.value = true;
      if (info.value.problemRecordMap != null) {
      } else {
        await getWriteData();
      }
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

const getWriteData = async () => {
  const params = {
    reviewDimensionId: info.value?.dimensionId || route.query.dimensionId,
  };
  const res = await Api.pdp.dcReviewIssues.list(params);
  const { code, data } = res.data;
  if (code === 200) {
    info.value = {
      ...info.value,
      problemRecordMap: data,
    };
    // info.value.problemRecordMap = data;
  }
};
</script>
<style lang="scss">
@media (max-width: 1360px) {
  .form-itme-width_50 {
    width: 100% !important;
    margin-right: 0;
  }
}
.wrap-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background: #f5f5f5;
  .wrap-left {
    padding: 30px 100px;
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
      width: 224px;
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
            // color: #e12137;
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
        padding: 8px 0 8px 10px;
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

.comp-review-step-box {
  .pssj {
    .el-date-editor {
      width: 100%;
    }
  }

  .write-btn {
    cursor: pointer;
    color: var(--el-color-primary);
  }
}
</style>
