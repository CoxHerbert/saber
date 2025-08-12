<template>
  <el-drawer v-model="dialogVisible" size="400px" :title="title" @close="cancel">
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

          <el-form-item label="初试结论" prop="preliminaryConclusion">
            <el-select
              v-model="formData.preliminaryConclusion"
              placeholder="请选择初试结论"
              clearable
            >
              <el-option
                v-for="(item, index) in statusList"
                :key="index"
                :value="item"
                :label="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="初试说明" prop="preliminaryDescription">
        <el-input
          type="textarea"
          v-model="formData.preliminaryDescription"
          placeholder="请输入初试说明"
          :rows="5"
        ></el-input>
      </el-form-item>
      <el-form-item label="岗位" prop="jobGradeDictCode">
        <el-select
          v-model="formData.jobGradeDictCode"
          placeholder="请选择岗位"
          clearable
          @change="
            () => {
              formData.deptId = '';
              formData.leaderId = '';
            }
          "
        >
          <el-option
            v-for="(item, index) in DC_LABOR_POSITION"
            :key="index"
            :value="item.dictKey"
            :label="item.dictValue"
          />
        </el-select>
      </el-form-item>
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

      <el-form-item class="form-itme-width_50" label="直属上级" prop="leaderId">
        <dc-select-user v-model="formData.leaderId" placeholder="请选择" :multiple="true" />
      </el-form-item>

      <el-form-item
        v-if="formData.jobGradeDictCode == 7"
        class="form-itme-width_50"
        label="是否转为待入职"
        prop="isWaitOnboarding"
      >
        <el-switch v-model="formData.isWaitOnboarding" active-value="1" inactive-value="0" />
      </el-form-item>
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
import { laborDecision, getLaborCompanyList } from '@/api/system/labor';
import { watch } from 'vue';
const { proxy } = getCurrentInstance();
const { DC_LABOR_POSITION } = proxy.useCache([{ key: 'DC_LABOR_POSITION' }]);

const data = reactive({
  loading: true,
  rules: {
    companyId: [{ required: true, message: '劳务公司为必选项', trigger: 'change' }],
    preliminaryConclusion: [{ required: true, message: '初试结论为必选项', trigger: 'change' }],
    jobGradeDictCode: [{ required: true, message: '岗位为必选项', trigger: 'change' }],
  },
  dialogVisible: false,
  title: '',
  formData: {},
  ids: [],
  statusList: ['通过', '未通过'],
  companyList: [],
});
const { rules, dialogVisible, title, formData, statusList, companyList } = toRefs(data);
const ruleFormRef = ref(null);

const emit = defineEmits(['judgeSuccess']);

onMounted(() => {
  getLaborCompanyListFn();
});

watch(
  () => formData.value.isWaitOnboarding,
  val => {
    let rulusObj = {
      jobGradeDictCode: [{ required: true, message: '岗位为必选项', trigger: 'change' }],
      deptId: [{ required: true, message: '所属部门必选项', trigger: 'change' }],
      leaderId: [{ required: true, message: '直属上级必选项', trigger: 'change' }],
    };

    if (val == 1) {
      rules.value = Object.assign(rulusObj, rules.value);
    } else {
      rules.value = {
        companyId: [{ required: true, message: '劳务公司为必选项', trigger: 'change' }],
        preliminaryConclusion: [{ required: true, message: '初试结论为必选项', trigger: 'change' }],
      };
    }
  }
);

const changeCustomerRlist = val => {
  data.formData.leaderId = val[0].deptLeaderId;
  data.formData.deptId = val[0].id;
};

// 打开添加弹窗
const openDialog = async row => {
  title.value = '初试判定';
  proxy.resetForm('ruleFormRef');
  dialogVisible.value = true;
  data.ids = [row.id];
  formData.value.companyId = row.companyId;
  formData.value.jobGradeDictCode = row.jobGradeDictCode;
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      let obj = {};
      data.ids.map(item => {
        obj[item] = {
          ...formData.value,
          isPreliminary: true,
          laborFileId: null,
        };
      });
      const res = await laborDecision(obj);
      const { code, msg } = res.data;
      if (code === 200) {
        cancel();
        emit('judgeSuccess');
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

defineExpose({
  openDialog,
});
</script>
