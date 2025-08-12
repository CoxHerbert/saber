<template>
  <basic-container>
    <div class="content-warp page-delivery-start-index">
      <!-- 交付启动会 -->
      <div class="header">
        <div class="title">交付启动会</div>
        <div class="search-area">
          <!--   objectName="projectDelivered" -->
          <dc-select-dialog-v2
            objectName="pdpProject"
            returnType="string"
            title="创建交付启动会"
            :multiple="false"
            :multiple-limit="1"
            :params="{
              filterDelivery: true,
            }"
            @change="changeProject"
          >
            <template #search-items="{ queryParams }">
              <div class="dialog-search-box fix">
                <el-form-item label-width="100px" label="项目名称:">
                  <el-input
                    placeholder="请输入项目名称"
                    clearable
                    v-model="queryParams.projectName"
                  />
                </el-form-item>
                <el-form-item label-width="100px" label="项目编码:">
                  <el-input
                    placeholder="请输入项目编码"
                    clearable
                    v-model="queryParams.projectCode"
                  />
                </el-form-item>
                <!-- <el-form-item label-width="100px" label="station">
                            <el-input
                              v-model="queryParams.station"
                              placeholder="请输入station"
                              clearable
                            />
                          </el-form-item> -->
              </div>
            </template>
            <el-button type="primary" icon="Plus" v-permission="{ id: 'DC_PDP_PRO_START_ADD' }"
              >新增</el-button
            >
          </dc-select-dialog-v2>
          <!-- <dc-search-group :config="searchConfig" @search="handleSearch" /> -->
        </div>
      </div>
      <div class="action-banner">
        <el-form
          :model="queryParams"
          ref="queryRef"
          label-suffix=":"
          :inline="true"
          @keyup.enter="handleQuery"
        >
          <!-- 在此添加搜索项 -->
          <el-form-item label="项目名称" prop="projectId">
            <dc-select-dialog-v2
              v-model="queryParams.projectId"
              placeholder="请选择关联项目"
              objectName="pdpProject"
              type="input"
              returnType="object"
              :multiple="false"
              :multiple-limit="1"
              :initChangeable="true"
              :clearable="true"
              :params="{
                enabled: true,
              }"
            >
              <!-- 
              @iptTagDataUpdate="handleProjectChange"
              @change="hanleProjectConfig" -->
              <template #search-items="{ queryParams }">
                <div class="dialog-search-box">
                  <el-form-item label-width="100px" label="项目名称">
                    <el-input
                      placeholder="请输入项目名称"
                      clearable
                      v-model="queryParams.projectName"
                    />
                  </el-form-item>
                  <el-form-item label-width="100px" label="项目编码">
                    <el-input
                      placeholder="请输入项目编码"
                      clearable
                      v-model="queryParams.projectCode"
                    />
                  </el-form-item>
                  <!-- <el-form-item label-width="100px" label="station">
                            <el-input
                              v-model="queryParams.station"
                              placeholder="请输入station"
                              clearable
                            />
                          </el-form-item> -->
                </div>
              </template>
            </dc-select-dialog-v2>
            <!-- <dc-select-dialog
              v-model="queryParams.projectId"
              placeholder="请选择项目"
              objectName="project"
              type="input"
              returnType="string"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
            /> -->
          </el-form-item>
          <el-form-item label="创建人" prop="createUser">
            <dc-select-user
              v-model="queryParams.createUser"
              placeholder="请选择创建人"
              returnType="string"
              :multiple="false"
              :multiple-limit="1"
              @click.stop
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查找</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
          <template v-for="(col, i) in columns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :width="col.width"
            />
            <!-- 序号类型 -->
            <el-table-column
              v-else-if="col.type === 'index'"
              :key="'index' + i"
              label="序号"
              :width="col.width"
              :align="col.align ? col.align : 'center'"
            >
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <!-- 普通文字类型 -->
            <el-table-column
              v-else-if="col.type === 'rowText'"
              :key="'rowText' + i"
              :label="col.label"
              :min-width="col.width"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <span v-if="col.prop === 'remark'">{{ scoped.row.remark_ }}</span>
                <span v-else> {{ scoped.row[col.prop] || '-' }}</span>
              </template>
            </el-table-column>
            <!-- 人员类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :key="'dc-view' + i"
              :label="col.label"
              :min-width="col.width"
              :align="col.align ? col.align : 'center'"
              prop="purchaserId"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-view
                  v-model="scoped.row[col.prop]"
                  :objectName="col.objectName"
                  :showKey="col.showKey"
                />
              </template>
            </el-table-column>
            <!-- 字典类型 -->
            <el-table-column
              v-else-if="col.type === 'dict'"
              :key="'dict' + i"
              :label="col.label"
              :min-width="col.width"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-dict-key
                  :value="scoped.row[col.prop]"
                  :options="dictCache[col.dictKey].value"
                />
              </template>
            </el-table-column>
            <!-- 文件回显 -->
            <el-table-column
              v-else-if="col.type === 'dc-upload'"
              :key="'dc-upload' + i"
              :label="col.label"
              :width="col.width"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <component v-bind="col.props" v-model="scoped.row[col.prop]" :is="col.type" />
              </template>
            </el-table-column>
            <el-table-column
              v-else-if="col.type === 'actions'"
              :key="'option' + i"
              :fixed="col.fixed"
              :label="col.label"
              :width="col.width ? col.width : 180"
              :align="col.align ? col.align : 'center'"
            >
              <template #default="scoped">
                <el-button
                  v-for="(btn, j) in col.children"
                  :key="j"
                  link
                  type="primary"
                  v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row))"
                  v-permission="
                    !btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row))
                      ? { id: btn.permissionId, row: scoped.row }
                      : undefined
                  "
                  @click="doAction(btn.action, scoped)"
                  >{{ btn.label }}</el-button
                >
              </template>
            </el-table-column>
          </template>
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
<script setup name="DeliveryStart">
import { onMounted, ref } from 'vue';
import Api from '@/api/index';
import options from './utils';
import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance();
const router = useRouter();
const data = reactive({
  columns: options.columns,
  queryParams: {
    keyword: '',
    current: 1,
    size: 10,
  },
  batchDelete: [],
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
});

