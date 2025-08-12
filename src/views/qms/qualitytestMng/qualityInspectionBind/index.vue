<template>
  <div class="app-container content-warp">
    <div class="header">
      <div class="title">
        <el-tabs v-model="queryParams.type" @tab-change="handleQuery">
          <el-tab-pane label="未指派" name="未指派"></el-tab-pane>
          <el-tab-pane label="已指派" name="已指派"></el-tab-pane>
          <el-tab-pane label="已出货" name="已出货"></el-tab-pane>
          <el-tab-pane label="完工" name="完工"></el-tab-pane>
        </el-tabs>
      </div>
      <div class="search-area">
        <el-button
          type="primary"
          @click="doAction('butchEdit')"
          :disabled="selectedRows.length === 0"
          v-permission="{ id: 'DC_QMS_QLB_BATCH_AP' }"
          >批量指派人员</el-button
        >
      </div>
    </div>

    <div class="search" style="margin-top: 10px">
      <div class="search-left">
        <el-form
          class="search-container"
          :model="queryParams"
          ref="queryRef"
          :inline="true"
          @keyup.enter="handleQuery"
        >
          <el-form-item label="组织">
            <dc-select
              v-model="queryParams.orgId"
              objectName="org"
              placeholder="请选择组织"
              :clearable="true"
            />
          </el-form-item>
          <el-form-item label="专案号" prop="mtono">
            <el-input v-model="queryParams.mtono" placeholder="请输入专案号" clearable />
          </el-form-item>
          <el-form-item label="计划单号" prop="billNumber">
            <el-input v-model="queryParams.billNumber" placeholder="请输入计划单号" clearable />
          </el-form-item>
          <el-form-item label="负责人" prop="selectPersonId">
            <dc-select-user
              v-model="queryParams.selectPersonId"
              placeholder="请输入负责人"
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
    <div class="body-container">
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="dataList"
          row-key="id"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="40" align="center" :reserve-selection="true" />
          <el-table-column label="序号" width="60" align="center">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            label="计划单号"
            prop="billNumber"
            align="center"
            width="160"
            show-overflow-tooltip
          />
          <el-table-column
            label="专案号"
            prop="mtono"
            align="center"
            width="120"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.mtono || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="物料编码"
            prop="materialCode"
            align="center"
            width="160"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.materialCode || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="物料名称"
            prop="materialName"
            align="center"
            min-width="200"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.materialName || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="数量"
            prop="splitAmount"
            align="center"
            min-width="60"
            show-overflow-tooltip
          />
          <el-table-column
            label="开始时间结束时间"
            prop="materialName"
            align="center"
            min-width="90"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <div>
                {{ scoped.row.planStartTime || '-' }} <br />{{ scoped.row.planEndTime || '-' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="负责人" prop="chargePersonId" align="center" width="100">
            <template #default="scoped">
              <dc-view v-model="scoped.row.chargePersonId" objectName="user" />
            </template>
          </el-table-column>
          <el-table-column label="PQE负责人" prop="pqeChargePersonId" align="center" width="100">
            <template #default="scoped">
              <dc-view v-model="scoped.row.pqeChargePersonId" objectName="user" />
            </template>
          </el-table-column>
          <el-table-column label="IPQC负责人" prop="ipqcChargePersonId" align="center" width="100">
            <template #default="scoped">
              <dc-view v-model="scoped.row.ipqcChargePersonId" objectName="user" />
            </template>
          </el-table-column>
          <el-table-column
            label="计划工时"
            prop="totalWorkingHours"
            align="center"
            min-width="120"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ secondToHour(scoped.row.totalWorkingHours) }} 小时
            </template>
          </el-table-column>
          <el-table-column
            label="汇报工时"
            prop="reportHours"
            align="center"
            width="120"
            show-overflow-tooltip
          >
            <template #default="scoped"> {{ secondToHour(scoped.row.reportHours) }}小时 </template>
          </el-table-column>
          <el-table-column
            label="ERP汇报工时"
            prop="erpReportHours"
            align="center"
            width="120"
            show-overflow-tooltip
          >
            <template #default="scoped"
              >{{ secondToHour(scoped.row.erpReportHours) }}小时
            </template>
          </el-table-column>
          <el-table-column
            label="业务状态"
            prop="businessStatusName"
            align="center"
            min-width="80"
            show-overflow-tooltip
          />
          <el-table-column
            label="齐套时间"
            prop="completionTime"
            align="center"
            min-width="140"
            show-overflow-tooltip
          />
          <el-table-column
            label="生产组别"
            prop="workGroupName"
            align="center"
            min-width="120"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ scoped.row.workGroupName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="排程状态" prop="planStatusCode" align="center" width="100">
            <template #default="scoped">
              <dc-dict-key
                :options="DC_MES_MPS_SCHEDULE_STATUS"
                :value="scoped.row.planStatusCode"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right" width="120">
            <template #default="scoped">
              <el-button
                type="primary"
                text
                v-permission="{ id: 'DC_QMS_QLB_AP', row: scoped.row }"
                @click="doAction('edit', scoped)"
                v-if="btnShow"
              >
                指派人员
              </el-button>
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

    <!-- 指派人员 -->
    <el-drawer v-model="open" :title="title" size="600px" @close="close">
      <div class="app-container">
        <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="100px">
          <el-form-item label="负责人" prop="chargePersonId">
            <dc-select-user
              v-model="formData.chargePersonId"
              placeholder="请选择负责人"
              :multiple="false"
            />
          </el-form-item>
          <el-form-item label="PQE负责人" prop="pqeChargePersonId" v-if="formData.isNumber > 1">
            <dc-select-user
              v-model="formData.pqeChargePersonId"
              placeholder="请选择PQE负责人"
              :multiple="false"
            />
          </el-form-item>
          <el-form-item label="IPQC负责人" prop="ipqcChargePersonId" v-if="formData.isNumber > 1">
            <dc-select-user
              v-model="formData.ipqcChargePersonId"
              placeholder="请选择IPQC负责人"
              :multiple="false"
            />
          </el-form-item>
        </el-form>
        <div class="table-container">
          <el-table :data="selectedRows" row-key="id">
            <el-table-column label="序号" width="60" align="center">
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column
              label="计划单号"
              prop="billNumber"
              align="center"
              width="160"
              show-overflow-tooltip
            />
            <el-table-column
              label="专案号"
              prop="mtono"
              align="center"
              width="120"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{ scoped.row.mtono || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              label="物料编码"
              prop="materialCode"
              align="center"
              width="160"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{ scoped.row.materialCode || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              label="物料名称"
              prop="materialName"
              align="center"
              min-width="200"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{ scoped.row.materialName || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              label="数量"
              prop="splitAmount"
              align="center"
              min-width="60"
              show-overflow-tooltip
            />
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="doAction(formData.action)" v-loading="loadingSubmit"
            >提交</el-button
          >
          <el-button @click="close" v-loading="loadingSubmit">关闭</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="QualityInspectionBind">
import { onMounted } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();
const { DC_MES_MPS_SCHEDULE_STATUS } = proxy.useCache([{ key: 'DC_MES_MPS_SCHEDULE_STATUS' }]);
const pageData = reactive({
  loading: false,
  btnShow: false,
  formData: {},
  queryParams: {
    current: 1,
    size: 10,
    orgId: '100006',
    type: '未指派',
    mtono: null,
    completeTimeStr: null,
    pickStatusCode: null,
  },
  dataList: [],
  total: 0,
  title: '',
  rules: {
    // chargePersonId: { required: true, message: '负责人为必选项', trigger: 'blur' },
    // pqeChargePersonId: { required: true, message: 'PQE负责人为必选项', trigger: 'blur' },
    // ipqcChargePersonId: { required: true, message: 'IPQC负责人为必选项', trigger: 'blur' },
  },
  loadingSubmit: false,
  open: false,
  selectedRows: [],
  tableRef: null,
});

const {
  btnShow,
  queryParams,
  formData,
  dataList,
  loading,
  total,
  title,
  rules,
  loadingSubmit,
  open,
  selectedRows,
  tableRef,
} = toRefs(pageData);

onMounted(() => {
  getData();
  getButtonControl();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  try {
    const res = await Api.mps.plan.getPlanSplitList(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
      queryParams.value.current = data.current;
      queryParams.value.size = data.size;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

const getButtonControl = () => {
  Api.mps.plan
    .buttonControl()
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        btnShow.value = data;
      }
    })
    .catch(err => {
      console.error(err);
    });
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
    orgId: '100006',
    type: queryParams.value.type,
  };
  proxy.resetForm('queryRef');
  getData();
};

// 关闭抽屉方式
const close = () => {
  title.value = '';
  formData.value = {
    id: null,
    isNumber: null,
    chargePersonId: null,
    pqeChargePersonId: null,
    ipqcChargePersonId: null,
  };
  open.value = false;
};

// 新增提交按钮
const submitForm = async () => {
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      loadingSubmit.value = true;
      const res = await Api.mps.plan.submit(formData.value);
      const { code } = res.data;
      if (code == 200) {
        getData();
        close();
      }
      loadingSubmit.value = false;
    }
  });
};

