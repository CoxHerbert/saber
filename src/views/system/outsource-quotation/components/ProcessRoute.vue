<template>
  <div class="app-containerWarp">
    <!-- 工艺库 -->
    <div class="section-content">
      <div class="process-library">
        <el-popover placement="top-start" :width="500" trigger="click">
          <template #reference>
            <el-button style="width: 100%; margin-bottom: 10px" type="primary" plain>
              选择工艺标签添加到路线中
            </el-button>
          </template>
          <el-tag
            v-for="item in processLibrary"
            :key="item.id"
            :type="item.surfaceTreatment ? 'success' : 'primary'"
            @click="addToRoute(item)"
            class="process-item"
          >
            <el-icon><Plus /></el-icon>
            {{ item.technologyName }}
          </el-tag>
        </el-popover>
      </div>
    </div>

    <!-- 工艺路线 -->
    <div class="section">
      <div class="section-content">
        <div class="route-container" ref="routeContainer">
          <!-- 空状态 -->
          <div v-if="processRoute.length === 0" class="empty-route">
            <el-empty description="暂无工艺路线" />
          </div>

          <!-- 胶囊式工艺项目 -->
          <template v-else>
            <div
              v-for="(item, index) in processRoute"
              :key="`${item.id}-${index}`"
              class="process-capsule"
              :class="{ focused: focusedCapsule === index }"
              :data-index="index"
              v-memo="[item.id, index, focusedCapsule, item.technologyPrice]"
            >
              <!-- 拖拽手柄 -->
              <el-icon class="drag-handle">
                <Menu />
              </el-icon>

              <!-- 删除按钮 -->
              <el-icon class="delete-btn" @click="removeFromRoute(index, $event)">
                <Delete />
              </el-icon>

              <!-- 胶囊头部：序号和工艺名称 -->
              <div class="capsule-header-content">
                <div class="capsule-header">
                  <el-text class="step-number">{{ index + 1 }}</el-text>
                  <el-text tag="b" truncated style="width: 70px">{{ item.technologyName }}</el-text>

                  <!-- <div class="process-name">￥{{ item.technologyPrice }}</div> -->
                </div>
                <div>
                  <el-text type="primary" tag="b" truncated>￥{{ item.technologyPrice }}</el-text>
                  <!-- <div class="process-name">￥{{ item.technologyPrice }}</div> -->
                </div>
              </div>
              <!-- <div class="capsule-header">
                <div class="step-number">{{ index + 1 }}</div>
                <el-text tag="b" truncated style="width: 70px">{{ item.technologyName }}</el-text>
                <el-text type="primary" tag="b" truncated>￥{{ item.technologyPrice }}</el-text>
              </div> -->

              <!-- 输入框区域 -->
              <div class="capsule-inputs">
                <div class="input-wrapper" v-if="item.pricingCostObj">
                  <label class="input-label">{{ item.pricingCostObj.labelEn }}</label>

                  <input
                    type="number"
                    class="capsule-input work-hours-input"
                    v-model.number="item[getBoundField(item)]"
                    placeholder="0"
                    min="0"
                    step="0.5"
                    :disabled="isInputDisabled(item)"
                    @focus="handleInputFocus(index)"
                    @blur="handleInputBlur"
                    @keydown.tab="handleTabNavigation($event, index, getBoundField(item))"
                    @keydown.enter="handleEnterNavigation($event, index, getBoundField(item))"
                    :data-capsule="index"
                    :data-field="getBoundField(item)"
                  />
                </div>

                <div class="input-wrapper">
                  <label class="input-label">计价方式</label>
                  <select
                    class="capsule-select pricing-select"
                    :class="{ 'single-option': getAvailablePricingMethods(item).length === 1 }"
                    v-model="item.pricingMethod"
                    @focus="handleSelectFocus(index)"
                    @blur="handleInputBlur"
                    @keydown.tab="handleTabNavigation($event, index, 'pricingMethod')"
                    @keydown.enter="handleEnterNavigation($event, index, 'pricingMethod')"
                    @change="handlePricingMethodChange(item)"
                    @keydown="handleSelectKeydown($event, index)"
                    :data-capsule="index"
                    :data-field="'pricingMethod'"
                    :title="getSelectTitle(item)"
                  >
                    <option v-if="getAvailablePricingMethods(item).length > 1" value="">
                      选择
                    </option>
                    <option
                      v-for="(method, idx) in getAvailablePricingMethods(item)"
                      :key="method.value"
                      :value="method.value"
                    >
                      {{ idx + 1 }}.{{ method.label }} ({{ method.unit }})
                    </option>
                  </select>
                  <div v-if="getAvailablePricingMethods(item).length > 1" class="keyboard-hint">
                    数字键1-{{ getAvailablePricingMethods(item).length }}快选
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, getCurrentInstance } from 'vue';
import Sortable from 'sortablejs';
import { Delete, Menu, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';

const { proxy } = getCurrentInstance();

// 定义props
const props = defineProps({
  processLibrary: {
    type: Array,
    default: () => [],
  },
  currentOutsourceProcess: {
    type: Array,
    default: () => [],
  },
  isAddToRoute: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['child-addToRoute']);

// 响应式数据
const routeContainer = ref(null);
const focusedCapsule = ref(-1);
const processRoute = ref([]);
const loading = ref(false);
// 1. 定义计价方式与绑定字段的映射关系
const fieldMap = {
  DC_TECHNOLOGY_PRICING_METHOD_GS: 'workHours', // 工时→绑定workHours
  DC_TECHNOLOGY_PRICING_METHOD_ZL: 'weight', // 重量→绑定weight
  DC_TECHNOLOGY_PRICING_METHOD_MJ: 'surfaceArea', // 面积→绑定surfaceArea
  DC_TECHNOLOGY_PRICING_METHOD_J: 'quantity', // 按件→绑定quantity
};
// 1. 判断输入框是否禁用：仅workHours（工时）可编辑，其他字段禁用
const isInputDisabled = item => {
  const field = getBoundField(item);
  // 禁用：重量（weight）、件数（quantity）、面积（surfaceArea）
  return ['weight', 'quantity', 'surfaceArea'].includes(field);
};
// 2. 动态获取当前item应绑定的字段
const getBoundField = item => {
  return fieldMap[item.pricingCostObj.value] || 'quantity'; // 默认按件
};

// 计价方式映射表（包含单位信息）
const pricingMethodMap = {
  DC_TECHNOLOGY_PRICING_METHOD_J: {
    label: '按件',
    labelEn: '件数(个)',
    value: 'DC_TECHNOLOGY_PRICING_METHOD_J',
    unit: '元/件',
  },
  DC_TECHNOLOGY_PRICING_METHOD_ZL: {
    label: '按重量',
    labelEn: '重量（KG）',
    value: 'DC_TECHNOLOGY_PRICING_METHOD_ZL',
    unit: '元/kg',
  },
  DC_TECHNOLOGY_PRICING_METHOD_GS: {
    label: '按工时',
    labelEn: '工时（分）',
    value: 'DC_TECHNOLOGY_PRICING_METHOD_GS',
    unit: '元/时',
  },
  DC_TECHNOLOGY_PRICING_METHOD_MJ: {
    label: '按面积',
    labelEn: '表面积（m2）',
    value: 'DC_TECHNOLOGY_PRICING_METHOD_MJ',
    unit: '元/平方米',
  },
};

// 添加工艺到路线
const addToRoute = process => {
  // console.log('process', props.isAddToRoute);

  if (!props.isAddToRoute) {
    ElMessage.error('请先输入材质和尺寸');
    return;
  }
  // console.log('process', process);

  try {
    // 确定默认计价方式
    const defaultPricingMethod =
      process.technologyItemList.length === 1 ? process.technologyItemList[0].pricingMethod : '';

    // 查找默认计价方式对应的详细信息
    const defaultPricingCostObj =
      getAvailablePricingMethods({
        ...process,
        pricingDetails: process.technologyItemList,
      }).find(method => method.value === defaultPricingMethod) || null;

    // 添加到工艺路线
    processRoute.value.push({
      ...process,
      workHours: parseFloat((process.standardWorkingHour / 60).toFixed(1)),
      pricingMethod: defaultPricingMethod,
      pricingDetails: process.technologyItemList,
      pricingMethods: process.technologyItemList.map(item => item.pricingMethod),
      pricingCostObj: defaultPricingCostObj,
    });
    // console.log('processRoute', processRoute.value);

    // 自动聚焦到新添加的工艺
    nextTick(() => {
      focusedCapsule.value = processRoute.value.length - 1;
      const inputs = document.querySelectorAll(`[data-capsule="${focusedCapsule.value}"]`);
      if (inputs.length > 0) {
        inputs[0].focus();
      }
    });
  } catch (error) {
    ElMessage.error(`添加工艺失败: ${error.message}`);
    // console.error('添加工艺错误:', error);
  }
};

// 从路线中移除工艺
const removeFromRoute = (index, event) => {
  // 阻止事件冒泡，避免触发拖拽等其他事件
  event.stopPropagation();

  if (processRoute.value.length <= 0) return;

  processRoute.value.splice(index, 1);

  // 聚焦处理
  if (processRoute.value.length > 0) {
    focusedCapsule.value = Math.min(index, processRoute.value.length - 1);
  } else {
    focusedCapsule.value = -1;
  }
};

// 定义清除工艺路线的方法
const resetProcessRoute = () => {
  processRoute.value = [];
  focusedCapsule.value = -1;
};

// 获取可用的计价方式（带单位和价格）
const getAvailablePricingMethods = item => {
  if (!item.pricingDetails) return [];

  return item.pricingDetails.map(detail => {
    const baseInfo = pricingMethodMap[detail.pricingMethod] || {
      label: '未知方式',
      value: detail.pricingMethod,
      unit: detail.pricingUnit,
    };
    return {
      ...baseInfo,
      price: detail.price,
      technologyPriceId: detail.id,
      minPrice: detail.minPrice,
    };
  });
};

// 处理计价方式变更
const handlePricingMethodChange = item => {
  if (!item.pricingMethod) {
    item.pricingCostObj = null;
    return;
  }

  item.pricingCostObj =
    getAvailablePricingMethods(item).find(method => method.value === item.pricingMethod) || null;
};

// 获取选择框标题
const getSelectTitle = item => {
  if (!item.pricingMethod) return '选择计价方式';

  const selectedMethod = getAvailablePricingMethods(item).find(
    method => method.value === item.pricingMethod
  );

  return selectedMethod ? `${selectedMethod.label} (${selectedMethod.unit})` : '选择计价方式';
};

// 处理输入框聚焦
const handleInputFocus = index => {
  focusedCapsule.value = index;
};

// 处理输入框失焦
const handleInputBlur = () => {
  // 延迟失焦，以便处理键盘导航
  setTimeout(() => {
    focusedCapsule.value = -1;
  }, 200);
};

// 处理Tab键导航
const handleTabNavigation = (event, index, field) => {
  event.preventDefault();
  const currentItem = processRoute.value[index];

  // 1. 同个工艺内导航：从输入框到选择框（无论输入框是否禁用）
  if (field === getBoundField(currentItem)) {
    const selects = document.querySelectorAll(
      `[data-capsule="${index}"][data-field="pricingMethod"]`
    );
    if (selects.length > 0) {
      selects[0].focus();
      return;
    }
  }

  // 2. 导航到下一个工艺
  const nextIndex = index + 1;
  if (nextIndex < processRoute.value.length) {
    focusedCapsule.value = nextIndex;
    nextTick(() => {
      // 用nextTick确保DOM已更新
      // 查找下一个工艺的输入框
      const input = document.querySelector(`[data-capsule="${nextIndex}"][type="number"]`);
      // 查找下一个工艺的选择框
      const select = document.querySelector(
        `[data-capsule="${nextIndex}"][data-field="pricingMethod"]`
      );

      if (input && !input.disabled) {
        // 输入框启用：聚焦输入框
        input.focus();
      } else if (select) {
        // 输入框禁用或不存在：聚焦选择框
        select.focus();
      }
    });
  } else {
    focusedCapsule.value = -1;
  }
};

// 处理Enter键导航（逻辑与Tab一致，同步修改）
const handleEnterNavigation = (event, index, field) => {
  event.preventDefault();
  const currentItem = processRoute.value[index];

  // 1. 同个工艺内导航：从输入框到选择框
  if (field === getBoundField(currentItem)) {
    const selects = document.querySelectorAll(
      `[data-capsule="${index}"][data-field="pricingMethod"]`
    );
    if (selects.length > 0) {
      selects[0].focus();
      return;
    }
  }

  // 2. 导航到下一个工艺
  const nextIndex = index + 1;
  if (nextIndex < processRoute.value.length) {
    focusedCapsule.value = nextIndex;
    nextTick(() => {
      const input = document.querySelector(`[data-capsule="${nextIndex}"][type="number"]`);
      const select = document.querySelector(
        `[data-capsule="${nextIndex}"][data-field="pricingMethod"]`
      );

      if (input && !input.disabled) {
        input.focus();
      } else if (select) {
        select.focus();
      }
    });
  } else {
    focusedCapsule.value = -1;
  }
};
// 处理选择框键盘事件
const handleSelectKeydown = (event, index) => {
  const item = processRoute.value[index];
  const availableMethods = getAvailablePricingMethods(item);

  // 处理数字键选择
  if (event.key >= '1' && event.key <= '9') {
    const num = parseInt(event.key, 10);
    if (num <= availableMethods.length) {
      item.pricingMethod = availableMethods[num - 1].value;
      item.pricingCostObj = availableMethods[num - 1];
      event.preventDefault();

      // 自动移动到下一个工艺
      const nextIndex = index + 1;
      if (nextIndex < processRoute.value.length) {
        focusedCapsule.value = nextIndex;
        nextTick(() => {
          const inputs = document.querySelectorAll(
            `[data-capsule="${nextIndex}"][data-field="workHours"]`
          );
          if (inputs.length > 0) {
            inputs[0].focus();
          }
        });
      }
    }
  }
};

// 初始化拖拽排序
const initSortable = () => {
  if (!routeContainer.value || processRoute.value.length === 0) return;

  // 销毁已存在的排序实例
  if (window.processSortable) {
    window.processSortable.destroy();
  }

  window.processSortable = new Sortable(routeContainer.value, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    handle: '.drag-handle',
    onEnd: event => {
      // 调整工艺顺序
      const movedItem = processRoute.value.splice(event.oldIndex, 1)[0];
      processRoute.value.splice(event.newIndex, 0, movedItem);
      focusedCapsule.value = event.newIndex;
    },
  });
};

// 监听工艺路线变化
watch(
  () => processRoute.value,
  newVal => {
    emit('child-addToRoute', newVal);
    console.log('newVal', newVal);

    nextTick(initSortable);
  },
  { deep: true }
);

// 监听工艺库变化，同步更新工艺路线中匹配的项
watch(
  () => props.processLibrary,
  newLibrary => {
    if (!newLibrary || newLibrary.length === 0) return;
    // console.log('newLibrary', newLibrary);

    // 遍历工艺路线，用工艺库中最新数据更新匹配项
    processRoute.value = processRoute.value.map(routeItem => {
      // 在新工艺库中找到同id的项
      const matchedItem = newLibrary.find(libraryItem => libraryItem.id === routeItem.id);
      // console.log('matchedItem', matchedItem);

      if (matchedItem) {
        // 合并：保留工艺路线中的用户设置属性，用工艺库数据更新其他属性
        return {
          ...matchedItem, // 工艺库中的最新基础数据（如名称、价格等）
          // 保留工艺路线中用户设置的属性
          workHours: routeItem.workHours,
          pricingMethod: routeItem.pricingMethod,
          pricingCostObj: {
            ...(pricingMethodMap[routeItem.pricingMethod] || {}),
            ...(matchedItem.technologyItemList.find(
              i => i.pricingMethod === routeItem.pricingMethod
            ) || {}),
          },
          // 保留其他自定义属性
          pricingDetails: matchedItem.technologyItemList, // 用工艺库的最新计价详情
          pricingMethods: matchedItem.technologyItemList.map(i => i.pricingMethod),
        };
      }
      // 未匹配到则保持原项不变
      return routeItem;
    });
    // emit('child-addToRoute', processRoute.value);
    // console.log('processRoute', processRoute.value);
  },
  { deep: true } // 深度监听工艺库数组及内部对象变化
);
// 监听外部工艺数据变化
watch(
  () => props.currentOutsourceProcess,
  newVal => {
    if (newVal && newVal.length > 0) {
      loading.value = true;

      // 使用setTimeout避免更新冲突
      setTimeout(() => {
        try {
          newVal.forEach(item => {
            const matchedProcess = props.processLibrary.find(p => p.id === item.technologyId);
            if (matchedProcess) {
              // 查找匹配的计价方式
              const pricingMethod = item.technologyPricingMethod;
              const pricingCostObj =
                getAvailablePricingMethods({
                  ...matchedProcess,
                  pricingDetails: matchedProcess.technologyItemList,
                }).find(method => method.value === pricingMethod) || null;

              processRoute.value.push({
                ...matchedProcess,
                workHours: parseFloat((item.technologyProcessingHours / 60).toFixed(1)),
                pricingMethod,
                pricingDetails: matchedProcess.technologyItemList,
                pricingMethods: matchedProcess.technologyItemList.map(i => i.pricingMethod),
                pricingCostObj,
              });
            }
          });
          emit('filteredProcessLibrary');
          // filteredProcessLibrary();
        } catch (error) {
          ElMessage.error(`加载工艺数据失败: ${error.message}`);
          // console.error('加载工艺数据错误:', error);
        } finally {
          loading.value = false;
        }
      }, 0);
    }
  },
  { immediate: true, deep: true }
);

// 组件挂载时初始化
onMounted(() => {
  nextTick(initSortable);
});

// 暴露公共方法
defineExpose({
  resetProcessRoute,
});
</script>

<style scoped>
/* 补充禁用输入框样式，增强区分度 */
.capsule-input:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
  cursor: not-allowed;
}

