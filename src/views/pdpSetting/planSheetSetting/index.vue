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
      <el-form-item label="阶段名称" prop="mmrPhaseName">
        <el-input v-model="queryParams.mmrPhaseName" placeholder="请输入阶段名称" clearable />
      </el-form-item>
      <el-form-item label="阶段编码" prop="mmrPhaseCode">
        <el-input v-model="queryParams.mmrPhaseCode" placeholder="请输入阶段编码" clearable />
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
          v-permission="{ id: 'DC_PLANSHEET_SETTING_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="阶段名称"
            prop="mmrPhaseName"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.mmrPhaseName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="阶段编码"
            prop="mmrPhaseCode"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.mmrPhaseCode || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="是否启用"
            prop="mmrPhaseEnable"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span
                ><el-switch
                  v-model="scoped.row.mmrPhaseEnable"
                  @change="handleMmrPhaseEnableChange(scoped.row)"
              /></span>
            </template>
          </el-table-column>
          <el-table-column
            label="是否可以时间重叠"
            prop="intervalsCanOverlap"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span
                ><el-switch
                  v-model="scoped.row.intervalsCanOverlap"
                  @change="handleMmrPhaseEnableChange(scoped.row)"
              /></span>
            </template>
          </el-table-column>
          <el-table-column
            label="是否模板"
            prop="templateEnable"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span
                ><el-switch
                  v-model="scoped.row.templateEnable"
                  @change="handleMmrPhaseEnableChange(scoped.row)"
              /></span>
            </template>
          </el-table-column>
          <el-table-column width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'DC_PLANSHEET_SETTING_EDIT', row: scoped.row }"
                @click="handleSubmit(scoped.row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                v-permission="{ id: 'DC_PLANSHEET_SETTING_DEL', row: scoped.row }"
                @click="handleDelete(scoped.row)"
                >删除</el-button
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
  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <div class="wrap">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="mt-5 custom-form"
      >
        <el-form-item label="阶段名称" prop="mmrPhaseName" class="form-itme-width_100">
          <el-input v-model="formData.mmrPhaseName" placeholder="请输入阶段名称" clearable />
        </el-form-item>
        <el-form-item label="阶段编码" prop="mmrPhaseCode" class="form-itme-width_100">
          <el-input
            v-model="formData.mmrPhaseCode"
            placeholder="请输入阶段编码"
            clearable
            disabled
          />
        </el-form-item>
        <el-form-item label="阶段类型" prop="phaseType" class="form-itme-width_100">
          <el-input v-model="formData.phaseType" placeholder="请输入阶段类型" clearable disabled />
        </el-form-item>
        <el-form-item label="排序" prop="phaseSort" class="form-itme-width_100">
          <el-input-number v-model="formData.phaseSort" :min="1" />
        </el-form-item>
        <el-form-item label="是否启用" prop="mmrPhaseEnable" class="form-itme-width_50">
          <el-switch v-model="formData.mmrPhaseEnable" />
        </el-form-item>
        <el-form-item label="是否时间重叠" prop="intervalsCanOverlap" class="form-itme-width_50">
          <el-switch v-model="formData.intervalsCanOverlap" />
        </el-form-item>
        <el-form-item label="是否模板" prop="templateEnable" class="form-itme-width_50">
          <el-switch v-model="formData.templateEnable" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="ComponentName">
import { reactive, toRefs, onMounted, getCurrentInstance, watch } from 'vue';
import Api from '@/api/index';
import { deepClone } from '@/utils/util';

const { proxy } = getCurrentInstance();

const {} = proxy.useCache([]);

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
  open: false,
  formData: {},
  rules: {
    mmrPhaseName: [{ required: true, message: '请输入阶段名称', trigger: 'change' }],
    mmrPhaseCode: [{ required: true, message: '请输入阶段编码', trigger: 'change' }],
    phaseType: [{ required: true, message: '请输入阶段类型', trigger: 'change' }],
  },
  title: '',
});

const { loading, queryParams, dataList, total, open, formData, rules, title } = toRefs(pageData);
const props = defineProps({
  mode: {
    type: String,
    default() {
      return '';
    },
  },
  List: {
    type: Object,
    default: {},
  },
  rowList: {
    type: Object,
    default: {},
  },
});
const emit = defineEmits(['confirm']);

onMounted(() => {
  if (!props.mode) {
    handleQuery();
  }
});

watch(
  () => props.List,
  () => {
    const time = setTimeout(() => {
      dataList.value = props.List;
      clearTimeout(time);
    });
  }
);

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.mmrPlanPhaseInfo.list(queryParams.value);
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

// 处理新增或编辑逻辑
const handleSubmit = async row => {
  title.value = '新增';
  formData.value.mmrPhaseEnable = true;
  formData.value.intervalsCanOverlap = true;
  formData.value.templateEnable = true;
  formData.value.mmrPhaseCode = props.rowList.categoryCode;
  formData.value.phaseType = props.rowList.categoryName;
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
};

// 保存提交
const submitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const from = {
        ...formData.value,
        phaseCategoryId: props.rowList.id,
      };
      const res = await Api.pdp.mmrPlanPhaseInfo.submit(from);
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        emit('confirm', props.rowList);
        closeDrawer();
      }
    }
  });
};

const handleMmrPhaseEnableChange = async row => {
  const res = await Api.pdp.mmrPlanPhaseInfo.submit(row);
  const { code } = res.data;
  if (code === 200) {
    proxy.$message({ type: 'success', message: '保存成功' });
    emit('confirm', props.rowList);
    closeDrawer();
  }
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
    .then(() => Api.pdp.mmrPlanPhaseInfo.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      emit('confirm', props.rowList);
    });
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
  emit('confirm', props.rowList);
};
</script>

<style lang="scss" scoped>
.colorCode {
  width: 100%;
  display: flex;
  height: 100%;
  justify-content: space-around;
  .colorCodeItem {
    width: 40px !important;
    height: 20px !important;
    border-radius: 4px;
  }
}
</style>
