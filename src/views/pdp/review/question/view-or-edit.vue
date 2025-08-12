<template>
  <div class="page-question-view-or-edit">
    <div class="row">
      <div class="left">
        <div class="title-box">
          <span class="icon" @click="doAction('cancel')"
            ><el-icon><Close /></el-icon
          ></span>
          <span class="title">{{ title }}</span>
        </div>
        <div class="info-box">
          <dc-view-user
            v-model="dcReviewProblemAllocation.createUser"
            objectName="user"
          ></dc-view-user
          ><span class="split">|</span>发起于{{ dcReviewProblemAllocation.createTime
          }}<span class="split">|</span
          ><span>预计完成：{{ dcReviewProblemAllocation.reviewCompletionTime }}</span>
        </div>
        <el-scrollbar height="calc(100vh - 180px)">
          <el-form
            ref="formRef"
            v-loading="loading"
            :model="formData"
            label-width="84px"
            :rules="rules"
            label-suffix=":"
          >
            <div
              class="group"
              v-for="(group, i) in formConfig.groups.filter(g => g.mode.includes(props.mode))"
              :key="i"
              :style="{
                display:
                  !group.showFunc || (group.showFunc?.call && group.showFunc(formData, props.mode))
                    ? 'block'
                    : 'none',
              }"
            >
              <div class="group-title">
                <span class="icon" @click="expandMaps[group.key] = !expandMaps[group.key]">
                  <el-icon v-if="expandMaps[group.key]"><CaretBottom /></el-icon>
                  <el-icon v-else><CaretRight /></el-icon>
                </span>
                <span class="title">{{ group.label }}</span>
              </div>
              <div
                class="gorup-content"
                :class="{
                  hide: !expandMaps[group.key],
                }"
              >
                <template v-for="(item, j) in group.formItems">
                  <el-form-item :label="item.label" :prop="item.prop">
                    <div v-if="item.type === 'dc-view'" class="el-input is-disabled">
                      <div class="el-input__wrapper">
                        <div class="el-input__inner">
                          <dc-view
                            :objectName="item.props.objectName"
                            v-model="formData[item.prop]"
                          />
                        </div>
                      </div>
                    </div>
                    <span v-else-if="item.type === 'text'">{{ formData[item.prop] }} </span>
                    <el-radio-group
                      v-else-if="item.type === 'el-radio-group'"
                      v-bind="item.props"
                      v-model="formData[item.prop]"
                    >
                      <el-radio
                        v-for="(ra, i) in dictMaps[item.dictKey]"
                        :key="i"
                        :value="ra.dictKey"
                        >{{ ra.dictValue }}</el-radio
                      >
                    </el-radio-group>
                    <component
                      v-else
                      :is="item.type"
                      v-bind="item.props"
                      v-model="formData[item.prop]"
                    ></component>
                  </el-form-item>
                </template>
              </div>
            </div>
          </el-form>
        </el-scrollbar>
      </div>

      <div class="right">
        <div class="right-title">流转记录</div>
        <el-scrollbar height="calc(100vh - 160px)">
          <div class="step-box">
            <el-steps
              direction="vertical"
              :active="props.mode === 'view' ? stepIndex - 1 : stepIndex"
            >
              <el-step
                v-for="(p, i) in processList"
                :key="i"
                :title="p.processNode || p.approvalNode + (p.approvalStatus || '')"
              >
                <template #description>
                  <div v-if="p.processUser || p.assigneeId" class="user-info-row">
                    <dc-view-user
                      :modelValue="p.processUser || p.assigneeId"
                      objectName="user"
                    ></dc-view-user>
                    <span v-if="p.processTime || p.createTime" class="time">{{
                      p.processTime || p.createTime
                    }}</span>
                  </div>
                  <div v-if="p.formJson" class="step-content">
                    <div v-if="p.approvalStatus === '提交'" class="content-data">
                      <div class="item">
                        <span class="ats" v-if="JSON.parse(p.formJson).attachmentAddress">
                          <dc-upload
                            v-model="JSON.parse(p.formJson).attachmentAddress"
                            :pain="true"
                            :is-upload="false"
                            :is-remove="false"
                          ></dc-upload>
                        </span>
                      </div>
                      <div class="item">
                        <span class="desc">
                          <el-input
                            type="textarea"
                            rows="4"
                            disabled
                            :modelValue="JSON.parse(p.formJson).reviewProblemResult"
                          ></el-input>
                        </span>
                      </div>
                    </div>
                    <div class="content-data" v-else-if="p.approvalStatus === '退回'">
                      <div class="item">
                        <div class="desc">
                          {{
                            dictMaps.DC_REVIEW_PROBLEM_RESULT?.find(
                              d => d.dictKey === JSON.parse(p.formJson).auditResult
                            )?.label
                          }}
                        </div>
                      </div>
                      <div class="item">
                        <div class="desc">
                          <el-input
                            type="textarea"
                            rows="4"
                            disabled
                            :modelValue="JSON.parse(p.formJson).superiorOpinion"
                          ></el-input>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-step>
            </el-steps>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <div class="footer">
      <el-button
        v-if="['audit', 'done'].includes(props.mode)"
        @click="doAction('submit')"
        type="primary"
        >提交</el-button
      >
      <el-button @click="doAction('cancel')">取消</el-button>
    </div>
  </div>