const dictCache = proxy.useCache([{ key: 'DC_WMS_OUT_TYPE_SCM' }]);

const { DC_WMS_OUT_TYPE_SCM } = dictCache;

const { batchDelete, queryParams, dataList, loading, total, columns } = toRefs(data);
const searchConfig = ref({
  paramType: {
    // keyword: {
    //   label: '默认',
    //   type: 'input',
    //   placeholder: '请输入关键词搜索',
    //   paramKey: 'keyword',
    // },
    outStockType: {
      label: '出库类型',
      type: 'select',
      options: DC_WMS_OUT_TYPE_SCM,
      labelKey: 'dictValue',
      placeholder: '请选择出库类型',
      valueKey: 'dictKey',
      paramKey: 'outStockType',
    },
    outStockCode: {
      label: '出库单号',
      type: 'input',
      placeholder: '请输入出库单号',
      paramKey: 'outStockCode',
    },
  },
});
onMounted(() => {
  getData();
});

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  switch (action) {
    case 'edit':
    case 'look':
      router.push({
        path: '/pdp/deliverystart/addorEdite',
        query: {
          id: row.id,
          type: action,
        },
      });
      return;
    case 'add':
      return;
    case 'delete':
      const ids = row.id;
      proxy
        .$confirm(`确定将“[${ids}]”数据删除?`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(() => Api.pdp.deliverystart.remove({ ids }))
        .then(() => {
          proxy.$message({
            type: 'success',
            message: '操作成功!',
          });
          getData();
        });
      return;
    default:
      console.warn('action not done', action);
  }
};

// 确认项目名称
const changeProject = async project => {
  const querySet = {
    projectCode: project.projectCode,
    projectName: project.projectName,
    projectId: project.id,
    quipmentDictId: project.quipmentDictId,
    projectDictId: project.projectDictId,
    industryDictId: project.industryDictId,
    opportunitiyId: project.opportunitiyId,
  };
  if (project.dcPdpFuncFieldList.length > 0) {
    project.dcPdpFuncFieldList.forEach(item => {
      querySet[item.filedKey] = item.fieldValue;
    });
  }
  // const res = await Api.pdp.deliverystart.createDelivered(params);
  // const { code, data } = res.data;
  // if (code == 200) {
  router.push({
    path: '/pdp/deliverystart/addorEdite',
    query: {
      type: 'add',
      from: 'list',
      projectId: project.id,
      // id: data.id,
      ...querySet,
    },
  });
  // }
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.pdp.deliverystart.list({
    ...dataparam,
    projectId: dataparam.projectId?.id || dataparam.projectId,
  });
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = res.data.data.records.map(item => {
      return {
        ...item,
        remark_: item.remark,
      };
    });
    // dataList.value = data.records;
    // .map(record => ({
    //   ...record,
    // }));
    // console.log('dataList.value 223');
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
.page-delivery-start-index {
  .search-area {
    :deep(.select-param) {
      width: 108px;
    }
  }
  .action-banner {
    padding: 8px 0;
  }
}
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
}

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
  .search-container {
    margin-top: 20px;
  }
}

:deep(.el-tabs__nav-wrap):after {
  height: 0px !important;
}

:deep(.el-tabs__item) {
  height: 52px !important;
}
.dialog-search-box {
  width: 900px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 30%;
    display: inline-flex;
    margin-right: 20px;
    .el-form-item__label {
      width: 80px !important;
    }

    .el-form-item__content {
      width: calc(100% - 100px);
    }
  }
}
</style>
