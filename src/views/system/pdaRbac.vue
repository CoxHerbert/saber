<template>
  <div class="content-warp">
    <div class="header none-border">
      <div class="title">PDA权限管理</div>
      <div class="search-area"></div>
    </div>
    <div class="content-body">
      <div class="content-area">
        <div class="operate-container">
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
        <div class="table-container">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="roleId" label="角色" align="center" show-overflow-tooltip>
              <template #default="scoped">
                <dc-dict type="text" :options="DC_PDA_ROLE" :value="scoped.row.roleId" />
              </template>
            </el-table-column>
            <el-table-column prop="userIds" label="用户数量" align="center" show-overflow-tooltip>
              <template #default="scoped">
                {{ scoped.row.userIds.split(',').length }}
              </template>
            </el-table-column>
            <el-table-column prop="orgId" label="所属组织" align="center" show-overflow-tooltip>
              <template #default="scoped">
                <dc-view v-model="scoped.row.orgId" objectName="org" />
              </template>
            </el-table-column>
            <el-table-column prop="funcIds" label="功能列表" align="center" show-overflow-tooltip>
              <template #default="scoped">
                <template v-for="(funcId, index) in scoped.row.funcIds.split(',')" :key="index">
                  <dc-dict type="text" :options="DC_PDA_FUNC" :value="funcId" />
                  <span v-if="index < scoped.row.funcIds.split(',').length - 1"> | </span>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="funcIds" label="打印服务" align="center" show-overflow-tooltip>
              <template #default="scoped">
                <dc-dict
                  type="text"
                  :options="DC_PDA_PRINTER_SERVER"
                  :value="scoped.row.printerServer"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="funcIds"
              label="标签默认打印机"
              align="center"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{ scoped.row.cardDefaultPrinter }}
              </template>
            </el-table-column>
            <el-table-column
              prop="funcIds"
              label="单据默认打印机"
              align="center"
              show-overflow-tooltip
            >
              <template #default="scoped">
                {{ scoped.row.orderDefaultPrinter }}
              </template>
            </el-table-column>
            <el-table-column prop="createUser" label="创建人" align="center" show-overflow-tooltip>
              <template #default="scoped">
                <dc-view v-model="scoped.row.createUser" objectName="user" showKey="realName" />
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column label="操作" align="center" fixed="right" width="180">
              <template #default="scoped">
                <el-button link type="primary" @click="handleUpdate(scoped.row)">修改</el-button>
                <el-button link type="primary" @click="handleDelete(scoped.row)">删除</el-button>
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
    </div>
  </div>

  <el-drawer v-model="open.drawer" width="600px" :title="open.operateTitle" @close="cancel">
    <el-form ref="submitFormRef" :model="formData" :rules="rules" label-width="auto">
      <el-form-item label="角色" prop="roleId">
        <el-select v-model="formData.roleId" clearable placeholder="请选择">
          <el-option
            v-for="item in DC_PDA_ROLE"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户" prop="userIds">
        <dc-select-user
          v-model="formData.userIds"
          placeholder="请选择用户"
          :multiple="true"
          :multiple-limit="0"
        />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <dc-select v-model="queryParams.orgId" objectName="org" placeholder="请选择" clearable />
      </el-form-item>
      <el-form-item label="功能列表" prop="funcIds">
        <el-select v-model="formData.funcIds" clearable placeholder="请选择" multiple>
          <el-option
            v-for="item in DC_PDA_FUNC"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="打印服务" prop="printerServer">
        <el-select
          v-model="formData.printerServer"
          clearable
          placeholder="请选择"
          @change="handleChange"
        >
          <el-option
            v-for="item in DC_PDA_PRINTER_SERVER"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签默认打印机" prop="cardDefaultPrinter">
        <el-select
          v-model="formData.cardDefaultPrinter"
          clearable
          placeholder="请选择"
          @click="hanglecardDefaultPrinter"
        >
          <el-option
            v-for="item in cardDefaultPrinterList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="单据默认打印机" prop="orderDefaultPrinter">
        <el-select
          v-model="formData.orderDefaultPrinter"
          clearable
          placeholder="请选择"
          @click="hangleorderDefaultPrinter"
        >
          <el-option
            v-for="item in orderDefaultPrinterList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup name="MyClientsList">
import { getCurrentInstance, reactive, toRefs } from 'vue';
import Api from '@/api/index';
import { onMounted } from 'vue';

const { proxy } = getCurrentInstance();

// 数据字典
const { DC_PDA_ROLE, DC_PDA_FUNC, DC_PDA_PRINTER_SERVER } = proxy.useCache([
  { key: 'DC_PDA_ROLE' },
  { key: 'DC_PDA_FUNC' },
  { key: 'DC_PDA_PRINTER_SERVER' },
]);