</template>
<script setup>
import {
  onMounted,
  reactive,
  toRefs,
  defineProps,
  getCurrentInstance,
  computed,
  onUnmounted,
} from 'vue';
import Api from '@/api';
import Options from './utils';

const formRef = ref(null);

const emit = defineEmits(['close']);

const { proxy } = getCurrentInstance();
const props = defineProps({
  id: {
    type: String,
    default() {
      return '';
    },
  },
  row: {
    type: Object,
    default() {
      return null;
    },
  },
  title: {
    type: String,
    default() {
      return '';
    },
  },
  mode: {
    type: String,
    default() {
      return 'view';
    },
  },
});

const rules = computed(() => {
  if (props.mode === 'done') {
    return {
      reviewProblemResult: [
        {
          required: true,
          validator(_, value, callback) {
            if ([null, undefined, ''].includes(value)) {
              callback(new Error('处理描述不能为空'));
            } else {
              callback();
            }
          },
        },
      ],
    };
  } else if (props.mode == 'audit') {
    return {
      auditResult: [
        {
          required: true,
          validator(_, value, callback) {
            if ([null, undefined, ''].includes(value)) {
              callback(new Error('审核结论不能为空'));
            } else {
              callback();
            }
          },
        },
      ],
    };
  }
});

const compData = reactive({
  loading: false,
  expandMaps: {
    basic: true,
    quesition: true,
    done: true,
    audit: true,
  },
  formData: {},
  processList: [],
  dcReview: {},
  dcReviewProblemAllocation: {},
  dictMaps: {
    DC_REVIEW_PROBLEM_RESULT: [],
    DC_REVIEW_PROBLEM_STATUS: [],
  },
});

const {
  loading,
  formData,
  expandMaps,
  processList,
  dcReview,
  dcReviewProblemAllocation,
  dictMaps,
} = toRefs(compData);

const formConfig = computed(() => {
  return Options.getGroups(props.mode);
});

const getDict = async () => {
  if (dictMaps.value.DC_REVIEW_PROBLEM_RESULT.length > 0) {
    return true;
  }
  const res = await proxy.useAsyncCache([
    { key: 'DC_REVIEW_PROBLEM_STATUS' },
    { key: 'DC_REVIEW_PROBLEM_RESULT' },
  ]);
  dictMaps.value = res;
};

const problemObj = ref(null);

