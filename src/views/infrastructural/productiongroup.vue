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
          <el-form-item label="生产组名称" prop="workGroupName">
            <el-input
              v-model="queryParams.workGroupName"
              placeholder="请输入生产组名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="生产组别" prop="productionId">
            <el-select v-model="queryParams.productionId" placeholder="请选择生产组别" clearable>
              <el-option
                v-for="item in DC_MES_PRODUCTION_GROUP"
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
        v-permission="{ id: 'DC_MES_PRODUCTION_GROUP_ADD' }"
        @click="handleAdd"
        >新增</el-button
      >
    </div>

    <div class="table-container">
      <el-table v-loading="loading" :data="dataList">
        <el-table-column width="140px" label="生产组名称" align="center">
          <template #default="scoped">
            <!-- <el-tag :color="scoped.row.colorCode"></el-tag> -->
            {{ scoped.row.workGroupName }}
          </template>
        </el-table-column>
        <el-table-column min-width="140px" label="维护区域" align="center">
          <template #default="scoped">
            {{ scoped.row.areaName }}
          </template>
        </el-table-column>
        <el-table-column width="120px" label="负责人 " align="center">
          <template #default="scoped">
            {{ scoped.row.chargePerson }}
          </template>
        </el-table-column>
        <el-table-column width="140" label="生产组别" align="center">
          <template #default="scoped">
            <dc-dict
              type="text"
              :options="DC_MES_PRODUCTION_GROUP"
              :value="scoped.row.productionId"
            />
          </template>
        </el-table-column>
        <el-table-column width="120" label="负责人照片 " align="center">
          <template #default="scoped">
            <img class="photo" :src="scoped.row.photo" v-if="scoped.row.photo" />
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column width="120px" label="编制人力 " align="center">
          <template #default="scoped">
            {{ scoped.row.manpowerQuantity }}
          </template>
        </el-table-column>
        <el-table-column width="120px" label="劳务人力 " align="center">
          <template #default="scoped">
            {{ scoped.row.laborManpowerQuantity }}
          </template>
        </el-table-column>
        <el-table-column
          width="120"
          label="标准工时"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scoped"> {{ scoped.row.standardWorkingHours }}/h</template>
        </el-table-column>
        <el-table-column width="200" label="是否启用" align="center">
          <template #default="scoped">
            <el-switch
              v-model="scoped.row.isEnable"
              v-permission="{ id: 'DC_MES_PRODUCTION_GROUP_EDIT', row: scoped.row }"
              @change="handleChange(scoped.row)"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="160">
          <template #default="scoped">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scoped.row)"
              v-permission="{ id: 'DC_MES_PRODUCTION_GROUP_EDIT', row: scoped.row }"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              icon="Delete"
              v-permission="{ id: 'DC_MES_PRODUCTION_GROUP_DEL', row: scoped.row }"
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

    <el-drawer v-model="dialogVisible" size="600px" :title="title" @close="cancel">
      <el-form class="mt-5" ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
        <el-form-item label="生产组名称" prop="workGroupName">
          <el-input v-model="formData.workGroupName" placeholder="请输入生产组名称" clearable />
        </el-form-item>
        <el-form-item label="生产组颜色" prop="colorCode">
          <el-color-picker v-model="formData.colorCode" />
        </el-form-item>
        <el-form-item label="工艺类别" prop="processCategoryCode">
          <el-select v-model="formData.processCategoryCode" placeholder="请选择" clearable>
            <el-option
              v-for="(item, index) in processCategoryOptions"
              :key="index"
              :value="item.productionProcessCode"
              :label="item.processCategory"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工种类别" prop="workTypeId">
          <el-select v-model="formData.workTypeId" placeholder="请选择" clearable>
            <el-option
              v-for="(dict, index) in DC_LABOR_POSITION"
              :key="index"
              :value="dict.id"
              :label="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="区域选择">
          <el-select v-model="formData.areaName" placeholder="请选择" clearable>
            <el-option
              v-for="item in areaNameOptions"
              :key="item.areaName"
              :label="item.areaName"
              :value="item.areaName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生产组别">
          <el-select v-model="formData.productionId" placeholder="请选择" clearable>
            <el-option
              v-for="item in DC_MES_PRODUCTION_GROUP"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <dc-select-user
            v-model="formData.chargePersonId"
            placeholder="请选择负责人"
            :multiple="false"
            @change="changeChargePerson"
          />
        </el-form-item>
        <el-form-item label="头像">
          <dc-upload-img v-model="formData.photo" :limit="1" />
        </el-form-item>
        <el-form-item label="编制人力">
          <el-input-number v-model="formData.manpowerQuantity" :min="0">
            <template #suffix>
              <span>人</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="劳务人力">
          <el-input-number v-model="formData.laborManpowerQuantity" :min="0">
            <template #suffix>
              <span>人</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="人天工时">
          <el-input-number v-model="formData.standardWorkingHours" :min="1">
            <template #suffix>
              <span>时</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="是否启用" prop="isEnable">
          <el-switch v-model="formData.isEnable" />
        </el-form-item>
        <el-form-item label="汇报人员" prop="reportPersonIds">
          <dc-select-user
            v-model="formData.reportPersonIds"
            placeholder="请选择汇报人员"
            :multiple-limit="0"
          />
        </el-form-item>
        <el-form-item label="领料人" prop="pickPersonIds">
          <dc-select-user
            v-model="formData.pickPersonIds"
            placeholder="请选择领料人"
            :multiple-limit="0"
          />
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
<script setup name="Productiongroup">
import { onMounted } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();

