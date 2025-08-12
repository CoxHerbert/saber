<template>
  <div class="table-wrapper">
    <!-- 工艺表 -->
    <el-table :data="processData" size="small" border align="center" style="width: 100%">
      <el-table-column prop="processOrder" width="50">
        <template #header>
          <div class="custom-header">顺序</div>
        </template>
      </el-table-column>
      <el-table-column label="工艺" prop="technologyName" />
      <!-- 计价方式列：匹配映射表 -->
      <el-table-column label="计价方式" width="120">
        <template #default="scope">
          <!-- 从映射表中获取对应信息，无匹配时显示原始值 -->
          <span v-if="pricingMethodMap[scope.row.technologyPricingMethod]">
            {{
              `${pricingMethodMap[scope.row.technologyPricingMethod].label}（${
                pricingMethodMap[scope.row.technologyPricingMethod].unit
              }）`
            }}
          </span>
          <!-- 兜底：无匹配时显示原始值 -->
          <span v-else>{{ scope.row.technologyPricingMethod }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计价值" prop="unitPrice" width="120" />
      <el-table-column label="最低价" prop="technologyPriceMin" />
      <el-table-column label="单价" prop="technologyPriceSingle" />
      <el-table-column label="单件费用" prop="technologyPrice" />
      <el-table-column label="小计" prop="subtotal" />
    </el-table>

    <!-- 费用汇总表（与工艺表间距） -->
    <div class="mt-4"></div>
    <el-table :data="costData" border size="small" :cell-style="{ textAlign: 'center' }">
      <el-table-column label="" prop="type" />
      <el-table-column label="材料费" prop="material" />
      <el-table-column label="加工费" prop="processing" />
      <el-table-column label="表处费" prop="surface" />
      <el-table-column label="金额" prop="amount" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({
  processData: {
    type: Array,
    default: () => [],
  },
  routeRowTable: {
    type: Object,
    default: () => {},
  },
});

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
// 费用表数据
const costData = ref([]);
// 监听props.processData的变化（包括初始加载和刷新）
watch(
  () => props.processData,
  newVal => {
    processData.value = newVal || [];
  },
  { immediate: true } // 立即执行一次，处理初始数据
);

// 监听props.routeRowTable的变化，更新costData
watch(
  () => props.routeRowTable, // 直接监听props的变化
  newRowTable => {
    // 处理空数据情况
    const row = newRowTable || {};
    // 重新计算costData
    costData.value = [
      {
        type: '单件',
        material: row.currentOutsourcePrice || 0, // 加默认值避免undefined
        processing: row.processFee || 0,
        surface: row.surfaceFee || 0,
        amount: row.overallPrice || 0,
      },
      {
        type: '总价',
        material: row.materialFeeCount || 0,
        processing: row.processFeeCount || 0,
        surface: row.sureFaceFeeCount || 0, // 注意：属性名是否正确？可能是surfaceFeeCount
        amount: row.overallPrice || 0,
      },
    ];
  },
  { immediate: true } // 立即执行，处理初始数据
);
</script>

<style scoped>
.table-wrapper .el-table th {
  text-align: center !important;
}
</style>