const data = reactive({
  loading: true,
  queryParams: {
    current: 1,
    size: 10,
  },
  total: 0,
  tableData: [],
  open: {
    drawer: false,
    operateTitle: '',
  },

  formData: {},
  rules: {
    roleId: [{ required: true, message: '请选择', trigger: 'blur' }],
    userIds: [{ required: true, message: '请选择', trigger: 'blur' }],
    orgId: [{ required: true, message: '请选择', trigger: 'blur' }],
    funcIds: [{ required: true, message: '请选择', trigger: 'blur' }],
    // printerServer: [{ required: true, message: '请输入', trigger: 'blur' }],
    // cardDefaultPrinter: [{ required: true, message: '请输入', trigger: 'blur' }],
    // orderDefaultPrinter: [{ required: true, message: '请输入', trigger: 'blur' }],
  },
  cardDefaultPrinterList: [],
  orderDefaultPrinterList: [],
  cardDefaultPrinterRef: '',
});

const {
  loading,
  queryParams,
  total,
  tableData,
  open,
  formData,
  rules,
  cardDefaultPrinterList,
  orderDefaultPrinterList,
  cardDefaultPrinterRef,
} = toRefs(data);

onMounted(async () => {
  await getData();
});

// 获取主数据列表
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.system.pdaRbac.list(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

const handleChange = selectedValue => {
  // 根据选中的 value 查找对应的对象
  const selectedItem = DC_PDA_PRINTER_SERVER.value.find(item => item.value === selectedValue);
  // 如果找到对应项，打印其 dictKey
  if (selectedItem) {
    formData.value.cardDefaultPrinter = undefined;
    formData.value.orderDefaultPrinter = undefined;
    cardDefaultPrinterList.value = [];
    orderDefaultPrinterList.value = [];
    cardDefaultPrinterRef.value = selectedItem.dictKey;
  }
};

// 标签打印
const hanglecardDefaultPrinter = async () => {
  try {
    // 拿到formData.value.printerServer 的 id  去查对应的 id 转化
    const selectedItem = DC_PDA_PRINTER_SERVER.value.find(
      item => item.value === formData.value.printerServer
    );
    const query = {
      server: cardDefaultPrinterRef.value || selectedItem.dictKey,
    };
    const res = await Api.system.pdaRbac.printerSearch(query);
    const { code, data } = res.data;
    if (code == 200) {
      cardDefaultPrinterList.value = data;
    }
  } catch (error) {}
};

// 标签打印
const hangleorderDefaultPrinter = async () => {
  try {
    const selectedItem = DC_PDA_PRINTER_SERVER.value.find(
      item => item.value === formData.value.printerServer
    );
    const query = {
      server: cardDefaultPrinterRef.value || selectedItem.dictKey,
    };
    const res = await Api.system.pdaRbac.printerSearch(query);
    const { code, data } = res.data;
    if (code == 200) {
      orderDefaultPrinterList.value = data;
    }
  } catch (error) {}
};

/** 编辑 */
const handleUpdate = async row => {
  // 详情接口
  const id = { id: row.id };
  const res = await Api.system.pdaRbac.detail(id);
  const { code, data } = res.data;
  if (code == 200) {
    formData.value = {
      id: data.id,
      userIds: data.userIds,
      roleId: data.roleId,
      orgId: String(data.orgId),
      funcIds: data.funcIds.split(','),
      printerServer: data.printerServer,
      cardDefaultPrinter: data.cardDefaultPrinter,
      orderDefaultPrinter: data.orderDefaultPrinter,
    };
  }
  open.value.drawer = true;
  open.value.operateTitle = '编辑';
};

/** 新增 */
const handleAdd = row => {
  // 抽屉类型
  formData.value = {};
  open.value.drawer = true;
  open.value.operateTitle = '新增';
};

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = { ids: row.id };
  proxy
    .$confirm('是否确认删除参数编号为"' + row.createUser + '"的数据项？')
    .then(async () => {
      return Api.system.pdaRbac.remove(configIds);
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
        funcIds: formData.value.funcIds.join(','),
      };
      if (formData.value.id) {
        // 编辑
        const res = await Api.system.pdaRbac.submit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          queryParams.value = {
            current: 1,
            size: 10,
          };
          cancel();
          getData();
          proxy.$message.success(msg);
        }
      } else {
        // 新增
        const res = await Api.system.pdaRbac.submit(form);
        const { code, msg } = res.data;
        if (code === 200) {
          queryParams.value = {
            current: 1,
            size: 10,
          };
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
  open.value.drawer = false;
  formData.value = {};
  proxy.resetForm('submitFormRef');
};
</script>
<style scoped lang="scss">
.tag-label {
  display: flex;
  flex-wrap: wrap;
}
</style>
