<template>
  <div class="wrap-left-form" v-loading="loading">
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :inline="true"
      validate-on-rule-change="true"
    >
      <div class="form-group-title">基本信息</div>
      <div class="form-item-info">
        <el-form-item class="form-itme-width_50" label="入库类型" prop="inType">
          <el-select
            v-model="formData.inType"
            clearable
            placeholder="请选择入库类型"
            @change="hangleInTypeChange"
          >
            <el-option
              v-for="item in DC_WMS_IN_TYPE_WMS"
              :key="item.dictKey"
              :label="item.dictValue"
              :value="item.dictKey"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="仓库名称" prop="warehouseId">
          <dc-select-dialog
            v-model="formData.warehouseId"
            :disabled="[null, '', undefined].includes(formData.inType)"
            :placeholder="
              [null, '', undefined].includes(formData.inType)
                ? '请先选择入库类型'
                : '请点击选择仓库'
            "
            objectName="warehouse"
            type="input"
            :multiple="false"
            :multiple-limit="1"
            :clearable="true"
            :params="{
              stockType: getStockType(formData.inType),
            }"
            @change="handleWarehouseChange"
          />
        </el-form-item>

        <el-form-item class="form-itme-width_50" label="来源单号" prop="inSourceNumber">
          <el-select
            v-model="formData.inSourceNumber"
            filterable
            remote
            reserve-keyword
            clearable
            placeholder="请输入选择来源单号"
            remote-show-suffix
            :remote-method="remoteMethod"
            :loading="loading"
            @change="handleSerch"
            @visible-change="handleVisibleChange"
            :disabled="formData.inType === 'DC_WMS_IN_TYPE_OTHER'"
          >
            <el-option
              v-for="item in inStockNumberList"
              :key="item.FBILLNO"
              :label="item.FBILLNO"
              :value="item.FBILLNO"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="form-itme-width_50" label="申请人" prop="applicantId">
          <dc-select-user v-model="formData.applicantId" placeholder="请选择" :multipleLimit="1" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="处理人" prop="processingPersonnel">
          <dc-select-user
            v-model="formData.processingPersonnel"
            placeholder="请选择"
            :multipleLimit="1"
          />
        </el-form-item>

        <el-form-item
          v-if="formData.reject"
          class="form-itme-width_100"
          label="驳回原因"
          id="reject"
          prop="reject"
        >
          <el-input text v-model="formData.reject" clearable disabled :rows="2" type="textarea" />
        </el-form-item>
      </div>
      <div class="form-group-title">入库明细</div>
      <el-button class="mb-5" type="primary" @click="addRow" v-if="btnOpen">新增</el-button>
      <el-upload
        :show-file-list="false"
        accept=".xls,.xlsx"
        :http-request="uploadFile"
        class="ml-2 mr-2"
        v-if="btnOpen"
      >
        <el-button type="primary" icon="Plus">导入</el-button>
      </el-upload>
      <el-button class="mb-5" type="primary" @click="addExport" v-if="btnOpen">下载模板</el-button>
      <el-form-item class="form-itme-width_100 tabel-border">
        <el-table :data="formData.detailList" :height="300">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="productCode" label="物料编号" align="center" min-width="150" />
          <el-table-column prop="productName" label="物料名称" align="center" min-width="150" />
          <el-table-column
            prop="productSpec"
            label="规格型号"
            align="center"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column prop="productQty" label="数量" align="center" min-width="150" />
          <el-table-column prop="productUnit" label="单位" align="center" min-width="150" />
          <el-table-column prop="locationId" label="仓位编号" align="center" min-width="150">
            <template #default="scoped">
              <dc-view
                v-model="scoped.row.locationId"
                objectName="warehouseLocation"
                showKey="locationName"
              />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" align="center" width="100">
            <template #default="scoped">
              <el-button link type="primary" size="small" @click="handleUpdate(scoped.row)">
                编辑
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="removeEvaluate(scoped.row)"
                v-if="btnOpen"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item class="form-itme-width_100">
        <div class="form-itme-btn">
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button type="primary" @click="submitAudit" :loading="loading">审核</el-button>
          <el-button @click="cancelSubmit">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
  <el-drawer v-model="open" :title="title" destroy-on-close append-to-body @close="closeDrawer">
    <el-form ref="formRef" :model="formDataTable" :rules="rules" label-width="86px">
      <el-form-item label="物料编号" prop="productCode">
        <el-input
          v-model="formDataTable.productCode"
          placeholder="产品编码"
          clearable
          :disabled="show"
        />
      </el-form-item>
      <el-form-item label="物料名称" prop="productName">
        <el-input
          v-model="formDataTable.productName"
          placeholder="产品名称"
          clearable
          :disabled="show"
        />
      </el-form-item>
      <el-form-item label="规格型号" prop="productSpec">
        <el-input
          v-model="formDataTable.productSpec"
          placeholder="规格型号"
          clearable
          :disabled="show"
        />
      </el-form-item>
      <el-form-item label="数量" prop="productQty">
        <el-input-number v-model="formDataTable.productQty" />
      </el-form-item>
      <el-form-item label="单位" prop="productUnit">
        <el-select v-model="formDataTable.productUnit" placeholder="请选择单位" :disabled="show">
          <el-option
            v-for="item in unitList"
            :key="item.unitName"
            :label="item.unitName"
            :value="item.unitName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓位编号" prop="locationId">
        <dc-select-dialog
          v-model="formDataTable.locationId"
          placeholder="请点击仓位编号"
          objectName="warehouseLocation"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :clearable="true"
          :params="{
            warehouseId:
              typeof formData.warehouseId === 'object' && formData.warehouseId !== null
                ? formData.warehouseId.id
                : formData.warehouseId,
          }"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitFormTable">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance } from 'vue';
