<template>
  <basic-container class="page-container" v-loading="loading">
    <iframe
      v-if="!iframeShow"
      class="drawing-wrap"
      :src="iframeSrc"
      title="物料图纸"
      frameBorder="no"
      border="0"
      marginWidth="0"
      marginHeight="0"
      scrolling="no"
      allowTransparency="yes"
    ></iframe>

    <div class="content-warp page-prod-plan-edit" :class="pageRenderSize">
      <div class="drawer-container">
        <div class="clearfix" v-if="!isEdit">
          <el-text style="padding: 0 15px">{{ total }}个</el-text>
          <el-button type="primary" size="medium" @click="handleNextItem">下一个</el-button>
        </div>

        <!-- 基本信息 -->
        <CollapsePanel>
          <template #title>基本信息</template>
          <div class="flex flex-wrap gap-2 text-gray-700 text-sm font-medium">
            <template v-for="(item, index) in basicInfoConfig" :key="index">
              <span class="flex items-center">
                <span class="text-gray-600">{{ item.label }}：</span>
                <span class="font-semibold">{{
                  item.formatter ? item.formatter(routeRow[item.value]) : routeRow[item.value]
                }}</span>
              </span>
              <span v-if="index < basicInfoConfig.length - 1" class="hidden md:inline-block"
                >|</span
              >
            </template>
          </div>
        </CollapsePanel>

        <!-- 原材料绑定 -->
        <CollapsePanel>
          <template #title>原材料绑定</template>
          <el-form
            size="medium"
            ref="dynamicForm"
            :model="routeRow"
            label-width="100px"
            label-position="left"
          >
            <el-row :gutter="20">
              <el-col
                v-for="(item, index) in formConfig"
                :key="index"
                :xs="24"
                :sm="item.prop === 'shape' || item.prop === 'size' ? 24 : 12"
                :md="item.prop === 'shape' || item.prop === 'size' ? 24 : 12"
              >
                <el-form-item
                  :label="item.label"
                  :prop="item.prop"
                  :required="item.required"
                  :rules="item.rules"
                  class="form-item"
                >
                  <!-- 单选组 -->
                  <template v-if="item.type === 'radio-group'">
                    <el-radio-group v-model="routeRow[item.prop]" @change="handleFieldChange(item)">
                      <el-radio
                        v-for="option in item.options"
                        :key="option.value"
                        :label="option.value"
                        :disabled="item.isEdit || item.disabled"
                        class="radio-item"
                        >{{ option.label }}</el-radio
                      >
                    </el-radio-group>
                  </template>

                  <!-- 下拉框 -->
                  <template v-else-if="item.type === 'select'">
                    <el-select
                      v-model="routeRow[item.prop]"
                      :placeholder="item.placeholder || ''"
                      filterable
                      :remote="item.remote || false"
                      :disabled="item.isEdit"
                      :remote-method="item.remote ? handleRemoteSearch : undefined"
                      @change="handleFieldChange(item)"
                      @clear="handleSelectClear(item)"
                      v-if="item.remote"
                      :loading="item.loading"
                      clearable
                      class="select-item"
                    >
                      <el-option
                        v-for="option in selectOptions"
                        @click="handleSelectOptionClick(option, item)"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                    <el-select
                      v-else
                      v-model="routeRow[item.prop]"
                      :placeholder="item.placeholder || ''"
                      :clearable="item.clearable"
                      :disabled="item.isEdit"
                      @change="handleFieldChange(item)"
                      :loading="item.loading"
                      class="select-item"
                    >
                      <el-option
                        v-for="option in item.options"
                        @click="handleSelectOptionClick(option, item)"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </template>

                  <!-- 输入框 -->
                  <template v-else>
                    <el-input
                      v-model="routeRow[item.prop]"
                      :placeholder="getInputPlaceholder(item.prop)"
                      @blur="handleFieldChange(item)"
                      clearable
                      :disabled="item.disabled || item.isEdit"
                      :readonly="item.readonly || false"
                      class="input-item"
                    />
                  </template>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </CollapsePanel>

        <!-- 加工工艺 -->
        <CollapsePanel>
          <template #title>加工工艺</template>
          <div class="process-section" v-if="!isEdit">
            <ProcessRoute
              ref="processRouteRef"
              @child-addToRoute="handleAddProcessToRoute"
              @filteredProcessLibrary="handleFilteredProcessLibrary"
              :isAddToRoute="canAddToRoute"
              :currentOutsourceProcess="currentOutsourceProcess"
              :processLibrary="processLibrary"
            ></ProcessRoute>
          </div>
          <div class="process-section" v-else>
            <ProcessTable
              :routeRowTable="routeRowTable"
              :processData="currentOutsourceProcessTable"
            ></ProcessTable>
          </div>
          <div style="height: 80px"></div>
        </CollapsePanel>
      </div>

      <div class="footer" v-if="!isEdit">
        <div style="margin-bottom: 8px; background-color: aliceblue; padding: 5px">
          <el-text>
            单价:{{ routeRow.currentOutsourcePrice || 0 }} =
            <span> 材料费:{{ routeRow.materialFee || 0 }}</span>
            + 加工费:{{ routeRow.processFee || 0 }}+ 表处费:{{ routeRow.surfaceFee || 0 }}
          </el-text>
        </div>
        <div>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button type="primary" @click="openHistoryProcess">历史工艺</el-button>
        </div>
      </div>
    </div>
    <processDrawer ref="processDrawerRef" @confirm="handleHistoryProcessConfirm"></processDrawer>
  </basic-container>
