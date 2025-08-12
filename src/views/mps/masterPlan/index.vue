<template>
  <basic-container v-loading="loading">
    <!-- tab切换 -->
    <el-tabs v-model="activeName" @tab-change="handleClick">
      <el-tab-pane
        :label="tab.label"
        :name="tab.value"
        v-for="(tab, index) in tabs"
        :key="index"
      ></el-tab-pane>
    </el-tabs>
    <!-- tab结束 -->
    <!-- form -->
    <div class="search">
      <div class="search-left">
        <el-form
          class="search-container"
          :inline="true"
          :model="queryParams"
          ref="queryRef"
          @keyup.enter="handleQuery"
        >
          <el-form-item label="组织">
            <el-select v-model="queryParams.dcOrgCode" placeholder="请选择组织" clearable>
              <el-option
                v-for="item in ORG_LIST_CACHE"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="专案号">
            <el-input v-model="queryParams.projectCaseMo" placeholder="请输入专案号" clearable />
          </el-form-item>
          <el-form-item label="物料编码">
            <el-input v-model="queryParams.materialCode" placeholder="请输入物料编码" clearable />
          </el-form-item>
          <el-form-item label="物料名称">
            <el-input v-model="queryParams.materialName" placeholder="请输入物料名称" clearable />
          </el-form-item>
        </el-form>
      </div>
      <div class="search-right">
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </div>
    </div>
    <div class="operate-container">
      <el-button type="primary" v-permission="{ id: 'MO_SYN' }" @click="handleInsertMoInfo"
        >手动同步</el-button
      >
      <el-button type="primary" v-permission="{ id: 'ETD_FINISH' }" @click="doAction('ETD', {})"
        >ETD完成</el-button
      >
    </div>
    <!-- form结束 -->
    <!-- table -->
    <div class="table-container">
      <el-table
        :data="dataList"
        row-key="entryId"
        lazy
        :load="load"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          prop="projectCaseMo"
          label="专案号"
          align="center"
          width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="billNumber"
          label="单据编号"
          width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="billType"
          label="单据类型"
          width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="documentTime"
          label="单据日期"
          width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="completionTime"
          label="齐套日"
          width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="splitStatusCode"
          label="拆分状态"
          width="100"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-dict :options="Const.mps.splitStatus" :value="scoped.row.splitStatusCode" />
          </template>
        </el-table-column>
        <el-table-column
          prop="materialCode"
          label="物料编码"
          width="200"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="materialName"
          label="物料名称"
          min-width="260"
          show-overflow-tooltip
          align="center"
        />
        <!-- <el-table-column
          prop="specificationType"
          label="规格型号"
          width="100"
          align="center"
          show-overflow-tooltip
        /> -->
        <el-table-column prop="unit" label="单位" width="60" align="center" show-overflow-tooltip />
        <el-table-column prop="splitTotalQty" label="拆分数量" width="100" align="center">
          <template #default="scoped">
            <div>{{ scoped.row.splitQty }}/{{ scoped.row.splitTotalQty }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="businessStatus"
          label="业务状态"
          width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column fixed="right" label="操作" width="130" align="center">
          <template #default="scoped">
            <el-button
              type="primary"
              text
              @click="handleUpdata(scoped.row)"
              :disabled="scoped.row.splitStatusCode === '2' || scoped.row.businessStatus === '完工'"
              :class="{
                'disabled-button':
                  scoped.row.splitStatusCode === '2' || scoped.row.businessStatus === '完工',
              }"
              v-if="!scoped.row.parentEntryId"
              v-permission="{ id: 'MO_PLAN_TO_SPLIT', row: scoped.row }"
            >
              {{ scoped.row.parentEntryId }}
              分解计划
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- table结束 -->
    <!-- 分页 -->
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
    <splitPlanDrawer ref="splitPlanDrawerRef" @confirm="handleQuery" />
    <etdListDrawer ref="etdListDrawerRef" />
  </basic-container>
</template>
<script setup>
import { onMounted } from 'vue';
import Api from '@/api/index';
import Const from '@/const/index';
import splitPlanDrawer from './splitPlanDrawer.vue';
import etdListDrawer from './etdListDrawer.vue';

const { proxy } = getCurrentInstance();

// 数据字典
const { ORG_LIST_CACHE } = proxy.useCache([{ key: 'ORG_LIST_CACHE' }]);

const pageData = reactive({
  queryParams: {
    current: 1,
    size: 10,
    dcOrgCode: '100006',
    processCategory: undefined,
    // 物料编码
    materialCode: undefined,
    // 物料名称
    materialName: undefined,
    // 单据状态
    businessStatusCode: undefined,
    // 专案号
    projectCaseMo: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  open: false,
  activeName: '',
  tabs: [
    { label: '全部', value: '' },
    { label: '待拆分', value: '待拆分' },
    { label: '部分拆分', value: '部分拆分' },
    { label: '全部拆分', value: '全部拆分' },
  ],
  //    form表单单据状态下拉框数据
  formDataSplitStatus: [
    { label: '下达', value: 3 },
    { label: '开工', value: 4 },
  ],
  splitPlanDrawerRef: null,
  etdListDrawerRef: null,
});

const {
  queryParams,
  dataList,
  loading,
  total,
  activeName,
  tabs,
  formDataSplitStatus,
  splitPlanDrawerRef,
  etdListDrawerRef,
} = toRefs(pageData);
onMounted(() => {
  getData();
});

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const params = { ...queryParams.value, splitStatus: activeName.value };
    const res = await Api.mps.mo.getMoLazyList(params);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 搜索方法
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const doAction = action => {
  if (action === 'ETD') {
    etdListDrawerRef.value.openDialog();
  }
};

// 重置方法
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
    processCategory: undefined,
    // 物料编码
    materialCode: undefined,
    // 物料名称
    materialName: undefined,
    // 单据状态
    businessStatusCode: undefined,
    // 专案号
    projectCaseMo: undefined,
  };
  proxy.resetForm('queryRef');
  getData();
};

// 树状方法
const load = async (row, treeNode, resolve) => {
  const params = { parentEntryId: row.entryId };
  const res = await Api.mps.mo.getMoChildrenLazyList(params);
  const { code, data } = res.data;
  if (code === 200) {
    resolve(data);
  }
};

// tab切换方法
const handleClick = () => {
  queryParams.value.current = 1;
  getData();
};

const handleInsertMoInfo = async () => {
  loading.value = true;
  const res = await Api.mps.mo.postTestInsertMoInfo();
  const { code, msg } = res.data;
  if (code === 200) {
    getData();
    proxy.$message.success(msg);
  }
  loading.value = false;
};

// 分解计划
const handleUpdata = async row => {
  loading.value = true;
  const options = {
    row,
    infoApi: Api.mps.mo.getMoSplitPlan,
    submitApi: Api.mps.mo.postMoItemGenerateV2,
    params: { moId: row.id },
  };
  await splitPlanDrawerRef.value.openDrawer(options, false);
  loading.value = false;
};
</script>
<style lang="scss">
@use '@/styles/masterDrawer';
</style>
<style scoped lang="scss">
.disabled-button[disabled] {
  background-color: #f5f5f5;
  border-color: #dcdfe6;
  color: #ccc;
}
</style>
