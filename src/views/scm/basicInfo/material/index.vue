<template>
  <basic-container>
    <div class="content-warp">
      <!-- <div class="header"> -->
      <!-- <div class="title">
          <el-tabs v-model="applyStatus" @tab-click="handleClick">
            <el-tab-pane label="全部" name=""> </el-tab-pane>
            <el-tab-pane
              :label="item.label"
              :name="item.dictKey"
              v-for="(item, index) in DC_FLAG_STATUS"
              :key="index"
            ></el-tab-pane>
          </el-tabs>
        </div>
        <div class="search-area">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增物料 </el-button>
          <el-button
            icon="el-icon-delete"
            plain
            @click="handleDelete"
            :disabled="batchDelete.length == 0"
            >批量删除</el-button
          >
        </div> -->
      <!-- </div> -->
      <div class="search">
        <div class="search-left">
          <el-form
            class="search-container"
            :model="queryParams"
            ref="queryRef"
            :inline="true"
            @keyup.enter="handleQuery"
          >
            <el-form-item label="物料名称" prop="materialName">
              <el-input
                type="text"
                v-model="queryParams.materialName"
                placeholder="请输入物料名称"
              ></el-input>
            </el-form-item>
            <el-form-item label="物料编码" prop="materialNumber">
              <el-input
                type="text"
                v-model="queryParams.materialNumber"
                placeholder="请输入物料编码"
              ></el-input>
            </el-form-item>

            <el-form-item label="规格型号" prop="specification">
              <el-input
                type="text"
                v-model="queryParams.specification"
                placeholder="请输入规格型号"
              ></el-input>
            </el-form-item>
            <el-form-item label="组织" prop="orgId">
              <el-select v-model="queryParams.orgId" placeholder="请选择组织" clearable>
                <el-option
                  v-for="(item, index) in SCMORG_LIST_CACHE"
                  :key="index"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="物料分类" prop="classifyDict">
              <el-select v-model="queryParams.classifyDict" placeholder="请选择物料分组" clearable>
                <el-option
                  v-for="(item, index) in DC_SCM_MATERIAL_CLASSIFY"
                  :key="index"
                  :value="item.dictKey"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="search-right">
          <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          size="small"
          @selection-change="handleSelectionChange"
          @row-dblclick="lookReport"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="物料分类" min-width="100px" align="center" prop="classifyDict">
            <template #default="scoped">
              <dc-dict-key
                color="#666"
                :options="DC_SCM_MATERIAL_CLASSIFY"
                :value="scoped.row.classifyDict"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="物料名称"
            min-width="120"
            prop="materialName"
            align="center"
            show-overflow-tooltip
          >
          </el-table-column>

          <el-table-column label="物料编码" min-width="110px" align="center" prop="materialNumber">
          </el-table-column>

          <!-- <el-table-column label="品牌" min-width="120px" align="center" prop="brand" /> -->

          <el-table-column label="规格型号" align="center" prop="specification" width="180px" />
          <el-table-column label="单位" align="center" prop="unitDict"> </el-table-column>
          <el-table-column label="物料属性" align="center" prop="attribute">
            <template #default="scoped">
              <dc-dict
                type="text"
                :options="DC_SCM_MATERIAL_ATTRIBUTE"
                :value="scoped.row.attribute"
              />
            </template>
          </el-table-column>

          <el-table-column label="组织" align="center" prop="orgId">
            <template #default="scoped">
              <dc-dict type="text" :options="SCMORG_LIST_CACHE" :value="scoped.row.orgId" />
            </template>
          </el-table-column>
          <el-table-column label="审核状态" width="100" align="center" prop="flagStatusDict">
            <template #default="scoped">
              <dc-dict-key :options="DC_FLAG_STATUS" :value="scoped.row.flagStatusDict" />
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                v-permission="{ id: 'MATERIAL_DETAIL', row: scoped.row }"
                @click="lookReport(scoped.row)"
                >查看</el-button
              >
              <el-button
                link
                type="primary"
                v-if="scoped.row.flagStatusDict == 0"
                v-permission="{ id: 'MATERIAL_EDIT', row: scoped.row }"
                @click="handleAdd(scoped.row)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        size="small"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';
import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  queryParams: {
    current: 1,
    size: 10,
  },
  batchDelete: [],
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  applyStatus: '',
});

const { batchDelete, queryParams, dataList, loading, total, applyStatus } = toRefs(data);
// 数据字典
const { DC_SCM_MATERIAL_CLASSIFY, SCMORG_LIST_CACHE, DC_FLAG_STATUS, DC_SCM_MATERIAL_ATTRIBUTE } =
  proxy.useCache([
    { key: 'DC_SCM_MATERIAL_CLASSIFY' },
    { key: 'SCMORG_LIST_CACHE' },
    { key: 'DC_FLAG_STATUS' },
    { key: 'DC_SCM_MATERIAL_ATTRIBUTE' },
  ]);
onMounted(() => {
  getData();
});

// 点击tab
const handleClick = e => {
  applyStatus.value = e.props.name;
  queryParams.value = {
    current: 1,
    size: 10,
    flagStatusDict: e.props.name ? e.props.name : null,
  };
  nextTick(() => {
    getData();
  });
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

/** 删除按钮操作 */
const handleDelete = () => {
  if (batchDelete.value.length === 0) {
    proxy.$message.error('请选择要删除的客户');
    return;
  }
  const ids = batchDelete.value.map(item => item.id).join(',');
  const message = `是否确认删除选中的数据项？`;
  handleDeleteCommon(ids, message, Api.scm.scmMaterial.remove);
};

// 删除and批量删除接口
const handleDeleteCommon = (ids, message, deleteApi) => {
  proxy
    .$confirm(message)
    .then(async () => {
      await deleteApi(ids); // 调用传入的删除接口
    })
    .then(() => {
      getData(); // 更新数据
      proxy.$message.success('删除成功');
    })
    .catch(() => {
      // 错误处理
    });
};

// 添加修改
const handleAdd = row => {
  router.push({
    path: '/scm/basicInfo/material/addorEdite',
    query: {
      id: row.id,
    },
  });
};

// 详情
const lookReport = row => {
  router.push({
    path: '/scm/basicInfo/material/addorEdite',
    query: {
      id: row.id,
      type: 'look',
    },
  });
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.scm.scmMaterial.getList(dataparam);
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
</script>

<style scoped lang="scss">
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
  .search {
    margin-top: 10px;
  }
}

:deep(.el-tabs__nav-wrap):after {
  height: 0px !important;
}

:deep(.el-tabs__item) {
  height: 52px !important;
}
</style>
