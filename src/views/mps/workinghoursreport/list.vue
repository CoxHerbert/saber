<template>
  <div class="app-container" v-loading="loading">
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="专案号" prop="mtoNo">
        <el-input v-model="queryParams.mtoNo" placeholder="请输入专案号" />
      </el-form-item>
      <el-form-item label="计划名称" prop="billNumber">
        <el-input v-model="queryParams.billNumber" placeholder="请输入计划名称" />
      </el-form-item>
      <el-form-item label="创建人" prop="createUser">
        <dc-select-user
          v-model="queryParams.createUser"
          placeholder="请选择创建人"
          :multiple="false"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          icon="Plus"
          v-permission="{ id: 'DC_WORKING_HOUR_SERPORT_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          :data="dataList"
          row-key="id"
          lazy
          :load="load"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column
            label="专案号"
            prop="mtoNo"
            align="center"
            show-overflow-tooltip
            width="150"
          >
            <template #default="scoped">
              <span>{{ scoped.row.mtoNo || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="计划名称" prop="billNumber" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.billNumber || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建人" prop="name" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="name" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.createTime || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总工时" prop="processTime" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ proxy.secondToHour(scoped.row.processTime) || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总数量" prop="processTime" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <span>{{ scoped.row.qty || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="已汇报工时"
            prop="reportTotal"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ proxy.secondToHour(scoped.row.reportTotal) || '0' }}时</span>
            </template>
          </el-table-column>
          <el-table-column
            label="已汇报数量"
            prop="reportQtyTotal"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.reportQtyTotal || '0' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="ERP汇报工时"
            prop="erpReportWorkingHours"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.erpReportWorkingHours || '0' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="汇报工时"
            prop="mpsReportWorkingHours"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.mpsReportWorkingHours || '0' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="本次汇报工时"
            prop="reportWorkingHours"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ proxy.secondToHour(scoped.row.reportWorkingHours) || '0' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="本次汇报数量"
            prop="reportQty"
            align="center"
            width="120"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.reportQty || '-' }} 个</span>
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column min-width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="hanleDetail(scoped.row)"
                v-if="scoped.row.parentId == null"
                v-permission="{ id: 'DC_WORKING_HOUR_SERPORT_DETAIL', row: scoped.row }"
                >查看</el-button
              >
              <el-button
                type="danger"
                text
                v-permission="{ id: 'DC_WORKING_HOUR_SERPORT_DEL', row: scoped.row }"
                @click="handleRemove(scoped.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </div>
  <!-- 新增抽屉 -->
  <el-drawer
    size="1400"
    v-model="open"
    :title="title"
    destroy-on-close
    append-to-body
    @close="closeAdd"
  >
    <el-form
      class="form-container"
      ref="formRef"
      :model="formData"
      label-width="90px"
      :rules="rules"
    >
      <el-form-item class="mt-5" label="选择计划" prop="planId">
        <el-select
          class="select"
          v-model="formData.planId"
          placeholder="请选择排程计划"
          @change="handleChange"
          :remote-method="remoteMethod"
          reserve-keyword
          filterable
          remote
          clearable
        >
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="`${item.mtono}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.moPlanCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.materialCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.materialName}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <div class="table-container">
        <el-table :data="formData.planDetail" :span-method="objectSpanMethod" height="100%" border>
          <el-table-column prop="produceRouteName" label="工艺" align="center" width="100" />
          <el-table-column prop="billNumber" label="MO" align="center" width="200" />
          <el-table-column prop="materialName" label="物料" align="center" />
          <el-table-column prop="processTime" label="总工时" align="center" width="100">
            <template #default="scoped">
              {{ proxy.secondToHour(scoped.row.processTime) }}时
            </template>
          </el-table-column>
          <el-table-column prop="reportWorkingHours" label="已汇报工时" align="center" width="100">
            <template #default="scoped">
              {{ proxy.secondToHour(scoped.row.reportWorkingHours) || '0' }}时
            </template>
          </el-table-column>
          <el-table-column prop="number" label="总数量" align="center" width="80">
            <template #default="scoped"> {{ scoped.row.number }}个 </template>
          </el-table-column>
          <el-table-column prop="reportNumber" label="已汇报数量" align="center" width="100">
            <template #default="scoped"> {{ scoped.row.reportNumber }}个 </template>
          </el-table-column>
          <el-table-column prop="reportHour" label="本次汇报工时" align="center" width="140">
            <template #default="scoped">
              <el-input-number
                class="w-full"
                v-model="scoped.row.reportHour"
                controls-position="right"
                :min="0"
              >
                <template #suffix>
                  <span>时</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column
            label="本次汇报数量"
            prop="reportQty"
            align="center"
            width="160"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <el-input-number
                class="w-full"
                v-model="scoped.row.reportQty"
                controls-position="right"
                :min="0"
                :max="scoped.row.number - scoped.row.reportNumber"
              >
                <template #suffix>
                  <span>Max {{ scoped.row.number - scoped.row.reportNumber }} 个</span>
                </template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="isComplete" label="是否标记完成" align="center" width="200">
            <template #default="scoped">
              <el-switch
                v-model="formData.isComplete[scoped.row.produceRouteName]"
                size="large"
                active-text="完成"
                inactive-text="未完成"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" v-loading="loading" @click="submitFormProgress">确 定</el-button>
        <el-button v-loading="loading" @click="closeAdd">关闭</el-button>
      </span>
    </template>
  </el-drawer>
  <!-- 查看 -->
  <el-drawer
    size="1300"
    v-model="checkOpen"
    :title="title"
    destroy-on-close
    append-to-body
    @close="closeProgress"
  >
    <el-descriptions class="mt-3 mb-3" :column="4" v-for="(item, index) in detailErp" :key="index">
      <el-descriptions-item label="汇报单号">{{ item.billNo }}</el-descriptions-item>
      <el-descriptions-item label="汇报时间">{{ item.createTime }}</el-descriptions-item>
      <el-descriptions-item label="本次汇报工时">{{ item.workHours }}</el-descriptions-item>
    </el-descriptions>

    <div class="table-container">
      <el-table :data="planInfo" height="100%" border>
        <el-table-column prop="produceRouteName" label="工艺" align="center" width="100" />
        <el-table-column prop="billNumber" label="MO" align="center" width="200" />
        <el-table-column prop="materialName" label="物料" align="center" />
        <el-table-column prop="processTime" label="总工时" align="center" width="100">
          <template #default="scoped">
            {{ proxy.secondToHour(scoped.row.processTime) }}时
          </template>
        </el-table-column>
        <el-table-column prop="qty" label="总数量" align="center" width="100">
          <template #default="scoped"> {{ scoped.row.qty }}个 </template>
        </el-table-column>
        <el-table-column prop="reportHour" label="本次汇报工时" align="center" width="200">
          <template #default="scoped">
            {{ proxy.secondToHour(scoped.row.reportWorkingHours) }}时
          </template>
        </el-table-column>
        <el-table-column
          label="本次汇报数量"
          prop="reportQty"
          align="center"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <span>{{ scoped.row.reportQty || '-' }} 个</span>
          </template>
        </el-table-column>
        <el-table-column
          label="是否标记完成"
          prop="isComplete"
          align="center"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <span>{{ isCompleteEnum[scoped.row.isComplete] || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeProgress">关闭</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="WorkingHoursReport">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入

const { proxy } = getCurrentInstance();

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
  open: false,
  title: '新增汇报工时',
  selectValue: '',
  planInfo: [],
  options: [],
  checkOpen: false,
  detailErp: [],
  // 新增表单数据
  formData: {
    // 计划id
    planId: null,
    // 是否标记完成
    isComplete: {},
    // 计划详情
    planDetail: [],
  },
  // 新增表单校验规则
  rules: {
    planId: [{ required: true, message: '请选择计划', trigger: 'blur' }],
    isComplete: [{ required: true, message: '请选择是否标记完成', trigger: 'blur' }],
  },
  isCompleteEnum: {
    false: '未完成',
    true: '已完成',
  },
});

