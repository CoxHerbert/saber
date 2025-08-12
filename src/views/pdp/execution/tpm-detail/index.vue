<template>
  <!-- <el-drawer
    v-model="visible"
    title="TPM执行单详情"
    header-class="drawer-header-tpm-detail"
    body-class="drawer-body-tpm-detail"
    direction="rtl"
    :size="800"
    :before-close="handleClose"
  > -->
  <basic-container>
    <div class="content-warp page-execution-add">
      <div v-loading="loading" class="drawer-container">
        <div class="step-box">
          <el-steps v-if="detailData" :active="step">
            <el-step v-for="(item, index) in filteredSteps.filter((_, i) => i < 4)" :key="index">
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
        </div>
        <div v-if="detailData" class="content-box">
          <el-scrollbar style="height: calc(100vh - 172px)">
            <div class="form-box">
              <el-form :model="detailData" label-suffix=":" :label-width="'120px'">
                <div v-for="(group, i) in columns" class="group-box">
                  <div :key="i" class="group-header">{{ group.name }}</div>
                  <el-form-item
                    v-for="(col, j) in group.items"
                    :key="j"
                    class="form-item-tpm-detail"
                    :label="col.description"
                    :prop="col.prop"
                  >
                    <span class="detail-column-value">{{
                      [null, undefined, ''].includes(detailData?.[col.prop])
                        ? '-'
                        : detailData?.[col.prop]
                    }}</span>
                  </el-form-item>
                </div>
              </el-form>
            </div>
          </el-scrollbar>
          <div class="footer"><el-button type="primary" @click="close">关闭</el-button></div>
        </div>
      </div>
    </div>
  </basic-container>
  <!-- </el-drawer> -->
</template>
<script setup>
import { defineEmits, reactive, defineExpose, toRefs, defineProps } from 'vue';
import Api from '@/api/index';
import detailConfig from './utils';

const pageData = reactive({
  visible: false,
  loading: false,
  detailId: '',
  step: 0,
  detailData: null,
});

const { columns } = detailConfig;

const { visible, detailId, step, detailData, loading } = toRefs(pageData);

const props = defineProps({
  filteredSteps: {
    type: Array,
    default() {
      return [];
    },
  },
});

const emit = defineEmits(['close']);

const handleClose = () => {
  close();
};

const getCalss = index => {
  if (step.value === index) return 'step-item-process';
  if (step.value < index) return 'step-item-wait';
  if (step.value > index) return 'step-item-finish';
};

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
  const res = await Api.pdp.dcErporder.neDetail({
    id: detailId.value,
  });
  const { code, data } = res.data;
  if (code === 200) {
    detailData.value = data;
    getStep();
  }
  loading.value = false;
};

const close = () => {
  emit('close');
  visible.value = false;
};

defineExpose({
  show,
  close,
});
</script>
<style lang="scss">
.drawer-header-tpm-detail {
  padding-top: 12px;
  padding-bottom: 12px;
  .el-drawer__close-btn {
    transform: translateY(-6px);
  }
}
.drawer-body-tpm-detail {
  padding-left: 0;
  padding-right: 0;
}
</style>
<style lang="scss" scoped>
.drawer-container {
  display: flex;
  flex-flow: column nowrap;
  min-height: calc(100vh - 90px);
  box-sizing: border-box;

  .step-box {
    padding: 0 60px;
    height: 48px;
    box-sizing: border-box;
  }

  .content-box {
    min-height: calc(100vh - 170px);
  }

  .footer {
    padding-top: 8px;
    border-top: 1px solid #eaeaeb;
    padding-left: 20px;
    height: 34px;
  }

  .form-box {
    padding: 0 20px;
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