// 批量提交
const butchSubmitForm = () => {
  proxy.$refs['ruleFormRef'].validate(valid => {
    if (valid) {
      loadingSubmit.value = true;
      const form = selectedRows.value.map(item => {
        let currentItem = {
          id: item.id,
          chargePersonId: formData.value.chargePersonId,
          routeId: item.routeId,
        };
        if (item.isNumber === 3) {
          currentItem.pqeChargePersonId = formData.value.pqeChargePersonId;
          currentItem.ipqcChargePersonId = formData.value.ipqcChargePersonId;
        }
        return currentItem;
      });
      Api.mps.plan
        .butchSubmit(form)
        .then(res => {
          const { code } = res.data;
          if (code == 200) {
            getData();
            close();
            tableRef.value.clearSelection();
          }
          loadingSubmit.value = false;
        })
        .catch(err => {
          loadingSubmit.value = false;
        });
    }
  });
};

// 处理表格选中
const handleSelectionChange = selection => {
  selectedRows.value = selection;
};

const doAction = (action, scope) => {
  switch (action) {
    case 'butchEdit':
      title.value = `批量指派人员`;
      formData.value = {
        action: 'butchSubmit',
        isNumber: 3,
        chargePersonId: null,
        pqeChargePersonId: null,
        ipqcChargePersonId: null,
      };
      open.value = true;
      return;
    case 'edit':
      const { row } = scope;
      title.value = `[${row.billNumber}]-指派人员`;
      formData.value = {
        action: 'submit',
        id: row.id,
        isNumber: row.isNumber,
        chargePersonId: row.chargePersonId,
        pqeChargePersonId: row.pqeChargePersonId,
        ipqcChargePersonId: row.ipqcChargePersonId,
      };
      open.value = true;
      return;
    case 'submit':
      submitForm();
      return;
    case 'butchSubmit':
      butchSubmitForm();
      return;
  }
};
</script>
