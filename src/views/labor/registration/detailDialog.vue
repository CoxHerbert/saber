<template>
  <el-drawer v-model="dialogVisible" size="760px" title="详情" @close="cancel">
    <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="登记时间:"> {{ row.createTime }} </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="头像:">
            <el-image :src="row.avatarId" style="width: 50px; height: 50px; border-radius: 5px">
              <template #error>
                <div class="image-slot">-</div>
              </template>
            </el-image>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="姓名:">{{ row.name }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="年龄:">{{ row.age }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="身份证号:">{{ row.cardNo }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="身份证正面:">
            <el-image
              :src="row.idCardFront"
              :preview-src-list="
                row.idCardFront && row.idCardBack ? [row.idCardFront, row.idCardBack] : undefined
              "
              style="width: 120px; height: 80px; border-radius: 5px"
            >
              <template #error>
                <div class="image-slot">-</div>
              </template>
            </el-image>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="身份证反面:">
            <el-image
              :src="row.idCardBack"
              :preview-src-list="
                row.idCardFront && row.idCardBack ? [row.idCardBack, row.idCardFront] : undefined
              "
              style="width: 120px; height: 80px; border-radius: 5px"
            >
              <template #error>
                <div class="image-slot">-</div>
              </template>
            </el-image>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="联系电话:">{{ row.mobile }} </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="民族:">{{ row.nation }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="籍贯:">{{ row.address }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文化程度:">{{ row.education }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="毕业院校:">{{ row.graduateSchool }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="护照号码:">{{ row.passportNumber || '-' }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="劳务公司:">
            <dc-view v-model="row.companyId" objectName="company" showKey="id" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="row.deptId">
          <el-form-item label="部门:">
            <dc-view v-model="row.deptId" objectName="dept" showKey="id" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="直属上级:">
            <dc-view v-model="row.leaderId" objectName="user" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="岗位:">{{ row.jobGradeDict }} </el-form-item>
        </el-col>
        <el-col :span="8" v-if="row.positionDictCode">
          <el-form-item label="岗位等级:">{{ row.positionDictCode || '-' }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="工作年限:">{{ row.workYear }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否住宿:">{{ row.isAccommodation }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="初试时间:">{{ row.preliminaryDate || '-' }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="初试说明:">{{ row.preliminaryDescription || '-' }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="初试结论:">
            <span :class="row.preliminaryConclusion === '通过' ? 'pass' : 'notpass'">
              {{ row.preliminaryConclusion }}
            </span>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="复试时间:">{{ row.finalDate || '-' }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="复试说明:">{{ row.finalDescription || '-' }} </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="复试结论:">
            <span :class="row.finalConclusion === '通过' ? 'pass' : 'notpass'">
              {{ row.finalConclusion }}
            </span>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="状态:">
            <el-tag :type="colorMap[row.applyStatus]">{{
              row.applyStatus === '复试已通过'
                ? '待确认入职'
                : row.applyStatus === '确认入职'
                ? '待入职'
                : row.applyStatus
            }}</el-tag>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer> </template>
  </el-drawer>
</template>
<script setup>
const data = reactive({
  loading: true,
  dialogVisible: false,
  row: [],
  colorMap: {
    复试已通过: 'warning',
    待初试: 'warning',
    初试已取消: 'info',
    初试不通过: 'danger',
    待复试: 'warning',
    复试不通过: 'danger',
    拒绝入职: 'danger',
    确认入职: 'success',
    已入职: 'success',
    已离职: 'danger',
  },
});
const { rules, dialogVisible, formData, row, colorMap } = toRefs(data);
const ruleFormRef = ref(null);

// 打开添加弹窗
const openDialog = async row => {
  dialogVisible.value = true;
  data.row = row;
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
};

defineExpose({
  openDialog,
});
</script>

<style scoped lang="scss">
.pass {
  color: #23c69f;
}
.notpass {
  color: #e12137;
}
:deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
}

:deep(.el-form-item__content) {
  color: #606266;
}
</style>
