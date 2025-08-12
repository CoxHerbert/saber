<template>
  <el-dialog v-model="dialogVisible" width="60%" :title="`检查项${title}`" @close="cancel">
    <el-form
      ref="ruleFormRef"
      :rules="rules"
      :model="formData"
      label-width="auto"
      style="overflow-x: hidden; padding: 0px 20px; box-sizing: border-box"
    >
      <div class="form-group-title">基础信息</div>
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item class="el-item-w50" label="检验类别" prop="checkCategoryDict">
            <el-select v-model="formData.checkCategoryDict" placeholder="请选择检验类别" clearable>
              <el-option
                v-for="(item, index) in DC_CHECKCATEGORY_DICT"
                :key="index"
                :value="item.label"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item class="el-item-w50" label="检查项名称：" prop="checkListName">
            <el-select
              v-model="formData.checkListName"
              filterable
              remote
              allow-create
              :remote-method="remoteSearch"
              :loading="loading"
              placeholder="输入关键词搜索或新增选项"
            >
              <el-option
                v-for="item in chekListOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- <el-select
              v-model="formData.inspectionItemName"
              placeholder="请选择检查项名称"
              clearable
            >
              <el-option
                v-for="(item, index) in DC_INAPECTIONITEM_NAME"
                :key="index"
                :value="item.label"
                :label="item.label"
              />
            </el-select> -->
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            class="el-item-w50"
            label="参考版本："
            prop="referVersion"
            v-if="type === 'upgrade'"
          >
            <el-input v-model="formData.referVersion" placeholder="" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="form-group-title">图片实例</div>
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item prop="pictureId" class="uppicture">
            <dc-upload-img v-model="formData.pictureId" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="form-group-title">检查项列表</div>
      <el-button type="text" style="margin: -10px 0px 10px" @click="addRow" icon="el-icon-plus"
        >添加检查项</el-button
      >
      <el-form-item prop="sipEntryItems">
        <el-table
          class="table-check-list"
          :data="formData.sipEntryItems"
          :border="true"
          style="width: 100%"
        >
          <el-table-column label="" width="60">
            <template #default="scope">
              <el-button
                type="text"
                icon="el-icon-minus"
                circle
                @click="deleteRow(scope.$index, formData.sipEntryItems)"
              ></el-button>
            </template>
          </el-table-column>
          <el-table-column label="序号" type="index" width="60px" align="center">
            <template #default="scoped">
              <span>{{ scoped.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="method" label="检测方法&标准" min-width="200px" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.method"
                placeholder="请输入检测方法&标准"
                @input="val => (scope.row.method = trimInput(val))"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="inspectionItem"
            label="检查项名称"
            min-width="160px"
            align="center"
          >
            <template #default="scope">
              <el-input v-model="scope.row.inspectionItem" placeholder="请输入检查项名称" />
            </template>
          </el-table-column>
          <el-table-column prop="measureUnit" label="测量单位" min-width="160px" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.measureUnit"
                @input="val => (scope.row.measureUnit = trimInput(val))"
                placeholder="请输入测量单位"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="measureStandard"
            label="测量标准值"
            min-width="160px"
            align="center"
          >
            <template #default="scope">
              <el-input-number
                v-model="scope.row.measureStandard"
                :step="0.01"
                :precision="5"
                :controls="false"
                :min="scope.row.measureLower"
                :max="scope.row.measureUpper"
                @input="val => (scope.row.measureStandard = trimInput(val))"
                placeholder="请输入测量标准值"
              />
            </template>
          </el-table-column>
          <el-table-column prop="measureUpper" label="上限值" min-width="160px" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.measureUpper"
                :step="0.01"
                :precision="5"
                :controls="false"
                :min="scope.row.measureLower ? scope.row.measureLower : undefined"
                @input="val => (scope.row.measureUpper = trimInput(val))"
                placeholder="请输入上限值"
              />
            </template>
          </el-table-column>
          <el-table-column prop="measureLower" label="下限值" min-width="160px" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.measureLower"
                :step="0.01"
                :precision="5"
                :controls="false"
                :max="scope.row.measureUpper ? scope.row.measureUpper : undefined"
                @input="val => (scope.row.measureLower = trimInput(val))"
                placeholder="请输入下限值"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <div class="form-group-title">备注信息</div>
      <el-col :span="24">
        <el-form-item prop="process">
          <el-input
            type="textarea"
            :row="6"
            v-model="formData.remark"
            placeholder="请输入备注信息"
            :clearable="true"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm(ruleFormRef)">确认</el-button>
        <el-button @click="cancel(ruleFormRef)">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue';
import Api from '@/api/index';
import dayjs from 'dayjs';

const { proxy } = getCurrentInstance();
// 数据字典
const { DC_CHECKCATEGORY_DICT, DC_INAPECTIONITEM_NAME } = proxy.useCache([
  { key: 'DC_CHECKCATEGORY_DICT' },
  { key: 'DC_INAPECTIONITEM_NAME' },
]);

// onMounted(()=> {
//   getCheckList()
// })
const loading = ref(false);
const chekListOptions = ref([]);
// 远程搜索方法
const remoteSearch = async query => {
  if (!query.trim()) return;

  loading.value = true;
  try {
    // 替换为实际API调用
    const res = await Api.qms.sn.sipChecklist({ checkNameQuery: query });
    if (res.data.code === 200) {
      chekListOptions.value =
        res.data?.data?.records?.map(item => ({
          value: item.checkName,
          label: item.checkName,
        })) || [];
    }
  } finally {
    loading.value = false;
  }
};

const trimInput = val => {
  return val.replace(/^\s+ |\s+$/g, '');
};

const keyMaps = {
  method: '检测方法&标准',
  inspectionItem: '检查项名称',
  measureUnit: '测量单位',
  measureStandard: '测量标准值',
  measureUpper: '上限值',
  measureLower: '下限值',
};

const data = reactive({
  type: '',
  rules: {
    checkCategoryDict: [{ required: true, message: '检验类别为必选项', trigger: 'change' }],
    checkListName: [{ required: true, message: '检查项名称为必选项', trigger: 'change' }],
    sipEntryItems: [
      {
        required: true,
        validator(rule, value_, callback) {
          let value = value_ || [];
          if (value?.length < 1) {
            callback(new Error('最少包含1条检查项'));
            return;
          }
          const nullData = [undefined, null, ''];
          let error = '';
          const find = value.findIndex((row, index) => {
            if (nullData.includes(row.method)) {
              error = `第${index + 1}行${keyMaps.method}不能为空`;
              callback(new Error(error));
              return true;
            } else if (nullData.includes(row.inspectionItem)) {
              error = `第${index + 1}行${keyMaps.inspectionItem}不能为空`;
              callback(new Error(error));
              return true;
            } else if (['重复精度', '形位公差'].includes(row.method)) {
              if (nullData.includes(row.measureStandard)) {
                error = `第${index + 1}行${keyMaps.measureStandard}不能为空`;
                callback(new Error(error));
                return true;
              } else if (nullData.includes(row.measureUpper)) {
                error = `第${index + 1}行${keyMaps.measureUpper}不能为空`;
                callback(new Error(error));
                return true;
              } else if (nullData.includes(row.measureLower)) {
                error = `第${index + 1}行${keyMaps.measureLower}不能为空`;
                callback(new Error(error));
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          });
          if (find === -1) {
            callback();
          }
        },
        trigger: ['blur', 'change'],
      },
    ],
  },
  dialogVisible: false,
  formData: { sipEntryItems: [] },
  ids: [],
  title: '新增',
  sipEntryItems: [],
  types: {
    add: '新增',
    edit: '编辑',
    upgrade: '升版',
  },
});

const { type, rules, dialogVisible, formData, title, sipEntryItems, types } = toRefs(data);
const ruleFormRef = ref(null);
const emit = defineEmits(['success']);

// 打开添加弹窗
const openDialog = row => {
  proxy.resetForm('ruleFormRef');
  data.formData = {
    ...row,
    sipEntryItems: row.sipEntryItems?.map
      ? row.sipEntryItems.map(row => {
          return {
            ...row,
            measureLower: row.measureLower ? parseFloat(row.measureLower) : undefined,
            measureStandard: row.measureStandard ? parseFloat(row.measureStandard) : undefined,
            measureUpper: row.measureUpper ? parseFloat(row.measureUpper) : undefined,
          };
        })
      : [],
  };
  type.value = row.type;
  if (row.type == 'add') {
    data.formData.version = 'V1.1';
  }

  // data.sipEntryItems = row.sipEntryItems || [];
  title.value = types.value[row.type];
  dialogVisible.value = true;
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      let data = {
        ...formData.value,
        // sipEntryItems: sipEntryItems.value,
        uniqueCode: type.value == 'add' ? dayjs().valueOf() : formData.value.uniqueCode,
      };
      const res = await Api.qms.sn.entrySubmit(data);
      const { code, msg } = res.data;
      if (code === 200) {
        cancel();
        emit('success');
        proxy.$message.success(msg);
      }
    }
  });
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  formData.value = { sipEntryItems: [] };
  // sipEntryItems.value = [];
};

// 添加行
const addRow = () => {
  if (!formData.value.sipEntryItems) {
    formData.value.sipEntryItems = [];
  }
  formData.value.sipEntryItems.push({ inspectionItem: '', method: '' });
};

// 删除行
const deleteRow = (index, rows) => {
  rows.splice(index, 1);
};

defineExpose({
  openDialog,
});
</script>

<style scoped lang="scss">
.uppicture :deep(.component-upload-image) {
  .el-upload--picture-card {
    width: 160px; /* 设置上传按钮的宽度 */
    height: 120px; /* 设置上传按钮的高度 */
    line-height: 120px; /* 设置上传按钮的行高 */
  }

  .el-upload-list--picture-card .el-upload-list__item {
    width: 160px; /* 设置图片项的宽度 */
    height: 120px; /* 设置图片项的高度 */
  }

  .hide .el-upload--picture-card {
    display: none;
  }
}
.form-group-title {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 10px 0px 20px;
  font-weight: 600;
  font-size: 16px;
  color: #333;

  &::before {
    margin-right: 4px;
    display: block;
    content: '';
    width: 4px;
    height: 13px;
    background-color: #f78431;
  }
}

.report-info {
  width: 100%;
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

.el-item-w50 {
  width: 100%;
  max-width: 600px;
}
</style>
