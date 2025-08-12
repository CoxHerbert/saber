<template>
  <basic-container>
    <div class="content-warp">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="resetQuery"
          @search="handleQuery"
        ></dc-search>
      </div>

      <div class="toolbar">
        <el-button
          type="primary"
          icon="el-icon-plus"
          v-permission="{ id: 'SUPPLIER_ADD' }"
          @click="handleAdd"
          >新增供应商
        </el-button>
        <el-button
          icon="el-icon-delete"
          plain
          v-permission="{ id: 'SUPPLIER_BATCH_DEL' }"
          @click="handleDelete"
          :disabled="batchDelete.length == 0"
          >批量删除</el-button
        >
      </div>

      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          @selection-change="handleSelectionChange"
          @row-dblclick="lookReport"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="供应商名称"
            width="180"
            prop="supplierName"
            align="center"
            show-overflow-tooltip
          >
          </el-table-column>
          <el-table-column label="组织" align="center" prop="orgId">
            <template #default="scoped">
              <dc-dict type="text" :options="SCMORG_LIST_CACHE" :value="scoped.row.orgId" />
            </template>
          </el-table-column>
          <el-table-column label="审核状态" width="160" align="center" prop="flagStatusDict">
            <template #default="scoped">
              <dc-dict-key :options="DC_FLAG_STATUS" :value="scoped.row.flagStatusDict" />
            </template>
          </el-table-column>
          <el-table-column label="供应商编码" min-width="110px" align="center" prop="supplierNo">
          </el-table-column>
          <el-table-column
            label="供应商分类"
            min-width="110px"
            align="center"
            prop="supplierClassifyDict"
          >
            <template #default="scoped">
              <dc-dict-key :value="scoped.row.supplierClassifyDict" :options="DC_SCM_SUPPLIER" />
            </template>
          </el-table-column>
          <el-table-column min-width="120" label="签约开始日期" align="center" prop="startDate">
            <template #default="scoped">
              {{ scoped.row.startDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="签约结束日期" min-width="120px" align="center" prop="endDate">
            <template #default="scoped">
              {{ scoped.row.endDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="结算方式" align="center" prop="paytermsDict" width="100px">
            <template #default="scoped">
              <dc-dict-key :options="DC_SUPPLIER_PAYTERMS" :value="scoped.row.paytermsDict" />
            </template>
          </el-table-column>
          <el-table-column label="供应商地址" align="center" prop="supplierAddress" width="100px">
            <template #default="scoped">
              {{ scoped.row.supplierAddress || '-' }}
            </template>
          </el-table-column>
          <el-table-column min-width="100px" label="合同附件" align="center" prop="contractFileId">
            <template #default="scoped">
              <span class="fileIdflex">
                <dc-upload
                  v-model="scoped.row.contractFileId"
                  :limit="3"
                  :isUpload="false"
                  :isRemove="false"
                  :targetType="Const.targetType.CUSTOMER"
              /></span>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                v-permission="{ id: 'SUPPLIER_DETAIL', row: scoped.row }"
                @click="lookReport(scoped.row)"
                >查看</el-button
              >
              <el-button
                link
                type="primary"
                v-if="scoped.row.flagStatusDict == 0"
                v-permission="{ id: 'SUPPLIER_EDIT', row: scoped.row }"
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
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>
  </basic-container>
</template>
<script setup name="Productiongroup">
import { computed, onMounted } from 'vue';
import Const from '@/const';
import Api from '@/api/index';
import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  queryParams: {
    current: 1,
    size: 10,
    flagStatusDict: '',
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
const { SCMORG_LIST_CACHE, DC_FLAG_STATUS, DC_SUPPLIER_PAYTERMS, DC_SCM_SUPPLIER } = proxy.useCache(
  [
    { key: 'SCMORG_LIST_CACHE' },
    { key: 'DC_FLAG_STATUS' },
    { key: 'DC_SUPPLIER_PAYTERMS' },
    { key: 'DC_SCM_SUPPLIER' },
  ]
);
onMounted(() => {
  getData();
});

const searchConfig = computed(() => {
  return {
    resetExcludeKeys: ['page', 'current', 'flagStatusDict'],
    tabConfig: {
      prop: 'flagStatusDict',
      items: [
        {
          label: '全部',
          value: '',
        },
        ...DC_FLAG_STATUS.value?.map(item => {
          return {
            label: item.dictValue,
            value: item.dictKey,
          };
        }),
      ],
    },
    searchItemConfig: {
      paramType: {
        supplierName: {
          paramKey: 'supplierName',
          type: 'input',
          label: '供应商名称',
          props: {
            placeholder: '请输入供应商名称',
          },
        },
        orgId: {
          paramKey: 'orgId',
          type: 'select',
          label: '组织',
          options: SCMORG_LIST_CACHE.value,
        },
        paytermsDict: {
          paramKey: 'paytermsDict',
          type: 'select',
          label: '结算方式',
          options: DC_SUPPLIER_PAYTERMS.value,
          labelKey: 'dictValue',
          valueKey: 'dictKey',
        },
      },
    },
  };
});

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
  handleDeleteCommon(ids, message, Api.scm.supplier.remove);
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
    path: '/scm/basicInfo/supplier/addorEdite',
    query: {
      id: row.id,
    },
  });
};

// 详情
const lookReport = row => {
  router.push({
    path: '/scm/basicInfo/supplier/addorEdite',
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
  const res = await Api.scm.supplier.getList(dataparam);
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
    flagStatusDict: '',
  };
  getData();
};
</script>

<style scoped lang="scss">
.fileIdflex {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  :deep(.file-list) {
    display: flex;
    justify-content: center;
  }
}

.search {
  margin-top: 10px;
}

:deep(.el-card__body) {
  padding-top: 0px;
  .content-warp {
    padding: 0px;
    position: relative;
    .header {
      padding-top: 10px;
    }
    .toolbar {
      padding: 10px 0;
    }
  }
}
</style>
