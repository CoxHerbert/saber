<template>
  <basic-container>
    <div class="content-warp">
      <div class="header">
        <div class="title">测量报告</div>
        <!-- <div class="search-area">
          <el-button type="primary" icon="el-icon-position" @click="handleImport"
            >扫描打码
          </el-button>
          <el-button type="primary" plain icon="el-icon-upload" @click="handleExport"
            >导出
          </el-button>
          <el-button
            icon="el-icon-delete"
            plain
            @click="handleDelete"
            :disabled="multipleSelection.length == 0"
            >批量删除</el-button
          >
        </div> -->
      </div>
      <div class="search">
        <div class="search-left">
          <el-form
            class="search-container"
            :model="queryParams"
            ref="queryRef"
            :inline="true"
            @keyup.enter="handleQuery"
          >
            <el-form-item label="物料编码" prop="materialNum">
              <el-input
                type="text"
                v-model="queryParams.materialNum"
                placeholder="请输入物料编码"
              ></el-input>
            </el-form-item>

            <el-form-item label="专案号" prop="mtoNo">
              <el-input
                type="text"
                v-model="queryParams.mtoNo"
                placeholder="请输入专案号"
              ></el-input>
            </el-form-item>

            <el-form-item class="form-itme-width_20" label="日期" prop="createTime">
              <el-date-picker
                v-model="queryParams.createTime"
                type="date"
                clearable
                placeholder="请选择日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="操作员" id="bdUserId" prop="surveyUser">
              <dc-select-user
                v-model="queryParams.surveyUser"
                placeholder="请选择"
                :multiple="false"
                :multiple-limit="1"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="search-right">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </div>
      </div>

      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="物料编码"
            width="180"
            prop="materialNum"
            align="center"
            show-overflow-tooltip
          >
          </el-table-column>
          <el-table-column label="物料名称" align="center" prop="materialName" />
          <el-table-column label="规格" width="160" align="center" prop="specification">
          </el-table-column>
          <el-table-column label="SN" min- align="center" prop="code"> </el-table-column>
          <el-table-column label="专案号" min-width="90px" align="center" prop="mtoNo">
          </el-table-column>
          <el-table-column
            min-width="120"
            label="报告类型"
            align="center"
            prop="measurementDictDode"
          >
          </el-table-column>
          <el-table-column label="操作员" min-width="120px" align="center" prop="surveyUser">
            <template #default="scoped">
              <dc-view v-model="scoped.row.surveyUser" objectName="user" />
            </template>
          </el-table-column>
          <el-table-column label="报告编码" min-width="120px" align="center" prop="qualityCode">
          </el-table-column>
          <el-table-column label="报告时间" align="center" prop="createTime" width="200px" />
          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                v-permission="{ id: 'MEASUREREPAORT_DETAIL' }"
                @click="lookReport(scoped.row.qualityCode)"
                >查看报告</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
  </basic-container>
  <!-- 报告查看 -->
  <ReportViewDialog ref="reportViewDialogRef" />
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import { getLaborCompanyList } from '@/api/system/labor';
import ReportViewDialog from '../../qualitytestMng/reportBind/reportViewDialog.vue';
import Api from '@/api/index';
const { proxy } = getCurrentInstance();
const reportViewDialogRef = ref(null);
const data = reactive({
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  companyList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  multipleSelection: [],
});

const { multipleSelection, queryParams, dataList, loading, total } = toRefs(data);

onMounted(() => {
  getData();
  getLaborCompanyListFn();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.qms.sn.getMeasurementReport(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

// 详情
const lookReport = row => {
  reportViewDialogRef.value.openDialog(row);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};

const getLaborCompanyListFn = () => {
  getLaborCompanyList({}).then(res => {
    data.companyList = res.data.data.records.map(item => {
      return {
        value: item.id,
        label: item.name,
      };
    });
  });
};
</script>

<style scoped lang="scss">
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
}

.search-right {
  padding-top: 20px;
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      height: 50px;
      display: flex;
      align-items: center;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}
</style>
