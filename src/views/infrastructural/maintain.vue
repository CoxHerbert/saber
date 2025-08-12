<template>
  <basic-container>
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <div class="search">
        <div class="search-left">
          <el-form-item label="工艺名称" prop="processName">
            <el-input v-model="queryParams.processName" placeholder="请输入工艺名称" clearable />
          </el-form-item>
          <el-form-item label="工艺类别" prop="processCategory">
            <el-input
              v-model="queryParams.processCategory"
              placeholder="请输入工艺类别"
              clearable
            />
          </el-form-item>
          <el-form-item label="生产组" prop="workGroupName">
            <el-input v-model="queryParams.workGroupName" placeholder="请输入生产组" clearable />
          </el-form-item>
          <el-form-item label="工艺类别" prop="工艺分组">
            <el-select v-model="queryParams.processGroupId" placeholder="请选择工艺类别" clearable>
              <el-option
                v-for="item in DC_MES_PROCESS_GROUP"
                :key="item.value"
                :label="item.label"
                :value="item.value"
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
    <div class="operate-container">
      <el-button
        type="primary"
        icon="CirclePlus"
        v-permission="{ id: 'DC_MES_PROCESS_ADD' }"
        @click="handleAdd"
        >新增</el-button
      >
    </div>
    <div class="table-container">
      <el-table v-loading="loading" :data="dataList">
        <el-table-column width="60" label="排序" align="center">
          <template #default="scoped">
            {{ scoped.row.processOrder }}
          </template>
        </el-table-column>
        <el-table-column min-width="80" label="工艺编码" align="center">
          <template #default="scoped">
            {{ scoped.row.code }}
          </template>
        </el-table-column>
        <el-table-column min-width="80" label="工艺名称" align="center">
          <template #default="scoped">
            {{ scoped.row.processName }}
          </template>
        </el-table-column>
        <el-table-column min-width="80" label="工艺类别" align="center">
          <template #default="scoped">
            {{ scoped.row.processCategory }}
          </template>
        </el-table-column>
        <el-table-column min-width="80" label="生产组" align="center">
          <template #default="scoped">
            {{ scoped.row.workGroupName }}
          </template>
        </el-table-column>
        <el-table-column min-width="80" label="工艺分组" align="center">
          <template #default="scoped">
            <dc-dict
              type="text"
              :options="DC_MES_PROCESS_GROUP"
              :value="scoped.row.processGroupId"
            />
          </template>
        </el-table-column>
        <el-table-column min-width="120" label="排程前置期" align="center">
          <template #default="scoped">
            {{ scoped.row.preSchedulingPeriod }}
          </template>
        </el-table-column>
        <el-table-column width="120" label="是否启用" align="center">
          <template #default="scoped">
            <el-switch
              v-model="scoped.row.isEnable"
              v-permission="{ id: 'DC_MES_PROCESS_EDIT', row: scoped.row }"
              @change="handleChange(scoped.row)"
            />
          </template>
        </el-table-column>
        <el-table-column width="120" label="是否报工" align="center">
          <template #default="scoped">
            <el-switch
              v-model="scoped.row.isReport"
              v-permission="{ id: 'DC_MES_PROCESS_EDIT', row: scoped.row }"
              @change="handleChange(scoped.row)"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" width="150" label="操作" align="center">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scoped.row)"
              v-permission="{ id: 'DC_MES_PROCESS_EDIT', row: scoped.row }"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              icon="Delete"
              v-permission="{ id: 'DC_MES_PROCESS_DEL', row: scoped.row }"
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

    <el-drawer v-model="dialogVisible" width="500" :title="title" @close="cancel">
      <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="98px" status-icon>
        <el-form-item label="排序" prop="processOrder">
          <!--          <el-input v-model="formData.processOrder" placeholder="请输入" clearable />-->
          <el-input-number v-model="formData.processOrder" :min="1" controls-position="right">
            <template #suffix> </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="工艺编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="工艺名称" prop="processName">
          <el-input v-model="formData.processName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="工艺类别" prop="processCategoryCode">
          <el-select v-model="formData.processCategoryCode" placeholder="请选择" clearable>
            <el-option
              v-for="(item, index) in regionalOptions"
              :key="index"
              :value="item.productionProcessCode"
              :label="item.processCategory"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生产组" prop="workGroupCode">
          <el-select v-model="formData.workGroupCode" placeholder="请选择" clearable>
            <el-option
              v-for="(item, index) in groupOptions"
              :key="index"
              :label="item.workGroupName"
              :value="item.workGroupCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工艺分组">
          <el-select v-model="formData.processGroupId" placeholder="请选择" clearable>
            <el-option
              v-for="item in DC_MES_PROCESS_GROUP"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排程前置期" prop="preSchedulingPeriod">
          <el-input-number
            v-model="formData.preSchedulingPeriod"
            :min="0"
            controls-position="right"
          >
            <template #suffix>
              <span>天</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="是否启用" prop="isEnable">
          <el-switch v-model="formData.isEnable" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>

