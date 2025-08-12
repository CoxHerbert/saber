<template>
  <div class="header-wrapper" :class="dataList.length == 0 ? 'nodata-height' : ''">
    <div class="search-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" @keyup.enter="handleQuery">
        <el-form-item class="form-itme-width_25" label="二维码" prop="qrCode">
          <el-input
            ref="qrCodeInput"
            v-model="queryParams.qrCode"
            placeholder="请输入物料二维码/工序二维码（可扫描得到"
            @input="debouncedHandleScan"
            :clearable="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="物料查询" prop="customerId" class="form-itme-width_25">
          <dc-select-remote
            v-model="queryParams.customerId"
            placeholder="请输入物料查询"
            objectName="customer"
            :multiple="false"
            :multipleLimit="1"
            :clearable="true"
            :params="{}"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="search-area">
        <el-button
          type="primary"
          plain
          v-permission="{ id: 'REOPRTBIND_OLD_RECORD' }"
          @click="lookHistoryRecord"
          >查看历史记录</el-button
        >
      </div>
    </div>
    <div class="search-result">
      <el-descriptions :column="4">
        <el-descriptions-item label="单据编码">{{ queryData.no || '-' }} </el-descriptions-item>
        <el-descriptions-item label="物料数量">{{ queryData.qty || '-' }} </el-descriptions-item>
        <el-descriptions-item label="物料编码"
          >{{ queryData.materialNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="物料名称"
          >{{ queryData.materialName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="物料规格"
          >{{ queryData.specification || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="专案号">{{ queryData.mtoNo || '-' }} </el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="noData-wrapper" v-if="dataList.length == 0">
      <img src="../../../../../public/img/frame@2x.png" alt="" class="img" />
      <p class="tip">暂无信息，请扫描物料工序二维码或输入查询</p>
    </div>
  </div>
  <div class="content-warp" v-if="dataList.length > 0">
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="dataList"
        @row-click="handleRowClick"
        :row-class-name="tableRowClassName"
      >
        <el-table-column label="序号" type="index" width="60px" align="center">
          <template #default="scoped">
            <span>{{ scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="长SN" show-overflow-tooltip align="center" prop="code">
          <template #default="scoped">
            <span v-if="scoped.row.code">{{ scoped.row.code }}</span>
            <span class="blue" v-else>待绑定生成</span>
          </template>
        </el-table-column>
        <el-table-column label="短SN" show-overflow-tooltip align="center" prop="shortCode">
          <template #default="scoped">
            <span v-if="scoped.row.shortCode">{{ scoped.row.shortCode }}</span>
            <span class="blue" v-else>待绑定生成</span>
          </template>
        </el-table-column>
        <el-table-column label="报告编码" show-overflow-tooltip align="center" prop="qualityCode">
          <template #default="scoped">
            <span v-if="scoped.row.qualityCode">{{ scoped.row.qualityCode }}</span>
            <span class="blue" v-else>待绑定</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" fixed="right">
          <template #default="scoped">
            <el-button
              v-if="scoped.row.qualityCode"
              link
              type="primary"
              @click="lookReport(scoped.row.qualityCode)"
              >查看</el-button
            >
            <el-button v-if="!scoped.row.qualityCode" link type="primary">去绑定</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <img src="../../../../../public/img/right.png" alt="" class="elright" />
    <div class="report-info-wrapper" v-loading="loading">
      <div class="report-title">报告信息</div>
      <div class="report-info">
        <div class="report-info-item">
          <div class="info-item-label">报告类型</div>
          <div class="info-item-value">{{ reportInfor.measurementDictCode || '-' }}</div>
        </div>
        <div class="report-info-item">
          <div class="info-item-label">测量时间</div>
          <div class="info-item-value">{{ reportInfor.surveyDate || '-' }}</div>
        </div>
        <div class="report-info-item">
          <div class="info-item-label">测量人</div>
          <div class="info-item-value">{{ reportInfor.surveyUser || '-' }}</div>
        </div>
        <div class="report-info-item">
          <div class="info-item-label">报告编码</div>
          <div class="info-item-value">{{ reportInfor.qualityCode || '-' }}</div>
        </div>
        <div class="report-info-item" v-if="reportInfor.qualityCode">
          <div class="info-item-label">查看报告</div>
          <div class="info-item-value click-look" @click="lookReport(reportInfor.qualityCode)">
            点击查看
          </div>
        </div>
      </div>
      <div class="report-title">当前选中物料</div>
      <el-table
        :data="[
          {
            code: selectedRow.code,
            shortCode: selectedRow.shortCode,
          },
        ]"
        class="select-table"
      >
        <el-table-column label="长SN" show-overflow-tooltip align="center" prop="code" />
        <el-table-column label="短SN" show-overflow-tooltip align="center" prop="shortCode" />
      </el-table>
      <div class="report-btns">
        <el-select
          v-model="machineIp"
          style="margin-right: 10px"
          placeholder="请搜索机台"
          clearable
          @change="changeMachine"
        >
          <el-option
            v-for="(item, index) in machineList"
            :key="index"
            :value="item.machineIp"
            :label="item.machineName"
          />
        </el-select>
        <el-button plain @click="getPort" :loading="reportLoading">获取最新报告</el-button>
      </div>
      <div class="report-btns" style="margin-top: 20px">
        <el-button type="primary" @click="snRecordSubmitFn" :disabled="!machineIp"
          >确认绑定</el-button
        >
      </div>
    </div>
    <!-- 历史记录 -->
    <HistoyRecordDialog ref="histoyRecordDialogRef" />
    <!-- 报告查看 -->
    <ReportViewDialog ref="reportViewDialogRef" />
  </div>
</template>
<script setup name="Productiongroup">
import Api from '@/api/index';
import router from '@/router/';
import HistoyRecordDialog from './histoyRecordDialog.vue';
import ReportViewDialog from './reportViewDialog.vue';
import { ref, onMounted } from 'vue';
import { debounce } from 'lodash';

const { proxy } = getCurrentInstance();
const histoyRecordDialogRef = ref(null);
const reportViewDialogRef = ref(null);
const data = reactive({
  machineList: [],
  reportLoading: false,
  queryParams: {},
  dataList: [],
  loading: true,
  title: '',
  selectedRow: [],
  queryData: {},
  reportInfor: {},
  machineIp: '',
  machine: {
    machineIp: null,
    measurementDictCode: null,
  },
});

const {
  queryParams,
  dataList,
  loading,
  selectedRow,
  queryData,
  machineIp,
  reportInfor,
  reportLoading,
  machineList,
} = toRefs(data);

const qrCodeInput = ref(null);
onMounted(() => {
  qrCodeInput.value.focus();
});

/** 扫码完成后自动查询 */
const handleScan = () => {
  if (queryParams.value.qrCode) {
    getData();
  }
};

// 使用 debounce 包装 handleScan 方法
const debouncedHandleScan = debounce(handleScan, 300); // 300 毫秒的防抖时间

/** 查询参数列表 */
const getData = async () => {
  if (!queryParams.value.qrCode) {
    proxy.$message.error('请输入查询条件');
    return;
  }
  loading.value = true;
  try {
    let dataparam = Object.assign(queryParams.value);
    const res = await Api.qms.sn.getSrmReceiveByQrCode(dataparam);
    const { code, data } = res.data;
    if (code === 200) {
      queryData.value = data;
      loading.value = false;
      getSnRecordListData();
    }
  } catch (error) {
    queryData.value = {};
    selectedRow.value = [];
    dataList.value = [];
    loading.value = false;
  }
};

// 获取物料列表
const getSnRecordListData = async () => {
  loading.value = true;
  let dataparam = Object.assign({
    purpose: queryParams.value.qrCode,
  });
  const res = await Api.qms.sn.getSnRecordList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = reData(data.records || []);
    if (data.records.length > 0) {
      selectedRow.value = data.records[0] || [];
      data.records[0].qualityCode && clickGetLookReport(data.records[0].qualityCode);
    } else {
      reportInfor.value = {};
    }
  }
  loading.value = false;
};

// 重组
const reData = list => {
  let newList = list;
  let qty = queryData.value.qty;
  let count = parseInt(qty) - list.length;
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      newList.push({
        code: '',
        shortCode: '',
        qualityCode: '',
        id: Math.random(),
      });
    }
  }
  return newList;
};

// 选择机台
const changeMachine = e => {
  let item = machineList.value.find(item => item.machineIp === e);
  data.machine.machineIp = item.machineIp;
  data.machine.measurementDictCode = item.measurementDictCode;
};

// 获取机台列表
const getMachineConfigListFn = () => {
  Api.qms.sn
    .getMachineConfigList({
      current: 1,
      size: 10,
    })
    .then(res => {
      if (res.data.code === 200) {
        data.machineList = res.data.data.records;
      }
    });
};

// 绑定
const snRecordSubmitFn = async () => {
  if (!reportInfor.value.no) {
    proxy.$message.error('请先获取报告');
    return;
  }
  // 如果没有先生成sn再绑定
  let ishandleImport = false;
  if (!selectedRow.value.shortCode) {
    ishandleImport = await Api.qms.sn.handleImport();
    return ishandleImport;
  }
  const res = await Api.qms.sn.snRecordSubmit({
    qualityCode: reportInfor.value.qualityCode,
    id: selectedRow.value.id,
  });
  if (res.data.code === 200) {
    proxy.$message.success('绑定成功');
    // 绑定成功更新列表报告编码数据
    let index = dataList.value.findIndex(item => item.id === selectedRow.value.id);
    dataList.value[index].qualityCode = reportInfor.value.qualityCode;
    machineIp.value = '';
  }
};

// 生成sn
const handleImport = () => {
  return new Promise((resolve, reject) => {
    Api.qms.sn
      .batchGenerate({
        purpose: queryParams.value.qrCode,
        sourceCodes: [1],
        materialNum: queryData.value.materialNo,
        createSize: 1,
        total: queryData.value.qty,
        mtoNo: queryData.value.mtoNo,
        sourceNo: queryData.value.no,
      })
      .then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          let index = dataList.value.findIndex(item => item.id === selectedRow.value.id);
          dataList.value[index] = data[0];
          resolve(true);
        }
      })
      .finally(() => {
        loading.value = false;
      });
  });
};

// 获取最新报告
const getPort = async () => {
  if (!machineIp.value) {
    proxy.$message.error('请选择机台');
    return;
  }
  reportLoading.value = true;
  try {
    const res = await Api.qms.sn.getInspectionReport({
      ...data.machine,
    });
    if (res.data.code === 200) {
      reportInfor.value = res.data.data[0] || {};
      reportLoading.value = false;
    } else {
      reportLoading.value = false;
    }
  } catch (error) {
    reportLoading.value = false;
  }
};

// 查看历史记录
const lookHistoryRecord = () => {
  router.push({ path: '/qms/reportinquiry/measureRepaort/index' });
};

// 查看报告
const lookReport = qualityCode => {
  reportViewDialogRef.value.openDialog(qualityCode);
};

// 查看已绑定的报告
const clickGetLookReport = async qualityCode => {
  const res = await Api.qms.sn.getSnQualityList({
    qualityCode: qualityCode,
  });
  const { code, data } = res.data;
  if (code === 200) {
    reportInfor.value = data.records[0];
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  getData();
  getMachineConfigListFn();
};

/** 重置按钮操作 */
const resetQuery = () => {
  proxy.resetForm('queryRef');
  dataList.value = [];
  queryData.value = {};
};

// 行点击事件处理
const handleRowClick = row => {
  selectedRow.value = row;
  machineIp.value = '';
  if (selectedRow.value.qualityCode) {
    selectedRow.value.qualityCode && clickGetLookReport(selectedRow.value.qualityCode);
  } else {
    reportInfor.value = {};
  }
};

// 行样式类处理
const tableRowClassName = ({ row }) => {
  if (selectedRow.value && selectedRow.value === row) {
    return 'selected-row';
  }
  return '';
};
</script>

<style scoped lang="scss">
:deep(.selected-row) {
  background: rgba(250, 111, 12, 0.05);
  box-shadow: inset 0px 0px 0px 0px #e5e5e5;
}
.blue {
  color: #1d65f3;
}

.el-form--inline {
  width: 100%;
}
.form-itme-width_25 {
  width: 25%;
}
.content-warp {
  height: calc(100% - 190px);
  padding-top: 20px;
  display: flex;
  position: relative;

  .table-container {
    width: calc(100% - 500px);
    margin-bottom: 0px;
    border: 1px solid #e9e9e9;
    border-radius: 8px;
  }
  .report-btns {
    width: 100%;
    display: flex;
    align-items: center;
  }
  .report-info-wrapper {
    height: calc(100% - 50px);
    right: 20px;
    position: absolute;
    width: 450px;
    border-radius: 8px 8px 8px 8px;
    border: 1px solid #e9e9e9;
    display: flex;
    flex-direction: column;
    padding: 24px;
    box-sizing: border-box;
    overflow-y: scroll;
    .report-title {
      font-weight: bold;
      font-size: 16px;
      color: #333333;
    }
    .report-info {
      border-radius: 4px 4px 4px 4px;
      border: 1px dashed #333333;
      padding: 14px;
      background-color: #f6f8fa;
      box-sizing: border-box;
      margin: 16px 0px 20px;
      .report-info-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        line-height: 30px;
        .info-item-label {
          color: #666666;
          width: 80px;
        }
        .info-item-value {
          font-weight: 500;
          color: #333333;
        }
        .click-look {
          color: #f78431;
          cursor: pointer;
        }
      }
    }
    .select-table {
      margin: 16px 0px 24px;
    }
  }
  .elright {
    width: 30px;
    position: absolute;
    top: 0%;
    right: 478px;
    z-index: 999;
    bottom: 0px;
    margin: auto;
  }
}
:deep(.el-table__inner-wrapper:before) {
  display: none;
}

.nodata-height {
  height: calc(100% - 20px) !important;
}

.header-wrapper {
  display: flex;
  padding: 16px;
  box-sizing: border-box;
  background-color: #fff;
  height: 170px;
  border-radius: 8px;
  margin-bottom: 20px;
  width: 100%;
  flex-direction: column;
  .search-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .noData-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .img {
      width: 456px;
      height: 456px;
    }
    .tip {
      font-size: 24px;
      color: #848488;
    }
  }
  :deep(.el-descriptions__label) {
    display: inline-block;
    width: 90px;
    text-align: right;
  }

  :deep(.el-descriptions__cell) {
    margin-bottom: 18px !important;
  }
  .search-result {
    padding: 10px 0px 0px;
    box-sizing: border-box;
    border: 1px dashed #606266;
  }
}
</style>