</template>

<script setup>
import {
  ref,
  reactive,
  getCurrentInstance,
  watch,
  onUnmounted,
  computed,
  watchEffect,
  nextTick,
  onMounted,
} from 'vue';
import CollapsePanel from '../components/CollapsePanel.vue';
import ProcessRoute from '../components/ProcessRoute.vue';
import processDrawer from '../components/processDrawer.vue';
import ProcessTable from '../components/ProcessTable.vue';
import { useRoute, useRouter } from 'vue-router';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import Api from '@/api/index';
import getFormConfig from './index';
import BigNumber from 'bignumber.js';
import {
  ElForm,
  ElFormItem,
  ElRadioGroup,
  ElMessageBox,
  ElRadio,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage,
} from 'element-plus';

import {
  parseSize,
  calculateWeight,
  calculateArea,
  formatBigNumber,
  calculateProcessCost,
} from '@/utils/calculate';

// 首先定义shapePlaceholders，解决初始化顺序问题
const shapePlaceholders = {
  DC_RAW_MATERIAL_TYPE_B: '长*宽*厚（例：1000*500*10）',
  DC_RAW_MATERIAL_TYPE_length: '直径*长度（例：50*2000）',
  DC_RAW_MATERIAL_TYPE_YG: '外径*壁厚*长度（例：108*4*6000）',
  DC_RAW_MATERIAL_TYPE_FT: '边长1*边长2*壁厚*长度（例：100*50*5*6000）',
  DC_RAW_MATERIAL_TYPE_JT: '边长1*边长2*壁厚*长度（例：50*50*5*2000）',
};

// 路由与状态管理
const route = useRoute();
const router = useRouter();
const { markAsSaved, markAsUnsaved } = useUnsavedChanges();
const { proxy } = getCurrentInstance();

// 基础状态 - 初始化routeRow为对象，避免undefined
const loading = ref(false);
const iframeShow = ref(false);
const iframeSrc = ref('');
const routeRow = ref({
  currentOutsourcePrice: 0,
  materialFee: 0,
  processFee: 0,
  surfaceFee: 0,
});
const processRouteRef = ref(null);
const processDrawerRef = ref(null);
const total = ref(0);
const isEdit = ref(false);

// 工艺相关状态
const processLibrary = ref([]);
const originProcessLibrary = ref([]);
const currentOutsourceProcess = ref([]);
const currentOutsourceProcessTable = ref([]);
const routeRowTable = ref({});
const selectedProcesses = ref([]); // 选中的工艺列表