const { DC_LABOR_POSITION } = proxy.useCache([{ key: 'DC_LABOR_POSITION' }]);

const data = reactive({
  formData: {},
  queryParams: {
    current: 1,
    size: 10,
    workGroupName: undefined,
  },
  dataList: [],
  loading: true,
  total: 0,
  switchValue: true,
  title: '',
  rules: {
    colorCode: [{ required: true, message: '生产组颜色为必选项', trigger: 'change' }],
    processCategoryCode: [{ required: true, message: '工艺类别为必选项', trigger: 'change' }],
    reportPersonIds: [{ required: true, message: '汇报人员为必选项', trigger: 'change' }],
  },
  dialogVisible: false,
  areaNameOptions: [],
  processCategoryOptions: [],
});

const {
  queryParams,
  formData,
  dataList,
  loading,
  total,
  switchValue,
  title,
  rules,
  dialogVisible,
  areaNameOptions,
  processCategoryOptions,
} = toRefs(data);

const ruleFormRef = ref(null);

// 数据字典
const { DC_MES_PRODUCTION_GROUP } = proxy.useCache([{ key: 'DC_MES_PRODUCTION_GROUP' }]);

onMounted(() => {
  getData();
});

/** 查询参数列表 */
const getData = async () => {
  loading.value = true;
  const res = await Api.mps.workGroup.list(queryParams.value);
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
    ...row,
    isEnable: row.isEnable ? 1 : 0,
  };
  const res = await Api.mps.workGroup.update(formData.value);
  const { code, msg } = res.data;
  if (code === 200) {
    getData();
    proxy.$message.success(msg);
  }
};

// 开关方式
const handleUpdate = async row => {
  await getRegionData();
  formData.value = {
    id: row.id,
    workGroupName: row.workGroupName,
    processCategoryCode: row.processCategoryCode,
    areaName: row.areaName,
    chargePersonId: row.chargePersonId,
    area: row.area,
    laborManpowerQuantity: row.laborManpowerQuantity,
    productionId: row.productionId,
    manpowerQuantity: row.manpowerQuantity,
    standardWorkingHours: row.standardWorkingHours,
    isEnable: row.isEnable,
    photo: row.photo,
    reportPersonIds: row.reportPersonIds,
    workTypeId: row.workTypeId,
    processCategoryCode: row.processCategoryCode,
    colorCode: row.colorCode,
  };
  title.value = '编辑';
  dialogVisible.value = true;
};

/** 区域参数列表 */
const getRegionData = async () => {
  const params = {
    current: 1,
    size: 1000000,
    isEnable: '1',
  };
  const res = await Api.mps.regionalMaintenance.list(params);
  areaNameOptions.value = res.data.data.records;

  // 工艺类别
  const res2 = await Api.mps.produceRoute.list(params);
  processCategoryOptions.value = res2.data.data.records;
};

// 打开添加弹窗
const handleAdd = async () => {
  await getRegionData();
  formData.value = {
    workGroupName: '',
    processCategoryCode: '',
    areaName: '',
    chargePersonId: '',
    area: '',
    isEnable: true,
    photo: '',
    manpowerQuantity: 0,
    laborManpowerQuantity: 0,
    standardWorkingHours: 8,
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
    .$confirm('是否确认删除参数编号为"' + row.workGroupName + '"的数据项？')
    .then(async () => {
      return Api.mps.workGroup.remove({
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
const submitForm = async () => {
  const form = {
    ...formData.value,
    isEnable: formData.value.isEnable ? 1 : 0,
  };
  if (formData.value.id) {
    const res = await Api.mps.workGroup.update(form);
    const { code, msg } = res.data;
    if (code === 200) {
      cancel();
      getData();
      getRegionData();
      proxy.$message.success(msg);
    }
  } else {
    const res = await Api.mps.workGroup.create(form);
    const { code, msg } = res.data;
    if (code === 200) {
      cancel();
      getData();
      proxy.$message.success(msg);
    }
  }
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  formData.value = {};
};

const changeChargePerson = user => {
  formData.value.chargePerson = user.name;
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
