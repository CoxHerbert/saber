<template>
  <basic-container>
    <div class="content-warp page-tpm-list">
      <!-- TMP执行单 -->
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button
          icon="Plus"
          type="primary"
          v-permission="{
            id: 'TPM_ERP_ORDER_ADD',
          }"
          style="margin-right: 16px"
          @click="doAction('add')"
          >新增</el-button
        >
        <el-upload
          :http-request="uploadFile"
          :before-upload="beforeUpload"
          accept=".xls,.xlsx"
          :show-file-list="false"
          class="upload"
        >
          <el-button
            icon="upload"
            v-permission="{
              id: 'TPM_ERP_ORDER_IMP',
            }"
            >导入</el-button
          >
        </el-upload>
        <el-button
          type="info"
          style="margin-left: 16px"
          @click="downloadExcel"
          icon="Download"
          v-permission="{
            id: 'TPM_ERP_ORDER_IMP_TEMP',
          }"
          >下载导入模板</el-button
        >
        <!-- <el-button @click="doAction('batchSubmissionForSupervisorReview')"
          >批量指定审核主管</el-button
        >
        <el-button v-if="checkIsAuditShow" @click="doAction('batchAudit')">批量审核</el-button> -->

        <el-button
          @click="doAction('batchDelete')"
          icon="Delete"
          v-permission="{
            id: 'TPM_ERP_ORDER_BATCH_DEL',
          }"
          >批量删除</el-button
        >
        <el-button
          @click="doAction('batchExport')"
          icon="Download"
          v-permission="{
            id: 'TPM_ERP_ORDER_EXPORT',
          }"
          >导出</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="dataList"
          row-key="id"
          lazy
          :load="loadChildren"
          :tree-props="{ children: 'children', hasChildren: 'isLeaf' }"
          :checkStrictly="true"
          @select="handleSelect"
          @select-all="handleSelectAll"
          @selection-change="handleSelectionChange"
        >
          <template v-for="(col, i) in columns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :align="col.align"
              :width="col.width"
            />
            <!-- 序号类型 -->
            <el-table-column
              v-else-if="col.type === 'index'"
              :key="'index' + i"
              label="序号"
              :align="col.align"
              :width="col.width"
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
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{
                  [null, undefined, ''].includes(scoped.row[col.prop]) ? '-' : scoped.row[col.prop]
                }}
              </template>
            </el-table-column>
            <!-- 人员类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
              prop="purchaserId"
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
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-dict
                  v-if="pageData[col.dictKey]"
                  type="text"
                  :options="pageData[col.dictKey]"
                  :value="scoped.row[col.prop]"
                ></dc-dict>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              v-else-if="col.type === 'actions'"
              :key="'option' + i"
              :fixed="col.fixed"
              :label="col.label"
              :width="col.width ? col.width : 180"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
            >
              <template #default="scoped">
                <el-button
                  v-for="(btn, j) in col.children"
                  :key="j"
                  link
                  v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                  type="primary"
                  @click="doAction(btn.action, scoped)"
                  v-permission="
                    !btn.showFunc || (btn.showFunc && btn.showFunc(scoped))
                      ? {
                          id: btn.permissionId,
                          row: scoped.row,
                        }
                      : undefined
                  "
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
<script setup name="Productiongroup">
import { onMounted, ref } from 'vue';
// import store from '@/store/index';
import NProgress from 'nprogress';
import Api from '@/api/index';
import getOptions from './utils';
import { useRouter } from 'vue-router';
import { exportBlob } from '@/api/common';
import { downloadXls } from '@/utils/util';
import dayjs from 'dayjs';
// import tpmDetail from './tpm-detail/index.vue';
// import addOrEdit from './add-or-edit/add.vue';

const options = getOptions(true);
const router = useRouter();

// const drawerDetail = ref(null);
// const drawerAddOrEdit = ref(null);
const { proxy } = getCurrentInstance();
const pageData = reactive({
  // mode: 'setAuditUser',
  // auditDialogVisible: false,
  // auditFormData: {
  //   isPass: '',
  //   selectedSupervisor: '',
  // },
  roleIdOptions: [],
  columns: options.columns,
  queryParams: {
    keyword: '',
    topType: '全部',
    pageNo: 1,
    current: 1,
    size: 10,
  },
  batchSelectRows: [],
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {},
  applyStatus: '',
  DC_BILL_TYPE: [],
  DC_ERP_ORDER_STATUS: [],
});

