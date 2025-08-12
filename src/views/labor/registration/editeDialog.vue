<template>
  <el-drawer v-model="dialogVisible" size="400px" title="编辑" @close="cancel">
    <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="劳务公司" prop="companyId">
            <el-select v-model="formData.companyId" placeholder="请选择劳务公司" clearable>
              <el-option
                v-for="(item, index) in companyList"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item class="form-itme-width_50" label="所属部门" prop="deptId">
            <dc-select-dialog
              v-model="formData.deptId"
              objectName="dept"
              type="input"
              @change="changeCustomerRlist"
              :params="{
                parentId:
                  formData.jobGradeDictCode == 7 ? '1906612083816628226' : '1890319987136700417',
              }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item class="form-itme-width_50" label="直属上级" id="bdUserId" prop="leaderId">
            <dc-select-user
              v-model="formData.leaderId"
              placeholder="请选择"
              :multiple="true"
              disabled
            />
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
</template>
<script setup>
import { laborRegisterUpdate, getLaborCompanyList } from '@/api/system/labor';
import { onMounted } from 'vue';

const { proxy } = getCurrentInstance();
const data = reactive({
  row: {},
  loading: true,
  companyList: [],
  rules: {
    deptId: [{ required: true, message: '所属部门为必选项', trigger: 'change' }],
    isAccommodation: [{ required: true, message: '是否入住为必选项', trigger: 'change' }],
    joinedDate: [{ required: true, message: '入职时间为必选项', trigger: 'change' }],
    leaderId: [{ required: true, message: '直属上级为必选项', trigger: 'change' }],
  },
  dialogVisible: false,
  formData: {},
  ids: [],
  isCheckinList: ['是', '否'],
  grandList: ['大工', '中工', '小工'],
});
const { rules, dialogVisible, formData, isCheckinList, companyList } = toRefs(data);
const ruleFormRef = ref(null);

const emit = defineEmits(['success']);

onMounted(() => {
  getLaborCompanyListFn();
});

// 打开添加弹窗
const openDialog = async row => {
  proxy.resetForm('ruleFormRef');
  dialogVisible.value = true;
  data.row = row || {};
  data.formData.jobGradeDictCode = row.jobGradeDictCode;
  data.formData.leaderId = row.leaderId;
  data.formData.id = row.id;
  data.formData.deptId = row.deptId;
  data.formData.companyId = row.companyId;
};

const changeCustomerRlist = val => {
  data.formData.leaderId = val[0].deptLeaderId;
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      let newrow = Object.assign(data.row, formData.value);
      let deptId = null;
      if (newrow.deptId && Array.isArray(newrow.deptId)) {
        deptId = newrow.deptId.map(item => item.id);
        deptId = deptId.join(',');
        newrow.deptId = deptId;
      }
      const res = await laborRegisterUpdate(newrow);
      const { code, msg } = res.data;
      if (code === 200) {
        cancel();
        emit('success');
        proxy.$message.success(msg);
      }
    }
  });
};

const getLaborCompanyListFn = () => {
  getLaborCompanyList({
    current: 1,
    size: 100000,
  }).then(res => {
    data.companyList = res.data.data.records.map(item => {
      return {
        value: item.id,
        label: item.name,
      };
    });
  });
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  formData.value = {};
};

defineExpose({
  openDialog,
});
</script>
