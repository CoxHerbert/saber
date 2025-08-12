<template>
  <el-drawer v-model="dialogVisible" size="400px" title="离职办理" @close="cancel">
    <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="离职人员:">
            {{ row.name }}
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="入职时间:">
            {{ row.joinedDate }}
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="离职日期:"
            prop="leavingDate"
            :rules="[
              {
                required: true,
                validator(_, value, callback) {
                  if ([null, '', undefined].includes(value)) {
                    callback(new Error('离职日期不能为空'));
                  } else {
                    callback();
                  }
                },
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <el-date-picker
              type="date"
              v-model="formData.leavingDate"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="请选择离职日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="离职说明:">
            <el-input
              type="textarea"
              v-model="formData.leavingAppraise"
              placeholder="请输入离职说明"
              :rows="5"
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="24">
          <el-form-item class="form-itme-width_50" label="直属上级" id="bdUserId" prop="leaderId">
            <dc-select-user
              v-model="formData.leaderId"
              placeholder="请选择"
              :multiple="false"
              :multiple-limit="1"
            />
          </el-form-item>
        </el-col> -->
        <!-- <el-col :span="24" v-if="row.isAccommodation === '是'">
          <el-form-item label="是否退宿" prop="isCheckOut">
            <el-select v-model="formData.isCheckOut" placeholder="请选择是否退宿" clearable>
              <el-option
                v-for="(item, index) in isCheckinList"
                :key="index"
                :value="item"
                :label="item"
              />
            </el-select>
          </el-form-item>
        </el-col> -->
        <!-- <el-col :span="24">
          <el-form-item label="离职说明" prop="leavingRemark">
            <el-input
              type="textarea"
              v-model="formData.leavingRemark"
              placeholder="请输入离职说明"
              :rows="5"
            ></el-input>
          </el-form-item>
        </el-col> -->
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
import { laborRegisterLeave, laborRegisterUpdate, leaving } from '@/api/system/labor';

const { proxy } = getCurrentInstance();
const data = reactive({
  row: {},
  loading: true,
  rules: {
    isAccommodation: [{ required: true, message: '是否入住为必选项', trigger: 'change' }],
    joinedDate: [{ required: true, message: '入职时间为必选项', trigger: 'change' }],
    leaderId: [{ required: true, message: '直属上级为必选项', trigger: 'change' }],
  },
  dialogVisible: false,
  formData: {},
  ids: [],
  isCheckinList: ['是', '否'],
});
const { rules, dialogVisible, formData, isCheckinList, row } = toRefs(data);
const ruleFormRef = ref(null);

const emit = defineEmits(['success']);

// 打开添加弹窗
const openDialog = async row => {
  proxy.resetForm('ruleFormRef');
  dialogVisible.value = true;
  data.row = row || {};
  formData.value.leaderId = row.leaderId;
  data.rules['leavingDate'] = [{ required: true, message: '离职日期为必填项', trigger: 'change' }];
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      let newrow = {
        ...data.row,
        ...formData.value,
      };
      if (Array.isArray(newrow.laborFileId) && newrow.laborFileId.length > 0) {
        let laborFileIdsList = newrow.laborFileId.map(item => {
          return item.id;
        });
        newrow.laborFileId = laborFileIdsList.join(',');
      }
      const res = await laborRegisterLeave(newrow);
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
  formData.value = {};
};

defineExpose({
  openDialog,
});
</script>
