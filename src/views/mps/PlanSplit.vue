<template>
  <div class="app-container">
    <el-tabs v-model="queryParams.businessStatusCode" @tab-change="handleQuery">
      <el-tab-pane label="进行中" name="1"></el-tab-pane>
      <el-tab-pane label="完成" name="2"></el-tab-pane>
      <el-tab-pane label="出货" name="3"></el-tab-pane>
    </el-tabs>
    <div class="search">
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

          <el-form-item label="齐套时间" prop="completeTimeStr">
            <el-date-picker
              v-model="queryParams.completeTimeStr"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="请选择齐套时间"
              clearable
            />
          </el-form-item>
          <el-form-item label="领料状态" prop="pickStatusCode">
            <el-select v-model="queryParams.pickStatusCode" placeholder="请选择领料状态" clearable>
              <el-option
                v-for="item in Const.mps.materialReguisitionStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
      <div class="operate-container">
        <el-button type="primary" icon="CirclePlus" @click="handleAdd">新增</el-button>
        <!-- <el-button type="primary" @click="submitWorkSchedule"> 自动排程</el-button> -->
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          row-key="id"
          lazy
          :load="loadChildren"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :expand-row-keys="expandRowKeys"
        >
          <el-table-column
            label="计划单号"
            prop="billNumber"
            align="left"
            min-width="200"
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
            min-width="160"
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
            min-width="120"
            show-overflow-tooltip
          >
            <template #default="scoped"> {{ secondToHour(scoped.row.reportHours) }}小时 </template>
          </el-table-column>
          <el-table-column
            label="ERP汇报工时"
            prop="erpReportHours"
            align="center"
            min-width="120"
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
          <el-table-column
            label="数量"
            prop="splitAmount"
            align="center"
            min-width="60"
            show-overflow-tooltip
          />
          <el-table-column
            label="齐套率"
            prop="completeSetRate"
            align="center"
            max-width="120"
            show-overflow-tooltip
            fixed="right"
          >
            <template #default="scoped">
              <el-progress
                v-if="scoped.row.isTrue"
                type="circle"
                :percentage="Number(scoped.row.completeSetRate) || 0"
                :width="50"
                @click="handleProgress(scoped.row)"
              />

              <div v-else style="height: 50px">-</div>
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
          <el-table-column
            label="领料状态"
            prop="materialRequisitionStatus"
            align="center"
            width="100"
          >
            <template #default="scoped">
              <dc-dict
                :options="Const.mps.materialReguisitionStatus"
                :value="scoped.row.pickStatusCode"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right" width="180">
            <template #default="scoped">
              <el-button
                type="primary"
                text
                @click="edit(scoped.row)"
                v-if="scoped.row.level === 1"
              >
                编辑
              </el-button>
              <el-button
                type="primary"
                text
                v-if="scoped.row.level === 1 && !scoped.row?.isSn"
                @click="handleImport(scoped.row)"
              >
                SN生成
              </el-button>
              <el-button
                type="primary"
                text
                v-if="scoped.row.level === 1 && scoped.row?.isSn"
                @click="handleOpenView(scoped.row)"
              >
                SN查看
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
    <!-- 打印领料单 -->
    <el-dialog v-model="open" size="600px" title="打印领料单" @close="cancelPrinter">
      <el-form
        ref="printerFormRef"
        :rules="printerRules"
        :model="printerFormData"
        label-width="100px"
      >
        <el-form-item label="打印机名称" prop="printer">
          <dc-select-print
            v-model="printerFormData.printer"
            :multiple="false"
            ref="selectPrintRef"
          />
        </el-form-item>
        <el-form-item label="是否打印" prop="whetherToPrintOrNot">
          <el-switch
            v-model="printerFormData.whetherToPrintOrNot"
            inactive-text="不打印"
            active-text="打印"
            inline-prompt
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFormPrinter" v-loading="fullscreenLoading"
            >提交</el-button
          >
          <el-button @click="cancelPrinter">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-drawer v-model="openProgress" size="800px" @close="closeProgress" title="物料清单">
      <el-table
        class="mb-5"
        :data="billNumberItemPpBom"
        width="100%"
        border
        v-if="Array.isArray(billNumberItemPpBom) && billNumberItemPpBom.length > 0"
      >
        <el-table-column
          prop="billNumber"
          label="料号"
          align="center"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          align="center"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="billStatus"
          label="状态"
          align="center"
          width="200"
          show-overflow-tooltip
        >
          <template #default="scoped">
            {{ scoped.row.billStatus }}
          </template>
        </el-table-column>
      </el-table>
      <el-table :data="billOfMaterials">
        <el-table-column
          prop="materialCode"
          label="料号"
          align="center"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="materialName"
          label="品名"
          align="center"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="completionNumber" label="齐套情况" align="center">
          <template #default="scoped">
            <span
              :style="{
                color: getStyle(scoped.row),
              }"
            >
              {{ scoped.row.completionNumber }}/ {{ scoped.row.completionTotalNumber }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="receivedQuantity" label="领取情况 " align="center">
          <template #default="scoped">
            <span
              :style="{
                color: getStyleTwo(scoped.row),
              }"
            >
              {{ scoped.row.receivedQuantity }}/{{ scoped.row.completionTotalNumber }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="提醒" align="center">
          <template #default="scoped">
            <el-switch v-model="scoped.row.reminder" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="submitFormProgress"
            v-loading.fullscreen.lock="fullscreenLoading"
          >
            发起领料单
          </el-button>
          <el-button @click="closeProgress">取消</el-button>
          <el-button type="warning" @click="open = true"> 打印领料单 </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 添加抽屉 -->
    <el-drawer v-model="addrogress" size="800px" @close="closeProgress" title="新增临时计划">
      <el-form
        ref="ruleFormRef"
        :rules="rules"
        :model="addFormData"
        label-width="120px"
        style="max-width: 600px"
      >
        <el-form-item label="专案号" prop="mtono">
          <el-input v-model="addFormData.mtono" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="物料名称" prop="materialName">
          <el-input v-model="addFormData.materialName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="物料编码" prop="materialCode">
          <el-input v-model="addFormData.materialCode" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="生产组别" prop="workGroupId">
          <el-select v-model="addFormData.workGroupId" clearable placeholder="请选择">
            <el-option
              v-for="item in workGroupsOptions"
              :key="item.value"
              :label="item.workGroupName"
              :value="item.workGroupCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="齐套时间" prop="completionTime">
          <el-date-picker
            v-model="addFormData.completionTime"
            type="date"
            placeholder="请确认时间"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="时间" prop="projectStartDate">
          <dc-date-range
            v-model:startDate="addFormData.planStartTime"
            v-model:endDate="addFormData.planEndTime"
            valueFormat="YYYY-MM-DD"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="临时物料工时" prop="totalWorkingHours">
          <el-input-number v-model="addFormData.totalWorkingHours" :min="1">
            <template #suffix>
              <span>时</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="数量" prop="splitAmount">
          <el-input-number v-model="addFormData.splitAmount" :min="1">
            <template #suffix>
              <span>个</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="前置天数" prop="leadDays">
          <el-input-number v-model="addFormData.leadDays" :min="1">
            <template #suffix>
              <span>天</span>
            </template>
          </el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="addSubmitFormProgress">确认</el-button>
          <el-button @click="closeProgress">取消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 查看SN -->
    <el-drawer v-model="openSn" size="800px" @close="closeProgress">
      <template #header>
        <div class="drawer-title">
          {{ title }}
          <div class="drawer-download">
            <el-button @click="handleClickExportLabel(snParams.purpose)" plain type="primary"
              >标签打印</el-button
            >
            <el-button @click="handleClickExportData(snParams.purpose)" plain type="primary"
              >制程卡打印</el-button
            >
          </div>
        </div>
      </template>
      <el-table class="mb-5" :data="snList" width="100%" border>
        <el-table-column
          prop="purpose"
          label="计划单号"
          align="center"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="mtoNo"
          label="专案号"
          align="center"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="shortCode"
          label="短码"
          align="center"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="code"
          label="长码"
          align="center"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column :min-width="110" align="center" label="打印">
          <template #default="scoped">
            <el-button
              @click="handleClickExportLabel(snParams.purpose, scoped.row.code)"
              type="primary"
              text
              >标签</el-button
            >
            <el-button
              @click="handleClickExportData(snParams.purpose, scoped.row.code)"
              type="primary"
              text
              >制程卡</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
    <splitPlanDrawer ref="splitPlanDrawerRef" @confirm="getData()" />
    <snPrintDrawer ref="snPrintDrawerRef" />
  </div>
</template>

<script setup name="PlanSplit">
import { onMounted } from 'vue';
import Api from '@/api/index';
import Const from '@/const/index';
import splitPlanDrawer from './masterPlan/splitPlanDrawer.vue';
import snPrintDrawer from './schedulePlan/snPrintDrawer.vue';

const { proxy } = getCurrentInstance();
const { DC_MES_MPS_SCHEDULE_STATUS } = proxy.useCache([{ key: 'DC_MES_MPS_SCHEDULE_STATUS' }]);
const pageData = reactive({
  loading: true,
  addFormData: {},
  queryParams: {
    current: 1,
    size: 10,
    orgId: '100006',
    businessStatusCode: '1',
    mtono: null,
    completeTimeStr: null,
    pickStatusCode: null,
  },
  dataList: [],
  expandRowKeys: [],
  total: 0,
  title: '',
  open: false,
  openProgress: false,
  addrogress: false,
  rowInfo: {},
  // 物料清单
  billOfMaterials: [],
  workGroupsOptions: [],
  rules: {
    totalWorkingHours: { required: true, message: '请输入', trigger: 'blur' },
    workGroupId: { required: true, message: '请选择', trigger: 'blur' },
    completionTime: { required: true, message: '请确认时间', trigger: 'blur' },
    splitAmount: { required: true, message: '请输入', trigger: 'blur' },
    leadDays: { required: true, message: '请输入', trigger: 'blur' },
  },

  fullscreenLoading: false,
  billNumberItemPpBom: [],
  printerRules: {
    whetherToPrintOrNot: { required: true, message: '请选择打印机', trigger: 'blur' },
    printServer: { required: true, message: '请确认时间', trigger: 'blur' },
    printer: { required: true, message: '请选择是否打印', trigger: 'blur' },
  },
  printerFormData: {
    whetherToPrintOrNot: false,
    printServer: '',
    printer: '',
  },
  selectPrintRef: null,
  splitPlanDrawerRef: null,
  openSn: false,
  snList: [],
  snParams: {},
  snPrintDrawerRef: null,
});

const {
  queryParams,
  addFormData,
  dataList,
  expandRowKeys,
  loading,
  total,
  title,
  rowInfo,
  openProgress,
  open,
  billOfMaterials,
  addrogress,
  workGroupsOptions,
  rules,
  fullscreenLoading,
  billNumberItemPpBom,
  printerFormData,
  printerRules,
  selectPrintRef,
  splitPlanDrawerRef,
  openSn,
  snList,
  snParams,
  snPrintDrawerRef,
} = toRefs(pageData);

onMounted(() => {
  getData();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  try {
    const res = await Api.mps.plan.getPlanSplitList(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records.map(item => ({
        ...item,
        level: 1,
        hasChildren: true,
        enable: item.enable === 1,
      }));
      total.value = data.total;
      queryParams.value.current = data.current;
      queryParams.value.size = data.size;
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

// 加载子项
const loadChildren = async (row, treeNode, resolve) => {
  if (row.children) return resolve(row.children);
  const params = {
    ...queryParams.value,
    id: row.id,
    size: 1000,
    current: 1,
  };
  const res = await Api.mps.moItem.getMoItemSecondList(params);
  const { code, data: resData } = res.data;
  if (code === 200) {
    const records = resData.records.map(item => {
      item.level = 2;
      item.children.forEach(child => (child.level = 3));
      if (item?.children) expandRowKeys.value.push(item.id);
      return item;
    });
    resolve(records);
  }
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
    areaName: undefined,
    chargePerson: undefined,
    businessStatusCode: queryParams.value.businessStatusCode,
  };
  proxy.resetForm('queryRef');
  getData();
};

// 编辑
const edit = row => {
  const options = {
    infoApi: Api.mps.mo.getSelectMoSplitItemV2,
    submitApi: Api.mps.mo.updatemMoSplitItem,
    params: {
      scheduleId: row.id,
    },
  };
  splitPlanDrawerRef.value.openDrawer(options, true);
};

// 抽屉提交表单
const submitFormProgress = async () => {
  try {
    fullscreenLoading.value = true;
    const res = await Api.mps.planSplit.postMpsMoItemMroGenerate(billOfMaterials.value);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message.success(msg);
      closeProgress();
      getData();
    }
  } catch (error) {
    console.error(error);
  } finally {
    closeProgress();
  }
};

// 批量生成
const handleImport = async row => {
  proxy
    .$confirm('确认是否生成SN?', '提示', {
      confirmButtonText: '生成',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() =>
      Api.qms.sn.batchGenerate({
        purpose: row.billNumber,
        materialNum: row.materialCode,
        createSize: row.splitAmount,
        total: row.splitAmount,
        mtoNo: row.mtono,
        sourceNo: row.billNumber,
      })
    )
    .then(async res => {
      const { code } = res.data;
      if (code === 200) {
        const resSubmit = await Api.mps.plan.submit({
          id: row.id,
          isSn: true,
        });
        getData();
        proxy.$message({
          type: 'success',
          message: '操作成功!',
        });
      }
      loading.value = false;
    })
    .catch(error => {});
};

// 抽屉提交打印表单
const submitFormPrinter = async () => {
  proxy.$refs['printerFormRef'].validate(async valid => {
    if (valid) {
      try {
        fullscreenLoading.value = true;
        printerFormData.value.printServer = selectPrintRef.value.queryParams.server;

        const res = await Api.mps.planSplit.postMpsMoItemMroGenerate(
          billOfMaterials.value,
          printerFormData.value
        );
        const { code, msg } = res.data;
        if (code === 200) {
          getData();
          cancelPrinter();
          proxy.$message.success(msg);
        }
        fullscreenLoading.value = false;
      } catch (error) {
        fullscreenLoading.value = false;
      }
    }
  });
};

const cancelPrinter = () => {
  open.value = false;
  printerFormData.value = {
    whetherToPrintOrNot: false,
    printServer: '',
    printer: '',
  };
  proxy.resetForm('printerFormRef');
};

// 打开物料清单弹窗
const handleProgress = async row => {
  loading.value = true;
  try {
    const params = {
      moItemId: row.id,
    };
    const res = await Api.mps.moItem.getMoItemMrList(params);
    const { code, data } = res.data;
    if (code === 200) {
      billOfMaterials.value = data;
    }

    const resMo = await Api.mps.planSplit.getMpsMoItemMrPpBom(params);
    if (resMo.data.code == 200) {
      billNumberItemPpBom.value = resMo.data.data;
    }
    rowInfo.value = row;
    title.value = '物料清单';
    openProgress.value = true;
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 标签打印
const handleClickExportLabel = (code, snCode = '') => {
  // const codeTest = 'MO250306827~1';
  window.open(
    `/api/blade-bip/skip-url/mps/assembly-progress/get-Label?moNumber=${code}&snCode=${snCode}`,
    '_blank'
  );
};

// 制程卡打印
const handleClickExportData = (code, snCode = '') => {
  // const codeTest = 'MO250306827~1';
  window.open(
    `/api/blade-bip/skip-url/mps/assembly-progress/get-pdf?moNumber=${code}&snCode=${snCode}`,
    '_blank'
  );
};

// 关闭抽屉方式
const closeProgress = () => {
  title.value = '';
  billNumberItemPpBom.value = [];
  billOfMaterials.value = [];
  openProgress.value = false;
  fullscreenLoading.value = false;
};

// 获取样式
const getStyle = row => {
  const completionNumber = Number(row.completionNumber || 0);
  if (completionNumber >= row.completionTotalNumber) {
    return '#23C69F';
  } else if (completionNumber < row.completionTotalNumber && completionNumber !== 0) {
    return '#F2B046';
  } else {
    return '#E12137';
  }
};

// 获取样式
const getStyleTwo = row => {
  const receivedQuantity = Number(row.receivedQuantity || 0);
  if (receivedQuantity >= row.completionTotalNumber) {
    return '#23C69F';
  } else if (receivedQuantity < row.completionTotalNumber && receivedQuantity !== 0) {
    return '#F2B046';
  } else {
    return '#E12137';
  }
};

// 新增
const handleAdd = async () => {
  addrogress.value = true;
  const res = await Api.mps.planSplit.postMpsMoItemAddDecompositionPlan();
  workGroupsOptions.value = res.data.data.workGroups;
};

// 新增提交按钮
const addSubmitFormProgress = async () => {
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      const res = await Api.mps.planSplit.postMpsMoItemSubmit(addFormData.value);
      const { code } = res.data;
      if (code == 200) {
        getData();
        addrogress.value = false;
      }
    }
  });
};

// 打开SN视图
const handleOpenView = row => {
  snPrintDrawerRef.value.openDrawer(row);
};

// 关闭SN视图
const closeView = () => {
  openSn.value = false;
};

// 获取物料列表
const getSnRecordListData = async row => {
  try {
    const res = await Api.qms.sn.getSnRecordList(snParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      snList.value = data.records;
    }
  } catch (error) {
    console.error(error);
  } finally {
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  padding-top: 0;
}
.drawer-title {
  display: flex;
  justify-content: space-between;

  .drawer-download {
    flex: end;
  }
}
</style>