<script setup name="Maintain">
import { onMounted } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const data = reactive({
  formData: {},
  queryParams: {
    current: 1,
    size: 10,
    processName: undefined,
    processCategory: undefined,
    workGroupName: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  title: '',
  dialogVisible: false,
  rules: {
    code: [{ required: true, message: '工艺编码为必填项', trigger: 'blur' }],
    processName: [{ required: true, message: '工艺名称为必填项', trigger: 'blur' }],
    processCategoryCode: [{ required: true, message: '工艺类别为必选项', trigger: 'change' }],
    preSchedulingPeriod: [{ required: true, message: '排程前置期为必填项', trigger: 'blur' }],
  },
  regionalOptions: [],
  groupOptions: [],
});

const {
  queryParams,
  formData,
  dataList,
  loading,
  total,
  title,
  dialogVisible,
  rules,
  regionalOptions,
  groupOptions,
} = toRefs(data);

// 数据字典
const { DC_MES_PROCESS_GROUP } = proxy.useCache([{ key: 'DC_MES_PROCESS_GROUP' }]);

onMounted(() => {
  getData();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.mps.processMaintenance.list(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
      isEnable: record.isEnable === 1,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
  }
  loading.value = false;
};

/** 区域参数列表 */
const getOptions = async () => {
  const params = {
    current: 1,
    size: 1000000,
    isEnable: '1',
  };
  // 获取工艺类别
  const res = await Api.mps.produceRoute.list(params);
  regionalOptions.value = res.data.data.records;
  // 获取生产组
  const res2 = await Api.mps.workGroup.list(params);
  groupOptions.value = res2.data.data.records;
};

// 处理变化
const handleChange = async row => {
  formData.value = {
    id: row.id,
    isReport: row.isReport,
    isEnable: row.isEnable ? 1 : 0,
  };
  const res = await Api.mps.processMaintenance.update(formData.value);
  const { code, msg } = res.data;
  if (code === 200) {
    getData();
    proxy.$message.success(msg);
  }
};

// 开关方式
const handleUpdate = async row => {
  await getOptions();
  formData.value = {
    id: row.id,
    processOrder: row.processOrder,
    code: row.code,
    processName: row.processName,
    processCategoryCode: row.processCategoryCode,
    processCategory: row.processCategory,
    workGroupCode: row.workGroupCode,
    processGroupId: row.processGroupId,
    workGroupName: row.workGroupName,
    preSchedulingPeriod: row.preSchedulingPeriod,
    isEnable: row.isEnable,
  };
  title.value = '编辑';
  dialogVisible.value = true;
};

// 打开添加弹窗
const handleAdd = async () => {
  await getOptions();
  formData.value = {
    processName: '',
    processCategoryCode: '',
    workGroupCode: '',
    preSchedulingPeriod: '',
    isEnable: true,
  };
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
    processName: undefined,
    processCategory: undefined,
    workGroupName: undefined,
  };
  proxy.resetForm('queryRef');
  getData();
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = row.id;
  proxy
    .$confirm('是否确认删除参数编号为"' + row.processName + '"的数据项？')
    .then(async () => {
      return Api.mps.processMaintenance.remove({
        id: configIds,
      });
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};

// 弹出框提交表单
const submitForm = () => {
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        isEnable: formData.value.isEnable ? 1 : 0,
      };
      if (formData.value.id) {
        const res = await Api.mps.processMaintenance.update(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      } else {
        const res = await Api.mps.processMaintenance.create(form);
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
  proxy.resetForm('ruleFormRef');
};
</script>
<style lang="scss" scoped>
.chouTi {
  display: flex;
  flex-direction: column;
  height: 100%;

  .header {
    height: 50px;
    margin-bottom: 20px;
  }
  .main {
    flex: 1;
  }
  .footer {
    height: 50px;
  }
}
</style>
