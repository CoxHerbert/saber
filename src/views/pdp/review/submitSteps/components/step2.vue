<template>
  <div class="wrap-left-form">
    <el-form
      class="custom-form"
      ref="ruleFormRef"
      :model="formData"
      label-suffix=":"
      :rules="rules"
      label-width="120px"
      :inline="true"
    >
      <div class="form-group-title">基本信息</div>
      <div class="form-item-info">
        <el-form-item class="form-itme-width_50" label="项目名称" prop="reviewProjectId">
          <dc-select-dialog-v2
            v-model="formData.reviewProjectId"
            placeholder="请选择关联项目"
            objectName="pdpProject"
            type="input"
            returnType="object"
            :multiple="false"
            :multiple-limit="1"
            :clearable="true"
            :params="{
              enabled: true,
            }"
            @change="hanleProjectConfig"
          >
            <template #search-items="{ queryParams }">
              <div class="dialog-search-box">
                <el-form-item label-width="100px" label="项目名称">
                  <el-input
                    placeholder="请输入项目名称"
                    clearable
                    v-model="queryParams.projectName"
                  />
                </el-form-item>
                <el-form-item label-width="100px" label="项目编码">
                  <el-input
                    placeholder="请输入项目编码"
                    clearable
                    v-model="queryParams.projectCode"
                  />
                </el-form-item>
                <!-- <el-form-item label-width="100px" label="station">
                  <el-input v-model="queryParams.station" placeholder="请输入station" clearable />
                </el-form-item> -->
              </div>
            </template>
          </dc-select-dialog-v2>
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="关联任务" prop="feaType">
          <el-select
            v-model="formData.taskId"
            placeholder="请选择关联任务"
            clearable
            v-if="props.info.edit"
          >
            <el-option
              v-for="item in dictMap.planItem"
              :key="item.id"
              :label="item.planName"
              :value="item.id"
            />
          </el-select>
          <span v-else>
            <dc-view objectName="planItem" v-model="formData.taskId" />
          </span>
        </el-form-item>

        <el-form-item class="form-itme-width_50" label="专案号" prop="oppsId">
          <el-select
            v-model="formData.projectCaseId"
            placeholder="请选择专案号"
            filterable
            clearable
            v-if="props.info.edit"
          >
            <el-option
              v-for="item in dictMap.deliveredItems"
              :key="item.id"
              :label="item.mtoNo"
              :value="item.id"
            />
          </el-select>
          <span v-else>
            <dc-view objectName="deliveredItem" v-model="formData.projectCaseId" />
          </span>
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="参考资料" prop="customerId">
          <dc-upload
            v-model="formData.referenceMaterial"
            :limit="10"
            :isUpload="false"
            pain
            :isRemove="false"
            :targetType="Const.targetType.CUSTOMER_RLIST"
          />
        </el-form-item>
        <!-- <el-form-item class="form-itme-width_50" label="项目名称" prop="materialName">
          <el-input placeholder="项目名称" v-model="formData.materialName" v-if="props.info.edit" />
          <span v-else>{{ formData.materialName }}</span>
        </el-form-item> -->
        <el-form-item class="form-itme-width_50" label="受评人" prop="reviewReviewee">
          <dc-select-user
            v-model="formData.reviewReviewee"
            placeholder="请选择受评人"
            :multiple="false"
            :multiple-limit="1"
            :disabled="!props.info.edit"
          />
        </el-form-item>
        <dc-member
          :mode="'edit'"
          formItemClass="form-itme-width_50"
          :modelFieldListProp="'dcPdpFuncFieldList'"
          :templateProp="'funcFieldTemplateId'"
          v-model:modelTemplate="formData.funcFieldTemplateId"
          v-model:modelFieldList="formData.dcPdpFuncFieldList"
        />
        <!-- <el-form-item class="form-itme-width_50" label="机构DRI" prop="institutionsDriId">
          <dc-select-user
            v-model="formData.institutionsDriId"
            placeholder="请选择机构DRI"
            :multiple="false"
            :multiple-limit="1"
            :disabled="!props.info.edit"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="电气DRI" prop="electricalDriId">
          <dc-select-user
            v-model="formData.electricalDriId"
            placeholder="请选择电气DRI"
            :multiple="false"
            :multiple-limit="1"
            :disabled="!props.info.edit"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="软件DRI" prop="softwareDriId">
          <dc-select-user
            v-model="formData.softwareDriId"
            placeholder="请选择软件DRI"
            :multiple="false"
            :multiple-limit="1"
            :disabled="!props.info.edit"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="BDDRI" prop="bdDriId">
          <dc-select-user
            v-model="formData.bdDriId"
            placeholder="请选择BDDRI"
            :multiple="false"
            :multiple-limit="1"
            :disabled="!props.info.edit"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="TPMDRI" prop="tpmDriId">
          <dc-select-user
            v-model="formData.tpmDriId"
            placeholder="请选择TPMDRI"
            :multiple="false"
            :multiple-limit="1"
            :disabled="!props.info.edit"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="PMDRI" prop="pmDriId">
          <dc-select-user
            v-model="formData.pmDriId"
            placeholder="请选择PMDRI"
            :multiple="false"
            :multiple-limit="1"
            :disabled="!props.info.edit"
          />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="视觉DRI" prop="versionDriId">
          <dc-select-user
            v-model="formData.versionDriId"
            placeholder="请选择视觉DRI"
            :multiple="false"
            :disabled="!props.info.edit"
          />
        </el-form-item> -->
        <el-form-item class="form-itme-width_100" label="评审项" prop="assessment">
          <span class="write-btn" @click="openWriteDialog"
            >点击查看( {{ selectedData ? selectedData.length : info.leaderUserQuantityFilledIn }} /
            {{ info.countQty }})</span
          >
        </el-form-item>
        <el-form-item class="form-itme-width_100" label="评审说明" prop="assessment">
          <el-input
            v-model="formData.assessment"
            autosize
            type="textarea"
            placeholder="请输入"
            v-if="props.info.edit"
          />
          <span v-else>{{ formData.assessment || '-' }}</span>
        </el-form-item>
      </div>

      <el-form-item class="form-itme-width_100" label="附件" prop="reviewData">
        <dc-upload
          v-model="formData.reviewData"
          :limit="10"
          :targetType="Const.targetType.CUSTOMER_RLIST"
          v-if="props.info.edit"
        />
        <dc-upload
          v-model="formData.reviewData"
          :limit="10"
          :isUpload="false"
          :isRemove="false"
          :targetType="Const.targetType.CUSTOMER_RLIST"
          v-else
        />
      </el-form-item>
      <el-form-item class="form-itme-width_100">
        <div class="form-itme-btn">
          <el-button type="primary" @click="submitForm(true)" v-if="props.info.edit"
            >提交</el-button
          >
          <el-button @click="cancelSubmit">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
  <el-dialog
    class="dialog"
    v-model="writeOpen"
    title="审核项填写"
    width="1500"
    destroy-on-close
    append-to-body
    @close="closeWriteDialog"
  >
    <template #header> 审核项填写 </template>
    <div class="table-container">
      <el-table
        :data="props.info.problemRecordMap"
        :span-method="objectSpanMethod"
        height="100%"
        border
      >
        <el-table-column prop="reviewDimensionName" label="分类" width="160" align="center" />
        <el-table-column prop="index" label="序号" width="60" align="center" />
        <el-table-column
          prop="reviewDimensionSplit"
          min-width="180"
          label="评审内容"
          align="center"
        />
        <el-table-column prop="reviewWeight" label="重要性" align="center">
          <template #default="scoped">
            <dc-dict :options="DC_REVIEW_WEIGHT" :value="scoped.row.reviewWeight"></dc-dict>
          </template>
        </el-table-column>
        <el-table-column prop="reviewConformTo" label="自评结论" align="center">
          <template #default="scoped">
            <el-select
              v-model="scoped.row.reviewConformTo"
              placeholder="请选择"
              clearable
              v-if="props.info.edit"
            >
              <el-option
                v-for="item in DC_REVIEW_ISSUES_RESULT"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <span v-else>
              <dc-dict
                type="text"
                :options="DC_REVIEW_ISSUES_RESULT"
                :value="scoped.row.reviewConformTo"
            /></span>
          </template>
        </el-table-column>
        <el-table-column prop="reviewHeadResult" label="上级评审" align="center">
          <template #default="scoped">
            <el-input
              v-model="scoped.row.reviewHeadResult"
              :rows="2"
              type="textarea"
              placeholder="请输入"
              v-if="props.info.edit"
            />
            <span v-else>{{ scoped.row.reviewHeadResult }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeWriteDialog">关闭</el-button>
        <el-button type="primary" @click="userConfirm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted } from 'vue';
import Api from '@/api';
import Const from '@/const';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const { proxy } = getCurrentInstance();

// 数据字典
const { DC_REVIEW_ISSUES_RESULT, DC_REVIEW_WEIGHT } = proxy.useCache([
  { key: 'DC_REVIEW_ISSUES_RESULT' },
  { key: 'DC_REVIEW_WEIGHT' },
]);

const pageData = reactive({
  loading: false,
  dictMap: {
    deliveredItems: [],
    planItem: [],
  },
  // 评审表单提交规则
  rules: {
    reviewProjectId: [{ required: true, message: '请选择项目名称', trigger: 'blur' }],
    feaName: [{ required: true, message: '请输入参考资料', trigger: 'blur' }],
  },
  // 评审表单
  formData: {},
  writeOpen: false,
  selectedData: null,
  // 计划选项
  planOptions: [],
});

const { rules, formData, writeOpen, selectedData, planOptions, dictMap } = toRefs(pageData);

const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});

