<template>
  <div class="app-container">
    <el-form
      class="search-container"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      @keyup.enter="handleQuery"
    >
      <!-- 在此添加搜索项 -->
      <el-form-item label="联系人姓名" prop="contactsName">
        <el-input v-model="queryParams.contactsName" placeholder="联系人姓名" clearable />
      </el-form-item>
      <!-- <el-form-item label="联系方式" prop="contactsPhoneNumber">
        <el-input v-model="queryParams.contactsPhoneNumber" placeholder="联系方式" clearable />
      </el-form-item>
      <el-form-item label="部门" prop="contactsDeptName">
        <el-input v-model="queryParams.contactsDeptName" placeholder="部门" clearable />
      </el-form-item>
      <el-form-item label="职务" prop="contactsPost">
        <el-input v-model="queryParams.contactsPost" placeholder="职务" clearable />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="body-container">
      <div class="operate-container">
        <el-button
          type="primary"
          v-permission="{ id: 'DC_CRM_CLIENT_CONTACTS_ADD' }"
          icon="Plus"
          @click="handleSubmit"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="dataList" @row-click="handleRowClick">
          <!-- <el-table-column type="selection" width="55" /> -->
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column
            v-for="(col, i) in columns"
            :key="i"
            :label="col.label"
            min-width="100px"
            :prop="col.prop"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <template v-if="col.type == 'dc-view'">
                <dc-view v-model="scoped.row[col.prop]" :objectName="col.objectName" />
              </template>
              <template v-else-if="col.type == 'dict'">
                <dc-dict-key :value="scoped.row[col.prop]" :options="dictMaps[col.dictKey]" />
              </template>
              <span v-else>{{ scoped.row[col.prop] || '-' }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column
            label="联系人姓名"
            width="100"
            prop="contactsName"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.contactsName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="联系方式"
            min-width="100"
            prop="contactsPhoneNumber"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.contactsPhoneNumber || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="部门"
            min-width="100"
            prop="contactsDeptName"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.contactsDeptName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="职务"
            min-width="100"
            prop="contactsPost"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.contactsPost || '-' }}</span>
            </template>
          </el-table-column> -->
          <el-table-column width="150" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleSubmit(scoped.row)"
                v-permission="{ id: 'DC_CRM_CLIENT_CONTACTS_EDIT', row: scoped.row }"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                icon="Delete"
                @click.stop="handleDelete(scoped.row)"
                v-permission="{ id: 'DC_CRM_CLIENT_CONTACTS_DEL', row: scoped.row }"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
  </div>
  <el-drawer
    v-model="open"
    :title="title"
    destroy-on-close
    append-to-body
    size="800px"
    @close="closeDrawer"
  >
    <el-form ref="formRef" label-suffix=":" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="联系人姓名" prop="contactsName">
        <el-input v-model="formData.contactsName" placeholder="联系人姓名" clearable />
      </el-form-item>
      <el-form-item label="手机号码" prop="contactsPhoneNumber">
        <el-input v-model="formData.contactsPhoneNumber" placeholder="联系方式" clearable />
      </el-form-item>
      <el-form-item label="邮箱" prop="contactsEmail">
        <el-input v-model="formData.contactsEmail" placeholder="联系方式" clearable />
      </el-form-item>
      <el-form-item label="部门" prop="contactsDeptName">
        <el-input v-model="formData.contactsDeptName" placeholder="部门" clearable />
      </el-form-item>
      <el-form-item label="职务" prop="contactsPost">
        <el-input v-model="formData.contactsPost" placeholder="职务" clearable />
      </el-form-item>
      <el-form-item label="关联客户" prop="customerId">
        <dc-select-dialog
          v-model="formData.customerId"
          placeholder="请选择关联客户"
          objectName="customer"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :clearable="true"
          :disabled="isShow"
          @change="handleCustomerChange"
        />
      </el-form-item>
      <el-form-item label="联系人上级" prop="contactsSuperiorId">
        <dc-select-dialog-v2
          v-model="formData.contactsSuperiorId"
          :multiple="false"
          :multipleLimit="1"
          :returnType="'string'"
          type="input"
          :params="contactsSuperiorIdParam"
          objectName="customerContact"
        ></dc-select-dialog-v2>
        <!-- <el-input v-model="formData.contactsSuperiorId" placeholder="联系人上级" clearable /> -->
        <!-- <dc-select-user
          type="input"
          returnType="string"
          :initChangeable="true"
          v-model="formData.contactsSuperiorId"
          :multiple="false"
          :multipleLimit="1"
        /> -->
      </el-form-item>

      <el-form-item label="角色" prop="contactsRole">
        <el-select v-model="formData.contactsRole" placeholder="请选择角色">
          <el-option
            v-for="(op, j) in dictMaps.DC_CUSTOMER_CONTACT_ROLE"
            :key="j"
            :label="op.dictValue"
            :value="op.dictKey"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="联系人标签" prop="contactsLabel">
        <el-input v-model="formData.contactsLabel" placeholder="联系人标签" clearable />
      </el-form-item>
      <el-form-item label="熟悉程度" prop="familiarityLevelCode">
        <el-select v-model="formData.familiarityLevelCode" placeholder="请选择熟悉程度">
          <el-option
            v-for="(op, j) in dictMaps.DC_CUSTOMER_FAMILIARITY_LEVEL"
            :key="j"
            :label="op.dictValue"
            :value="op.dictKey"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="忌讳事项" prop="contactsTabooItem">
        <el-input v-model="formData.contactsTabooItem" placeholder="忌讳事项" clearable />
      </el-form-item>
      <el-form-item label="销售策略" prop="salesStrategy">
        <el-input v-model="formData.salesStrategy" placeholder="销售策略" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="closeDrawer">取消</el-button>
      </span>
    </template>
  </el-drawer>
