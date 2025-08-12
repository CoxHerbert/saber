<!-- 阶段计划 -->
<template>
  <div class="app-container">
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <!-- 在此添加搜索项 -->
      <el-form-item label="阶段编码" prop="phaseCode">
        <el-input v-model="queryParams.phaseCode" placeholder="请输入阶段编码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button @click="handleClickPlan">排计划</el-button>
      </el-form-item>
    </el-form>
    <div class="body-container">
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          :row-style="getRowStyle"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="阶段编码" prop="phaseCode" align="center" show-overflow-tooltip />
          <el-table-column label="阶段名称" prop="phaseName" align="center" show-overflow-tooltip />
          <el-table-column label="开始时间" prop="startDate" align="center" show-overflow-tooltip />
          <el-table-column label="结束时间" prop="endDate" align="center" show-overflow-tooltip />
          <el-table-column
            label="阶段负责人"
            prop="personInCharge"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <dc-view
                v-model="scoped.row.personInCharge"
                objectName="user"
                showKey="realName"
              /> </template
          ></el-table-column>
          <el-table-column
            label="当前进度"
            prop="currentProgress"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column label="当前状态" prop="overdue" align="center" show-overflow-tooltip>
            <template #default="scoped">
              <el-tag :color="scoped.row.color" effect="dark" size="large" style="border: none">
                {{ scoped.row.labelText }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="超期原因"
            prop="overdueExplanation"
            align="center"
            show-overflow-tooltip
          />
          <!-- 在此添加其他列 -->
          <el-table-column width="250" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button link type="primary" icon="Edit" @click.stop="handleSubmit(scoped.row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleOnSite(scoped.row)"
                :disabled="!scoped.row.startDate && !scoped.row.endDate"
                >创建报工</el-button
              >
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
  <!-- 编辑 -->
  <el-drawer
    v-model="open"
    :title="title"
    destroy-on-close
    append-to-body
    size="800px"
    @close="closeDrawer"
  >
    <el-form ref="formRef" :model="formData" label-suffix=":" :rules="rules" label-width="100px">
      <el-form-item label="阶段编码" prop="phaseCode">
        <el-input v-model="formData.phaseCode" placeholder="请输入阶段编码" clearable disabled />
      </el-form-item>
      <el-form-item label="阶段名称" prop="phaseName">
        <el-input v-model="formData.phaseName" placeholder="请输入阶段名称" clearable disabled />
      </el-form-item>
      <el-form-item label="开始时间" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          placeholder="请选择开始时间"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endDate">
        <el-date-picker
          v-model="formData.endDate"
          type="date"
          placeholder="请选择结束时间"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="阶段负责人" prop="personInCharge">
        <dc-select-user
          v-model="formData.personInCharge"
          placeholder="请选择阶段负责人"
          returnType="object"
          :multiple="false"
          :multiple-limit="1"
          @click.stop
        />
      </el-form-item>
      <el-form-item label="当前进度" prop="currentProgress">
        <el-input-number v-model="formData.currentProgress" :min="0" :max="100" disabled />
      </el-form-item>
      <el-form-item label="超期原因" prop="overdueExplanation">
        <el-input
          v-model="formData.overdueExplanation"
          placeholder="请输入超期原因"
          clearable
          disabled
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
  <!-- 创建报工 -->
  <el-drawer
    v-model="onSiteOpen"
    title="创建报工"
    destroy-on-close
    append-to-body
    size="800px"
    @close="closeDrawer"
  >
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="onSiteFormData"
      :rules="rules"
      label-width="120px"
      status-icon
    >
      <div class="wrap-left-form">
        <el-form-item class="form-itme-width_100" label="当前阶段" id="phaseName" prop="phaseName">
          <el-input v-model="onSiteFormData.phaseName" disabled />
        </el-form-item>
        <el-form-item
          class="form-itme-width_100"
          label="阶段开始时间"
          id="startTime"
          prop="startTime"
        >
          <el-date-picker
            v-model="onSiteFormData.startTime"
            type="date"
            placeholder="请选择阶段开始时间"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="阶段结束时间" id="endTime" prop="endTime">
          <el-date-picker
            v-model="onSiteFormData.endTime"
            type="date"
            placeholder="请选择阶段结束时间"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            disabled
          />
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="当前进度" id="progress" prop="progress">
          <el-input-number v-model="onSiteFormData.progress" :min="min" :max="100">
            <template #suffix>
              <span>%</span>
            </template></el-input-number
          >
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="onSiteSubmitForm">提交</el-button>
        <el-button @click="closeDrawer"> 取消 </el-button>
      </div>
    </template>
  </el-drawer>

  <!-- 排计划 -->
  <el-drawer
    v-model="SchedulingOpen.drawer"
    size="40%"
    :title="SchedulingOpen.title"
    @close="closeScheduling"
  >
    <el-form ref="ruleForm" :model="SchedulingPlanForm" label-width="auto" class="mt-5">
      <div>
        <el-form-item
          v-for="(item, index) in findList"
          :key="index"
          :label="item.phaseName"
          class="form-item"
        >
          <dc-date-range v-model:startDate="item.startDate" v-model:endDate="item.endDate" />
        </el-form-item>
      </div>

      <!-- <el-form-item>
          <el-button @click="handleAdd">添加阶段</el-button>
        </el-form-item> -->
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="schedulingPlanSubmitForm">提交</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup name="ComponentName">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { deepClone } from '@/utils/util';

const route = useRoute();
const userinfo = computed(() => proxy.$store.getters.userInfo);

const { proxy } = getCurrentInstance();

const {} = proxy.useCache([]);

const props = defineProps({
  id: {
    type: String,
    default() {
      return '';
    },
  },
});

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
  open: false,
  onSiteOpen: false,
  formData: {},
  onSiteFormData: {},
  title: '',
  min: null,
  detailInfo: {},
  findList: [],
  SchedulingPlanForm: {
    startDate: null,
    endDate: null,
  },
  rules: {
    phaseCode: [{ required: true, message: '请输入', trigger: 'change' }],
    phaseName: [{ required: true, message: '请输入', trigger: 'change' }],
    startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    endDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
    // personInCharge: [{ required: true, message: '请选择阶段负责人', trigger: 'change' }],
    // currentProgress: [{ required: true, message: '请输入当前进度', trigger: 'change' }],
    startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
    progress: [{ required: true, message: '请输入当前进度', trigger: 'change' }],
  },
});