// 表单相关状态 - 现在shapePlaceholders已经定义，可以安全使用
const formConfig = reactive(getFormConfig(() => routeRow.value.shape, shapePlaceholders));
const dynamicForm = ref(null);
const selectOptions = ref([]);
const checkRawListData = ref([]);
const dictMaps = ref({});
const hasHistoryProcess = ref(false);

// 基本信息配置
const basicInfoConfig = ref([
  { label: '下单数量', value: 'qty', formatter: value => (value ? Number(value).toFixed(1) : '') },
  { label: '材质', value: 'erpSpecificationName' },
  { label: '物料名称', value: 'materialName' },
]);

// 计算属性：是否可以添加工艺
// const canAddToRoute = computed(() => {
//   // const isSupplierMaterial = Boolean(routeRow.value.supplierMaterial);
//   console.log(dynamicForm.value.validate());

//   // if (isSupplierMaterial) return true;

//   // 非供应商包料时需要验证表单
//   return dynamicForm.value ? dynamicForm.value.validate() : false;
// });

// 分页操作：下一个
const handleNextItem = () => {
  ElMessageBox.confirm('当前页面有未保存的数据，确定要离开吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      iframeShow.value = true;
      router.push({
        path: `/system/outsource-quotation/pricingdetail`,
        query: { ...route.query },
      });
      processRouteRef.value?.resetProcessRoute();
      nextTick(() => {
        iframeShow.value = false;
        initData(true);
      });
    })
    .catch(() => {});
};

