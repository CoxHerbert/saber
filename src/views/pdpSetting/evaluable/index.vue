<template>
  <div class="app-container">
    <el-form class="search-container" :model="queryParams" ref="queryRef" :inline="true">
      <div class="search">
        <div class="search-left">
          <!-- 在此添加搜索项 -->
          <el-form-item label="评估项类型" prop="feaItemType">
            <el-select v-model="queryParams.feaItemType" placeholder="请选择评估项类型" clearable>
              <el-option
                :label="option.label"
                :value="option.value"
                v-for="(option, index) in DC_FEA_ITEM_TYPE"
                :key="index"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-right">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          icon="Plus"
          v-permission="{ id: 'EVALUABLE_ADD' }"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList">
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建人" width="150" prop="templateName" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column label="评估项类型" width="150" prop="sectorId" align="center">
            <template #default="scoped">
              <dc-dict type="text" :options="DC_FEA_ITEM_TYPE" :value="scoped.row.feaItemType" />
            </template>
          </el-table-column>
          <el-table-column label="评估问题" prop="categoryId" align="center">
            <template #default="scoped">
              {{ scoped.row.feaEvaluationProblem }}
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column width="240" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                v-permission="{ id: 'EVALUABLE_EDIT', row: scoped.row }"
                @click="handleSubmit(scoped.row)"
                >编辑
              </el-button>
              <el-button
                link
                type="primary"
                icon="Delete"
                v-permission="{ id: 'EVALUABLE_DEL', row: scoped.row }"
                @click="handleDelete(scoped.row)"
                >删除
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
    <submit ref="submitRef" @confirm="getData" />
  </div>
</template>

<script setup name="ComponentName">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import submit from './components/submit.vue';

const { proxy } = getCurrentInstance();
const router = useRouter();

// 缓存
const { DC_FEA_ITEM_TYPE } = proxy.useCache([{ key: 'DC_FEA_ITEM_TYPE' }]);

const pageData = reactive({
  loading: false,
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
});

const { loading, queryParams, dataList, total } = toRefs(pageData);

onMounted(() => {
  getData();
});

const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.evaluable.list(queryParams.value);
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

const handleSubmit = row => {
  // 处理新增或编辑逻辑
  proxy.getRef('submitRef').openDrawer(row);
};

const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.pdp.evaluable.remove({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    });
};

const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const resetQuery = () => {
  Object.assign(queryParams.value, {
    current: 1,
    size: 10,
  });
  proxy.resetForm('queryRef');
  getData();
};
</script>

<style lang="scss" scoped></style>
