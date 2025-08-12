<template>
  <div class="app-container">
    <div class="header-wrapper" :class="dataList.length == 0 ? 'nodata-height' : ''">
      <div class="title">
        <img
          src="../../../../../public/img/back.png"
          alt=""
          class="back-img"
          @click="$router.go(-1)"
        />编辑配置
      </div>

      <div class="operate-container">
        <el-button type="primary" @click="doAction('submit')">保存</el-button>

        <el-button
          icon="el-icon-delete"
          plain
          @click="handleDelete"
          :disabled="multipleSelection.length == 0"
          >批量删除</el-button
        >
        <el-button icon="CirclePlus" @click="doAction('add')">新增检查项</el-button>
      </div>
      <el-form class="search-container" ref="ruleFormRef" :rules="rules" :model="formData">
        <el-form-item class="form-itme-width" label="类别" prop="category">
          <el-select v-model="formData.category" placeholder="请选择类别">
            <el-option
              v-for="(item, index) in DC_INSPECTION_CLASS"
              :key="index"
              :value="item.label"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="form-itme-width" label="类型">
          <el-select
            v-model="formData.checkType"
            placeholder="请选择类型"
            @change="handleModeChange"
          >
            <el-option
              v-for="(option, i) in DC_SIP_CHECK_TYPE"
              :key="i"
              :value="option.dictKey"
              :label="option.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="formData.checkType !== 'DC_SIP_CHECK_TYPE_MR'"
          :label="DC_SIP_CHECK_TYPE_ENUM[formData.checkType]"
          style="width: 400px"
          prop="materialNumberCollection"
        >
          <wf-select-dialog
            v-if="formData.checkType === 'DC_SIP_CHECK_TYPE_WL'"
            :modelValue="formData.materialIdCollection"
            objectName="SnCheckMaterial"
            placeholder="请选择物料"
            :multiple="true"
            masterKey="fnumber"
            showKey="fnumber"
            :query="{
              fuseorgid: 100006,
            }"
            @change="changeMaterial"
          >
          </wf-select-dialog>
          <wf-select-dialog
            v-else-if="formData.checkType === 'DC_SIP_CHECK_TYPE_ZA'"
            :modelValue="formData.materialIdCollection"
            placeholder="请选择专案"
            objectName="CompleteMtoNo"
            masterKey="billNo"
            showKey="billNo"
            :query="{
              fuseorgid: 100006,
              currentPage: null,
              pageSizeName: null,
            }"
            @change="changeMaterial"
            :multiple="true"
            :multiple-limit="100"
          >
          </wf-select-dialog>
          <el-select
            v-if="formData.checkType === 'DC_SIP_CHECK_TYPE_BS'"
            v-model="formData.materialNumberCollection"
            placeholder="请选择标识"
          >
            <el-option
              v-for="(option, i) in DC_SIP_CHECK_ITEM"
              :key="i"
              :value="option.dictKey"
              :label="option.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="noData-wrapper" v-if="dataList.length == 0">
        <img src="../../../../../public/img/frame@2x.png" alt="" class="img" />
        <p class="tip">暂无信息，请新增检查项</p>
      </div>
    </div>
    <div class="content-warp" v-if="dataList.length > 0">
      <div class="table-container">
        <el-table
          height="100%"
          v-loading="loading"
          :data="dataList"
          :show-header="false"
          @row-click="handleRowClick"
          :row-class-name="tableRowClassName"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column label="序号" type="checkCategoryDict" width="150px">
            <template #default="scoped">
              <div
                class="tag"
                :class="scoped.row.checkCategoryDict == '功能验证' ? 'green' : 'purple'"
              >
                {{ scoped.row.checkCategoryDict }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="名称" show-overflow-tooltip prop="checkListName" />
          <el-table-column label="操作" width="160" fixed="right" align="right">
            <template #default="scoped">
              <el-button link type="primary" @click="doAction('upgrade', scoped)">升版</el-button>
              <el-button icon="el-icon-edit" link type="primary" @click="doAction('edit', scoped)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="report-info-wrapper">
        <el-scrollbar height="100%">
          <div class="scroll-content">
            <div class="group-box" v-for="(item, index) in selectedRow.oldSipEntrys" :key="index">
              <div class="group-box_header">
                <div class="name">{{ item.checkListName }}</div>
                <div class="group-box-right-box">
                  <span class="right-title-uptate-time"
                    >由 &nbsp;<dc-view v-model="item.updateUser" objectName="user"></dc-view
                  ></span>
                  <span class="right-title-uptate-time"
                    >于&nbsp;{{ item.updateTime }} 修改&nbsp;</span
                  ><span class="version">版本 {{ item.version }}</span>
                </div>
              </div>

              <div class="report-title" v-if="item.pictureId">图片示例</div>
              <div class="imgsList" v-if="item.pictureId">
                <dc-upload-img v-model="item.pictureId" disabled />
              </div>
              <div class="report-title">检查项</div>
              <el-table v-loading="loading" :data="item.sipEntryItems" class="select-table">
                <el-table-column label="序号" type="index" width="60px" align="center">
                  <template #default="scoped">
                    <span>{{ scoped.$index + 1 }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="检查项" prop="inspectionItem" align="center">
                  <template #default="scoped">
                    <span>{{ scoped.row.inspectionItem || '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="检测方法&标准" prop="method" width="140" align="center"
                  ><template #default="scoped">
                    <span>{{ scoped.row.method || '-' }}</span>
                  </template></el-table-column
                >
                <el-table-column label="单位" prop="measureUnit" align="center" width="60"
                  ><template #default="scoped">
                    <span>{{ scoped.row.measureUnit || '-' }}</span>
                  </template></el-table-column
                >
                <el-table-column label="标准值" prop="measureStandard" align="center" width="80"
                  ><template #default="scoped">
                    <span>{{ scoped.row.measureStandard || '-' }}</span>
                  </template></el-table-column
                >
                <el-table-column label="上限" prop="measureUpper" align="center" width="60"
                  ><template #default="scoped">
                    <span>{{ scoped.row.measureUpper || '-' }}</span>
                  </template></el-table-column
                >
                <el-table-column label="下限" prop="measureLower" align="center" width="60"
                  ><template #default="scoped">
                    <span>{{ scoped.row.measureLower || '-' }}</span>
                  </template></el-table-column
                >
              </el-table>

              <div class="report-title" v-if="item.remark">备注信息</div>
              <div class="report-info" v-if="item.remark">
                {{ item.remark }}
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <!-- 检查项 -->
    <InspectionItemsDialog ref="inspectionItemsDialogRef" @success="addInspectionItems" />
  </div>
</template>
<script setup name="Productiongroup">
import dayjs from 'dayjs';
import InspectionItemsDialog from './inspectionItemsDialog.vue';
import { onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance();
const { currentRoute } = useRouter();
const route = currentRoute.value;
const inspectionItemsDialogRef = ref(null);
const ruleFormRef = ref(null);
const data = reactive({
  queryParams: {},
  dataList: [],
  loading: true,
  title: '',
  selectedRow: null, // 添加这一行
  multipleSelection: [],
  orderId: null,
  mode: 2,
  formData: {},
  rules: {
    category: [{ required: true, message: '检验类别为必选项', trigger: 'change' }],
    materialNameCollection: [{ required: true, message: '检验物料为必选项', trigger: 'change' }],
  },
  DC_SIP_CHECK_TYPE_ENUM: {
    DC_SIP_CHECK_TYPE_WL: '物料',
    DC_SIP_CHECK_TYPE_ZA: '专案',
    DC_SIP_CHECK_TYPE_BS: '标识',
  },
});

const {
  queryParams,
  dataList,
  loading,
  selectedRow,
  multipleSelection,
  orderId,
  mode,
  formData,
  rules,
  DC_SIP_CHECK_TYPE_ENUM,
} = toRefs(data);
const { DC_INSPECTION_CLASS, DC_SIP_CHECK_TYPE, DC_SIP_CHECK_ITEM } = proxy.useCache([
  { key: 'DC_INSPECTION_CLASS' },
  { key: 'DC_SIP_CHECK_TYPE' },
  { key: 'DC_SIP_CHECK_ITEM' },
]);

// 检查项添加回调
const addInspectionItems = () => {
  getData();
};

/** 查询参数列表 */
const getData = async id => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value, { id: orderId.value });
  const res = await Api.qms.sn.sipOrderDetail(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.sipEntryList.filter(item => item) || [];
    if (data.sipEntryList.length > 0) {
      selectedRow.value = dataList.value[0];
    }
  }
  loading.value = false;
};

onMounted(() => {
  if (route.query.id) {
    orderId.value = route.query.id;
    getData();
    getDetail();
  }
});

/** 查询参数列表 */
const getDetail = async id => {
  loading.value = true;
  let dataparam = Object.assign(queryParams.value, { id: orderId.value });
  const res = await Api.qms.sn.sipDetail(dataparam);
  const { code, data } = res.data;
  if (code === 200) {
    formData.value = data;
  }
  loading.value = false;
};

// 升版
const upgrade = (id, type) => {
  Api.qms.sn
    .sipOrderUpgrade({
      id,
    })
    .then(e => {
      let { code, data } = e.data;
      inspectionItemsDialogRef.value.openDialog({
        ...data,
        type,
      });
    })
    .catch(e => {});
};

// 多选
const handleSelectionChange = val => {
  data.multipleSelection = Array.from(val, ({ id }) => id);
};

/** 删除按钮操作 */
const handleDelete = () => {
  proxy
    .$confirm('是否确认删除数据吗？')
    .then(async () => {
      return Api.qms.sn.sipEntryRemove(data.multipleSelection.join(','));
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 行点击事件处理
const handleRowClick = row => {
  selectedRow.value = row;
};

// 行样式类处理
const tableRowClassName = ({ row }) => {
  if (selectedRow.value && selectedRow.value === row) {
    return 'selected-row';
  }
  return '';
};

const doAction = (action, scope) => {
  let data = {};
  const row = scope?.row;
  switch (action) {
    case 'add':
      data = {
        type: action,
        orderId: orderId.value,
      };
      inspectionItemsDialogRef.value.openDialog(data);
      return;
    case 'edit':
      data = {
        ...row,
        type: action,
        orderId: orderId.value,
      };
      inspectionItemsDialogRef.value.openDialog(data);
      return;
    case 'upgrade':
      upgrade(row.id, action);
      break;
    case 'submit':
      submitForm();
      break;

    default:
      break;
  }
};

// 检验物料
const changeMaterial = e => {
  if (e.length > 0) {
    // formData.value.materialNumberCollection = e.map(item => item.fnumber);
    formData.value.materialNameCollection = e.map(item => item.fname).join(',');
    formData.value.materialNumberCollection = e.map(item => item.fnumber).join(',');
  } else {
    // formData.value.materialNumberCollection = [e.fnumber];
    formData.value.materialNameCollection = e.fname;
    formData.value.materialNameCollection = e.fnumber;
  }
};

const handleModeChange = () => {
  setTimeout(() => {
    formData.value.materialIdCollection = '';
    formData.value.materialNumberCollection = '';
  }, 100);
};

// 弹出框提交表单
const submitForm = async () => {
  ruleFormRef.value.validate(async valid => {
    if (valid) {
      let newrow = Object.assign(formData.value, {});
      newrow.configDate = dayjs().valueOf();
      if (
        Array.isArray(newrow.materialNumberCollection) &&
        newrow.materialNumberCollection.length > 0
      ) {
        let list = newrow.materialNumberCollection.map(item => {
          return item.fnumber;
        });
        newrow.materialNumberCollection = list.join(',');
      }
      const res = await Api.qms.sn.sipOrderSubmit({
        ...newrow,
      });
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
      }
    }
  });
};
</script>

<style scoped lang="scss">
.app-container {
  padding: 0;
}
:deep(.selected-row) {
  background: rgba(250, 111, 12, 0.05);
  box-shadow: inset 0px 0px 0px 0px #e5e5e5;
}

.imgsList :deep(.component-upload-image) {
  .el-upload--picture-card {
    width: 160px; /* 设置上传按钮的宽度 */
    height: 120px; /* 设置上传按钮的高度 */
    line-height: 120px; /* 设置上传按钮的行高 */
  }

  .el-upload-list--picture-card .el-upload-list__item {
    width: 160px; /* 设置图片项的宽度 */
    height: 120px; /* 设置图片项的高度 */
  }

  .el-upload--picture-card {
    display: none;
  }
}

.operate-container {
  margin-bottom: 8px;
}
.content-warp {
  padding-top: 0px;
  display: flex;
  flex-direction: row;
  border-radius: 0px 0px 8px 8px;
  gap: 8px;

  .table-container {
    flex: 1;
    margin-bottom: 0px;
    border: 1px solid #e9e9e9;
    border-radius: 8px;
    overflow: auto;
  }
  .tag {
    display: flex;
    padding: 4px 12px;
    box-sizing: border-box;
    height: 22px;
    align-items: center;
    background: #168be8;
    border-radius: 4px 4px 4px 4px;
    font-size: 14px;
    color: #ffffff;
    justify-content: center;
    align-items: center;
  }
  .green {
    background-color: #11afa7;
  }
  .purple {
    background-color: #994fe1;
  }
  .report-info-wrapper {
    flex: 1;
    height: 100%;
    border-radius: 8px;
    border: 1px solid #e9e9e9;
    display: flex;
    background: #fff;
    flex-direction: column;
    padding: 16px;
    box-sizing: border-box;
    overflow: auto;
    .scroll-content {
      padding-right: 10px;
    }
    .group-box {
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid #ccc;
      &_header {
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .version {
        color: rgb(29, 87, 29);
        font-size: 14px;
      }
    }

    .imgsList {
      display: flex;
      align-items: center;
      margin: 10px 0px;
      flex-wrap: wrap;
      .img-item {
        width: 30%;
        height: 100px;
        margin-right: 5%;
        margin-bottom: 10px;
        &:nth-of-type(3n) {
          margin-right: 0px !important;
        }
      }
    }
    .report-title {
      font-weight: bold;
      font-size: 14px;
      color: #333333;
    }
    .report-info {
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #dadbe0;
      padding: 8px 16px;
      box-sizing: border-box;
      margin: 16px 0px 20px;
      background-color: #f6f8fa;
      color: #848488;
      font-size: 14px;
      .report-info-item {
        display: flex;
        align-items: center;
        line-height: 24px;
      }
    }
    .select-table {
      margin: 16px 0px 24px;
    }
  }
}

:deep(.el-table__inner-wrapper:before) {
  display: none;
}

.nodata-height {
  height: calc(100% - 20px) !important;
}

.header-wrapper {
  display: flex;
  padding: 0px 16px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  width: 100%;
  flex-direction: column;
  .title {
    display: flex;
    height: 58px;
    align-items: center;
    border-bottom: 1px solid #dadbe0;
    margin-bottom: 8px;
    .back-img {
      width: 22px;
      height: 22px;
      margin-right: 8px;
      cursor: pointer;
    }
  }
  .search-container {
    width: 100%;
    display: flex;
    gap: 20px;
    .el-form-item {
      width: 240px;
    }
  }
  .noData-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .img {
      width: 320px;
      height: 320px;
    }
    .tip {
      font-size: 24px;
      color: #848488;
    }
  }
  :deep(.el-descriptions__label) {
    display: inline-block;
    width: 90px;
    text-align: right;
  }

  :deep(.el-descriptions__cell) {
    margin-bottom: 18px !important;
  }
  .search-result {
    padding: 10px 0px 0px;
    box-sizing: border-box;
    border: 1px dashed #606266;
  }
}
.group-box-right-box {
  :deep(.dc-view),
  .right-title-uptate-time {
    font-size: 14px;
    font-weight: normal;
    color: #333;
    margin-right: 2px;
  }
}
.dialog-search-box {
  width: 600px;
  display: felx;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 50%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 120px);
    }
  }
}
</style>
