<template>
  <div ref="boxRef" class="comp-project-add-or-edit" :class="pageRenderSize">
    <dc-steps v-bind="stepProps"></dc-steps>
    <div class="form-box">
      <el-scrollbar style="height: 100%">
        <el-form
          v-if="inited"
          ref="formRef"
          :model="formData"
          label-suffix=":"
          :label-width="labelWidth"
          inline
        >
          <template v-for="item in formItems">
            <template v-if="item.type === 'dc-member'">
              <dc-member
                :mode="formData.id ? 'edit' : 'add'"
                formItemClass="form-item-common"
                :modelFieldListProp="'dcPdpFuncFieldList'"
                :templateProp="'funcFieldTemplateId'"
                v-model:modelTemplate="formData.funcFieldTemplateId"
                v-model:modelFieldList="formData.dcPdpFuncFieldList"
              />
            </template>
            <template v-else>
              <el-form-item
                class="form-item-common"
                :class="item.class"
                :label="item.label"
                :prop="item.prop"
                :rules="item.required ? getFormRule(item) : undefined"
              >
                <component
                  v-if="item.type === 'el-select'"
                  v-model="formData[item.prop]"
                  :is="item.type"
                  v-bind="item.props"
                  :disabled="checkDiabled(item, formData)"
                  @change="
                    val => {
                      handleFormItemChange(val, item);
                    }
                  "
                >
                  <el-option
                    v-for="(option, index) in dictMaps[item.dictKey] || []"
                    :label="option[item.labelKey ? item.labelKey : 'dictValue']"
                    :value="option[item.valueKey ? item.valueKey : 'dictKey']"
                    :key="index"
                  >
                  </el-option>
                </component>
                <component
                  v-else-if="item.type === 'el-select-remote-search'"
                  :is="'el-select'"
                  v-model="formData[item.prop]"
                  v-bind="item.props"
                  :remote-method="remoteMethodMaps[item.remoteSearch]"
                  :loading="loadingMaps[item.loading]"
                  :disabled="checkDiabled(item, formData)"
                  @change="
                    val => {
                      handleFormItemChange(val, item);
                    }
                  "
                >
                  <el-option
                    v-for="(option, index) in dictMaps[item.dictKey] || []"
                    :label="option[item.labelKey ? item.labelKey : 'dictValue']"
                    :value="option[item.valueKey ? item.valueKey : 'dictKey']"
                    :key="index"
                  >
                  </el-option>
                </component>
                <component
                  v-else-if="item.type === 'el-cascader'"
                  v-model="formData[item.prop]"
                  :is="item.type"
                  v-bind="item.props"
                  :disabled="checkDiabled(item, formData)"
                  :options="dictMaps[item.dictKey]"
                  @change="
                    val => {
                      handleFormItemChange(val, item);
                    }
                  "
                />

                <component
                  v-else
                  v-model="formData[item.prop]"
                  :is="item.type"
                  v-bind="item.props"
                  :disabled="checkDiabled(item, formData)"
                  @change="
                    val => {
                      handleFormItemChange(val, item);
                    }
                  "
                ></component>
              </el-form-item>
            </template>
          </template>
        </el-form>
      </el-scrollbar>
    </div>
    <div class="footer">
      <el-button v-if="activeIndex > 0" @click="doAction('last')">上一步</el-button>
      <el-button v-if="activeIndex < 2" @click="doAction('next')">下一步</el-button>
      <el-button v-if="activeIndex === 2" type="primary" @click="doAction('submit')"
        >保存</el-button
      >
      <el-button v-if="activeIndex === 2 && !formData.id" @click="doAction('saveData')"
        >存草稿</el-button
      >
      <el-button @click="doAction('cancel')">取消</el-button>
    </div>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Options from './utils';
import Api from '@/api/index';
import { getDetailByParams } from '@/api/system/param';

const { proxy } = getCurrentInstance();

const router = useRouter();
const route = useRoute();

const formRef = ref(null);
const boxRef = ref(null);

const loadingMaps = ref({
  loadingRemote: false,
});

const pageData = reactive({
  activeIndex: 0,
  boxWidth: 1920,
  loading: false,
  inited: false,
  formData: {
    // dcPdpFuncFields: {},
    dcPmsProjectPhaseList: [],
  },
  dictMaps: {
    DC_PMS_PROJECT_ROLE: [],
    chekListOptions: [],
    DC_CRM_SECTOR: [],
    DC_PMS_PROJECT_QIOPMENT: [],
    DC_PMS_PROJECT_TYPE: [],
    DC_PMS_PROJECT_ORDER: [],
    DC_PMS_PROJECT_PHASE: [],
    DC_PMS_PROJECT_TECHNOLOGY: [],
    DC_PMS_PROJECT_CREATE_STATUS: [],
  },
  // loadingRemote remoteSearch
  remoteMethodMaps: {
    remoteSearch: async query => {
      if (!query.trim()) return;
      loadingMaps.value.loadingRemote = true;
      try {
        // 替换为实际API调用
        const res = await Api.pdp.project.endCustomerCodeList({ endCustomerProjectCode: query });
        if (res.data.code === 200) {
          dictMaps.value.chekListOptions =
            res.data?.data?.records?.map(item => ({
              value: item.endCustomerProjectCode,
              label: item.endCustomerProjectCode,
            })) || [];
        }
      } finally {
        loadingMaps.value.loadingRemote = false;
      }
    },
  },
});
const { activeIndex, formData, boxWidth, dictMaps, remoteMethodMaps, inited, loading } =
  toRefs(pageData);

