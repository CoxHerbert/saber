<template>
  <!-- {{ tableData }} -->
  <div class="wl-wrapper">
    <el-table
      :data="tableData"
      :span-method="objectSpanMethod"
      :summary-method="getSummaries"
      show-summary
      max-height="600"
      border
    >
      <el-table-column prop="feaItemType" label="评估类型" width="100" align="center">
        <template #default="scoped">
          <dc-dict type="text" :options="DC_FEA_ITEM_TYPE" :value="scoped.row.feaItemType" />
        </template>
      </el-table-column>
      <el-table-column
        prop="feaEvaluationConclusion"
        min-width="180"
        label="评审内容"
        align="center"
      />
      <el-table-column prop="feaEvaluationTotalScore" label="总分" width="80" align="center">
        <template #default="scoped">
          {{ scoped.row.feaEvaluationTotalScore }}
        </template>
      </el-table-column>
      <el-table-column prop="feaEvaluationScore" label="评分" width="200" align="center">
        <template #default="scoped">
          <el-input-number
            v-model="scoped.row.feaEvaluationScore"
            placeholder="评分"
            controls-position="right"
            style="width: 100px"
            :min="0"
            :max="10"
            @change="changeFeaEvaluationScore"
            :disabled="disabled"
          >
            <template #decrease-icon>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </template>
            <template #increase-icon>
              <el-icon>
                <ArrowUp />
              </el-icon> </template
          ></el-input-number>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'wf-feasibility',
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
      tableData: [],
      DC_FEA_ITEM_TYPE: [],
    };
  },
  watch: {
    modelValue(newValue, oldValue) {
      this.tableData = JSON.parse(newValue);
    },
  },
  async mounted() {
    const { DC_FEA_ITEM_TYPE } = await this.useCache([{ key: 'DC_FEA_ITEM_TYPE' }]);
    this.DC_FEA_ITEM_TYPE = DC_FEA_ITEM_TYPE;
  },
  methods: {
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = h('div', {}, ['总分']);
          ``;
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => Number.isNaN(value))) {
          sums[index] = `${values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!Number.isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0)} 分`;
        } else {
          sums[index] = 'N/A';
        }
      });
      return sums;
    },
    changeFeaEvaluationScore() {
      this.$emit('update:modelValue', JSON.stringify(this.tableData));
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const currentId = this.tableData[rowIndex].feaItemType;
        const prevId = rowIndex > 0 ? this.tableData[rowIndex - 1].feaItemType : null;

        // 如果是第一行，或者ID与上一行不同
        if (rowIndex === 0 || currentId !== prevId) {
          // 计算当前ID的重复行数
          const count = this.tableData.filter(item => item.feaItemType === currentId).length;
          return {
            rowspan: count,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.wl-wrapper {
  width: 60%;
  display: flex;
  align-items: center;
  .organization {
    margin-right: 20px;
  }
}
</style>