const {
  loading,
  queryParams,
  dataList,
  total,
  open,
  title,
  planInfo,
  options,
  selectValue,
  checkOpen,
  detailErp,
  formData,
  rules,
  isCompleteEnum,
} = toRefs(pageData);

onMounted(() => {
  getData();
  remoteMethod('init');
});

// 主列表数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.mps.workinghoursreport.list(queryParams.value);
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

// 新增
const handleSubmit = async () => {
  // 处理新增或编辑逻辑
  open.value = true;
  title.value = '新增';
};

// 处理删除
const handleRemove = row => {
  const ids = row.id;
  proxy
    .$confirm(`确认是否删除"${ids}"为的数据项？`)
    .then(() => {
      loading.value = true;
      return Api.mps.workinghoursreport.remove({ ids });
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

// 选择框改变
const handleChange = async () => {
  const res = await Api.mps.workinghoursreport.planDetail({ planId: formData.value.planId });
  const { code, data } = res.data;
  if (code == 200) {
    formData.value.planDetail = data;
    data.forEach(item => {
      formData.value.isComplete[item.produceRouteName] = item.isComplete;
    });
  }
};

// 远程搜索
const remoteMethod = async query => {
  if (query === 'init') {
    const res = await Api.mps.workinghoursreport.planList();
    const { code, data } = res.data;
    if (code === 200) {
      options.value = data;
    }
  } else if (query) {
    const params = {
      mtoNo: query,
    };
    const res = await Api.mps.workinghoursreport.planList(params);
    const { code, data } = res.data;
    if (code === 200) {
      options.value = data;
    }
  }
};

// 抽屉确定
const submitFormProgress = async () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      try {
        loading.value = true;
        const data = formData.value.planDetail.map(item => {
          return {
            ...item,
            reportHour: item.reportHour * 3600, // 将小时转为秒
            isComplete: formData.value.isComplete[item.produceRouteName] || false,
          };
        });
        const res = await Api.mps.workinghoursreport.reporSavetSubmit(data);
        const { code, msg } = res.data;
        if (code == 200) {
          closeAdd();
          getData();
          proxy.$message.success(msg);
        }
        loading.value = false;
        open.value = false;
      } catch (error) {
        loading.value = false;
      }
    }
  });
};

