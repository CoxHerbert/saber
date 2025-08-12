<template>
  <el-table :data="tableData" :summary-method="getSummaries" show-summary width="100%" border>
    <el-table-column label="序号" width="60" type="index" align="center" />
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
        {{ scoped.row.feaEvaluationScore || '-' }}
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
export default {
  name: 'feasibility',
  emits: ['update:modelValue'],
  props: {
    value: [String, Number, Object],
  },
  data() {
    return {
      DC_FEA_ITEM_TYPE: [],
    };
  },
  computed: {
    tableData() {
      return JSON.parse(this.value);
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
        if (!values.every(value => Number.isNaN(value)) && 'feaItemType' !== column.property) {
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
