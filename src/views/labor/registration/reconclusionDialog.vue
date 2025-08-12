<template>
  <el-drawer v-model="dialogVisible" size="450px" title="复试结论" @close="cancel">
    <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="复试结论" prop="finalConclusion">
            <el-select v-model="formData.finalConclusion" placeholder="请选择复试结论" clearable>
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

      <el-form-item label="岗位等级" prop="positionDictCode" v-if="formData.jobGradeDictCode != 7">
        <el-select v-model="formData.positionDictCode" placeholder="请选择等级" clearable>
          <el-option v-for="(item, index) in grandList" :key="index" :value="item" :label="item" />
        </el-select>
      </el-form-item>

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
      <el-form-item class="form-itme-width_50" label="直属上级" id="bdUserId" prop="leaderId">
        <dc-select-user v-model="formData.leaderId" placeholder="请选择" :multiple="true" />
      </el-form-item>

      <!-- <el-form-item label="复试说明" prop="finalDescription">
        <el-input
          type="textarea"
          v-model="formData.finalDescription"
          placeholder="请输入备注说明"
          :rows="5"
        ></el-input>
      </el-form-item> -->
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
import { laborDecision } from '@/api/system/labor';
import { watch } from 'vue';
const { proxy } = getCurrentInstance();
const { DC_LABOR_POSITION } = proxy.useCache([{ key: 'DC_LABOR_POSITION' }]);

const data = reactive({
  loading: true,
  rules: {
    deptId: [{ required: true, message: '部门必选项', trigger: 'change' }],
    finalConclusion: [{ required: true, message: '复试结论为必选项', trigger: 'change' }],
    jobGradeDictCode: [{ required: true, message: '岗位为必选项', trigger: 'change' }],
    leaderId: [{ required: true, message: '直属上级为必选项', trigger: 'change' }],
  },
  dialogVisible: false,
  title: '',
  formData: {},
  ids: [],
  statusList: ['通过', '未通过'],
  grandList: ['大工', '中工', '小工'],
  row: {},
});
const { rules, dialogVisible, formData, statusList, grandList } = toRefs(data);
const ruleFormRef = ref(null);

const emit = defineEmits(['judgeSuccess']);

watch(
  () => formData.value.jobGradeDictCode,
  val => {
    let rulusObj = {
      positionDictCode: [{ required: true, message: '岗位等级为必选项', trigger: 'change' }],
    };
    if (val != 7) {
      rules.value = Object.assign(rulusObj, rules.value);
    } else {
      delete rules.value.positionDictCode;
    }
  }
);

// 打开添加弹窗
const openDialog = async (ids, row) => {
  proxy.resetForm('ruleFormRef');
  dialogVisible.value = true;
  data.ids = ids || [];
  data.row = row;
  if (row.jobGradeDict == '钳工' || row.jobGradeDict == '电工') {
    data.rules.positionDictCode = [{ required: true, message: '等级为必选项', trigger: 'change' }];
  }
  data.formData.jobGradeDictCode = row.jobGradeDictCode;
  data.formData.deptId = row.deptId;
  data.formData.leaderId = row.leaderId;
};

const changeCustomerRlist = val => {
  data.formData.leaderId = val[0].deptLeaderId;
};

// 弹出框提交表单
const submitForm = async formEl => {
  formEl.validate(async valid => {
    if (valid) {
      let obj = {};
      let dataParmas = Object.assign({}, formData.value);
      dataParmas.deptId = dataParmas.deptId[0].id || dataParmas.deptId;
      data.ids.map(item => {
        obj[item] = {
          ...dataParmas,
          isPreliminary: false,
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

defineExpose({
  openDialog,
});
</script>