onMounted(async () => {
  await getOptions();
  getWriteData();
  formData.value = props.info;
});

// 提交可行性评估项
const submitForm = async () => {
  proxy.$refs['ruleFormRef'].validate(async valid => {
    if (valid) {
      const files = proxy.arrayToIdsString({
        array: formData.value.reviewData,
      });
      const form = {
        ...formData.value,
        problemRecordMap: props.info.problemRecordMap,
        draft: false,
        dimensionId: props.info.dimensionId,
        id: route.params.id,
        referenceMaterial: formData.value.referenceMaterial
          ? formData.value.referenceMaterial.map(at => at.id).join(',')
          : undefined,

        reviewData: files,
        reviewProjectId: formData.value.reviewProjectId?.id
          ? formData.value.reviewProjectId?.id
          : formData.value.reviewProjectId,
        funcFieldTemplateId:
          formData.value.funcFieldTemplateId?.id || formData.value.funcFieldTemplateId,
      };

      const res = await Api.pdp.dcReview.dataReViewSubmit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
        router.push('/pdp/review/list');
      }
    }
  });
};

const handleProjectChange = async (first = false) => {
  const projectId = first ? props.info.reviewProjectId : formData.value.reviewProjectId;
  const res = await Api.pdp.dcReview.findPlanItemByProjectId({
    projectId: projectId,
  });
  const { code, data } = res.data;
  if (code === 200) {
    dictMap.value = data;
  }
};

