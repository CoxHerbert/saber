<template>
  <div class="wl-wrapper">
    <el-form :model="formData" label-width="88px" :inline="true" class="custom-form">
      <div class="wrap-left-form">
        <el-form-item label="计划单号" class="form-itme-width_50">
          <el-input
            v-model="formData.name"
            :size="size"
            suffix-icon="el-icon-search"
            :placeholder="placeholder || '现场计划查询'"
            readonly
            :disabled="disabled"
            @click="handleSelect"
          ></el-input>
        </el-form-item>
        <el-form-item label="阶段" class="form-itme-width_50">
          <el-select
            v-model="formData.select"
            @change="handleSelectChange"
            class="form-itme-width_50"
          >
            <el-option
              v-for="item in selectData"
              :key="item.id"
              :label="item.phaseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" class="form-itme-width_50">
          <el-date-picker
            v-model="formData.startTime"
            type="date"
            placeholder="请输入开始时间"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
        <el-form-item label="结束时间" class="form-itme-width_50 mt-5">
          <el-date-picker
            v-model="formData.endTime"
            type="date"
            placeholder="请输入结束时间"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
        <el-form-item label="阶段报工" class="form-itme-width_50 mt-5">
          <el-input-number v-model="formData.progress" :min="1" :max="100">
            <template #suffix>
              <span>%</span>
            </template></el-input-number
          >
        </el-form-item>
      </div>
    </el-form>

    <!-- 选择弹窗 -->
    <nf-plan-select
      ref="material-select"
      :check-type="checkType"
      :default-checked="modelValue"
      checkType="radio"
      @onConfirm="handleSelectConfirm"
    ></nf-plan-select>
  </div>
</template>
<script>
import NfPlanSelect from '../../nf-plan-select/index.vue';
import { findEffectivePhase } from '@/api/system/user';

export default {
  name: 'wf-mmrplanwhr-select',
  components: { NfPlanSelect },
  emits: ['update:modelValue'],
  props: {
    modelValue: [String, Number, Object],
    checkType: {
      // radio单选 checkbox多选
      type: String,
      default: () => {
        return 'radio';
      },
    },
    size: {
      type: String,
      default: () => {
        return 'default';
      },
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
    change: Function,
  },

  data() {
    return {
      data: [],
      selectData: [],
      formData: {
        name: null,
        select: null,
        startTime: null,
        endTime: null,
        progress: null,
      },
    };
  },

  watch: {
    modelValue: {
      handler(val) {
        if (val) {
          this.formData.name = this.modelValue.lineCode;
        } else this.formData.name = '';
      },
      immediate: true,
    },
  },

  methods: {
    handleSelect() {
      if (this.readonly || this.disabled) return;
      this.$refs['material-select'].visible = true;
    },
    async handleSelectConfirm(list) {
      this.formData.name = list[0].lineCode;
      var results = await findEffectivePhase({
        orderId: list[0].id,
      });
      this.selectData = results.data.data;

      this.$emit('update:modelValue', list[0]);
      if (this.change && typeof this.change == 'function') this.change({ value: list[0] });
    },
    handleSelectChange(value) {
      this.formData.startTime = null;
      this.formData.endTime = null;
      const selectedItem = this.selectData.find(item => item.id === value);
      this.formData.startTime = selectedItem.startDate;
      this.formData.endTime = selectedItem.endDate;
    },
  },
};
</script>
<style lang="scss" scoped>
.wl-wrapper {
  display: flex;
  align-items: center;
  .organization {
    margin-right: 20px;
  }
}
</style>