</template>

<script setup name="Contacts">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index';
import { deepClone } from '@/utils/util';

const { proxy } = getCurrentInstance();

const pageData = reactive({
  loading: false,
  dictMaps: {
    DC_CUSTOMER_CONTACT_ROLE: [],
  },
  queryParams: {
    current: 1,
    size: 10,
  },
  dataList: [],
  total: 0,
  open: false,
  formData: {},
  rules: {
    customerId: [{ required: true, message: '请选择关联客户', trigger: 'blur' }],
    contactsEmail: [{ required: true, message: '请输入联系人邮箱', trigger: 'blur' }],
    contactsName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
    // contactsSuperiorId: [{ required: true, message: '请选择联系人上级', trigger: 'blur' }],
    contactsRole: [{ required: true, message: '请选择角色', trigger: 'blur' }],
    contactsPhoneNumber: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
    // contactsLabel: [{ required: true, message: '请输入联系人标签', trigger: 'blur' }],
    familiarityLevelCode: [{ required: true, message: '请选择熟悉程度', trigger: 'blur' }],
    // contactsTabooItem: [{ required: true, message: '请输入忌讳事项', trigger: 'blur' }],
    // salesStrategy: [{ required: true, message: '请输入销售策略', trigger: 'blur' }],
    contactsDeptName: [{ required: true, message: '请输入部门', trigger: 'blur' }],
    contactsPost: [{ required: true, message: '请输入职务', trigger: 'blur' }],
  },
  title: '',
});

const columns = ref([
  {
    label: '联系人姓名',
    prop: 'contactsName',
    required: false,
  },
  {
    label: '联系方式',
    prop: 'contactsPhoneNumber',
    required: false,
  },
  {
    label: '邮箱',
    prop: 'contactsEmail',
    required: true,
  },
  {
    label: '部门',
    prop: 'contactsDeptName',
    required: false,
  },
  {
    label: '职务',
    prop: 'contactsPost',
    required: false,
  },
  {
    label: '关联客户',
    prop: 'customerId',
    type: 'dc-view',
    objectName: 'customer',
    required: false,
  },
  {
    label: '联系人上级',
    prop: 'contactsSuperiorId',
    type: 'dc-view',
    objectName: 'user',
    required: true,
  },
  {
    label: '角色',
    prop: 'contactsRole',
    type: 'dict',
    dictKey: 'DC_CUSTOMER_CONTACT_ROLE',
    required: true,
  },
  {
    label: '联系人标签',
    prop: 'contactsLabel',
    required: true,
  },
  {
    label: '熟悉程度',
    prop: 'familiarityLevelCode',
    type: 'dict',
    dictKey: 'DC_CUSTOMER_FAMILIARITY_LEVEL',
    required: true,
  },
  {
    label: '忌讳事项',
    prop: 'contactsTabooItem',
    required: true,
  },
  {
    label: '销售策略',
    prop: 'salesStrategy',
    required: true,
  },
]);

const { loading, queryParams, dataList, total, open, formData, rules, title, dictMaps } =
  toRefs(pageData);

const getDictData = async () => {
  const res = await proxy.useAsyncCache([
    { key: 'DC_CUSTOMER_CONTACT_ROLE' },
    { key: 'DC_CUSTOMER_FAMILIARITY_LEVEL' },
  ]);
  dictMaps.value = res?.value;
};

onMounted(async () => {
  await getDictData();
  getData();
});

// 获取数据
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.crm.customerContacts.list(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      total.value = data.total;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 处理新增或编辑逻辑
const handleSubmit = async row => {
  title.value = '新增客户联系人';
  if (row?.id) {
    title.value = '编辑客户联系人';
    formData.value = deepClone(row);
  }
  open.value = true;
};

// 关闭弹窗
const closeDrawer = () => {
  title.value = '';
  formData.value = {};
  open.value = false;
};

// 保存提交
const submitForm = () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const res = await Api.crm.customerContacts.submit({
        ...formData.value,
        contactsSuperiorId:
          formData.value.contactsSuperiorId?.id || formData.value.contactsSuperiorId,
      });
      const { code } = res.data;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        getData();
        closeDrawer();
      }
    }
  });
};

const contactsSuperiorIdParam = computed(() => {
  return {
    customerId: formData.value.customerId?.id
      ? formData.value.customerId?.id
      : formData.value.customerId,
  };
});

const handleCustomerChange = val => {
  formData.value.contactsSuperiorId = '';
};

// 点击行选中
const handleRowClick = (row, column, event) => {
  handleSubmit(row);
};

// 处理删除
const handleDelete = row => {
  const ids = row.id;
  proxy
    .$confirm(`确定将“[${ids}]”数据删除?`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.crm.customerContacts.delete({ ids }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
      getData();
    })
    .catch(err => {});
};

// 处理查询
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};
</script>

<style lang="scss" scopedd></style>
