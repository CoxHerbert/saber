<template>
  <basic-container>
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <!-- <el-form-item label="租户" prop="tenantId" class="wid20">
        <el-select v-model="queryParams.tenantId" placeholder="请选择租户" clearable>
          <el-option
            v-for="(item, index) in data.tenantList"
            :key="index"
            :value="item.tenantId"
            :label="item.tenantName"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="机台名称" prop="machineName" class="wid20">
        <el-input
          type="text"
          v-model="queryParams.machineName"
          placeholder="请输入机台名称"
        ></el-input>
      </el-form-item>

      <el-form-item label="机台ip" prop="machineIp" class="wid20">
        <el-input type="text" v-model="queryParams.machineIp" placeholder="请输入机台ip"></el-input>
      </el-form-item>
      <el-form-item label="位置" prop="location" class="wid20">
        <el-input type="text" v-model="queryParams.location" placeholder="请输入位置"></el-input>
      </el-form-item>

      <el-form-item class="wid20">
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="operate-container">
      <el-button
        type="primary"
        icon="CirclePlus"
        v-permission="{ id: 'INSTRUMENTCONFIG_ADD' }"
        @click="handleAdd"
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
        <el-table-column width="100px" label="租户" align="center" prop="tenantId">
          <template #default="scoped">
            <span>{{ tenantView(scoped.row.tenantId) }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" label="机台名称" align="center" prop="machineName" />
        <el-table-column
          min-width="130px"
          label="测量类型"
          align="center"
          prop="measurementDictCode"
          :show-overflow-tooltip="true"
        >
        </el-table-column>

        <el-table-column
          min-width="160px"
          label="机台ip"
          align="center"
          prop="machineIp"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          min-width="120px"
          label="位置"
          align="center"
          prop="location"
          :show-overflow-tooltip="true"
        />

        <el-table-column label="操作" align="center" width="220" fixed="right">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              icon="Edit"
              v-permission="{ id: 'INSTRUMENTCONFIG_EDIT', row: scoped.row }"
              @click="handleUpdate(scoped.row)"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              icon="Delete"
              v-permission="{ id: 'INSTRUMENTCONFIG_DEL', row: scoped.row }"
              @click="handleDelete(scoped.row)"
              >删除</el-button
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

    <el-drawer v-model="dialogVisible" size="500px" :title="title" @close="cancel">
      <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="租户" prop="tenantId">
              <el-select v-model="formData.tenantId" placeholder="请选择租户" clearable>
                <el-option
                  v-for="(item, index) in data.tenantList"
                  :key="index"
                  :value="item.tenantId"
                  :label="item.tenantName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="机台名称" prop="machineName">
              <el-input
                type="text"
                v-model="formData.machineName"
                placeholder="请输入机台名称"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="测量类型" prop="measurementDictCode">
              <el-select
                v-model="formData.measurementDictCode"
                placeholder="请选择测量类型"
                clearable
              >
                <el-option
                  v-for="(item, index) in DC_MEASUREMENT_TYPE"
                  :key="index"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="机台ip" prop="machineIp">
              <el-input
                v-model="formData.machineIp"
                placeholder="请输入机台ip
"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="位置" prop="location">
              <el-input v-model="formData.location" placeholder="请输入位置"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
          <el-button @click="cancel(ruleFormRef)">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';
import { getTenantList } from '@/api/system/expNotice';
const { proxy } = getCurrentInstance();

const data = reactive({
  tenantList: [],
  formData: {
    openStatus: 'CREATED',
    tenantId: '000000',
  },
  queryParams: {
    current: 1,
    size: 10,
    workGroupName: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  rules: {
    tenantId: [{ required: true, message: '租户为必选项', trigger: 'blur' }],
    machineName: [{ required: true, message: '机台名称为必选项', trigger: 'blur' }],
    measurementDictCode: [{ required: true, message: '测量类型为必选项', trigger: 'change' }],
    machineIp: [{ required: true, message: '机台ip为必选项', trigger: 'blur' }],
    location: [{ required: true, message: '位置为必选项', trigger: 'blur' }],
  },
  dialogVisible: false,
});

const { queryParams, formData, dataList, loading, total, title, rules, dialogVisible, tenantList } =
  toRefs(data);

const ruleFormRef = ref(null);
// 数据字典
const { DC_MEASUREMENT_TYPE } = proxy.useCache([{ key: 'DC_MEASUREMENT_TYPE' }]);

onMounted(() => {
  getData();
  getTenantListFn();
});

// 启用/禁用
const tenantView = tenantId => {
  if (!tenantList.value.length) {
    return '-';
  }
  return tenantList.value.find(item => item.tenantId == tenantId).tenantName;
};

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.qms.sn.getMachineConfigList(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
      measurementDictCode:
        DC_MEASUREMENT_TYPE.value.find(item => item.id == record.measurementDictCode)?.label || '-',
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

// 编辑
const handleUpdate = async row => {
  let data = Object.assign({}, row);
  formData.value = data;
  title.value = '编辑';
  dialogVisible.value = true;
};

// 打开添加弹窗
const handleAdd = async () => {
  title.value = '添加';
  dialogVisible.value = true;
  proxy.resetForm('ruleFormRef');
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
    workGroupName: undefined,
    areaName: undefined,
    chargePerson: undefined,
  };
  proxy.resetForm('queryRef');
  getData();
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = row.id;
  proxy
    .$confirm('是否确认删除机台名称为"' + row.machineName + '"的数据项？')
    .then(async () => {
      return Api.qms.sn.machineConfigRemove(configIds);
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      const form = Object.assign({}, formData.value);
      if (form.id) {
        const res = await Api.qms.sn.machineConfigSubmit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      } else {
        const res = await Api.qms.sn.machineConfigSubmit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      }
    }
  });
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  formData.value = {};
};

// 获取租户列表
const getTenantListFn = () => {
  getTenantList().then(res => {
    if (res.data.code === 200) {
      data.tenantList = res.data.data;
    }
  });
};
</script>

<style scoped lang="scss">
:deep(.el-card__body) {
  padding-top: 20px !important;
}
.wid20 {
  width: 17.4% !important;
}
</style>
