<template>
  <div class="date-range-picker">
    <!-- 开始日期选择 -->
    <el-date-picker
      ref="startDatePicker"
      v-model="localStartDate"
      type="date"
      placeholder="开始时间"
      :disabled-date="disableStartDate"
      @change="onStartDateChange"
      value-format="YYYY-MM-DD"
      popper-class="custom-datepicker-popper custom-datepicker-popper-start"
      :default-value="getMaxStartDate()"
      :prefix-icon="customPrefix"
      :clearable="false"
    />
    至
    <!-- 结束日期选择 -->
    <el-date-picker
      ref="endDatePicker"
      v-model="localEndDate"
      type="date"
      placeholder="结束时间"
      :disabled-date="disableEndDate"
      @focus="onEndDateClick"
      @change="onEndDateChange"
      :default-value="getMaxStartDate()"
      value-format="YYYY-MM-DD"
      popper-class="custom-datepicker-popper custom-datepicker-popper-end"
      :prefix-icon="customPrefix"
      :clearable="false"
    />
    <!-- <el-date-picker
      ref="endDatePicker"
      v-model="localEndDate"
      type="date"
      placeholder="结束时间"
      :disabled-date="disableEndDate"
      @focus="onEndDateClick"
      @change="onEndDateChange"
      :default-value="getMaxStartDate()"
      value-format="YYYY-MM-DD"
      popper-class="custom-datepicker-popper custom-datepicker-popper-end"
      :prefix-icon="customPrefix"
      :clearable="false"
    /> -->
    <div class="clear">
      <el-icon class="clear-icon" @click="clear"><Close /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import dayjs from 'dayjs';

const customPrefix = shallowRef({
  render() {
    return h('p', '');
  },
});

const props = defineProps({
  startDate: Date,
  endDate: Date,
  earliestDate: {
    type: [String, Boolean, null],
    default: null,
  },
});

const emit = defineEmits(['update:startDate', 'update:endDate', 'change']); // 增加 `change` 事件

const startDatePicker = ref(null);
const endDatePicker = ref(null);

const localStartDate = ref(props.startDate || null);
const localEndDate = ref(props.endDate || null);

const propEarliestDate = computed(() => props.earliestDate || null);

const getMaxStartDate = () => {
  const earliestDate = propEarliestDate.value ? dayjs(propEarliestDate.value) : null;
  const startDate = localStartDate.value ? dayjs(localStartDate.value) : null;

  if (!earliestDate) return startDate;
  if (!startDate) return earliestDate;

  // 比较两个日期，返回较大的那个
  return startDate.isBefore(earliestDate) ? earliestDate : startDate;
};

// 计算禁用开始日期：不能晚于结束时间
const disableStartDate = time => {
  const endDate = localEndDate.value ? dayjs(localEndDate.value).startOf('day') : null;
  return endDate && dayjs(time).isAfter(endDate, 'day');
};

// 计算禁用结束日期：不能早于开始日期和 earliestDate
const disableEndDate = time => {
  const startDate = localStartDate.value ? dayjs(localStartDate.value).startOf('day') : null;
  const earliestDate = propEarliestDate.value ? dayjs(propEarliestDate.value).startOf('day') : null;

  let minAllowedEndDate;
  if (earliestDate) {
    minAllowedEndDate = startDate
      ? startDate.isBefore(earliestDate)
        ? earliestDate
        : startDate
      : earliestDate;
  } else {
    minAllowedEndDate = startDate;
  }

  return dayjs(time).isBefore(startDate, 'day');
  // return minAllowedEndDate && dayjs(time).isBefore(minAllowedEndDate, 'day');
};

// 监听开始时间的变化，自动触发 `change` 事件并处理结束日期
const onStartDateChange = value => {
  emit('update:startDate', value);
  checkAndTriggerChangeEvent();

  nextTick(() => {
    if (endDatePicker.value) {
      endDatePicker.value.focus();
    }
  });
};

// 如果点击了结束日期但开始日期为空，强制弹出开始日期选择器
const onEndDateClick = () => {
  if (!localStartDate.value && startDatePicker.value) {
    startDatePicker.value.focus();

    const timer = setTimeout(() => {
      endDatePicker.value.handleClose();
      clearTimeout(timer);
    });
  }
};

// 监听结束时间的变化
const onEndDateChange = value => {
  emit('update:endDate', value);
  checkAndTriggerChangeEvent();
};

// 确保结束时间不小于开始时间
watch(localStartDate, newStartDate => {
  if (localEndDate.value && dayjs(localEndDate.value).isBefore(newStartDate, 'day')) {
    localEndDate.value = newStartDate;
    emit('update:endDate', newStartDate);
  }
});

// **当 startDate 和 endDate 都有值时，调用 change 事件**
const checkAndTriggerChangeEvent = () => {
  if (localStartDate.value && localEndDate.value) {
    emit('change', { startDate: localStartDate.value, endDate: localEndDate.value });
  }
};

const clear = () => {
  localStartDate.value = undefined;
  localEndDate.value = undefined;
  emit('update:startDate', undefined);
  emit('update:endDate', undefined);
  emit('change', { startDate: localStartDate.value, endDate: localEndDate.value });
};
</script>

<style lang="scss">
/* 自定义日期选择器弹出层 */
.custom-datepicker-popper {
  position: relative;
  &::before {
    display: block;
    text-align: center;
    font-weight: bold;
    padding: 8px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }
  &-start {
    &::before {
      content: '开始时间';
    }
  }
  &-end {
    &::before {
      content: '结束时间';
    }
  }
}
</style>

<style lang="scss" scoped>
.date-range-picker {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  background: #fff;
  &:hover {
    .clear-icon {
      display: block;
    }
  }
  :deep(.el-input) {
    flex: 1;
  }
  :deep(.el-input__prefix) {
    display: none;
  }
  :deep(.el-input__wrapper) {
    box-shadow: none;
    padding: 0;
  }
  :deep(.el-input__inner) {
    text-align: center;
  }
  .clear {
    width: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    &-icon {
      display: none;
    }
  }
}
</style>
