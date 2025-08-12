<template>
  <template v-if="$slots.default">
    <slot></slot>
  </template>
  <template v-else>
    <el-input
      v-if="data.type === 'input'"
      :placeholder="data.props?.placholder || `请输入${data.label}`"
      v-bind="data.props"
      v-model="value"
      clearable
      @change="
        val => {
          handleChange(val);
        }
      "
    />
    <el-switch
      v-else-if="['switch'].includes(data.type)"
      v-bind="data.props"
      v-model="value"
      @change="
        val => {
          handleChange(val);
        }
      "
    />
    <el-select
      v-else-if="['dict', 'select'].includes(data.type)"
      v-model="value"
      :placeholder="data.props?.placholder || `请选择${data.label}`"
      v-bind="data.props"
      clearable
      @change="
        val => {
          handleChange(val);
        }
      "
    >
      <!-- 配置里面有withGroup的情况 -->
      <template v-if="data.withGroup">
        <el-option-group
          v-for="(opGroup, i) in dictMaps?.[data.dictKey] || []"
          :key="i"
          :label="opGroup[data.labelKey]"
        >
          <el-option
            v-for="(option, j) in opGroup.children"
            :key="j"
            :label="option[data?.labelKey || 'label']"
            :value="option[data?.valueKey || 'value']"
          />
        </el-option-group>
      </template>
      <template v-else>
        <el-option
          v-for="(option, j) in dictMaps?.[data.dictKey] || []"
          :key="j"
          :label="option[data?.labelKey || 'label']"
          :value="option[data?.valueKey || 'value']"
        />
      </template>
    </el-select>
    <el-date-picker
      v-else-if="data.type === 'date'"
      v-model="value"
      :placeholder="data.props?.placholder || `请选择${data.label}`"
      v-bind="data.props"
      @change="
        val => {
          handleChange(val);
        }
      "
    ></el-date-picker>
    <el-input-number
      v-else-if="data.type === 'number'"
      v-model="value"
      v-bind="data.props"
      :placeholder="data.props?.placholder || `请输入${data.label}`"
      @change="
        val => {
          handleChange(val);
        }
      "
    />
    <dc-select-user
      v-else-if="data.type === 'dc-select-user'"
      v-model="value"
      v-bind="data.props"
      @change="
        val => {
          handleChange(val);
        }
      "
    />
    <dc-upload
      v-else-if="data.type === 'dc-upload'"
      v-model="value"
      v-bind="data.props"
      :limit="5"
      @change="
        val => {
          handleChange(val);
        }
      "
    />
    <component
      v-else
      :is="data.type"
      v-bind="data.props"
      v-model="value"
      @change="
        val => {
          handleChange(val);
        }
      "
    >
    </component>
  </template>
</template>

<script>
export default {
  emits: ['change', 'update:modelValue'],
  name: 'dc-widget',
  props: {
    // 绑定的值
    modelValue: {
      type: [String, Number, Object, null],
      default: null,
    },
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    dictMaps: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      value: null,
    };
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.value = newVal;
      },
      immediate: true,
      deep: true,
    },
    value: {
      handler(newVal) {
        this.value = newVal;
        this.$emit('update:modelValue', newVal);
      },
      deep: true,
    },
  },
  methods: {
    handleChange(val) {
      console.log(val);
      this.$nextTick(() => {
        this.$emit('change', val);
      });
    },
  },
};
</script>
