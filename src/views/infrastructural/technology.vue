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
          <el-form-item label="工艺类别" prop="processCategory">
            <el-input
              v-model="queryParams.processCategory"
              placeholder="请输入工艺类别"
              clearable
            />
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
        v-permission="{ id: 'DC_MES_PROCESS_TYPE_ADD' }"
        @click="handleAdd"
        >新增</el-button
      >
    </div>
    <div class="table-container">
      <el-table v-loading="loading" :data="dataList">
        <el-table-column min-width="100" label="工艺类别" align="center">
          <template #default="scoped">
            {{ scoped.row.processCategory }}
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="工艺分组" align="center">
          <template #default="scoped">
            <!--            {{ scoped.row.processGroupId }}-->
            <dc-dict
              type="text"
              :options="DC_MES_PROCESS_GROUP"
              :value="scoped.row.processGroupId"
            />
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="是否启用" align="center">
          <template #default="scoped">
            <el-switch
              v-model="scoped.row.isEnable"
              v-permission="{ id: 'DC_MES_PROCESS_TYPE_EDIT', row: scoped.row }"
              @change="handleChange(scoped.row)"
            />
          </template>
        </el-table-column>
        <el-table-column min-width="150" label="操作" align="center">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              icon="Edit"
              v-permission="{ id: 'DC_MES_PROCESS_TYPE_EDIT', row: scoped.row }"
              @click="handleUpdate(scoped.row)"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              icon="Delete"
              v-permission="{ id: 'DC_MES_PROCESS_TYPE_DEL', row: scoped.row }"
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

    <el-drawer v-model="dialogVisible" width="500" :title="title" :before-close="cancel">
      <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="80px" status-icon>
        <el-form-item label="工艺类别" prop="processCategory">
          <el-input v-model="formData.processCategory" placeholder="请输入" clearable />
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
        <el-form-item label="是否启用" prop="isEnable">
          <el-switch v-model="formData.isEnable" />
        </el-form-item>
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

<script setup name="technology">
import { onMounted } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const data = reactive({
  formData: {
    noticrTypeName: '',
  },
  queryParams: {
    current: 1,
    size: 10,
    processCategory: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  switchValue: true,
  title: '',
  dialogVisible: false,
  rules: {
    processCategory: [{ required: true, message: '工艺类别为必填项', trigger: 'blur' }],
  },
});

const {
  queryParams,
  formData,
  dataList,
  loading,
  total,
  switchValue,
  title,
  dialogVisible,
  rules,
} = toRefs(data);
// 表单引用
const ruleFormRef = ref(null);

// 数据字典
const { DC_MES_PROCESS_GROUP } = proxy.useCache([{ key: 'DC_MES_PROCESS_GROUP' }]);

onMounted(() => {
  getData();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.mps.produceRoute.list(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    dataList.value = data.records.map(record => ({
      ...record,
      isEnable: record.isEnable === 1,
    }));
    total.value = data.total;
    queryParams.value.current = data.current;
    queryParams.value.size = data.size;
    switchValue.value = data.isEnable;
  }
  loading.value = false;
};

// 处理变化
const handleChange = async row => {
  formData.value = {
    id: row.id,
    isEnable: row.isEnable ? 1 : 0,
  };
  const res = await Api.mps.produceRoute.update(formData.value);
  const { code, msg } = res.data;
  if (code === 200) {
    getData();
    proxy.$message.success(msg);
  }
};

// 开关方式
const handleUpdate = async row => {
  formData.value = {
    id: row.id,
    processCategory: row.processCategory,
    processGroupId: row.processGroupId,
    isEnable: row.isEnable,
  };
  title.value = '编辑';
  dialogVisible.value = true;
};

// 打开添加弹窗
const handleAdd = () => {
  formData.value = {
    processCategory: '',
    processGroupId: '',
    isEnable: true,
  };
  title.value = '添加';
  dialogVisible.value = true;
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
    processCategory: undefined,
    processGroupId: undefined,
  };
  proxy.resetForm('queryRef');
  getData();
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = row.id;
  proxy
    .$confirm('是否确认删除参数编号为"' + row.processCategory + '"的数据项？')
    .then(async () => {
      return Api.mps.produceRoute.remove({
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
const submitForm = formEl => {
  formEl.validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        isEnable: formData.value.isEnable ? 1 : 0,
      };
      if (formData.value.id) {
        const res = await Api.mps.produceRoute.update(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      } else {
        const res = await Api.mps.produceRoute.create(form);
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