const getOptions = async () => {
  const res = await Api.pdp.planItem.getPlanitemList({
    size: 99999,
    current: 1,
    isMine: true,
  });
  const { code, data } = res.data;
  if (code === 200) {
    planOptions.value = data.records;
  }
};

const hanleProjectConfig = data => {
  confirmProjectList(data);
};

/**
 * 结构就是机构
 * 电气电子都属于电控
 * */

// 确认项目名称
const confirmProjectList = data => {
  if (data[0]) {
    (formData.value.reviewProjectId = data[0].id),
      (formData.value.materialName = data[0].projectName);
    formData.value.institutionsDriId = data[0].institutionsDriId;
    formData.value.electricalDriId = data[0].electricalDriId;
    formData.value.softwareDriId = data[0].softwareDriId;
    formData.value.bdDriId = data[0].bdDriId;
    formData.value.tpmDriId = data[0].tpmDriId;
    formData.value.pmDriId = data[0].pmDriId;
    formData.value.versionDriId = data[0].versionDriId;

    handleProjectChange();
  } else {
    formData.value.materialName = null;
    formData.value.institutionsDriId = null;
    formData.value.electricalDriId = null;
    formData.value.softwareDriId = null;
    formData.value.bdDriId = null;
    formData.value.tpmDriId = null;
    formData.value.pmDriId = null;
    formData.value.versionDriId = null;
  }
};