const {
  batchSelectRows,
  queryParams,
  dataList,
  loading,
  total,
  columns,
  DC_BILL_TYPE,
  DC_ERP_ORDER_STATUS,
  // auditDialogVisible,
  // auditFormData,
  roleIdOptions,
  // mode,
} = toRefs(pageData);

function getParamType(col) {
  if (col.searchProps.is === 'dict') {
    return {
      label: col.label,
      type: 'select',
      withGroup: true,
      options: pageData[col.dictKey],
      labelKey: 'dictValue',
      placeholder: `请选择${col.label}`,
      valueKey: 'dictValue', // 'id', // 'dictKey',
      paramKey: col.prop,
    };
  } else if (col.searchProps.is === 'input') {
    return {
      label: col.label,
      type: 'input',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
    };
  } else if (col.searchProps.is === 'dc-date-range') {
    return {
      label: col.label,
      type: 'dc-date-range',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
      // 注意这里使用的是ref类型参数
      clear(queryParams) {
        queryParams.value.startTime = null;
        queryParams.value.endTime = null;
      },
      getLabelValue(queryParams) {
        if (queryParams.startTime && queryParams.endTime) {
          return `${col.label}：${queryParams.startTime} 至 ${queryParams.endTime}`;
        }
        return null;
      },
    };
  } else if (col.searchProps.is === 'dc-select-user') {
    return {
      label: col.label,
      type: 'dc-select-user',
      placeholder: `请选择${col.label}`,
      paramKey: col.prop,
      objectName: 'user',
      props: {
        multipleLimit: 1,
        returnType: 'string',
      },
    };
  } else {
    console.error('undefined type', col.type, col);
    return {
      label: col.label,
      type: 'input',
      placeholder: `请输入${col.label}`,
      paramKey: col.prop,
    };
  }
}

const tabConfig = {
  prop: 'topType',
  items: [
    { label: '全部', value: '全部' },
    { label: '待处理', value: '待处理' },
    { label: '我的', value: '我的' },
    { label: '已处理', value: '已处理' },
  ],
};

const searchConfig = ref({
  tabConfig,
});

const getDictData = async () => {
  const res = await proxy.useAsyncCache([{ key: 'DC_BILL_TYPE' }, { key: 'DC_ERP_ORDER_STATUS' }]);
  DC_BILL_TYPE.value = res?.value?.DC_BILL_TYPE;
  DC_ERP_ORDER_STATUS.value = res?.value?.DC_ERP_ORDER_STATUS;
};

const initSearchConfig = () => {
  searchConfig.value = {
    resetExcludeKeys: ['page', 'current', 'topType'],
    tabConfig,
    searchItemConfig: {
      paramType: options.columns
        .filter(item => item.search)
        .sort((a, b) => a.searchIndex < b.searchIndex)
        .reduce((rec, item) => {
          rec[item.prop] = getParamType(item);
          return rec;
        }, {}),
    },
  };
};

onMounted(async () => {
  await getDictData();
  initSearchConfig();
  getAuditUsers();
  getData();
});

const tableRef = ref(null);

// const checkIsAuditShow = computed(() => {
//   if (roleIdOptions.value?.length < 1) {
//     return false;
//   }
//   const userInfo = store.getters.userInfo;
//   const isAdmin = userInfo?.role_id?.split(',').includes('1123598816738675201');
//   const find = roleIdOptions.value.find(u => u.id === userInfo?.user_id);
//   return isAdmin || !!find;
// });

const handleSelect = (selection, row) => {
  if (row.children) {
    toggleChildrenSelection(row, selection.includes(row));
  }
};

const toggleChildrenSelection = (parent, isSelected) => {
  parent.children.forEach(child => {
    // 更新子行选中状态
    tableRef.value?.toggleRowSelection(child, isSelected);
    // 递归处理子节点的子节点
    if (child.children) toggleChildrenSelection(child, isSelected);
  });
};

const handleSelectAll = selection => {
  // 全选时处理所有顶层行及其子节点
  selection.forEach(row => {
    if (row.children) toggleChildrenSelection(row, true);
  });
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchSelectRows.value = selection;
};

const deleteData = ids => {
  handleDeleteCommon(
    ids,
    `确定要删除数据id为[${ids.join(',')}]的数据项？`,
    Api.pdp.dcErporder.neDelete
  );
};

