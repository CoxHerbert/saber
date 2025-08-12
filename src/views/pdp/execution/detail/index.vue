<template>
  <basic-container>
    <div ref="pageBox" class="content-warp page-execution-detail" :class="pageRenderSize">
      <div v-loading="loading" class="drawer-container">
        <!-- <div class="step-box">
          <el-steps v-if="detailData" :active="step">
            <el-step
              v-for="(item, index) in DC_ERP_ORDER_STATUS.filter((_, i) => i < 4)"
              :key="index"
            >
              <template #icon>
                <div class="step-item" :class="getCalss(index)">
                  <span class="step-num">
                    <span v-if="index >= step">{{ index + 1 }}</span>
                    <el-icon v-else><Check /></el-icon>
                  </span>
                  <span class="step-title"
                    >{{ item.dictValue }} <br />
                    <dc-view
                      v-model="detailData.tpmOperatorId"
                      objectName="user"
                      v-if="index === 0"
                    />
                    <dc-view
                      v-model="detailData.tpmHeaderOperatorId"
                      objectName="user"
                      v-if="index === 1"
                    />
                    <dc-view
                      v-model="detailData.operationOperatorId"
                      objectName="user"
                      v-if="index === 2"
                    />
                  </span>
                </div>
              </template>
            </el-step>
          </el-steps>
        </div> -->
        <div class="step-new">
          <dc-steps v-bind="stepProps" :activeIndex="step"></dc-steps>
        </div>
        <div v-if="detailData" class="content-box">
          <div class="form-box">
            <el-form :model="detailData" label-suffix=":" :label-width="'100px'">
              <div v-for="(group, i) in columns" class="group-box" :class="group.classList">
                <div :key="i" class="group-header">{{ group.name }}</div>
                <template v-if="group.renderType === 'form'">
                  <template v-for="col in group.items">
                    <el-form-item
                      v-if="
                        !col.showFunc ||
                        (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                      "
                      class="form-item-operation-detail"
                      :class="`form-item-${col.prop}`"
                      :label="col.label"
                      :prop="col.prop"
                    >
                      <dc-view
                        v-if="col.type === 'dc-select-user'"
                        v-model="detailData[col.prop]"
                        objectName="user"
                        showKey="realName"
                      />
                      <dc-dict
                        v-else-if="col.type === 'dict'"
                        :options="dictmaps[col.dictKey]"
                        type="text"
                        :value="detailData[col.prop]"
                      />
                      <span v-else class="detail-column-value">{{
                        [null, undefined, ''].includes(detailData?.[col.prop])
                          ? '-'
                          : detailData?.[col.prop]
                      }}</span>
                    </el-form-item>
                  </template>
                </template>
                <div v-if="group.renderType === 'table'" class="table-box">
                  <el-table border :data="detailData[group.prop]" height="100%">
                    <template v-for="(col, i) in group.items">
                      <el-table-column
                        v-if="
                          !col.showFunc ||
                          (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                        "
                        :label="col.label"
                        :prop="col.prop"
                        :fixed="col.fixed"
                        :width="col.width"
                        :min-width="col.minWidth"
                        show-overflow-tooltip="true"
                        :key="i"
                      >
                        <template #default="scoped">
                          <span>{{ scoped.row[col.prop] || '-' }}</span>
                        </template>
                      </el-table-column>
                    </template>
                  </el-table>
                </div>
              </div>
            </el-form>
          </div>
          <div class="footer"><el-button type="primary" @click="close">关闭</el-button></div>
        </div>
      </div>
    </div>
  </basic-container>
  <!-- </el-drawer> -->
</template>
<script setup>
import {
  defineEmits,
  reactive,
  toRefs,
  onBeforeMount,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  computed,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Api from '@/api/index';
import detailConfig from './utils';

const pageBox = ref(null);
const { proxy } = getCurrentInstance();
const route = useRoute();
const pageData = reactive({
  dictmaps: { DC_ERP_ORDER_STATUS: [] },
  DC_ERP_ORDER_STATUS: [],
  visible: false,
  loading: false,
  detailId: '',
  step: 0,
  boxWidth: 0,
  detailData: null,
});

const router = useRouter();

const { columns } = detailConfig;

const { DC_ERP_ORDER_STATUS, visible, detailId, step, detailData, loading, boxWidth, dictmaps } =
  toRefs(pageData);

const pageRenderSize = computed(() => {
  if (boxWidth.value < 800) {
    return 'render-small';
  } else if (boxWidth.value >= 800 && boxWidth.value < 1200) {
    return 'render-middle';
  } else {
    return 'render-large';
  }
});

const emit = defineEmits(['close']);

// const handleClose = () => {
//   close();
// };

// const getCalss = index => {
//   if (step.value === index) return 'step-item-process';
//   if (step.value < index) return 'step-item-wait';
//   if (step.value > index) return 'step-item-finish';
// };

const uesrIdMaps = {
  '1876789752111362049': 'createUserId',
  '1876789821522898946': 'auditUserId',
  '1876789881673412609': 'operationOperatorId',
};
const AuditTimeMaps = {
  '1876789752111362049': 'createTime',
  '1876789821522898946': 'auditTime',
  '1876789881673412609': 'operationOperatorDate',
};

const getUserId = item => {
  return detailData.value?.[uesrIdMaps[item.id]];
};

const getTime = item => {
  return detailData.value?.[AuditTimeMaps[item.id]];
};

const stepProps = computed(() => {
  return {
    options: DC_ERP_ORDER_STATUS.value
      .filter((_, i) => i < 4)
      .map(item => {
        return {
          ...item,
          userId: getUserId(item),
          time: getTime(item),
        };
      }),
    activeIndex: getStep(),
    labelKey: 'dictValue',
    timeKey: 'time',
    nameKey: 'userId',
    nameType: 'userId',
  };
});

const getStep = () => {
  if (detailData.value?.dcErpOrderStatus === '1876789821522898946') {
    step.value = 1;
  } else if (detailData.value?.dcErpOrderStatus === '1876789881673412609') {
    step.value = 2;
  } else if (detailData.value?.dcErpOrderStatus === '1876789924404981761') {
    step.value = 3;
  } else {
    step.value = 0;
  }
};

const show = async id => {
  detailId.value = id;
  visible.value = true;
  loading.value = true;
  const res = await Api.pdp.dcErporder.neGetDetail({
    id: detailId.value,
  });
  const { code, data } = res.data;
  if (code === 200) {
    detailData.value = data;
    getStep();
  }
  loading.value = false;
};

const getDictData = async () => {
  const res = await proxy.useAsyncCache([{ key: 'DC_ERP_ORDER_STATUS' }]);
  // DC_BILL_TYPE.value = res?.value?.DC_BILL_TYPE;
  DC_ERP_ORDER_STATUS.value = res?.value?.DC_ERP_ORDER_STATUS;
  dictmaps.value.DC_ERP_ORDER_STATUS = res?.value?.DC_ERP_ORDER_STATUS;
  return true;
};

onBeforeMount(async () => {
  await getDictData();
  const { id } = route.query;
  show(id);
});

const addResize = () => {
  const box = pageBox.value;
  if (box) {
    proxy.$erd.listenTo(box, element => {
      boxWidth.value = element.scrollWidth;
      console.log('  boxWidth.value ', boxWidth.value);
    });
  }
};

const removeResize = () => {
  const box = proxy.$el;
  proxy.$erd.uninstall(box);
};

onMounted(() => {
  addResize();
});
onBeforeUnmount(() => {
  removeResize();
});
const close = () => {
  router.go(-1);
  //   emit('close');
  //   visible.value = false;
};

// defineExpose({
//   show,
//   close,
// });
</script>
<style lang="scss">
.page-execution-detail {
  height: calc(100vh - 100px);
  overflow: hidden;
  .step-box {
    display: block;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .step-new {
    display: block;
    width: 100%;
    margin: 0 auto;
    margin-bottom: 20px;
  }
  .form-item-operation-detail {
    display: inline-flex;
    margin-bottom: 8px;
  }
  &.render-small {
    .form-basic-group {
      .form-item-operation-detail {
        width: 100%;
        margin-right: 0 !important;
      }
    }
  }
  &.render-middle {
    .form-basic-group {
      .form-item-operation-detail {
        width: 49%;
        &:nth-child(2n + 1) {
          margin-right: 2%;
        }
      }
    }
  }
  &.render-large {
    .form-basic-group {
      .form-item-operation-detail {
        width: 32%;
        &:nth-child(3n) {
          margin-right: 1%;
        }
        &:nth-child(3n + 1) {
          margin-right: 1%;
        }
        &:nth-child(3n + 2) {
          margin-right: 1%;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.drawer-container {
  display: flex;
  flex-flow: column nowrap;
  height: calc(100vh - 100px);
  box-sizing: border-box;

  .step-box {
    padding: 0 60px;
    height: 48px;
    box-sizing: border-box;
  }

  .content-box {
    display: flex;
    flex-flow: column nowrap;
    min-height: calc(100vh - 220px);
  }

  .table-box {
    flex: 1;
  }

  .footer {
    padding-top: 8px;
    border-top: 1px solid #eaeaeb;
    padding-left: 20px;
    height: 34px;
  }

  .form-box {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    padding: 0;

    .el-form {
      display: flex;
      flex: 1;
      flex-flow: column nowrap;
    }

    .form-detail-group {
      flex: 1;
      display: flex;
      flex-flow: column nowrap;
    }

    .table-box {
      flex: 1;
      overflow: hidden;
      position: relative;

      .el-table {
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }

  .group-header {
    font-weight: bold;
    box-sizing: border-box;
    padding-left: 4px;
    border-left: 3px solid #f78431;
    line-height: 16px;
    font-size: 16px;
    margin: 10px 0;
  }

  .form-item-tpm-detail {
    width: 49%;
    display: inline-flex;
    margin-bottom: 8px;
    &:nth-child(2n + 1) {
      margin-right: 2%;
    }

    .detail-column-value {
      width: 100%;
      display: block;
      white-space: wrap;
      word-break: break-all;
      text-overflow: ellipsis;
      line-height: 20px;
      padding-top: 6px;
    }
  }
}
</style>
