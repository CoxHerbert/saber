<template>
  <div class="footer-box">
    <el-table :data="tableData" :row-style="{ height: '48px' }">
      <el-table-column v-for="(col, i) in subColumns" :key="i" :label="col.label" :prop="col.prop">
        <template #default="{ row }">
          <span :key="m" class="self-column">
            <span
              v-if="col.prop === 'phase'"
              class="col-set"
              :style="{
                color: row.color ? row.color : 'inherit',
              }"
            >
              {{ col.render ? col.render(row[col.prop], row) : row[col.prop] }}</span
            >
            <span v-else>
              {{ col.render ? col.render(row[col.prop], row) : row[col.prop] }}
            </span>
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup>
import Api from '@/api/index';
import { toRefs } from 'vue';
import { subColumns } from '../../../planOrder/utils';

const route = useRoute();
const props = defineProps({
  id: {
    type: String,
    default() {
      return '';
    },
  },
});

// const computId = props.id ? props.id : route.query.id;

const pageData = reactive({
  tableData: [],
});
const { tableData } = toRefs(pageData);

// 获取阶段详情信息
const getOrderDetail = async () => {
  const params = {
    id: props.id ? props.id : route.params.id,
  };

  const res = await Api.pdp.mmrPlanCount.detailByOrderId(params);
  const { code, data } = res.data;
  if (code == 200) {
    tableData.value = data?.children || [];
  }
};

onMounted(() => {
  getOrderDetail();
});
</script>

<style lang="scss" :scoped>
.footer-box {
  padding: 20px;
  background-color: #fff;
}
</style>