// 删除and批量删除接口
const handleDeleteCommon = (ids, message, deleteApi) => {
  proxy
    .$confirm(message)
    .then(async () => {
      await deleteApi({
        ids: ids.join(','),
      }); // 调用传入的删除接口
    })
    .then(() => {
      getData(); // 更新数据
      proxy.$message.success('删除成功');
    })
    .catch(() => {
      // 错误处理
    });
};

async function blobToJson(blob) {
  try {
    const text = await blob.text(); // 读取 Blob 为文本
    return JSON.parse(text); // 解析为 JSON 对象
  } catch (err) {
    console.error(' 转换失败:', err);
    throw err; // 或返回 null/默认值
  }
}

const exportData = data => {
  proxy
    .$confirm('是否导出执行单数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      NProgress.start();
      exportBlob(`/blade-bip//dc/erp/order/ne/excel-export?ids=${data.join(',')}`).then(
        async res => {
          if (res.data.type === 'application/json') {
            const dataSet = await blobToJson(res.data);
            proxy.$message.error(dataSet?.msg || '导出失败');
          } else {
            downloadXls(res.data, `执行单数据表${dayjs().format('YYYY-MM-DD')}.xlsx`);
          }
          NProgress.done();
        }
      );
    });
};

const auditCurrentRows = ref([]);

/** 操作 */
const doAction = (action, scope = {}) => {
  const { row } = scope;
  // if (action === 'audit') {
  //   auditCurrentRows.value = [row];
  //   mode.value = 'audit';
  //   auditDialogVisible.value = true;
  // } else
  if (action === 'add') {
    router.push({
      path: '/pdp/execution/add',
      query: {
        list: 'tpm',
        parentMenuId: '1913143624737734658',
      },
    });
  } else if (action === 'edit') {
    router.push({
      path: '/pdp/execution/edit',
      query: {
        list: 'tpm',
        id: row.mainId ? row.mainId : row.id,
        parentMenuId: '1913143624737734658',
      },
    });
  } else if (action === 'retrieve') {
    proxy
      .$confirm(`是否将任务单编号为‘${scope.row.taskNumber}’取回?`)
      .then(() => {
        loading.value = true;
        Api.pdp.dcErporder
          .retrieveOrder({ id: scope.row.id })
          .then(res => {
            const { code } = res.data;
            if (code === 200) {
              getData();
              proxy.$message.success('操作成功');
            }
            loading.value = false;
          })
          .catch(e => {
            loading.value = false;
          });
      })
      .catch(err => {});
  }
  // else if (action === 'batchSubmissionForSupervisorReview') {
  //   if (batchSelectRows.value.length < 1) {
  //     proxy.$message.error('请先选择指定的执行单');
  //     return;
  //   }
  //   if (!batchSelectRows.value.every(item => item.dcErpOrderStatus === '1876789752111362049')) {
  //     proxy.$message.error('请确保所选单据都为“TPM提交”状态');
  //     return;
  //   }
  //   auditCurrentRows.value = [...batchSelectRows.value];
  //   mode.value = 'setAuditUser';
  //   auditDialogVisible.value = true;
  // } else if (action === 'batchAudit') {
  //   if (batchSelectRows.value.length < 1) {
  //     proxy.$message.error('请先选择指定的执行单');
  //     return;
  //   }
  //   if (!batchSelectRows.value.every(item => item.dcErpOrderStatus === '1876789821522898946')) {
  //     proxy.$message.error('请确保所选单据都为“审核主管”状态');
  //     return;
  //   }
  //   auditCurrentRows.value = [...batchSelectRows.value];
  //   mode.value = 'audit';
  //   auditDialogVisible.value = true;
  // }
  else if (action === 'batchDelete') {
    if (batchSelectRows.value.length < 1) {
      proxy.$message.error('请先勾选要删除的数据');
      return;
    }
    deleteData(batchSelectRows.value.map(row => row.id));
  } else if (action === 'batchExport') {
    if (batchSelectRows.value.length < 1) {
      proxy.$message.error('请先勾选要导出的数据');
      return;
    }
    exportData(batchSelectRows.value.map(row => row.id));
  } else if (action === 'detail') {
    router.push({
      path: '/pdp/execution/detail',
      list: 'tpm',
      query: {
        id: row.mainId ? row.mainId : row.id,
        parentMenuId: '1913143624737734658',
      },
    });
  }
  // else if (action === 'setTpmHeaderOperatorId') {
  //   auditCurrentRows.value = [row];
  //   mode.value = 'setAuditUser';
  //   auditDialogVisible.value = true;
  // }
  else if (action === 'delete') {
    deleteData([scope.row.id]);
  }
};

