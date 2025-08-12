<template>
  <el-drawer v-model="dialogVisible" size="400px" title="入职办理信息填写" @close="cancel">
    <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
      <el-row :gutter="24">
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
        <el-col :span="24">
          <el-form-item label="是否入住" prop="isAccommodation">
            <el-select v-model="formData.isAccommodation" placeholder="请选择是否入住" clearable>
              <el-option
                v-for="(item, index) in isCheckinList"
                :key="index"
                :value="item"
                :label="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="入职时间" prop="joinedDate">
            <el-date-picker
              :default-value="new Date()"
              v-model="formData.joinedDate"
              placeholder="请选择入职时间"
              type="date"
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="上传附件" prop="laborFileId">
            <dc-upload
              v-model="formData.laborFileId"
              :limit="3"
              :targetType="Const.targetType.OPPS"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
            <el-input
              type="textarea"
              v-model="formData.remark"
              placeholder="请输入备注信息"
              :rows="5"
            ></el-input>
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
import { laborRegisterUpdate, onboarding } from '@/api/system/labor';
import Const from '@/const';
import dayjs from 'dayjs';

const { proxy } = getCurrentInstance();
const data = reactive({
  row: {},
  loading: true,
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
const { rules, dialogVisible, formData, isCheckinList } = toRefs(data);
const ruleFormRef = ref(null);

const emit = defineEmits(['success']);

// 打开添加弹窗
const openDialog = async row => {
  proxy.resetForm('ruleFormRef');
  dialogVisible.value = true;
  data.row = row || {};
  data.formData.joinedDate = new Date();
  data.formData.jobGradeDictCode = row.jobGradeDictCode;
  data.formData.isAccommodation = row.isAccommodation;
  data.formData.leaderId = row.leaderId;
  data.formData.id = row.id;
  data.formData.deptId = row.deptId;
};

const changeCustomerRlist = val => {
  data.formData.leaderId = val[0].deptLeaderId;
};

// 弹出框提交表单
const submitForm = async formEl => {
  // console.log(data.formData);
  // return;
  formEl.validate(async valid => {
    if (valid) {
      let newrow = Object.assign(data.row, formData.value);
      newrow.joinedDate = dayjs(newrow.joinedDate).format('YYYY-MM-DD');
      if (Array.isArray(newrow.laborFileId) && newrow.laborFileId.length > 0) {
        let laborFileIdsList = newrow.laborFileId.map(item => {
          return item.id;
        });
        newrow.laborFileId = laborFileIdsList.join(',');
      }
      let deptId = null;
      if (newrow.deptId && Array.isArray(newrow.deptId)) {
        deptId = newrow.deptId.map(item => item.id);
        deptId = deptId.join(',');
        newrow.deptId = deptId;
      }
      const res = await laborRegisterUpdate(newrow);
      const { code, msg } = res.data;
      if (code === 200) {
        const chageStatus = await onboarding([newrow.id]);
        if (chageStatus) {
          cancel();
          emit('success');
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

defineExpose({
  openDialog,
});
</script>