.process-item {
  cursor: pointer;
  text-align: center;
  margin: 3px;
  transition: all 0.2s ease;
}

.process-item:hover {
  transform: scale(1.05);
}

.section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.process-library {
  display: flex;
  flex-wrap: wrap;
}

.route-container {
  position: relative;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.empty-route {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

/* 胶囊样式 */
.process-capsule {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  /* cursor: grab; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 120px;
}

.process-capsule:hover {
  border-color: #f78431;
  box-shadow: 0 4px 16px rgba(247, 132, 49, 0.15);
  transform: translateY(-2px);
}

.process-capsule:active {
  /* cursor: grabbing; */
}

.process-capsule.sortable-ghost {
  opacity: 0.3;
  background: #f0f9ff;
  border-color: #f78431;
}

.process-capsule.sortable-drag {
  opacity: 0.9;
  transform: rotate(2deg) scale(1.02);
  box-shadow: 0 8px 32px rgba(247, 132, 49, 0.3);
}
.capsule-header-content {
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  width: 100%;
}
/* 胶囊顶部区域 */
.capsule-header {
  padding-top: 5px;
  display: flex;
  /* align-items: center; */
  gap: 5px;
  /* width: 100%; */
  justify-content: flex-start;
  /* margin-bottom: 5px; */
}

/* 序号 */
.step-number {
  background: linear-gradient(135deg, #f78431 0%, #f78431 100%);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(247, 132, 49, 0.3);
}

/* 工艺名称 */
.process-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
  text-align: center;
  flex-shrink: 0;
}

/* 输入框容器 */
.capsule-inputs {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 48%;
}

.input-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  text-align: left;
  padding-left: 5px;
}

.capsule-input,
.capsule-select {
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  width: 100%;
}

.capsule-input:focus,
.capsule-select:focus {
  outline: none;
  border-color: #f78431;
  box-shadow: 0 0 0 2px rgba(247, 132, 49, 0.2);
  background: #fff;
}

/* 删除按钮 */
.delete-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  color: #f56c6c;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
}

.process-capsule:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #dd4a4a;
  transform: scale(1.1);
}

/* 拖拽手柄 */
.drag-handle {
  position: absolute;
  top: 4px;
  left: 4px;
  color: #c0c4cc;
  cursor: grab;
  transition: color 0.3s ease;
}

.drag-handle:hover {
  color: #f78431;
}

.drag-handle:active {
  cursor: grabbing;
}

/* 聚焦状态高亮 */
.process-capsule.focused {
  border-color: #f78431;
  box-shadow: 0 0 0 2px rgba(247, 132, 49, 0.2);
}

/* 单一选项样式 */
.single-option {
  background: #f0f9ff;
  border-color: #f78431;
  color: #f78431;
  font-weight: 500;
}

/* 键盘提示 */
.keyboard-hint {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 3px;
  text-align: right;
  padding-right: 5px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .route-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .route-container {
    grid-template-columns: 1fr;
  }
}

/* 加载状态 */
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
}
</style>
