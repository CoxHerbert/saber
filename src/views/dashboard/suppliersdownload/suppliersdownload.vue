<template>
  <basic-container v-loading="loading">
    <div class="page-title" style="margin: 0 0 20px 0">
      <h2 style="font-size: 18px; font-weight: 600; color: #333">联合东创供应商自助下图</h2>
      <div style="height: 1px; background: #eaeaea; margin: 10px 0"></div>
    </div>
    <!-- 查询区域 -->
    <el-form :inline="true" class="demo-form-inline" style="margin-bottom: 15px">
      <el-form-item label="采购订单号">
        <el-input v-model="query.poOrderCoding" placeholder="请输入采购订单号"></el-input>
      </el-form-item>
      <el-form-item label="料号">
        <el-input v-model="query.materialCoding" placeholder="请输入料号"></el-input>
      </el-form-item>
      <el-form-item label="开始时间-结束时间">
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button type="primary" @click="handleReset" style="margin-left: 10px">重置</el-button>
        <el-button type="primary" @click="handleBatchesPrint" :disabled="!multipleSelection.length"
          >批量打印(选中{{ multipleSelection.length }}行)</el-button
        >
        <el-button type="primary" @click="handleBatchesDow" :disabled="!multipleSelection.length"
          >批量打包(选中{{ multipleSelection.length }}行)</el-button
        >
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <el-table
      ref="multipleTableRef"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      border
      @selection-change="handleSelectionChange"
      :row-key="row => row.id"
    >
      <!-- 动态渲染表格列 -->
      <el-table-column
        v-for="col in columns"
        :key="col.prop || col.type"
        :type="col.type"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :align="col.align || 'center'"
        :reserve-selection="col.type === 'selection'"
        show-overflow-tooltip
      >
        <!-- 自定义列模板 -->
        <template v-if="col.slotName" #default="{ row }">
          <template v-if="col.slotName === 'materialCoding'">
            <span style="color: blue" @click="handleMaterialClick(row)">{{
              row.materialCoding
            }}</span>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <div style="margin-top: 15px; text-align: right">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </basic-container>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus';
import Api from '@/api/index';
const { proxy } = getCurrentInstance();
import { downloadFileBlobPromise } from '@/utils/util';
// import { useRouter } from 'vue-router';
const route = useRoute();
const { xkyCompCode, xkyTime, checkToken, ssoToken, supplierCode } = route.query;
// 表格列JSON配置
const columns = ref([
  { type: 'selection', width: 55 },
  { type: 'index', label: '序号', width: 55 },
  { prop: 'poOrderCoding', label: '订单编号', minWidth: 120 },
  { prop: 'materialCoding', label: '料号', minWidth: 100, slotName: 'materialCoding' }, // 带自定义模板的列
  { prop: 'materialName', label: '料号名称', minWidth: 150 },
  { prop: 'materialVersion', label: '版本号', width: 100 },
  { prop: 'specification', label: '规格型号', minWidth: 120 },
  { prop: 'materialQuality', label: '材质', minWidth: 80 },
  { prop: 'quantity', label: '数量', width: 80 },
  { prop: 'deliveryTime', label: '要求交期', minWidth: 100 },
]);
const loading = ref(false);
// 表格原始数据
const tableData = ref([]);
// 分页相关响应式数据（新增）
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
// 响应式数据
const query = reactive({
  poOrderCoding: '',
  materialCoding: '',
  dateRange: [],
});

const multipleSelection = ref([]);
const multipleTableRef = ref(null);

onMounted(() => {
  handleQuery();
});
// 查询方法
const handleQuery = async () => {
  try {
    loading.value = true;
    let startDate = '';
    let endDate = '';
    if (query.dateRange) {
      startDate = query.dateRange[0] ? proxy.$dayjs(query.dateRange[0]).format('YYYY-MM-DD') : '';
      endDate = query.dateRange[1] ? proxy.$dayjs(query.dateRange[1]).format('YYYY-MM-DD') : '';
    }
    let params = {
      poOrderCoding: query.poOrderCoding,
      materialCoding: query.materialCoding,
      startDate: startDate,
      endDate: endDate,
      current: currentPage.value,
      size: pageSize.value,
      xkyCompCode,
      xkyTime,
      checkToken,
      ssoToken,
      supplierCode,
    };
    // 实际项目中调用API
    const res = await Api.floor.floorid.listPurchaseOrder(params);
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total; // 设置总条数
    }
    // console.log('查询参数:', query);
  } catch (error) {
    ElMessage.error('查询失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 下载选中行
const handleDownload = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要下载的行');
    return;
  }
  console.log('下载选中行:', multipleSelection.value);
  // 实际下载逻辑
};

// 选择变化
const handleSelectionChange = val => {
  multipleSelection.value = val;
  console.log(multipleSelection.value);
};

const handleBatchesPrint = async () => {
  const loading = ref(false);
  try {
    loading.value = true;
    const items = multipleSelection.value.map(item => {
      return {
        pdfName: `${item.materialCoding}${item.materialVersion || ''}`,
        pdfExplain: ``,
      };
    });
    const res = await proxy.$axios.post('/pdf-printing/join', items);
    const { status, data } = res;
    if (status === 200 && data.mergeName) {
      window.open(`https://www.eastwinbip.com/pdf-printing/print/${data.mergeName}`, 'target');
    }
  } catch (err) {
    console.log(err);
  } finally {
    if (multipleTableRef.value) {
      multipleTableRef.value.clearSelection();
    }
    loading.value = false;
  }
};
// 处理批量打包
const handleBatchesDow = async () => {
  try {
    loading.value = true;
    const items = multipleSelection.value.map(
      item => `${item.materialCoding}${item.version || ''}`
    );
    const res = await proxy.$axios.post('/pdf-printing/zip', items);
    const { status, data } = res;
    if (status === 200 && data.mergeName) {
      await downloadFileBlobPromise(
        `https://www.eastwinbip.com/pdf-printing/zip-download/${data.mergeName}`,
        '-----'
      );
      if (multipleTableRef.value) {
        multipleTableRef.value.clearSelection();
      }
      loading.value = false;
    }
  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};
// 料号点击事件
const handleMaterialClick = row => {
  console.log('点击料号:', row.materialCoding);
  window.open(`https://www.eastwinbip.com/drawing/${row.materialCoding}`, 'target');
  // 实际业务逻辑
};

// 新增重置方法
const handleReset = () => {
  // 重置查询条件
  query.poOrderCoding = '';
  query.materialCoding = '';
  query.dateRange = [];
  // 重置分页
  currentPage.value = 1;
  pageSize.value = 20;
  // 重置选中状态

  if (multipleTableRef.value) {
    multipleTableRef.value.clearSelection();
  }

  // 重新查询
  handleQuery();
};
const handleCurrentChange = val => {
  console.log(val);
  // pageSize.value = val;
  currentPage.value = val; // 页码重置为1
  handleQuery();
};
// handleSizeChange方法
const handleSizeChange = val => {
  pageSize.value = val;
  currentPage.value = 1; // 页码重置为1
  handleQuery();
};
</script>
