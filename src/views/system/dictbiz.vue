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
      <el-form-item label="字典编号" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入字典编号" clearable />
      </el-form-item>
      <el-form-item label="字典名称" prop="dictValue">
        <el-input v-model="queryParams.dictValue" placeholder="请输入字典名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查找</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="body-container">
      <div class="operate-container">
        <div>
          <el-button
            type="primary"
            icon="Plus"
            @click="handleSubmit"
            v-if="func.isOperate(permission.dictbiz_add)"
          >
            新增
          </el-button>
          <el-button
            type="danger"
            icon="Delete"
            @click="handleDeletes"
            v-if="func.isOperate(permission.dictbiz_delete)"
            plain
          >
            删除
          </el-button>
        </div>
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="dataList"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          border
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="60" type="index" align="center">
            <template #default="scoped">
              <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <!-- 在此添加其他列 -->
          <el-table-column
            label="字典编号"
            min-width="180"
            prop="code"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <el-tag type="primary">{{ scoped.row.code || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="字典名称"
            min-width="100"
            prop="dictValue"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.dictValue || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="字典排序"
            min-width="100"
            prop="sort"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.sort }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="封存"
            min-width="100"
            prop="isSealed"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <el-tag type="primary" v-if="scoped.row.isSealed === 0 || !!scoped.row.isSealed">{{
                scoped.row.isSealed ? '是' : '否'
              }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            label="字典备注"
            min-width="100"
            prop="remark"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span>{{ scoped.row.remark || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column max-width="320" fixed="right" label="操作" align="center">
            <template #default="scoped">
              <el-button
                text
                type="primary"
                icon="Edit"
                v-if="func.isOperate(permission.dictbiz_edit)"
                @click.stop="handleSubmit(scoped.row)"
              >
                编辑
              </el-button>
              <el-button
                text
                type="primary"
                icon="Delete"
                v-if="func.isOperate(permission.dictbiz_delete)"
                @click.stop="removeRow(scoped.row)"
              >
                删除
              </el-button>
              <el-button
                text
                type="primary"
                icon="el-icon-setting"
                v-if="userInfo.role_name.includes('admin')"
                @click.stop="handleRowClick(scoped.row)"
              >
                字典配置
              </el-button>
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
  <el-dialog v-model="open" :title="title" width="900">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px">
      <el-row>
        <el-col>
          <el-form-item label="字典编号" prop="code">
            <el-input v-model="formData.code" placeholder="请输入字典编号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字典名称" prop="dictValue">
            <el-input v-model="formData.dictValue" placeholder="请输入字典名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字典排序" prop="sort">
            <el-input-number
              class="w-full"
              v-model="formData.sort"
              :min="0"
              placeholder="请输入字典排序"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="封存" prop="isSealed">
            <el-switch v-model="formData.isSealed" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字典备注" prop="remark">
            <el-input v-model="formData.remark" placeholder="请输入字典备注" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="submitForm">{{
          !!formData?.id ? '编辑' : '新增'
        }}</el-button>
      </div>
    </template>
  </el-dialog>
  <detail ref="detailRef" />
</template>

<script setup name="DictBiz">
import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue';
import Api from '@/api/index'; // 根据实际路径调整导入
import store from '@/store/';
import Detail from './dictBizChild/detail.vue';
import { deepClone } from '@/utils/util';
import func from '@/utils/func';

const { proxy } = getCurrentInstance();

const pageData = reactive({
  // 加载字段
  loading: false,
  // 查询参数
  queryParams: {
    current: 1,
    size: 10,
  },
  // table数据
  dataList: [],
  // 总条数
  total: 0,
  // 选中的行
  ids: [],
  // 字典配置弹窗
  detailRef: null,
  // 控制弹窗显示隐藏
  open: false,
  // 标题
  title: '',
  // 表单
  formData: {},
  // 表单规则
  rules: {
    code: [{ required: true, message: '请输入字典编号', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
    sort: [{ required: true, message: '请输入字典排序', trigger: 'blur' }],
    isSealed: [{ required: true, message: '请选择封存状态', trigger: 'blur' }],
  },
  // 表单
  formRef: null,
});

const {
  loading,
  queryParams,
  dataList,
  total,
  ids,
  detailRef,
  open,
  title,
  formData,
  rules,
  formRef,
} = toRefs(pageData);

const permission = computed(() => store.getters.permission);
const userInfo = computed(() => store.getters.userInfo);

onMounted(() => {
  getData();
});

const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.system.dictbiz.getParentList(queryParams.value);
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
// 处理行点击
const handleRowClick = row => {
  detailRef.value.handleOpen(row);
};

// 选中变化事件
const handleSelectionChange = selection => {
  ids.value = selection.map(row => row.id);
};

// 处理新增或编辑逻辑
const handleSubmit = async row => {
  title.value = !!row?.id ? '编辑' : '新增';
  formData.value = {
    code: '',
    dictValue: '',
    sort: 0,
    isSealed: false,
    remark: '',
  };
  if (!!row?.id) {
    formData.value = deepClone(row);
  }
  open.value = true;
};

// 关闭
const handleClose = () => {
  formData.value = {
    code: '',
    dictValue: '',
    sort: '',
    isSealed: false,
    remark: '',
  };
  open.value = false;
};

// 表单提交
const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      formData.value.isSealed = formData.value.isSealed ? 1 : 0;
      if (formData.value.id) {
        const res = await Api.system.dictbiz.update(formData.value);
        const { code, msg } = res.data;
        if (code === 200) {
          handleClose();
          getData();
          proxy.$message({ type: 'success', message: msg });
        }
      } else {
        const res = await Api.system.dictbiz.add(formData.value);
        const { code, msg } = res.data;
        if (code === 200) {
          handleClose();
          getData();
          proxy.$message({ type: 'success', message: msg });
        }
      }
    }
  });
};

// 删除行
const removeRow = row => {
  proxy
    .$confirm('确定将选择数据删除?', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.system.dictbiz.remove({ ids: row.id }))
    .then(() => {
      getData();
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
    })
    .catch(() => {});
};

// 删除选中的行
const handleDeletes = () => {
  if (ids.value.length === 0) {
    proxy.$message.warning('请选择至少一条数据');
    return;
  }
  proxy
    .$confirm('确定将选择数据删除?', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => Api.system.dictbiz.remove({ ids: ids.value }))
    .then(() => {
      getData();
      proxy.$message({
        type: 'success',
        message: '操作成功!',
      });
    });
};

const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};

const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  proxy.resetForm('queryRef');
  getData();
};
</script>

<style lang="scss" scoped></style>
