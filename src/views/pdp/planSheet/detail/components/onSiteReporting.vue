<template>
  <div class="content-warp">
    <el-form class="search-container" :model="queryParams" ref="queryRef" :inline="true">
      <div class="search">
        <div class="search-left">
          <el-form-item label="阶段" prop="phaseId">
            <el-select v-model="queryParams.phaseId" placeholder="请选择阶段">
              <el-option
                v-for="item in dataList"
                :key="item.id"
                :label="item.mmrPhaseName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-right">
          <el-form-item>
            <el-button type="primary" @click="getData">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <div class="table-container" v-loading="loading">
      <el-table
        :data="tableData"
        :row-style="{ height: '63px' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="60px" type="index" align="center">
          <template #default="scoped">
            <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCode" label="计划名称" align="center" width="200" />
        <el-table-column
          prop="reportUserId"
          label="DRI"
          align="center"
          width="180"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-view
              v-model="scoped.row.reportUserId"
              objectName="user"
              showKey="realName"
            /> </template
        ></el-table-column>
        <el-table-column
          prop="phaseName"
          label="当前阶段"
          align="center"
          width="220"
          show-overflow-tooltip
        />
        <el-table-column
          prop="progress"
          label="当前阶段进度"
          align="center"
          width="250"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <el-progress
              :percentage="scoped.row.progress"
              :color="
                parseFloat(scoped.row.progress).toFixed(2) === '100.00'
                  ? '#23C69F'
                  : parseFloat(scoped.row.progress).toFixed(2) < '50.00'
                  ? '#1D65F3'
                  : '#E12137'
              "
            /> </template
        ></el-table-column>
        <el-table-column
          prop="startTime"
          label="阶段开始时间"
          align="center"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="endTime"
          label="阶段结束时间"
          align="center"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="createUser" label="创建人" align="center" show-overflow-tooltip>
          <template #default="scoped">
            <dc-view
              v-model="scoped.row.createUser"
              objectName="user"
              showKey="realName"
            /> </template
        ></el-table-column>
        <el-table-column
          prop="reportDate"
          min-width="180"
          label="报工日期"
          align="center"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right">
          <template #default="scoped">
            <!-- <el-button link type="primary" @click="handleDetail(scoped.row)">查看</el-button> -->
            <el-button link type="primary" @click="handleEdit(scoped.row)">编辑</el-button>
            <!-- <el-button link type="primary" @click="handleRemove(scoped.row)">删除</el-button> -->
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

  <el-drawer
    v-model="open"
    destroy-on-close
    append-to-body
    @close="closeDrawer"
    :with-header="false"
    class="drawer-container"
    size="35%"
  >
    <div class="close-icon" @click="closeDrawer">
      <el-icon><Close /></el-icon>
    </div>

    <div class="left-head">
      <div class="left-head_title">{{ title }}</div>
      <div class="left-head_info">
        <div class="info-value">
          <dc-view v-model="userInfo.user_id" objectName="user" showKey="realName" />
        </div>
        |
        <div class="info-value">
          发起于{{ editTimer || proxy.$dayjs().format('YYYY-MM-DD HH:mm:ss') }}
        </div>
      </div>
    </div>
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      status-icon
      :inline="true"
    >
      <div class="wrap-left-form">
        <div class="form-group-title">报工信息</div>
        <el-form-item
          class="form-itme-width_100"
          label="计划单名称"
          id="orderName"
          prop="orderName"
        >
          <dc-select-dialog
            v-model="formData.orderId"
            placeholder="请选择计划单"
            objectName="mmrPlanOrder"
            type="input"
            :multiple="false"
            :multiple-limit="1"
            :clearable="true"
            :params="{
              planOrderStatus: 'DC_MMR_PLAN_ORDER_STATUS_IP',
            }"
            @change="handleLineNameChange"
          />
        </el-form-item>
        <!-- <el-form-item
          class="form-itme-width_100"
          label="计划单编号"
          id="orderCode"
          prop="orderCode"
        >
          <el-input v-model="formData.orderCode" disabled placeholder="选择计划单名称自动带出" />
        </el-form-item> -->
        <el-form-item class="form-itme-width_100" label="DRI" id="reportUserId" prop="reportUserId">
          <dc-view v-model="formData.reportUserId" objectName="user" showKey="realName" />
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="当前阶段" id="phaseName" prop="phaseName">
          <el-select
            v-model="formData.phaseName"
            placeholder="请选择阶段"
            @change="handlePhaseChange"
          >
            <el-option
              v-for="item in planOrderPhases"
              :key="item.id"
              :label="item.phaseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          class="form-itme-width_100"
          label="阶段开始时间"
          id="startTime"
          prop="startTime"
        >
          <el-date-picker
            v-model="formData.startTime"
            type="date"
            placeholder="请选择阶段开始时间"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="阶段结束时间" id="endTime" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="date"
            placeholder="请选择阶段结束时间"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="当前进度" id="progress" prop="progress">
          <el-input-number v-model="formData.progress" :min="1" :max="100">
            <template #suffix>
              <span>%</span>
            </template></el-input-number
          >
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer"> 取消 </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup name="onSiteReporting">
import { getCurrentInstance, reactive, toRefs } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import { onMounted } from 'vue';
import store from '@/store/index';
import { useRoute } from 'vue-router';
const { proxy } = getCurrentInstance();
const userInfo = computed(() => store.getters.userInfo);
const route = useRoute();

