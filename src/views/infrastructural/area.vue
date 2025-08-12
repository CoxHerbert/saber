<template>
  <basic-container>
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <el-form-item label="区域名称" prop="areaName">
        <el-input
          v-model="queryParams.areaName"
          style="width: 240px"
          placeholder="请输入区域名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="负责人员" prop="chargePerson">
        <el-input
          v-model="queryParams.chargePerson"
          style="width: 240px"
          placeholder="请输入负责人员"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="operate-container">
      <el-button
        type="primary"
        icon="CirclePlus"
        v-permission="{ id: 'DC_MES_BASE_AREA_ADD' }"
        @click="handleAdd"
        >新增</el-button
      >
    </div>
    <div class="table-container">
      <el-table v-loading="loading" :data="dataList">
        <el-table-column min-width="100" label="区域名称" prop="areaName" align="center">
          <template #default="scoped">
            {{ scoped.row.areaName }}
          </template>
        </el-table-column>
        <el-table-column label="负责人" min-width="150" prop="chargePerson" align="center">
          <template #default="scoped">
            {{ scoped.row.chargePerson }}
          </template>
        </el-table-column>
        <el-table-column label="负责人图片" min-width="100" prop="photo" align="center">
          <template #default="scoped">
            <img
              class="photo"
              :src="scoped.row.photo"
              :onerror="hanldleLoadError(scoped.row)"
              v-if="scoped.row.photo"
            />
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column label="面积(m²)" min-width="100" prop="area" align="center">
          <template #default="scoped">
            {{ scoped.row.area }}
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="是否启用" align="center">
          <template #default="scoped">
            <el-switch
              v-model="scoped.row.isEnable"
              v-permission="{ id: 'DC_MES_BASE_AREA_EDIT', row: scoped.row }"
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
              @click="handleUpdate(scoped.row)"
              v-permission="{ id: 'DC_MES_BASE_AREA_EDIT', row: scoped.row }"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              icon="Delete"
              v-permission="{ id: 'DC_MES_BASE_AREA_DEL', row: scoped.row }"
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

    <el-drawer v-model="dialogVisible" width="600px" :title="title" @close="cancel">
      <el-form ref="submitFormRef" :model="formData" :rules="rules" label-width="auto">
        <el-form-item label="区域名称" prop="areaName">
          <el-input v-model="formData.areaName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="负责人员">
          <el-input v-model="formData.chargePerson" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="负责人图片">
          <dc-upload-img v-model="formData.photo" :limit="1" />
        </el-form-item>
        <el-form-item label="面积">
          <el-input-number v-model="formData.area" :min="0" placeholder="请输入">
            <template #suffix>
              <span>m²</span>
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

<script setup name="Area">
import { onMounted } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const data = reactive({
  formData: {},
  queryParams: {
    current: 1,
    size: 10,
    areaName: undefined,
    chargePerson: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  switchValue: true,
  title: '',
  dialogVisible: false,
  rules: {
    areaName: [{ required: true, message: '区域名称为必填项', trigger: 'blur' }],
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

onMounted(() => {
  getData();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.mps.regionalMaintenance.list(queryParams.value);
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

const hanldleLoadError = row => {
  row.photo = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
};

// 处理变化
const handleChange = async row => {
  formData.value = {
    ...row,
    isEnable: row.isEnable ? 1 : 0,
  };
  const res = await Api.mps.regionalMaintenance.update(formData.value);
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
    areaName: row.areaName,
    chargePerson: row.chargePerson,
    area: row.area,
    isEnable: row.isEnable,
    photo: row.photo,
  };
  title.value = '编辑';
  dialogVisible.value = true;
};

// 打开添加弹窗
const handleAdd = () => {
  formData.value = {
    areaName: '',
    chargePerson: '',
    area: '',
    isEnable: true,
    photo: '',
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
    .$confirm('是否确认删除参数编号为"' + row.areaName + '"的数据项？')
    .then(async () => {
      return Api.mps.regionalMaintenance.remove({
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
  proxy.$refs['submitFormRef'].validate(async valid => {
    if (valid) {
      const form = {
        ...formData.value,
        isEnable: formData.value.isEnable ? 1 : 0,
      };
      if (formData.value.id) {
        const res = await Api.mps.regionalMaintenance.update(form);
        const { code, msg } = res.data;
        if (code === 200) {
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      } else {
        const res = await Api.mps.regionalMaintenance.create(form);
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
  proxy.resetForm('submitFormRef');
};
</script>
<style lang="scss" scoped>
.avatar-container {
  position: relative;
  display: inline-block;
  width: 178px;
  height: 178px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.avatar-container:hover {
  border-color: var(--el-color-primary);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.delete-button {
  position: absolute;
  top: 5px;
  right: 5px;
  display: none;
}

.avatar-container:hover .delete-button {
  display: block;
}

.avatar-uploader .el-upload {
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  text-align: center;
}
.photo {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #eee;
}
</style>