const {
  detailInfo,
  findList,
  loading,
  queryParams,
  dataList,
  total,
  open,
  formData,
  rules,
  title,
  onSiteOpen,
  onSiteFormData,
  min,
  SchedulingPlanForm,
} = toRefs(pageData);

onMounted(async () => {
  await getDetail();
  getFindScheduling();
  getData();
});

const SchedulingOpen = reactive({
  drawer: false,
  title: '排计划',
});

const closeScheduling = () => {
  SchedulingOpen.drawer = false;
};

const openScheduling = () => {
  SchedulingOpen.drawer = true;
};

const getDetail = async () => {
  const params = {
    id: props.id ? props.id : route.params.id,
  };

  const res = await Api.pdp.mmrPlanOrder.detail(params);
  const { code, data } = res.data;
  if (code == 200) {
    detailInfo.value = data;
    // setTimeout(() => {
    //   filteredData.value = Object.values(PROJECT_MAP_CACHE.value).filter(
    //     item => item.id === detailInfo.value.projectId
    //   );
    // }, 100);
  }
};

const getFindScheduling = async () => {
  const params = {
    planOrderId: props.id ? props.id : route.params.id,
    planOrderStatus: detailInfo.value.planOrderStatus,
  };

  const res = await Api.pdp.mmrPlanOrder.findScheduling(params);
  const { code, data } = res.data;
  if (code == 200) {
    findList.value = data;
  }
};

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.stagePlan.list({
      ...queryParams.value,
      orderId: props.id ? props.id : route.params.id,
    });
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

const getRowStyle = row => {
  return {
    height: '62px',
  };
};

// 处理新增或编辑逻辑
const handleSubmit = async row => {
  title.value = '新增';
  if (row?.id) {
    title.value = '编辑';
    formData.value = deepClone(row);
  }
  open.value = true;
};

// 关闭弹窗
const closeDrawer = () => {
  title.value = '';
  formData.value = {};
  open.value = false;
  onSiteFormData.value = {};
  onSiteOpen.value = false;
};

// 保存提交
const submitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        personInCharge:
          typeof formData.value.personInCharge === 'object'
            ? formData.value.personInCharge.id
            : formData.value.personInCharge,
      };
      const res = await Api.pdp.stagePlan.submit(form);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        getData();
        closeDrawer();
      }
    }
  });
};

// 处理删除
const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    })
    .catch(err => {});
};

// 点击行选中
const handleRowClick = (row, column, event) => {
  handleSubmit(row);
};

// 处理查询
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};

// 处理表格选中
const handleSelectionChange = () => {};

const handleOnSite = row => {
  onSiteOpen.value = true;
  min.value = row.currentProgress;
  const rows = {
    ...row,
    startTime: row.startDate,
    endTime: row.endDate,
    progress: row.currentProgress,
  };
  onSiteFormData.value = deepClone(rows);
};

const onSiteSubmitForm = () => {
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      const form = {
        orderId: props.id ? props.id : route.params.id,
        planOrderPhaseId: onSiteFormData.value.id,
        phaseId: onSiteFormData.value.phaseId,
        phaseCode: onSiteFormData.value.phaseCode,
        phaseName: onSiteFormData.value.phaseName,
        startTime: onSiteFormData.value.startTime,
        endTime: onSiteFormData.value.endTime,
        progress: onSiteFormData.value.progress,
        reportDate: proxy.$dayjs().format('YYYY-MM-DD HH:mm:ss'),
        reportUserId: userinfo.value.user_id,
      };
      const res = await Api.pdp.mmrPlanWhr.submit(form);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        getData();
        closeDrawer();
      }
    }
  });
};

/** 排计划 */
const handleClickPlan = () => {
  openScheduling();
};

/** 排计划取消 */
const cancel = () => {
  formData.value = {};
  SchedulingPlanForm.value = {};
  SchedulingOpen.drawer = false;
};

// 确定提交排计划
const schedulingPlanSubmitForm = async () => {
  proxy.$refs['ruleForm'].validate(async valid => {
    if (valid) {
      const params = {
        planOrderId: props.id ? props.id : route.params.id,
      };
      const res = await Api.pdp.mmrPlanOrderItem.SchedulingPlanSubmit(findList.value, params);
      const { code, msg } = res.data;
      if (code === 200) {
        SchedulingOpen.drawer = false;
        proxy.$message.success(msg);
        formData.value = {};
        SchedulingPlanForm.value = {};
        handleQuery();
      }
    }
  });
};
</script>

<style lang="scss" scopedd></style>