// const formAudit = ref(null);
// const audit = formData => {
//   formAudit.value.validate(async valid => {
//     if (valid) {
//       const formDataSend = (auditCurrentRows.value || []).reduce((rec, item) => {
//         rec.push({
//           ...item,
//           causeOfRejection: formData.isPass === '2' ? formData.causeOfRejection : '',
//         });
//         return rec;
//       }, []);

//       const action =
//         formData.isPass === '2' ? Api.pdp.dcErporder.neReject : Api.pdp.dcErporder.nePass;

//       const res = await action(formDataSend);
//       const { code } = res.data;
//       if (code === 200) {
//         formAudit.value.resetFields();
//         auditDialogVisible.value = false;
//         handleQuery();
//       }
//     }
//   });
// };
// const confirmReject = uId => {
//   formAudit.value.validate(async valid => {
//     if (valid) {
//       const formData = (auditCurrentRows.value || []).reduce((rec, item) => {
//         rec.push({
//           ...item,
//           tpmHeaderOperatorId: uId,
//         });
//         return rec;
//       }, []);

//       const res = await Api.pdp.dcErporder.nePass(formData);
//       const { code, data } = res.data;
//       if (code === 200) {
//         formAudit.value.resetFields();
//         auditDialogVisible.value = false;
//         handleQuery();
//       }
//     }
//   });
// };

/** 搜索按钮操作 */
const handleSearch = params => {
  queryParams.value = {
    ...queryParams.value,
    ...params,
  };
  getData();
};

/** 重置 */
const handleReset = () => {
  getData();
};

// 树状方法
const loadChildren = async (row, treeNode, resolve) => {
  const res = await Api.pdp.dcErporder.neList({
    mainId: row.id,
    current: 1,
    size: 100,
  });
  const { code, data } = res.data;
  if (code === 200) {
    row.children = data.records;
    resolve(data.records);
  }
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value);
  const res = await Api.pdp.dcErporder.neList(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    const listData = data.records
      .filter(row => !row.mainId)
      .map(row => {
        return {
          ...row,
          hasChildren: true,
          children: [],
        };
      });
    dataList.value = listData;
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

const getAuditUsers = async () => {
  const res = await Api.pdp.dcErporder.getAuditUsers({
    roleId: '1877174804015386626',
  });
  const { code, data } = res.data;
  if (code === 200) {
    roleIdOptions.value = data;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const beforeUpload = file => {
  const isExcel =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    // 使用 Element Plus 的消息提示
    proxy.$message.error('只能上传 Excel 文件!');
  }
  return isExcel;
};

const uploadFile = async fileObj => {
  const formData = new FormData();
  formData.append('file', fileObj.file);
  try {
    const response = await axios.post(
      '/blade-bip/dc/erp/order/ne/import-plan-order-template',
      formData
    );

    if (response.data.code === 200) {
      proxy.$message.success('导入成功！');
      getData();
    } else {
      proxy.$message.error(response.data.message || '导入失败');
    }
  } catch (error) {
    console.error('导入失败', error);
    proxy.$message.error('导入失败，请稍后重试');
  }
};

const downloadExcel = () => {
  // 文件的 HTTP 链接
  const excelUrl =
    'https://static.eastwinbip.com/static/%E6%89%A7%E8%A1%8C%E5%8D%95%E6%A8%A1%E6%9D%BF.xlsx';
  // 创建一个 a 标签用于下载
  const link = document.createElement('a');
  link.href = excelUrl;
  link.download = 'example.xlsx'; // 自定义下载文件名

  // 将 a 标签添加到文档并触发点击
  document.body.appendChild(link);
  link.click();

  // 移除 a 标签
  document.body.removeChild(link);
};
</script>

<style lang="scss" scoped>
.page-tpm-list {
  .action-banner {
    padding: 8px 0;
    display: flex;
    flex-flow: row wrap;
    width: 100%;
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
      padding-top: 6px;
      padding-bottom: 0;
    }
  }
  .search-container {
    margin-top: 20px;
  }
}
</style>