const detail = async id => {
  const res = await Api.mps.workinghoursreport.list({ parentId: id });
  const { code, data } = res.data;
  if (code == 200) {
    planInfo.value = data.records;
  }
};

// 查看
const hanleDetail = async row => {
  title.value = '查看';
  checkOpen.value = true;
  detail(row.id);
  const params = {
    moCode: row.billNumber,
    mtoNo: row.mtoNo,
  };
  const res = await Api.mps.workinghoursreport.queryDetailErp(params);
  const { code, data } = res.data;
  if (code === 200) {
    detailErp.value = data;
  }
};

// 关闭新增弹窗
const closeAdd = () => {
  open.value = false;
  formData.value = {
    planId: null,
    isComplete: {},
    planDetail: [],
  };
};

// 抽烟取消
const closeProgress = () => {
  checkOpen.value = false;
  selectValue.value = null;
  planInfo.value = [];
};

// 树状方法
const load = async (row, treeNode, resolve) => {
  const params = { ...queryParams.value, parentId: row.id };
  const res = await Api.mps.workinghoursreport.list(params);
  const { code, data } = res.data;
  if (code === 200) {
    resolve(data.records);
  }
};

const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};

const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0 || columnIndex === 9) {
    const currentId = formData.value.planDetail[rowIndex].produceRouteId;
    const prevId = rowIndex > 0 ? formData.value.planDetail[rowIndex - 1].produceRouteId : null;

    // 如果是第一行，或者ID与上一行不同
    if (rowIndex === 0 || currentId !== prevId) {
      // 计算当前ID的重复行数
      const count = formData.value.planDetail.filter(
        item => item.produceRouteId === currentId
      ).length;
      return {
        rowspan: count,
        colspan: 1,
      };
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.description {
  margin-bottom: 20px;
}
:deep(.el-descriptions__body) {
  background: #f5f5f5 !important;
}
.select {
  margin-bottom: 20px;
}

:deep(.el-descriptions__cell) {
  padding: 12px 0 !important;
}
.form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .table-container {
    flex: 1;
    overflow: hidden;
  }
}
</style>