const initFormData = info => {
  formData.value = {
    reviewProblemStatus: info.dcReviewProblemAllocation.reviewProblemStatus,
  };
  formConfig.value.groups.forEach(group => {
    group.formItems.forEach(item => {
      formData.value[item.prop] =
        group.infoObjectName && info[group.infoObjectName]
          ? info[group.infoObjectName][item.prop]
          : undefined;
    });
  });

  formData.value.reviewProblem = info.dcReviewProblemAllocation.reviewProblem;
  formData.value.reviewProblemResult = info.dcReviewProblemAllocation.reviewProblemResult;
  problemObj.value = info.dcReviewProblemAllocation;
  dcReview.value = info.dcReview;
  processList.value = [info.processList[0], ...info.nodeList];
  stepIndex.value = info.nodeList.findIndex(n => !n.formJson) + 1;
  stepIndex.value = stepIndex.value === 0 ? info.nodeList.length + 1 : stepIndex.value;
  dcReviewProblemAllocation.value = info.dcReviewProblemAllocation;
};

// const stepIndex = computed(() => {
//   return processList.value?.findIndex(p => p.processStatus === '进行中');
// });

const stepIndex = ref(0);

const getDetail = async () => {
  loading.value = true;
  const res = await Api.pdp.dcReviewQuestion.getDetailById({ id: props.id });
  const { data, code } = res.data;
  if (code === 200) {
    initFormData(data);
  } else {
    proxy.$message.error(res.data.msg);
  }
  loading.value = false;
};

defineExpose({
  async show() {
    formData.value = {};
    expandMaps.value = {
      basic: true,
      quesition: true,
      done: true,
      audit: true,
    };
    await getDict();
    await getDetail();
  },
});

const doAction = action => {
  if (action === 'cancel') {
    emit('close');
  } else if (action === 'submit') {
    submit();
  }
};

const getDataSend = () => {
  if (props.mode === 'done') {
    return {
      ...problemObj.value,
      attachmentAddress:
        formData.value.attachmentAddress?.length > 0
          ? formData.value.attachmentAddress?.map(at => at.id).join(',')
          : undefined,
      reviewProblemResult: formData.value.reviewProblemResult,
    };
  } else if (props.mode === 'audit') {
    return {
      ...problemObj.value,
      auditResult: formData.value.auditResult,
      superiorOpinion: formData.value.superiorOpinion,
    };
  }
};

