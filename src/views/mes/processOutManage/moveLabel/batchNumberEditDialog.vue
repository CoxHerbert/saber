<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="80%"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <el-form :model="formData" ref="formRef">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        height="calc(80vh - 100px)"
        @selection-change="handleSelectionChange"
      >
        <template v-for="col in columns" :key="col.prop">
          <el-table-column
            :prop="col.prop"
            :label="col.label"
            :min-width="col.minWidth"
            :fixed="col.fixed"
          >
            <template #default="{ row }">
              <template v-if="col.prop === 'deliveryDeliveryno'">
                <el-input-number
                  :max="parseFloat(row.transferQty)"
                  v-model="row.deliveryDeliveryno"
                  :precision="2"
                  :step="0.01"
                  :controls="false"
                  :min="0"
                  controls-position="right"
                />
              </template>
              <span v-else>{{
                [null, undefined, ''].includes(row[col.prop])
                  ? '-'
                  : col.transVal?.call
                  ? col.transVal(row)
                  : row[col.prop]
              }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '批量补打转单标签数量确认',
  },
});

const emit = defineEmits(['submit']);

// 表格列配置（根据用户提供的结构）
const columns = reactive([
  { prop: 'billType', label: '单据类型', minWidth: '150px' },
  { prop: 'billNo', label: '单据编号', minWidth: '150px' },
  { prop: 'transferQty', label: '转单数量' },
  { prop: 'returnQty', label: '回库数量' },
  { prop: 'deliveryTime', label: '交期', minWidth: 200 },
  { prop: 'processes', label: '工序', minWidth: 200 },
  { prop: 'supplierName', label: '供应商名称', minWidth: 200 },
  { prop: 'unitPrice', label: '单价', width: 80 },
  { prop: 'totalPrice', label: '总价', width: 80 },
  { prop: 'deliveryDeliveryno', label: '收料数量', minWidth: '120px', fixed: 'right' },
]);

const dialogVisible = ref(false);
const formRef = ref(null);
const formData = reactive({});
const tableData = ref([]);
const selectedRows = ref([]);

// 对外暴露的show方法
const show = data => {
  tableData.value = Array.isArray(data)
    ? data.map(item => ({
        ...item,
        deliveryDeliveryno: Number(item.transferQty - item.returnQty) || 0,
      }))
    : [];
  dialogVisible.value = true;
};

const handleSelectionChange = selection => {
  selectedRows.value = selection;
};

const handleSubmit = () => {
  emit('submit', tableData.value);
  dialogVisible.value = false;
};

const handleClose = () => {
  tableData.value = [];
  selectedRows.value = [];
};

// 暴露方法给父组件
defineExpose({ show });
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 确保数字输入框宽度自适应 */
:deep(.el-input-number) {
  width: 100%;
}
</style>