const checkDiabled = (item, formDataSet) => {
  if (item.props?.disabled) {
    return true;
  } else {
    const editMode = !!formDataSet.id;
    if (editMode) {
      const group = Options.steps[activeIndex.value];
      if (group.disabledEditMode) {
        return group.disabledEditWhileList
          ? group?.enabledEditFields?.includes(item.prop)
          : !group?.enabledEditFields?.includes(item.prop);
      }
    }
  }
  return false;
};

const formItems = computed(() => {
  return Options.steps[activeIndex.value]?.formItems || [];
});

const labelWidth = computed(() => {
  return Options.steps[activeIndex.value]?.labelWidth || '140px';
});

const isNullData = value => {
  if ([null, undefined, ''].includes(value)) {
    return true;
  } else if (Array.isArray(value) && value?.length === 0) {
    return true;
  }
  return false;
};

const getFormRule = item => {
  return [
    {
      required: true,
      validator(rule, value, callback) {
        if (isNullData(value)) {
          callback(new Error(item.props?.placeholder || `${item.label}不能为空`));
        } else {
          callback();
        }
      },
      trigger: ['blur', 'change'],
    },
  ];
};

const initColumn = async () => {
  const res = await getDetailByParams({
    paramKey: 'PROJECT_USER_TEMPLATE_ID',
  });
  const { code } = res.data;
  if (code === 200) {
    formData.value.funcFieldTemplateId = res.data.data.paramValue;
  }
};