const submit = () => {
  formRef.value.validate().then(() => {
    loading.value = true;
    const dataSend = getDataSend();
    Api.pdp.dcReviewQuestion
      .submit(dataSend)
      .then(res => {
        const { data, code } = res.data;
        if (code === 200) {
          doAction('cancel');
        } else {
          proxy.$message.error(data.msg);
        }
        loading.value = false;
      })
      .catch(() => {
        loading.value = false;
      });
  });
};
</script>
<style lang="scss" scoped>
.page-question-view-or-edit {
  padding-bottom: 50px;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
  box-sizing: border-box;

  .info-box {
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 24px;
    font-weight: 400;
    font-size: 14px;
    color: #666666;
    line-height: 14px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    padding-bottom: 24px;
    &::after {
      content: ' ';
      position: absolute;
      bottom: 0;
      left: 24px;
      width: calc(100% - 24px);
      border-bottom: 1px solid rgba(222, 219, 217, 1);
    }
    .split {
      transform: translateY(-2px);
      color: rgba(218, 219, 224, 1);
      font-size: 12px;
      box-sizing: border-box;
      padding: 0 12px;
    }
  }

  .title-box {
    padding: 4px;
    box-sizing: border-box;
    display: flex;

    .icon {
      transform: translateY(4px);
      display: block;
      text-align: center;
      font-size: 20px;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      line-height: 20px;
      padding-top: 5px;
      color: var(--el-color-white);
      background-color: rgba(187, 187, 187, 1);
      margin-right: 8px;
    }

    .title {
      padding: 24px 0 20px 4px;

      display: block;
      font-family: Source Han Sans CN, Source Han Sans CN;
      font-weight: bold;
      font-size: 18px;
      color: #333333;
      line-height: 18px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }
  .user-info-row {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;

    .time {
      white-space: nowrap;
      justify-self: flex-end;
      color: rgba(153, 153, 153, 1);
    }
  }
  .step-content {
    margin-top: 16px;
    padding: 8px 8px 8px 8px;
    background-color: rgba(246, 248, 250, 1);
    .item {
      margin-bottom: 8px;
      .desc {
        font-size: 12px;
        color: #333333;
        line-height: 12px;
        text-align: left;
        font-style: normal;
        text-transform: none;

        :deep(.el-textarea.is-disabled) {
          .el-textarea__inner {
            border-color: transparent;
            box-shadow: none;
            background-color: transparent;
          }
        }
      }
      .ats {
        :deep(.file-list) {
          gap: 0;
          padding: 0;
          .file-item {
            height: 32px;
            padding-left: 8px;
            background-color: #fff;
            border-radius: 4px;
            & + .file-item {
              margin-top: 8px;
            }
            width: 100%;
            display: flex;
            justify-content: flex-start;
            flex-flow: row nowrap;
            .file-item-type,
            .file-item-type_icon {
              width: 20px;
              height: 20px;
            }

            .file-item_name {
              margin-top: 0;
              padding-left: 8px;
              text-align: left;
              height: 20px;
              line-height: 20px;
              font-size: 12px;
              color: #999999;
              text-align: left;
              font-style: normal;
              text-transform: none;
            }
          }
        }
      }
    }
  }

  .row {
    display: flex;
    flex: 1;
    flex-flow: row nowrap;
    justify-content: flex-start;

    .left {
      flex: 1;
      padding-right: 0;
      box-sizing: border-box;
      :deep(.el-form) {
        padding-top: 24px;
        padding-right: 24px;
      }
    }
    .right {
      border-left: 1px solid rgba(245, 245, 245, 1);
      box-sizing: border-box;
      padding: 32px 24px 20px;
      width: 370px;

      :deep(.is-finish .el-step__icon),
      :deep(.is-process .el-step__icon) {
        background-color: var(--el-color-primary);
        box-sizing: border-box;
        border: 5px solid rgba(255, 230, 212, 1);
        .el-step__icon-inner {
          display: none;
        }
      }
      :deep(.is-finish .el-step__line) {
        background-color: transparent;
        border-right: 1px dashed var(--el-color-primary);
        .el-step__line-inner {
          display: none;
        }
      }

      :deep(.el-step__title) {
        font-weight: bold;
        font-size: 14px;
        color: #333333;
        line-height: 14px;
        transform: translateY(4px);
        text-align: left;
        font-style: normal;
        text-transform: none;
      }

      :deep(.is-process .el-step__line) {
        background-color: transparent;
        border-right: 1px dashed rgba(187, 187, 187, 1);
        .el-step__line-inner {
          display: none;
        }
      }
      :deep(.is-wait .el-step__icon) {
        background-color: rgba(187, 187, 187, 1);
        box-sizing: border-box;
        border: 5px solid rgba(246, 248, 250, 1);
        .el-step__icon-inner {
          display: none;
        }
      }
    }
    .right-title {
      font-weight: bold;
      font-size: 18px;
      color: #333333;
      line-height: 18px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      margin-bottom: 24px;
    }
  }

  .group {
    padding-left: 24px;
    .group-title {
      font-weight: bold;
      font-size: 16px;
      color: #333333;
      line-height: 16px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      margin-bottom: 20px;
      .icon {
        display: inline-block;
        cursor: pointer;
        margin-right: 4px;
      }
    }

    .gorup-content {
      height: auto;
      margin-top: 10px;
      padding-left: 20px;
      &.hide {
        transition: all ease-in 0.2s;
        height: 0;
        overflow: hidden;
      }
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10;
    width: calc(100% - 40px);
    height: 48px;
    text-align: left;
    padding-left: 24px;
    background-color: #fff;
    box-sizing: border-box;
    padding-top: 8px;
  }
}
</style>