// 打开填写项弹窗
const openWriteDialog = () => {
  writeOpen.value = true;
};

// 关闭填写项弹窗
const closeWriteDialog = () => {
  writeOpen.value = false;
};

//  确定按钮
const userConfirm = () => {
  writeOpen.value = false;
  selectedData.value = props.info.problemRecordMap.filter(item => item.reviewHeadResult);
};

// 获取评审项列表
const getWriteData = async () => {
  const groupedData = {};
  if (props.info.reviewProjectId) {
    await handleProjectChange(true);
  }
  if (Array.isArray(props.info.problemRecordMap)) {
    props.info.problemRecordMap.forEach(item => {
      const key = item.reviewDimensionSplitId;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    });
  }

  // 添加序号
  props.info.problemRecordMap = Object.values(groupedData).flatMap(group =>
    group.map((item, index) => ({
      ...item,
      index: index + 1,
    }))
  );
};

const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    const currentId = props.info.problemRecordMap[rowIndex].reviewDimensionSplitId;
    const prevId =
      rowIndex > 0 ? props.info.problemRecordMap[rowIndex - 1].reviewDimensionSplitId : null;

    // 如果是第一行，或者ID与上一行不同
    if (rowIndex === 0 || currentId !== prevId) {
      // 计算当前ID的重复行数
      const count = props.info.problemRecordMap.filter(
        item => item.reviewDimensionSplitId === currentId
      ).length;
      return {
        rowspan: count,
        colspan: 1,
      };
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      };
    }
  }
};
const cancelSubmit = () => {
  router.back();
};
</script>
<style lang="scss">
.dialog {
  padding: 0 !important;
  overflow: hidden;
  background-color: #f5f5f5 !important;
  border-radius: 16px !important;
  .el-dialog {
    &__header {
      display: flex;
      align-items: center;
      margin: 0 !important;
      padding: 0 24px !important;
      height: 74px;
      background: #fff;
      box-shadow: inset 0px 0px 0px 0px #dedbd9;
    }
    &__headerbtn {
      height: 74px;
    }
    &__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 27px;
      height: 27px;
      background: #bbb;
      border-radius: 50%;
      color: #fff;
      font-size: 18px;
      font-weight: 800;
    }
    &__body {
      display: flex;
      flex-direction: column;
      padding: 20px;
      padding-bottom: 0;
      overflow: auto;
      .table-container {
        padding: 16px;
        height: 100%;
        background: #fff;
      }
    }
    &__footer {
      padding: 16px;
    }
  }
  .el-progress-bar__inner {
    background: linear-gradient(90deg, #ffd1ac 0%, #f29346 100%);
  }
}
</style>
<style lang="scss" scoped>
.dialog-search-box {
  width: 900px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 30%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 100px);
    }
  }
}
.write-btn {
  color: #f78431;
  cursor: pointer;
}
</style>