const stepProps = computed(() => {
  return {
    options: Options.steps.map(s => {
      return { label: s.label, value: s.value };
    }),
    activeIndex: activeIndex.value,
  };
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

const addResize = () => {
  try {
    const box = boxRef.value;
    if (box) {
      proxy.$erd.listenTo(box, element => {
        boxWidth.value = element.scrollWidth;
      });
    }
  } catch (error) {
    console.log('error', error);
  }
};

const removeResize = () => {
  try {
    const box = boxRef.value;
    if (box) {
      proxy.$erd.uninstall(box);
    }
  } catch (error) {
    console.log('error', error);
  }
};

const arrayToTree = (list, options = {}) => {
  // 合并默认配置
  const { idKey = 'id', parentKey = 'parentId', childrenKey = 'children' } = options;

  // 创建节点映射表
  const nodeMap = new Map();
  list.forEach(item => nodeMap.set(item[idKey], item));

  const result = list
    .filter(item => !nodeMap.get(item[parentKey]))
    .map(item => {
      const childrenData = list.filter(d => d[parentKey] === item[idKey]);
      return {
        ...item,
        [childrenKey]: childrenData?.length > 0 ? childrenData : undefined,
      };
    });

  return result;
};

const getDictMaps = async () => {
  const res = await proxy.getMultipleDict(
    'DC_PMS_PROJECT_ROLE,DC_CRM_SECTOR,DC_PMS_PROJECT_QIOPMENT,DC_PMS_PROJECT_TYPE,DC_PMS_PROJECT_ORDER,DC_PMS_PROJECT_PHASE,DC_PMS_PROJECT_TECHNOLOGY,DC_PMS_PROJECT_CREATE_STATUS'
  );

  dictMaps.value = {
    ...dictMaps.value,
    ...(res || {}),
    DC_PMS_PROJECT_PHASE: res.DC_PMS_PROJECT_PHASE
      ? arrayToTree(res.DC_PMS_PROJECT_PHASE, {
          idKey: 'id',
          parentKey: 'parentId',
          childrenKey: 'children',
          rootParentId: '1859834732500652033',
        })
      : [],
  };
};
const findNodeById = (tree, dictKey) => {
  for (const node of tree) {
    if (node.dictKey === dictKey) return node;
    if (node.children && node.children.length) {
      const result = findNodeById(node.children, dictKey);
      if (result) return result;
    }
  }
  return null;
};

const handleFormItemChange = (val, item) => {
  if (item.prop === 'phaseDictId') {
    formData.value.dcPmsProjectPhaseList = [];
    if (formData.value.phaseDictId !== 'DC_PMS_PROJECT_PHASE_MP') {
      const dict = findNodeById(dictMaps.value.DC_PMS_PROJECT_PHASE, formData.value.phaseDictId);
      if (!!dict?.children) {
        formData.value.dcPmsProjectPhaseList = dict?.children.map(item => {
          return {
            phaseCode: item.dictKey,
            startTime: null,
            endTime: null,
            notes: null,
          };
        });
      } else {
        formData.value.dcPmsProjectPhaseList.push({
          phaseCode: dict.dictKey,
          startTime: null,
          endTime: null,
          notes: null,
        });
      }
    }
  } else if (item.prop === 'demandName') {
    formData.value.demandName = val.feaName;
    formData.value.demandId = val.id;
    formData.value.demandCode = val.rlistCode;
    formData.value.customerId = val.customerId;
    formData.value.opportunitiyId = val.oppsId;
  }
};

const submitForm = () => {
  formRef.value
    .validate()
    .then(async valid => {
      if (valid) {
        try {
          loading.value = true;
          const form = {
            ...formData.value,
            funcFieldTemplateId:
              formData.value.funcFieldTemplateId?.id || formData.value.funcFieldTemplateId,
            itSADraft: false,
            customerCode: formData.value.customerCode?.join(','),
            projectCreateStatusId: dictMaps.value.DC_PMS_PROJECT_CREATE_STATUS[0].id,
            fileId: proxy.arrayToIdsString({
              array: formData.value.fileId,
            }),
            quipmentDictId: formData.value.quipmentDictId
              ? formData.value.quipmentDictId?.join(',')
              : undefined,
            technologyDictId: formData.value.technologyDictId
              ? formData.value.technologyDictId.join(',')
              : undefined,
          };
          const res = await Api.pdp.project.submit(form);
          const { code, msg } = res.data;
          if (code === 200) {
            proxy.$message.success(msg);
            router.go(-1);
          }
          loading.value = false;
        } catch (error) {
          console.error(error);
        }
      }
    })
    .catch(errors => {
      const firstErrorField = Object.keys(errors)[0];
      formRef.value.scrollToField(firstErrorField);
    });
};

const saveData = () => {
  formRef.value
    .validate()
    .then(async valid => {
      if (valid) {
        loading.value = true;
        const form = {
          ...formData.value,
          itSADraft: true,
          customerCode: formData.value.customerCode?.join(','),
          projectCreateStatusId: dictMaps.value.DC_PMS_PROJECT_CREATE_STATUS[1].id,
          fileId: proxy.arrayToIdsString({
            array: formData.value.fileId,
          }),
          quipmentDictId: formData.value.quipmentDictId
            ? formData.value.quipmentDictId?.join(',')
            : undefined,
          technologyDictId: formData.value.technologyDictId
            ? formData.value.technologyDictId.join(',')
            : undefined,
        };
        const res = await Api.pdp.project.submit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          proxy.$message.success(msg);
          router.go(-1);
        }
        loading.value = false;
      }
    })
    .catch(errors => {
      const firstErrorField = Object.keys(errors)[0];
      formRef.value.scrollToField(firstErrorField);
    });
};

const doAction = action => {
  switch (action) {
    case 'next':
      formRef.value
        .validate()
        .then(() => {
          activeIndex.value = activeIndex.value + 1;
        })
        .catch(() => {
          proxy.$message.error('请先将信息填写完整');
        });

      break;
    case 'last':
      activeIndex.value = activeIndex.value - 1;
      break;
    case 'submit':
      submitForm();
      break;
    case 'saveData':
      saveData();
      break;
    case 'cancel':
      router.go('-1');
      break;
    default:
      console.log('action', action);
      break;
  }
};

// 获取详情
const getDetail = async id => {
  const res = await Api.pdp.project.detail({
    id,
  });
  const { code, data } = res.data;
  if (code === 200) {
    formData.value = {
      ...data,
      orgId: data.orgId ? `${data.orgId}` : null,
      // dcPdpFuncFields:
      //   data.dcPdpFuncFieldList?.reduce((rec, f) => {
      //     rec[f.filedKey] = f.bindUserIds;
      //     return rec;
      //   }, {}) || {},
      customerCode: data.customerCode ? data.customerCode.split(',') : [],
    };
    formData.value.technologyDictId = formData.value.technologyDictId?.split(',');
    formData.value.quipmentDictId = formData.value.quipmentDictId?.split(',');
  }
};

onMounted(async () => {
  await getDictMaps();
  addResize();
  if (route.params.id !== 'create' && !!route.params.id) {
    await getDetail(route.params.id);
  } else {
    initColumn();
  }
  inited.value = true;
});
onBeforeUnmount(() => {
  removeResize();
});
</script>
<style lang="scss" scoped>
.comp-project-add-or-edit {
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 10px 16px;
  display: flex;
  flex-flow: column nowrap;
  :deep(.el-form-item__label) {
    line-height: 16px;
    text-align: right;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }
  .form-box {
    flex: 1;
    overflow: hidden;
    padding-top: 20px;
  }
  .footer {
    text-align: center;
    height: 48px;
  }

  &.render-small {
    :deep(.form-item-common),
    .form-item-common {
      width: 100%;

      &.w-100 {
        width: 90%;
      }
    }
  }
  &.render-middle {
    :deep(.form-item-common),
    .form-item-common {
      width: 46%;

      &.w-100 {
        width: 90%;
      }
    }
  }
  &.render-large {
    :deep(.form-item-common),
    .form-item-common {
      width: 30%;

      &.w-100 {
        width: 94%;
      }
    }
  }

  :deep(.el-form-item .el-cascader) {
    width: 100%;
  }
}
</style>
