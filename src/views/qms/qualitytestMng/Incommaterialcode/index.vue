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
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item class="form-itme-width_25" label="物料查询" prop="customerId">
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
        <el-form-item class="form-itme-width_25">
          <el-button type="primary" icon="Search" @click="getData">查找</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="search-area">
        <el-button
          type="primary"
          v-permission="{ id: 'INCOMMATERIALCODE_GC' }"
          @click="handleImport"
          >生成SN码</el-button
        >
      </div>
    </div>
    <div class="search-result" v-loading="loading">
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
        <el-descriptions-item label="版本">{{ queryData.version || '-' }} </el-descriptions-item>
        <el-descriptions-item label="已生成/未生成"
          >{{ queryData.status || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="noData-wrapper" v-if="dataList.length == 0">
      <img src="../../../../../public/img/frame@2x.png" alt="" class="img" />
      <p class="tip">暂无信息，请扫描物料工序二维码或输入查询</p>
    </div>
  </div>
  <div class="content-warp" v-if="dataList.length > 0">
    <div class="operate-container">
      <el-button
        icon="el-icon-copy-document"
        plain
        @click="handleBatchCopy"
        :disabled="multipleSelection.length == 0"
        >批量SN复制</el-button
      >
    </div>

    <div class="table-container">
      <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="70"> </el-table-column>
        <el-table-column label="序号" type="index" width="60px" align="center">
          <template #default="scoped">
            <span>{{ scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SN全码" align="center" prop="code" />
        <el-table-column label="SN简码" align="center" prop="shortCode"> </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup name="Productiongroup">
import { ref, onMounted } from 'vue';
import { debounce } from 'lodash';
import Api from '@/api/index';
const { proxy } = getCurrentInstance();
const data = reactive({
  queryParams: {},
  dataList: [],
  loading: false,
  title: '',
  rules: {},
  multipleSelection: [],
  queryData: {},
});

const { multipleSelection, queryParams, dataList, loading, queryData } = toRefs(data);
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
    }
  } catch (error) {
    loading.value = false;
    queryData.value = {};
  }
};

// 批量生成
const handleImport = () => {
  if (Object.keys(queryData.value).length == 0) {
    proxy.$message.error('请先查找数据');
    return;
  }
  loading.value = true;
  Api.qms.sn
    .batchGenerate({
      purpose: queryParams.value.qrCode,
      sourceCodes: sourceCodesList(queryData.value.qty),
      materialNum: queryData.value.materialNo,
      createSize: queryData.value.qty,
      total: queryData.value.qty,
      mtoNo: queryData.value.mtoNo,
      sourceNo: queryData.value.no,
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        dataList.value = data;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

// 源编码集合
const sourceCodesList = qry => {
  let list = [];
  for (let i = 0; i < qry; i++) {
    list.push(i + 1);
  }
  return list;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  proxy.resetForm('queryRef');
  dataList.value = [];
  queryData.value = {};
};

// 多选
const handleSelectionChange = val => {
  data.multipleSelection = val;
};

// 批量复制
const handleBatchCopy = () => {
  if (multipleSelection.value.length === 0) {
    proxy.$message.error('请选择要复制的行');
    return;
  }

  // 获取所有选中的 SN 全码或简码
  const selectedCodes = multipleSelection.value
    .map(item => {
      return item.code + '  ' + '  ' + item.shortCode;
    })
    .join('\n');

  // 复制到剪贴板
  navigator.clipboard
    .writeText(selectedCodes)
    .then(() => {
      proxy.$message.success('复制成功');
    })
    .catch(err => {
      proxy.$message.error('复制失败，请重试');
    });
};
</script>

<style scoped lang="scss">
.content-warp {
  height: calc(100% - 190px);
  padding-top: 0px;
}

.table-container {
  margin-bottom: 0px;
}

.form-itme-width_25 {
  width: 25%;
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
  .el-form--inline {
    width: 100%;
  }
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