const props = defineProps({
  id: {
    type: String,
    default() {
      return '';
    },
  },
});
// 数据字典
const data = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  tableData: [],
  selectedIds: null,
  formData: {
    customerId: null,
    phaseId: null,
    planOrderPhaseId: null,
  },
  open: false,
  planOrderPhases: [],
  rules: {
    orderName: [{ required: true, message: '请输入', trigger: 'change' }],
    orderCode: [{ required: true, message: '请选择', trigger: 'change' }],
    reportUserId: [{ required: true, message: '请输入', trigger: 'change' }],
    phaseName: [{ required: true, message: '请输入', trigger: 'change' }],
    startTime: [{ required: true, message: '请选择', trigger: 'change' }],
    endTime: [{ required: true, message: '请选择', trigger: 'change' }],
    progress: [{ required: true, message: '请选择', trigger: 'change' }],
  },
  dataList: [],
  selectedPhase: null,
  title: '',
  editTimer: null,
  mmrPlanOrderList: [],
});

const {
  loading,
  queryParams,
  total,
  tableData,
  selectedIds,
  formData,
  open,
  planOrderPhases,
  rules,
  dataList,
  selectedPhase,
  title,
  editTimer,
  mmrPlanOrderList,
} = toRefs(data);

onMounted(() => {
  getData();
  getDataList();
  getDataPhaseName();
});

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const params = {
      ...queryParams.value,
      orderId: props.id ? props.id : route.params.id,
    };
    const res = await Api.pdp.mmrPlanWhr.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total;
      tableData.value.forEach(item => {
        const matchedPhase = dataList.value.find(phase => phase.id === item.phaseId);
        item.phaseName = matchedPhase ? matchedPhase.mmrPhaseName : null; // 处理找不到的情况
      });
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 获取主数据列表
const getDataList = async () => {
  try {
    loading.value = true;
    const params = {
      current: 1,
      size: 100000,
    };
    const res = await Api.pdp.mmrPlanOrder.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      mmrPlanOrderList.value = data.records;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 获取数据
const getDataPhaseName = async () => {
  try {
    loading.value = true;
    const params = {
      current: 1,
      size: 100000,
    };
    const res = await Api.pdp.mmrPlanPhaseInfo.list(params);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      const res = await Api.pdp.mmrPlanWhr.submit(formData.value);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        getData();
        closeDrawer();
      }
    }
  });
};

const handleEdit = row => {
  open.value = true;
  formData.value = row;
  title.value = '编辑';
  editTimer.value = row.createTime;
};

// 勾选事件
const handleSelectionChange = selection => {
  selectedIds.value = selection.map(item => item.id).join(',');
};

// 删除
const handleRemove = () => {
  const ids = selectedIds.value;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.pdp.mmrPlanWhr.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
};

/** 重置搜索 **/
const handleReset = () => {
  queryParams.value.current = 1;
  proxy.resetForm('queryRef');
  getData();
};

/** 新增 */
const handleRouterAdd = () => {
  open.value = true;
  title.value = '创建';
};

// 回显
const handleLineNameChange = async row => {
  formData.value.orderName = row.lineName;
  formData.value.orderCode = row.lineCode;
  formData.value.reportUserId = row.chargeUser;
  formData.value.reportDate = row.createTime;
  formData.value.customerId = row.customerId;
  // 查询有效计划
  const params = {
    orderId: row.id,
  };
  const res = await Api.pdp.mmrPlanWhr.findeFfectivePhase(params);
  const { code, data } = res.data;
  if (code === 200) {
    planOrderPhases.value = data;
  }
};

// 取消
const closeDrawer = () => {
  formData.value = {};
  open.value = false;
  getData();
};

const handlePhaseChange = selectedId => {
  // 找到当前选中的对象
  selectedPhase.value = planOrderPhases.value.find(item => item.id === selectedId);
  formData.value.startTime = selectedPhase.value.startDate;
  formData.value.endTime = selectedPhase.value.endDate;
  formData.value.phaseId = selectedPhase.value.phaseId;
  formData.value.planOrderPhaseId = selectedPhase.value.id;
};
</script>
<style lang="scss" scoped>
.content-warp {
  .ht {
    height: 70px;
  }
}

.custom-form {
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  .form-itme-width_100 {
    width: 100%;
  }
}

.form-center {
  display: flex;
  flex-wrap: wrap;
}

.form-group-title {
  display: flex;
  align-items: center;
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin: 20px 0;
  &::before {
    margin-right: 4px;
    display: block;
    content: '';
    width: 4px;
    height: 13px;
    background-color: #f78431;
  }
}

.close-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 27px;
  height: 27px;
  background-color: #bbb;
  border-radius: 50%;
  left: 7px;
  top: 15px;
  font-size: 18px;
  color: #fff;
  font-weight: 600;
}
.left-head {
  padding: 24px;
  border-bottom: 1px solid #f5f5f5;
  &_title {
    font-weight: bold;
    font-size: 18px;
    color: #333;
    line-height: 18px;
  }
  &_info {
    margin-top: 20px;
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: #666;
    line-height: 14px;
    gap: 12px;
  }
}
</style>