import Api from '@/api';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const inTypeMap = {
  // 现场仓库
  DC_WMS_IN_TYPE_ON_SITE_STORAGE: 'DC_WMS_STOCK_TYPE_SCENE', //        现场仓
  // 线边仓入库
  DC_WMS_IN_TYPE_LEW: 'DC_WMS_STOCK_TYPE_LINE_EDGE', //         线边仓
  // 其他入库
  DC_WMS_IN_TYPE_OTHER: '', // 'DC_WMS_STOCK_TYPE_COMMON', //         普通仓
};

// 获取入库类型
const getStockType = inType => {
  return inType && inTypeMap[inType] ? inTypeMap[inType] : undefined;
};

const router = useRouter();
const { proxy } = getCurrentInstance();
const route = useRoute();
const userinfo = computed(() => proxy.$store.getters.userInfo);
const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});
const { DC_WMS_IN_TYPE_WMS } = proxy.useCache([{ key: 'DC_WMS_IN_TYPE_WMS' }]);

const pageData = reactive({
  loading: false,
  rules: {
    warehouseId: [{ required: true, message: '请选择仓库', trigger: 'blur' }],
    inType: [{ required: true, message: '请输入入库类型', trigger: 'blur' }],
    applicantId: [{ required: true, message: '请选择申请人', trigger: 'blur' }],
    processingPersonnel: [
      {
        required: true,
        validator(_, value, callback) {
          if ([null, '', undefined].includes(value)) {
            callback(new Error('请选择处理人'));
          }
          if (value && value?.split?.(',')?.length > 1) {
            callback(new Error('不允许有多个处理人'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
  },
  formData: {
    inType: 'DC_WMS_IN_TYPE_ON_SITE_STORAGE',
    detailList: [],
  },
  formDataTable: {},
  open: false,
  title: '',
  editIndex: null,
  show: true,
  btnOpen: false,
  unitList: [],
  inStockNumberList: [],
});

const {
  loading,
  rules,
  formData,
  formDataTable,
  open,
  title,
  editIndex,
  show,
  btnOpen,
  unitList,
  inStockNumberList,
} = toRefs(pageData);

// 其他不进行校验

// 确认创建
const submitForm = () => {
  proxy.$refs.ruleFormRef.validate(async valid => {
    if (valid) {
      loading.value = true;
      try {
        const warehouseId =
          typeof formData.value.warehouseId === 'object'
            ? formData.value.warehouseId?.id
            : formData.value.warehouseId;
        const parmas = {
          ...formData.value,
          warehouseId: warehouseId,
        };
        const res = await Api.wms.warehousingEntry.submit(parmas);
        const { code, msg } = res.data;
        loading.value = false;
        if (code === 200) {
          proxy.$message({ type: 'success', message: '保存成功' });
          router.push({
            path: '/wms/warehouseRecord/warehousingEntry',
            params: {},
          });
        }
      } catch (err) {
        loading.value = false;
      }
    }
  });
};

onMounted(() => {
  if (route.params.id != 'create') {
    loading.value = true;
    const timer = setTimeout(() => {
      formData.value = props.info;
      loading.value = false;
      if (formData.value.inType == 'DC_WMS_IN_TYPE_OTHER') {
        btnOpen.value = true;
      }
      clearTimeout(timer);
    }, 300);
  }
  formData.value.applicantId = userinfo.value.user_id;
  getUnitData();
});

// 获取单位下拉列表
const getUnitData = async () => {
  const res = await Api.wms.warehousingEntry.unitList();
  const { code, data } = res.data;
  if (code === 200) {
    unitList.value = data;
  }
};

// 审核
const submitAudit = () => {
  proxy.$refs.ruleFormRef.validate(async valid => {
    if (valid) {
      loading.value = true;
      const warehouseId =
        typeof formData.value.warehouseId === 'object'
          ? formData.value.warehouseId?.id
          : formData.value.warehouseId;

      const dataList = formData.value.detailList.map(item => ({
        ...item,
        warehouseId: warehouseId,
      }));
      const form = {
        ...formData.value,
        warehouseId: warehouseId,
        detailList: dataList,
      };

      const res = await Api.wms.warehousingEntry.submitAudit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '审核成功' });
        loading.value = false;
        router.push({
          path: '/wms/warehouseRecord/warehousingEntry',
          params: {},
        });
      }
    }
  });
};

// 表格编辑
const handleUpdate = row => {
  show.value = true;
  editIndex.value = formData.value.detailList.findIndex(item => item === row);
  if (editIndex.value !== -1) {
    open.value = true;
    formDataTable.value = { ...row }; // 创建一个新对象，避免直接修改引用
  }
};

// 提交修改
const submitFormTable = async () => {
  if (editIndex.value !== null && editIndex.value !== -1) {
    // 编辑模式：更新原列表中的数据
    formData.value.detailList[editIndex.value] = { ...formDataTable.value };
    editIndex.value = null;
  } else {
    // 新增模式
    formData.value.detailList.push({ ...formDataTable.value });
  }
  formDataTable.value = {}; // 清空表单
  open.value = false; // 关闭抽屉
};

// 表格删除
const removeEvaluate = async row => {
  const index = formData.value.detailList.findIndex(item => item === row);
  if (index !== -1) {
    formData.value.detailList.splice(index, 1);
  }
};

const addRow = () => {
  title.value = '新增';
  open.value = true;
};

// 抽屉取消
const closeDrawer = () => {
  formDataTable.value = {};
  open.value = false;
};
// 取消
const cancelSubmit = () => {
  router.push({
    path: '/wms/warehouseRecord/warehousingEntry',
    params: {},
  });
};

const handleSerch = async row => {
  if (row) {
    try {
      loading.value = true;
      const params = {
        type: formData.value.inType,
        sourceId: formData.value.inSourceNumber,
      };
      const res = await Api.wms.warehousingEntry.detailList(params);
      const { code, data } = res.data;
      if (code === 200) {
        formData.value.detailList = data;
      }
      loading.value = false;
    } catch (err) {
      loading.value = false;
    }
  } else {
    formData.value.detailList = [];
  }
};

// 选中入库类型监听事件
const hangleInTypeChange = row => {
  formData.value.inSourceNumber = null;
  if (formData.value.inType == 'DC_WMS_IN_TYPE_OTHER') {
    formData.value.inSourceNumber = null;
    show.value = false;
    btnOpen.value = true;
    formData.value.detailList = [];
  } else {
    formData.value.inSourceNumber = null;
    show.value = true;
    btnOpen.value = false;
    formData.value.detailList = [];
  }
};

// 仓库监听事件
const handleWarehouseChange = row => {
  formData.value.processingPersonnel = row.warehouseSupervisor;
};

// 获取来源单号下拉列表
const getInStockNumberList = async query => {
  const params = {
    code: query || null,
  };
  const res = await Api.wms.warehousingEntry.inStockNumberList(params);
  const { code, data } = res.data;
  if (code === 200) {
    inStockNumberList.value = data;
  }
};

// 搜索来源单号监听事件
const remoteMethod = query => {
  if (query.length > 3) {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      getInStockNumberList(query);
    }, 800);
  } else {
    // getInStockNumberList();?
  }
};

const uploadFile = async fileObj => {
  const form = new FormData();
  form.append('file', fileObj.file); // fileObj.file 是上传的文件
  const param =
    typeof formData.value.warehouseId === 'object'
      ? formData.value.warehouseId?.id
      : formData.value.warehouseId;
  const url = `/blade-bip/dc-wms-in-stock/import-excel?warehouseId=${param}`;
  loading.value = true;
  try {
    const response = await axios.post(url, form);
    if (response.data.code === 200) {
      loading.value = false;
      ElMessage.success('导入成功！');
      formData.value.detailList = response.data.data;
    } else {
      ElMessage.error(response.data.message || '导入失败');
    }
  } catch (error) {
    loading.value = false;
    console.error('导入失败', error);
    ElMessage.error('导入失败，请稍后重试');
  }
};

const addExport = () => {
  // 文件的 HTTP 链接
  const excelUrl =
    'https://static.eastwinbip.com/static/%E7%8E%B0%E5%9C%BA%E4%BB%93%E5%85%B6%E4%BB%96%E5%85%A5%E5%BA%93%E6%98%8E%E7%BB%86.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dc-minio%2F20250320%2F%2Fs3%2Faws4_request&X-Amz-Date=20250320T054333Z&X-Amz-Expires=432000&X-Amz-SignedHeaders=host&X-Amz-Signature=212ade78cb1367e391b29ff742d6187320255943cdc26a1a273c543cb41bbe30';

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
.tabel-border {
  border: 1px solid #edeae8;
}
</style>
