<template>
  <!-- <basic-container> -->
  <div
    v-loading="loading"
    ref="pageBoxRef"
    class="content-warp page-plan-add-or-edit"
    :class="pageRenderSize"
  >
    <el-form ref="formRef" label-suffix=":" label-width="120px" :model="formData">
      <template v-if="['edit', 'view'].includes(props.mode)">
        <div v-for="(group, i) in option.edit" :key="i" class="group">
          <div class="group-title">{{ group.label }}</div>
          <div v-if="group.renderType === 'form'" class="group-items">
            <template v-for="(col, i) in group.columns">
              <el-form-item
                v-if="!col.showFunc || (col.showFunc?.call && col.showFunc(formData))"
                :label="col.label"
                :prop="col.prop"
                :class="col.class"
                :rules="col.getRules?.call ? col.getRules(formData) : getRuleByColumn(col)"
              >
                <el-radio-group
                  v-if="col.type === 'el-radio-group'"
                  v-bind="col.props"
                  v-model="formData[col.prop]"
                  :disabled="!!formData.id || isFormDisabled"
                  @change="
                    val => {
                      handleFormItemChange(val, col);
                    }
                  "
                >
                  <el-radio-button
                    :label="dict.label"
                    :value="dict.id"
                    v-for="dict in dictMaps[col.dictKey]"
                    :key="dict"
                  />
                </el-radio-group>
                <el-select
                  v-else-if="col.type === 'el-select'"
                  v-bind="col.props"
                  v-model="formData[col.prop]"
                  :disabled="isFormDisabled"
                  @change="
                    val => {
                      handleFormItemChange(val, col);
                    }
                  "
                >
                  <el-option
                    v-for="(op, m) in dictMaps[col.dictKey] || []"
                    :label="op[col.labelKey]"
                    :value="op[col.valueKey]"
                  ></el-option>
                </el-select>
                <template v-else-if="col.type === 'el-cascader'">
                  <el-cascader
                    v-bind="col.props"
                    :modelValue="formData[col.prop]"
                    :options="dictMaps[col.dictKey]"
                    :disabled="isFormDisabled"
                    @change="
                      val => {
                        handleFormItemChange(val, col);
                      }
                    "
                  ></el-cascader>
                </template>
                <component
                  v-else
                  v-bind="col.props"
                  :is="col.type"
                  :disabled="isFormDisabled"
                  v-model="formData[col.prop]"
                ></component>
              </el-form-item>
            </template>
          </div>
          <template v-else-if="group.renderType === 'table'">
            <div v-if="props.mode === 'edit'" class="toolbar">
              <el-button @click="addChild(formData.id)" type="primary">添加子计划</el-button>
            </div>
            <el-table :data="formData[group.key]">
              <el-table-column
                v-for="(col, j) in group.columns"
                :key="j"
                :prop="col.prop"
                :label="col.label"
                v-bind="col.tableColumnProps"
                :show-overflow-tooltip="true"
              >
                <template #default="scoped">
                  <dc-view
                    v-if="col.tableType === 'dc-view'"
                    v-model="scoped.row[col.prop]"
                    v-bind="col.tableControlProps"
                  />
                  <template v-else-if="col.tableType === 'dc-dict'">
                    <span
                      class="plan-type"
                      v-if="col.prop === 'businessCategoryId'"
                      :style="{ backgroundColor: getPlanTypeColor(scoped.row.businessCategoryId) }"
                    >
                      <dc-dict :options="dictMaps[col.dictKey]" :value="scoped.row[col.prop]" />
                    </span>
                    <dc-dict
                      v-else
                      :options="dictMaps[col.dictKey]"
                      :value="scoped.row[col.prop]"
                    />
                  </template>
                  <span v-else>{{ scoped.row[col.prop] || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column width="80px" label="操作">
                <template #default="scoped">
                  <el-button
                    v-if="props.mode === 'edit'"
                    @click="doAction('editRow', scoped.row)"
                    plain
                    type="text"
                    >编辑</el-button
                  >
                  <el-button
                    v-if="props.mode === 'view'"
                    @click="doAction('viewRow', scoped.row)"
                    plain
                    type="text"
                    >查看</el-button
                  >
                  <!-- <el-button @click="addChild(scoped.row.id)" type="text">添加子计划</el-button> -->
                </template>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </template>
      <template v-else-if="['add'].includes(props.mode)">
        <!-- <h4 class="page-title">
            <el-icon class="back-icon" @click="doAction('cancel')"><ArrowLeft /></el-icon>新增计划
          </h4> -->
        <template v-for="(col, i) in option.add.columns">
          <el-form-item
            v-if="!col.showFunc || (col.showFunc?.call && col.showFunc(formData))"
            :label="col.label"
            :prop="col.prop"
            :class="col.class"
            :rules="col.getRules?.call ? col.getRules(formData) : getRuleByColumn(col)"
          >
            <el-radio-group
              v-if="col.type === 'el-radio-group'"
              v-bind="col.props"
              v-model="formData[col.prop]"
              @change="
                val => {
                  handleFormItemChange(val, col);
                }
              "
            >
              <el-radio-button
                :label="dict.label"
                :value="dict.id"
                v-for="dict in dictMaps[col.dictKey]"
                :key="dict"
                :style="handleFormItemStyle(dict, col)"
              />
            </el-radio-group>
            <el-select
              v-else-if="col.type === 'el-select'"
              v-bind="col.props"
              v-model="formData[col.prop]"
              @change="
                val => {
                  handleFormItemChange(val, col);
                }
              "
            >
              <el-option
                v-for="(op, m) in dictMaps[col.dictKey] || []"
                :label="op[col.labelKey]"
                :value="op[col.valueKey]"
              ></el-option>
            </el-select>
            <el-cascader
              v-else-if="col.type === 'el-cascader'"
              v-bind="col.props"
              :modelValue="formData[col.prop]"
              :options="dictMaps[col.dictKey]"
              @change="
                val => {
                  handleFormItemChange(val, col);
                }
              "
            ></el-cascader>
            <component
              v-else
              v-bind="col.props"
              :is="col.type"
              v-model="formData[col.prop]"
            ></component>
          </el-form-item>
        </template>
      </template>
    </el-form>
    <!-- 变更申请 -->
    <el-dialog
      v-model="chargeDialogProps.visible"
      body-class="charge-dialog"
      :title="chargeDialogProps.title"
    >
      <div class="group-title">变更申请前</div>
      <el-form
        v-if="chargeDialogProps.visible"
        :model="formData"
        label-width="120px"
        :disabled="true"
        label-suffix=":"
      >
        <el-form-item
          v-for="(item, i) in option.charge.columns"
          :key="i"
          :label="item.label"
          :prop="item.prop"
        >
          <component v-bind="item.props" :is="item.type" v-model="formData[item.prop]"></component>
        </el-form-item>
      </el-form>
      <div class="group-title">变更申请后</div>
      <el-form
        ref="chargeFormRef"
        v-if="chargeDialogProps.visible"
        :model="chargeDialogProps.formData"
        label-width="120px"
        label-suffix=":"
      >
        <el-form-item
          v-for="(item, i) in option.charge.columns"
          :key="i"
          :label="item.label"
          :prop="item.prop"
          :rules="
            item.getRules?.call ? item.getRules(chargeDialogProps.formData) : getRuleByColumn(item)
          "
        >
          <component
            v-bind="item.props"
            :is="item.type"
            v-model="chargeDialogProps.formData[item.prop]"
          ></component>
        </el-form-item>
      </el-form>

      <div class="footer">
        <el-button type="primary" @click="doAction('chargeSubmit')">确定</el-button>
        <el-button @click="chargeDialogProps.visible = false">取消</el-button>
      </div>
    </el-dialog>
    <div class="footer">
      <el-button
        v-if="['add', 'edit'].includes(props.mode)"
        type="primary"
        @click="doAction('submit')"
        >确定</el-button
      >
      <el-button
        type="primary"
        v-if="
          !!formData.id &&
          userInfo.user_id !== formData?.createUser &&
          !['1866033974148980737', '1866034129325645826', '1866034176666755073'].includes(
            formData?.planStatusId
          )
        "
        @click="changeCharge"
        >变更申请</el-button
      >
      <el-button @click="doAction('cancel')">取消</el-button>
    </div>
  </div>
  <!-- </basic-container> -->
</template>
<script setup>
import { computed, getCurrentInstance, reactive, defineEmits, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';
import { arrayToTree } from '@/utils/util';
import Api from '@/api';
import option from './utils';
import dayjs from 'dayjs';
import { getPlanTypeColor, getPlanTypeNameColor } from '@/utils/util';

const route = useRoute();
const emit = defineEmits(['close', 'editRow', 'viewRow', 'detailInfo', 'addChild']);

const formRef = ref(null);

const props = defineProps({
  id: {
    type: String,
    default() {
      return '';
    },
  },
  mode: {
    type: String,
    default() {
      return '';
    },
    required: true,
    validator(value) {
      return ['add', 'edit', 'view'].includes(value);
    },
  },
  parentId: {
    type: String,
    default() {
      return '';
    },
  },
  from: {
    type: String,
    default() {
      return '';
    },
  },
  projectId: {
    type: String,
    default() {
      return '';
    },
  },
  projectCode: {
    type: String,
    default() {
      return '';
    },
  },
  projectCaseId: {
    type: String,
    default() {
      return '';
    },
  },
});

// const mode = computed(() => {
//   return props.id ? 'edit' : 'add';
// });

const { proxy } = getCurrentInstance();

const pageData = reactive({
  boxWidth: 0,
  loading: true,
  formData: {
    parentId: '',
  },
  dictMaps: {
    parentList: [],
    processCorrelationOptions: [],
    DC_PMS_TEMPITEM_TYPE: [],
    DC_PDP_PHASE_TYPE: [],
  },
  activeName: 'detailInfo',
  fields: [
    'businessTypeName',
    'processId',
    'docTypeId',
    'docFolder',
    'docTemplate',
    'funcType',
    'funcName',
    'funcUrl',
    'funcViewUrl',
    'systemCodeType',
    'systemCodeName',
    'systemCodePath',
  ],
});

const { boxWidth, formData, dictMaps, fields, loading } = toRefs(pageData);

const isFormDisabled = computed(() => {
  if (props.mode === 'view') {
    return true;
  }
  if (formData.value.id) {
    if (formData.value.planStatusId === '1866033974148980737') {
      return false;
    }
    return true;
  } else {
    return false;
  }
});

const pageRenderSize = computed(() => {
  if (boxWidth.value < 800) {
    return 'render-small';
  } else if (boxWidth.value >= 800 && boxWidth.value < 1200) {
    return 'render-middle';
  } else {
    return 'render-large';
  }
});

const getRuleByColumn = col => {
  const isRequired = col.required === true || (col.required?.call && col.required(formData.value));
  if (isRequired) {
    return [
      {
        required: true,
        key: col.prop,
        validator(_, value, callback) {
          if ([null, '', undefined].includes(value)) {
            callback(new Error(col.props.placeholder || `${col.label}不能为空`));
          } else {
            callback();
          }
        },
        trigger: ['blur', 'change'],
      },
    ];
  }
  return undefined;
};

const userInfo = computed(() => proxy.$store.getters.userInfo);

const getDict = async () => {
  const res = await proxy.useAsyncCache([
    { key: 'DC_PMS_TEMPITEM_TYPE' },
    { key: 'DC_PMS_DOCUMENT_TYPE' },
    { key: 'DC_FOLDER_TYPE' },
    { key: 'DC_PMS_PLAN_STATUS' },
    { key: 'DC_PDP_PHASE_TYPE' },
  ]);
  dictMaps.value = res;
};

const getOptions = async () => {
  const res = await Api.system.processCorrelation.list({
    businessCategoryId: formData.value.businessCategoryId,
    size: 999999,
    current: 1,
  });
  const { code, data } = res.data;
  if (code === 200) {
    dictMaps.value.processCorrelationOptions = data.records;
  }
};

const getDetailInfo = async () => {
  const res = await Api.pdp.planItem.getDetailChildren({
    id: props.id,
  });
  const { code, data } = res.data;
  if (code === 200) {
    formData.value = data;
    emit('detailInfo', { ...data, DC_PMS_PLAN_STATUS: dictMaps.value.DC_PMS_PLAN_STATUS });
    getOptions();
  }
};

const getParentList = async () => {
  const res = await Api.pdp.planItem.getPlanitemList({
    [props.from === 'planSheet' ? 'planOrderId' : 'projectId']: props.projectId,
    projectCaseId: props.projectCaseId,
    size: 999999,
    current: 1,
  });
  const { code, data } = res.data;
  if (code === 200) {
    const arr = data.records.map(item => {
      return {
        label: item.planName,
        value: item.id,
        ...item,
        // id: item.id,
        // parentId: item.parentId,
        // planName: item.planName,
      };
    });
    dictMaps.value.parentList = arrayToTree(arr);
  }
};

const handleFormItemChange = (val, col) => {
  if (col.prop === 'businessCategoryId') {
    getOptions();
    formData.value.businessType = '';
    formData.value.phaseType = '';
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 10);
  } else if (col.prop === 'businessType') {
    const option = dictMaps.value[col.dictKey].find(
      option => option[col.valueKey] === formData.value.businessType
    );
    if (option) {
      fields.value.forEach(key => {
        formData.value[key] = option[key];
      });
    } else {
      fields.value.forEach(key => {
        formData.value[key] = null;
      });
    }
  } else if (col.prop === 'parentId') {
    formData.value[col.prop] = val?.[val.length - 1];
  } else if (col.prop === 'phaseType') {
    if (val) {
      const findDict = dictMaps.value[col.dictKey].find(item => val === item.dictKey);
      formData.value.planName = findDict.dictValue;
    }
  } else {
    console.warn('not matched val', val, col);
  }
};

const handleFormItemStyle = (value, col) => {
  if (col.type === 'el-radio-group' && col.prop === 'businessCategoryId') {
    return {
      backgroundColor: getPlanTypeNameColor(value.label),
      color: '#fff',
    };
  }
};

const pageBoxRef = ref(null);

const addResize = () => {
  const box = pageBoxRef.value;
  if (box) {
    proxy.$erd.listenTo(box, element => {
      boxWidth.value = element.scrollWidth;
    });
  }
};

const savePlanItem = async () => {
  loading.value = true;
  const form = {
    ...formData.value,
    planOrderId: props?.projectId,
  };
  if (form.id) {
    // form.isMilestone = !!form.isMilestone ? 0 : 1;
    form.planStatusId = formData.value.planStatusId;
  } else {
    form.projectId = props.projectId;
    form.projectCaseId = props.projectCaseId;
  }
  if (Array.isArray(form.docTemplate)) {
    form.docTemplate = form.docTemplate.map(item => item.id).join(',');
  }
  if (Array.isArray(formData.value.attachment)) {
    form.attachment = formData.value.attachment.map(({ id }) => id).join(',');
  }
  try {
    const res = await Api.pdp.planItem.submitPlanItem(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message({ type: 'success', message: msg });
      setTimeout(() => {
        doAction('cancel');
        loading.value = false;
      }, 100);
    }
  } catch (error) {
    loading.value = false;
  }
};

const saveProjectPlanItem = async () => {
  loading.value = true;
  const form = {
    ...formData.value,
    projectId: props.projectId,
    projectCode: props.projectCode,
  };
  if (form.id) {
    // form.isMilestone = form.isMilestone ? 0 : 1;
    form.planStatusId = formData.value.planStatusId;
  } else {
    form.projectId = props.projectId;
    form.projectCaseId = props.projectCaseId;
  }
  if (Array.isArray(form.docTemplate)) {
    form.docTemplate = form.docTemplate.map(item => item.id).join(',');
  }
  if (Array.isArray(formData.value.attachment)) {
    form.attachment = formData.value.attachment.map(({ id }) => id).join(',');
  }
  delete form.children;
  try {
    const res = await Api.pdp.planItem.submit(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message({ type: 'success', message: msg });
      setTimeout(() => {
        doAction('cancel');
        loading.value = false;
      }, 100);
    }
  } catch (error) {
    loading.value = false;
  }
};

const addChild = parentId => {
  emit('addChild', {
    parentId: parentId,
    projectId: props.projectId,
    projectCaseId: props.projectCaseId,
    from: props.from,
  });
};

const chargeDialogProps = ref({
  title: '计划变更申请',
  formData: {},
  visible: false,
});

const changeCharge = () => {
  chargeDialogProps.value.formData = {};
  option.charge.columns.forEach(col => {
    chargeDialogProps.value.formData[col.prop] = formData.value[col.prop];
  });
  chargeDialogProps.value.visible = true;
};

const removeResize = () => {
  const box = proxy.$el;
  proxy.$erd.uninstall(box);
};
const doAction = (action, data) => {
  if (action === 'submit') {
    formRef.value?.validate()?.then(() => {
      if (props.from === 'planSheet') {
        savePlanItem();
      } else if (props.from === 'projectList') {
        saveProjectPlanItem();
      }
    });
  } else if (action === 'cancel') {
    emit('close');
  } else if (action === 'editRow') {
    emit('editRow', {
      from: props.from,
      id: data.id,
      parentId: formData.value.id,
      projectId: props?.projectId,
    });
  } else if (action === 'viewRow') {
    emit('viewRow', {
      from: props.from,
      id: data.id,
      parentId: formData.value.id,
      projectId: props?.projectId,
    });
    //  变更申请
  } else if (action === 'chargeSubmit') {
    proxy.$refs['chargeFormRef'].validate(async valid => {
      if (valid) {
        if (
          Object.keys(chargeDialogProps.value.formData).every(k => {
            return chargeDialogProps.value.formData[k] === formData.value[k];
          })
        ) {
          proxy.$message.error('变更申请数据与变更前相同');
          return;
        }
        const dataSend = {
          businessId: formData.value.id,
          formerChargePersonId: formData.value.handlePersonId,
          formerStartDate: formData.value.startDate,
          formerEndDate: formData.value.endDate,
          handlePersonId: formData.value.createUser,
          currentChargePersonId: chargeDialogProps.value.formData.handlePersonId,
          currentStartDate: chargeDialogProps.value.formData.startDate,
          currentEndDate: chargeDialogProps.value.formData.endDate,
        };
        const res = await Api.pdp.changeRecord.sumbitProcess(dataSend);
        const { code } = res.data;
        if (code === 200) {
          proxy.$message({ type: 'success', message: '申请成功' });
          chargeDialogProps.value.visible = false;
          proxy.$store.dispatch('UpdateWorkCountStatistic');
        }
      }
    });
  } else {
    console.warn('action not souport', action);
  }
};

watch(
  () => props.id,
  () => {
    setTimeout(() => {
      getDetailInfo();
    }, 10);
  }
);

onMounted(async () => {
  if (props?.parentId) {
    formData.value.parentId = props?.parentId;
  }
  await getDict();
  await getParentList();
  if (['edit', 'view'].includes(props.mode)) {
    await getDetailInfo();
  } else if (['add'].includes(props.mode)) {
    formData.value.startDate = dayjs().format('YYYY-MM-DD');
  }
  addResize();
  loading.value = false;
});
onBeforeUnmount(() => {
  removeResize();
});
</script>

<style lang="scss" scoped>
.page-plan-add-or-edit {
  border: 1px solid transparent;
  box-sizing: border-box;
  padding-bottom: 100px;
  :deep(.el-radio-button__original-radio:disabled:checked + .el-radio-button__inner) {
    background-color: #fff;
  }
  :deep(.el-radio-button__original-radio:disabled + .el-radio-button__inner) {
    background-color: rgba(0, 0, 0, 0.15);
  }
  :deep(.charge-dialog) {
    height: auto;
    padding-bottom: 60px;
  }
  .page-title {
    font-size: 16px;
    color: #333;
    line-height: 1.2;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    margin-bottom: 10px;
  }

  .back-icon {
    transform: translateY(2px);
    margin-right: 4px;
    cursor: pointer;
  }
  :deep(.el-form-item) {
    .el-cascader {
      width: 100%;
    }
    .business-category {
      .el-radio-button--small .el-radio-button__inner {
        padding: 10px;
      }
    }
  }
  &.render-large {
    :deep(.w50) {
      display: inline-flex;
      width: 32%;
      margin-right: 1%;
    }
    :deep(.w100) {
      width: 98%;
    }
  }
  &.render-middle {
    :deep(.w50) {
      display: inline-flex;
      width: 48%;
      margin-right: 1%;
    }
  }
  &.render-small {
    :deep(.w50) {
      display: inline-flex;
      width: 97%;
      margin-right: 1%;
    }
  }

  .group-title {
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    padding-left: 9px;
    position: relative;
    padding-top: 20px;
    padding-bottom: 32px;

    &:first-child {
      padding-top: 0;
    }

    &::before {
      display: inline-block;
      content: ' ';
      width: 4px;
      height: 13px;
      background: #f78431;
      margin-right: 8px;
    }
  }
  :deep(.w100) {
    width: 97%;
  }
  :deep(.w50) {
    display: inline-flex;
    width: 48%;
    margin-right: 1%;
  }
  :deep(.el-date-editor) {
    width: 100%;
  }

  .footer {
    z-index: 100;
    padding: 8px 0 14px;
    text-align: center;
    position: absolute;
    width: 100%;
    height: auto;
    left: 0;
    bottom: 0;
    background-color: #fff;
  }
}
</style>