// 初始化数据
const initData = async (isNext = false) => {
  loading.value = true;
  try {
    const res = await Api.system.OutsourceQuotation.getOrderDetail({
      srcEntryId: isNext ? null : route.query.srcEntryId,
      total: isNext ? null : route.query.total,
    });

    if (res.data.code === 200) {
      // 确保routeRow始终是对象，避免undefined
      routeRow.value = {
        currentOutsourcePrice: 0,
        materialFee: 0,
        processFee: 0,
        surfaceFee: 0,
        ...res.data.data.outsourceQuotation,
      };
      iframeSrc.value = `https://www.eastwinbip.com/drawing/${routeRow.value.fnumber}`;
      processLibrary.value = res.data.data.technologyList;
      originProcessLibrary.value = res.data.data.technologyList;
      total.value = res.data.data.total;
      hasHistoryProcess.value = res.data.data.existHistoryProcess;
      currentOutsourceProcess.value = res.data.data.currentOutsourceProcess;

      await getDict();
      await fetchRawMaterialList();

      // 如果有原材料编码，自动加载对应数据
      if (routeRow.value.rawMaterialCode) {
        handleRemoteSearchByNumber(routeRow.value.rawMaterialCode);
      }
    }
  } catch (error) {
    ElMessage.error('获取数据失败');
    console.error('初始化失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取原材料列表
const fetchRawMaterialList = async () => {
  try {
    const res = await Api.system.OutsourceQuotation.getRawList();
    const { code, data } = res.data;
    if (code === 200) {
      checkRawListData.value = data.map(item => ({
        label: item.materialName,
        value: item.materialNumber,
        ...item,
      }));
    }
  } catch (error) {
    ElMessage.error('获取原材料列表失败');
    console.error('原材料列表获取失败:', error);
  }
};

// 获取字典数据
const getDict = async () => {
  try {
    const res = await proxy.getMultipleDict(
      'DC_RAW_MATERIAL_TYPE,DC_TECHNOLOGY_PART_ACCURACY,ERP_MATERIAL_ARTIFACT_TYPE'
    );

    dictMaps.value = { ...dictMaps.value, ...(res || {}) };

    // 填充表单选项
    formConfig.forEach(item => {
      if (!item.dictType) return;

      const dictData = dictMaps.value[item.dictType] || [];
      item.options = dictData.map(d => ({ label: d.dictValue, value: d.dictKey }));

      // 设置默认值（如果未设置）
      if (!routeRow.value[item.prop] && item.options.length > 0) {
        routeRow.value[item.prop] = item.options[0].value;
      }
    });

    // 初始化时过滤工艺库
    filterProcessLibrary();
  } catch (error) {
    ElMessage.error('获取字典数据失败');
    console.error('字典获取失败:', error);
  }
};

// 过滤工艺库
const filterProcessLibrary = () => {
  const { cz, precisionGrade } = routeRow.value;

  // 过滤单个分类下的工艺项
  const filterCategoryItems = category => ({
    ...category,
    technologyItemList: (category.technologyItemList || []).filter(
      item =>
        (item.partAccuracy == null || item.partAccuracy === precisionGrade) &&
        (item.cz == null || item.cz === cz)
    ),
  });

  processLibrary.value = originProcessLibrary.value.map(filterCategoryItems);
};

// 处理过滤后的工艺库
const handleFilteredProcessLibrary = () => {
  filterProcessLibrary();
};

// 输入框占位符
const getInputPlaceholder = prop => {
  if (prop === 'size') {
    return shapePlaceholders[routeRow.value.shape] || '请输入尺寸';
  }
  const config = formConfig.find(item => item.prop === prop);
  return config?.placeholder || '';
};

// 远程搜索处理
const handleRemoteSearch = query => {
  if (!query) {
    selectOptions.value = [];
    return;
  }

  setTimeout(() => {
    selectOptions.value = checkRawListData.value.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }, 200);
};

// 按编号搜索原材料
const handleRemoteSearchByNumber = query => {
  if (!query) {
    selectOptions.value = [];
    return;
  }

  setTimeout(() => {
    const matched = checkRawListData.value.filter(item => item.materialNumber === query);
    selectOptions.value = matched;

    if (matched.length > 0) {
      routeRow.value.rawMaterialCode = matched[0].value;
      routeRow.value.rawMaterialName = matched[0].label;
      routeRow.value.materialUnitPrice = matched[0].materialUnitPrice;
      routeRow.value.density = matched[0].density;
      routeRow.value.cz = matched[0].cz;
      filterProcessLibrary();
    }
  }, 200);
};

// 选择下拉项
const handleSelectOptionClick = (option, item) => {
  if (item.prop === 'precisionGrade') {
    routeRow.value.precisionGrade = option.value;
    filterProcessLibrary();
  } else if (item.prop === 'workpieceType') {
    routeRow.value.workpieceType = option.value;
  } else {
    // 处理原材料选择
    if (option.materialUnitPrice <= 0) {
      ElMessage.error('物料单价未维护，价格异常');
      return;
    }

    routeRow.value = {
      ...routeRow.value,
      materialCode: option.value,
      material: option.label,
      density: option.density,
      cz: option.cz,
      materialUnitPrice: option.materialUnitPrice,
      shape: option.shapeTypeCode,
      antistatic: option.antistatic,
      rawMaterialCode: option.value,
      rawMaterialName: option.label,
    };
    filterProcessLibrary();
  }
};

// 清除选择
const handleSelectClear = item => {
  if (item.prop === 'rawMaterialCode') {
    resetMaterialRelatedFields();
    processRouteRef.value?.resetProcessRoute();
  }
};

// 重置物料相关字段
const resetMaterialRelatedFields = () => {
  const fields = [
    'shape',
    'size',
    'antistatic',
    'materialCode',
    'material',
    'rawMaterialCode',
    'rawMaterialName',
  ];
  fields.forEach(key => (routeRow.value[key] = ''));
};

// 字段变化处理
const handleFieldChange = item => {
  if (['shape', 'size', 'supplierMaterial', 'materialUnitPrice'].includes(item.prop)) {
    calculateCosts();
  }
  markAsUnsaved();
};

// 计算费用
const calculateCosts = () => {
  // 确保routeRow.value已初始化
  if (!routeRow.value) return;

  // 计算重量和体积
  const { volume, weight } = calculateWeight(
    routeRow.value.shape,
    routeRow.value.size,
    routeRow.value.density
  );

  // 计算表面积
  const surfaceArea = calculateArea(routeRow.value.shape, routeRow.value.size);

  // 更新基础计算值
  routeRow.value.weight = formatBigNumber(weight);
  routeRow.value.volume = formatBigNumber(volume);
  routeRow.value.surfaceArea = formatBigNumber(surfaceArea);

  // 计算材料费（供应商包料则为0）
  const materialFee = routeRow.value.supplierMaterial
    ? 0
    : new BigNumber(weight)
        .multipliedBy(new BigNumber(routeRow.value.materialUnitPrice || 0))
        .toNumber();

  routeRow.value.materialFee = formatBigNumber(materialFee);

  // 计算总价
  updateTotalPrice();
};

// 更新总价
const updateTotalPrice = () => {
  // 确保routeRow.value已初始化
  if (!routeRow.value) return;

  const total = new BigNumber(routeRow.value.surfaceFee || 0)
    .plus(new BigNumber(routeRow.value.processFee || 0))
    .plus(new BigNumber(routeRow.value.materialFee || 0))
    .toNumber();

  routeRow.value.currentOutsourcePrice = formatBigNumber(total);
};

// 添加工艺到路线
const handleAddProcessToRoute = processList => {
  selectedProcesses.value = processList;
  resetProcessCosts();

  // 计算工艺费用
  processList.forEach(item => {
    if (!item.pricingCostObj) return;

    const cost = calculateProcessCost(
      item.pricingCostObj,
      routeRow.value.surfaceArea,
      routeRow.value.weight,
      routeRow.value.qty,
      item.workHours
    );

    // 应用最小价格限制
    item.technologyPrice = formatBigNumber(
      item.pricingCostObj.minPrice && cost.toNumber() < item.pricingCostObj.minPrice
        ? item.pricingCostObj.minPrice
        : cost.toNumber()
    );

    // 区分加工费和表处费
    if (item.surfaceTreatment) {
      routeRow.value.surfaceFee = new BigNumber(routeRow.value.surfaceFee || 0)
        .plus(cost)
        .toNumber();
    } else {
      routeRow.value.processFee = new BigNumber(routeRow.value.processFee || 0)
        .plus(cost)
        .toNumber();
    }

    // 补充工艺相关数据
    item.weight = routeRow.value.weight;
    item.quantity = 1;
    item.surfaceArea = routeRow.value.surfaceArea;
  });

  updateTotalPrice();
};

// 重置工艺费用
const resetProcessCosts = () => {
  if (routeRow.value) {
    routeRow.value.surfaceFee = 0;
    routeRow.value.processFee = 0;
  }
};

// 提交表单
const handleSubmit = () => {
  dynamicForm.value.validate(valid => {
    if (!valid) {
      ElMessage.error('表单存在错误，请检查后重试');
      return;
    }

    if (selectedProcesses.value.length === 0) {
      ElMessage.error('请添加工艺');
      return;
    }

    submitFormData();
  });
};

// 提交数据处理
const submitFormData = async () => {
  loading.value = true;
  try {
    const submitData = selectedProcesses.value.map((item, index) => ({
      technologyId: item.id,
      technologyName: item.technologyName,
      technologyCode: item.technologyCode,
      technologyProcessingHours: parseFloat((item.workHours * 60).toFixed(1)),
      technologyPricingMethod: item.pricingMethod || 'DC_TECHNOLOGY_PRICING_METHOD_ZL',
      technologyPrice: item.technologyPrice,
      technologyPriceSingle: item.pricingCostObj.price,
      technologyPriceId: item.pricingCostObj.technologyPriceId,
      technologyPriceMin: item.pricingCostObj.minPrice || 0,
      processOrder: index + 1,
    }));

    const res = await Api.system.OutsourceQuotation.saveAndPushToErp({
      currentOutsourceProcess: submitData,
      outsourceQuotation: {
        ...routeRow.value,
        materialShapeId: routeRow.value.shape,
        quotationStatusId: 'DC_WX_VALENCE_STATUS_WHJ',
      },
    });

    if (res.data.code === 200) {
      ElMessage.success('保存成功');
      route.query.srcEntryId = routeRow.value.srcEntryId;
      route.query.total = total.value;
      initData(false);
      processRouteRef.value?.resetProcessRoute();
      markAsSaved();
    } else {
      ElMessage.error(res.data.msg || '保存失败');
    }
  } catch (error) {
    ElMessage.error('保存失败：' + (error.message || '网络错误'));
    console.error('提交失败:', error);
  } finally {
    loading.value = false;
  }
};

// 编辑状态数据加载
const loadEditData = async () => {
  try {
    const res = await Api.system.OutsourceQuotation.loadHistoryByEntryId({
      srcEntryId: route.query.srcEntryId,
    });

    if (res.data.code === 200) {
      // 确保routeRow始终是对象
      routeRow.value = {
        currentOutsourcePrice: 0,
        materialFee: 0,
        processFee: 0,
        surfaceFee: 0,
        ...res.data.data.outsourceQuotation,
      };
      routeRowTable.value = res.data.data.outsourceQuotation;
      iframeSrc.value = `https://www.eastwinbip.com/drawing/${routeRow.value.fnumber}`;
      processLibrary.value = res.data.data.technologyList;
      originProcessLibrary.value = res.data.data.technologyList;
      total.value = res.data.data.total;
      hasHistoryProcess.value = res.data.data.existHistoryProcess;
      currentOutsourceProcessTable.value = res.data.data.currentOutsourceProcess;

      await getDict();
    }
  } catch (error) {
    ElMessage.error('加载编辑数据失败');
    console.error('编辑数据加载失败:', error);
  }
};

// 历史工艺相关
const openHistoryProcess = () => {
  processDrawerRef.value.openDialog({
    materialCode: routeRow.value.fnumber,
    srcEntryId: routeRow.value.srcEntryId,
  });
};

const handleHistoryProcessConfirm = data => {
  if (Array.isArray(data)) {
    currentOutsourceProcess.value = data;
    processRouteRef.value?.resetProcessRoute();
    filterProcessLibrary();
  } else {
    ElMessage.error('历史工艺数据格式错误');
  }
};
const canAddToRoute = ref(false);

// 监听与初始化
watchEffect(() => {
  // 确保routeRow.value已初始化再计算费用
  if (routeRow.value) {
    calculateCosts();

    // 表单验证
    if (dynamicForm.value) {
      nextTick(() => {
        // 调用表单验证方法
        dynamicForm.value.validate(valid => {
          // 更新验证结果
          canAddToRoute.value = valid;
        });
      });
    }
  }
});

// 监听形状和尺寸变化，触发工艺过滤
watch(
  () => [routeRow.value.shape, routeRow.value.size],
  () => {
    filterProcessLibrary();
  }
);

// 初始化
onMounted(async () => {
  const isEditStatus = route.query.quotationStatusId === 'DC_WX_VALENCE_STATUS_YHJ';
  isEdit.value = isEditStatus;

  // 设置表单编辑状态
  formConfig.forEach(item => {
    item.isEdit = isEditStatus;
  });

  if (isEditStatus) {
    await loadEditData();
  } else {
    await initData(false);
  }
});

onUnmounted(() => {
  // 清理工作
  selectOptions.value = [];
  selectedProcesses.value = [];
});
</script>
<style lang="scss">
.page-container {
  .basic-container__card {
    .el-card__body {
      display: flex;
      align-items: center;
      flex-direction: row;
      .page-process-outsourcing-right {
        .param-group {
          display: none;
        }
      }
    }
  }
}
.content-warp {
  overflow-y: scroll;
}
</style>
<style scoped lang="scss">
::v-deep .el-form-item {
  margin-bottom: 7px;
}

/* 图纸预览 */
.drawing-wrap {
  width: 65%;
  height: 100%;
}
.page-prod-plan-edit {
  width: 35%;
}

/* 工艺样式 */
.process-section {
  padding: 5px;
}

.process-item {
  cursor: pointer;
  text-align: center;
  margin: 2px;
}

.clearfix {
  display: flex;
  justify-content: center;
}

.footer {
  position: absolute;
  bottom: 0;
  right: 0px;
  width: 35%;
  text-align: right;
  padding-top: 8px;
  border-top: 1px solid #eaeaeb;
  padding-right: 20px;
  height: 90px;
  z-index: 99;
  background-color: #fff;
}
</style>
