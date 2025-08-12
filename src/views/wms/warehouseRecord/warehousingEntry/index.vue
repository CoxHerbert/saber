<template>
  <div class="wrap-box" v-loading="loading">
    <div class="wrap-left">
      <!-- <div class="step-new">
        <dc-steps v-bind="stepProps" :activeIndex="step"></dc-steps>
      </div> -->
      <el-steps :active="step">
        <el-step v-for="(item, index) in DC_WMS_IN_STATUS" :key="index">
          <template #icon>
            <div class="step-item" :class="getCalss(index)">
              <span class="step-num">
                <span v-if="index >= step">{{ index + 1 }}</span>
                <el-icon v-else><Check /></el-icon>
              </span>
              <span class="step-title">{{ item.dictValue }}</span>
            </div>
          </template>
        </el-step>
      </el-steps>
      <step1 v-if="steps2 === 0" :info="info"></step1>
      <step2 v-if="steps2 === 1" :info="info" @detail="getDetail"></step2>
      <step3 v-if="steps2 === 2" :info="info" @detail="getDetail"></step3>
    </div>
  </div>
</template>

<script setup name="CustomerSubmit">
import { reactive, toRefs, onBeforeMount, computed } from 'vue';
import step1 from './components/step1.vue';
import step2 from './components/step2.vue';
import step3 from './components/step3.vue';
import { useRoute } from 'vue-router';
import Api from '@/api/index';

const route = useRoute();

const { proxy } = getCurrentInstance();

// 数据字典
const { DC_WMS_IN_STATUS } = proxy.useCache([{ key: 'DC_WMS_IN_STATUS' }]);

const pageData = reactive({
  loading: false,
  step: 0,
  pageId: null,
  info: {},
});

const { loading, step, pageId, info } = toRefs(pageData);

const steps2 = computed(() => {
  if (route.params.id !== 'create') {
    step.value = 0;
    pageId.value = route.params.id;
    if (info.value.inStockStatus == 'DC_WMS_IN_STATUS_S') {
      step.value = 0;
    }
    if (info.value.inStockStatus === 'DC_WMS_IN_STATUS_A') {
      step.value = 1;
    }
    if (info.value.inStockStatus === 'DC_WMS_IN_STATUS_C') {
      step.value = 2;
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

// const uesrIdMaps = {
//   '1899335959778770945': 'createUserId',
//   '1899336056260345857': 'auditUserId',
//   '1899336133913690113': 'tpmHeaderOperatorId',
// };
// const AuditTimeMaps = {
//   '1899335959778770945': 'createTime',
//   '1899336056260345857': 'auditTime',
//   '1899336133913690113': 'operationOperatorDate',
// };

// const getUserId = item => {
//   return info.value?.[uesrIdMaps[item.id]];
// };

// const getTime = item => {
//   console.log('item======>', item);
//   return info.value?.[AuditTimeMaps[item.id]];
// };

// const stepProps = computed(() => {
//   return {
//     options: DC_WMS_IN_STATUS.value?.map(item => {
//       return {
//         ...item,
//         userId: getUserId(item),
//         time: getTime(item),
//       };
//     }),
//     activeIndex: steps2,
//     labelKey: 'dictValue',
//     timeKey: 'time',
//     nameKey: 'userId',
//     nameType: 'userId',
//   };
// });

const getDetail = async () => {
  try {
    loading.value = true;
    const res = await Api.wms.warehousingEntry.detail({ id: pageId.value });
    const { code, msg, data } = res.data;
    if (code === 200) {
      info.value = data;
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
        font-size: 14px;
        color: #333;
        line-height: 14px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
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
          width: 100%;
          display: flex;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>
