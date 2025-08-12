<template>
  <div class="wrap-left-form" v-loading="loading">
    <div>
      <el-form
        class="custom-form"
        ref="formRef"
        :model="formData"
        label-suffix=":"
        label-width="120px"
        :inline="true"
      >
        <div class="form-group-title" id="detail">基本信息</div>
        <div class="group-box">
          <el-form-item class="form-itme-width_50" label="项目名称" prop="rlistName">
            <dc-view v-model="infoList.reviewProjectId" objectName="pdpProject" />
          </el-form-item>
          <el-form-item class="form-itme-width_50" label="关联任务" prop="relatedAttachments">
            <dc-view objectName="planItem" v-model="infoList.taskId" />
          </el-form-item>
          <el-form-item class="form-itme-width_50" label="专案号">
            <dc-view objectName="deliveredItem" v-model="infoList.projectCaseId" />
          </el-form-item>
          <el-form-item class="form-itme-width_50" label="参考资料">
            <dc-upload
              v-model="infoList.referenceMaterial"
              :limit="10"
              :isUpload="false"
              pain
              :isRemove="false"
              :targetType="Const.targetType.CUSTOMER_RLIST"
            />
          </el-form-item>
          <el-form-item
            v-for="(item, i) in infoList.dcPdpFuncFieldList"
            :key="i"
            v-show="!!item.bindUserIds"
            class="form-itme-width_50"
            :label="getLabel(item.filedKey)"
          >
            <dc-view v-model="item.bindUserIds" objectName="user" showKey="realName" />
          </el-form-item>
          <el-form-item class="form-itme-width_100" label="评审项">
            <span class="write-btn" @click="openWriteDialog">去查看</span>
          </el-form-item>
          <el-form-item class="form-itme-width_100" label="评审说明">
            {{ infoList.assessment || '-' }}
          </el-form-item>
          <el-form-item class="form-itme-width_100" label="相关附件">
            <dc-upload
              v-model="infoList.reviewData"
              :limit="10"
              :isUpload="false"
              pain
              :isRemove="false"
              :targetType="Const.targetType.CUSTOMER"
            />
          </el-form-item>
        </div>
        <div class="group-box" id="conclusion-and-recommendations">
          <div class="form-group-title">会议信息</div>
          <div>
            <el-form-item class="form-itme-width_50" label="评审方式" prop="dcConference">
              <dc-dict type="text" :options="DC_CONFERENCE" :value="formData.dcConference" />
            </el-form-item>
            <el-form-item
              class="form-itme-width_50"
              label="会议地址"
              prop="reviewRecordMeetingAddress"
            >
              {{ formData.reviewRecordMeetingAddress }}
            </el-form-item>
            <el-form-item class="form-itme-width_50" label="记录人" prop="reviewRecordNoteTaker">
              <dc-view
                v-model="formData.reviewRecordNoteTaker"
                objectName="user"
                showKey="realName"
              />
            </el-form-item>
            <el-form-item class="form-itme-width_50" label="评审时间">
              {{ formData.reviewRecordTime }}
            </el-form-item>
            <el-form-item class="form-itme-width_50" label="受评人">
              <dc-view
                v-model="formData.reviewRecordReviewee"
                objectName="user"
                showKey="realName"
              />
            </el-form-item>
            <el-form-item
              class="form-itme-width_50"
              label="常任负责人"
              prop="reviewRecordPersonLiable"
            >
              <dc-view
                v-model="formData.reviewRecordPersonLiable"
                objectName="user"
                showKey="realName"
              />
            </el-form-item>
          </div>
        </div>

        <div class="group-box" id="conclusion-and-recommendations">
          <div class="form-group-title">参评人员</div>
          <div class="w-full">
            <el-form-item
              class="form-itme-width_100"
              label="参评人员"
              prop="reviewRecordAttendee"
              disabled
            >
              <dc-view
                v-model="formData.reviewRecordAttendee"
                objectName="user"
                showKey="realName"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>
  </div>
  <!-- 问题集 -->
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
            <el-select v-model="scoped.row.reviewConformTo" placeholder="请选择" clearable disabled>
              <el-option
                v-for="item in DC_REVIEW_ISSUES_RESULT"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="reviewHeadResult" label="上级评审" align="center">
          <template #default="scoped">
            <el-input
              v-model="scoped.row.reviewHeadResult"
              :rows="2"
              type="textarea"
              placeholder="请输入"
              disabled
            />
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
  <!-- 新建抽屉 -->
  <el-drawer v-model="open.drawer" width="600px" :title="open.operateTitle" @close="cancel">
    <el-form
      ref="drawerSubmitFormRef"
      :model="problemAllocationMapItem"
      :rules="rules"
      label-width="auto"
    >
      <el-form-item label="问题" prop="reviewProblem">
        <el-input
          v-model="problemAllocationMapItem.reviewProblem"
          placeholder="请输入"
          clearable
          :autosize="{ minRows: 2, maxRows: 4 }"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="附件" prop="reviewAttachments">
        <dc-upload
          v-model="problemAllocationMapItem.reviewAttachments"
          :limit="10"
          :targetType="Const.targetType.P_PROJECT"
        />
      </el-form-item>
      <el-form-item label="提议人" prop="reviewProposer">
        <dc-select-user
          v-model="problemAllocationMapItem.reviewProposer"
          placeholder="请选择提议人"
          :multiple="false"
          :multiple-limit="1"
        />
      </el-form-item>
      <el-form-item label="预计完成时间" prop="reviewCompletionTime">
        <el-date-picker
          v-model="problemAllocationMapItem.reviewCompletionTime"
          type="date"
          placeholder="请选择预计完成时间"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="drawerSubmitForm">提交</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted, watch } from 'vue';
import Api from '@/api';
import Const from '@/const';
import { useRouter, useRoute } from 'vue-router';

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const {
  DC_CONFERENCE,
  DC_REVIEW_ISSUES_RESULT,
  DC_REVIEW_WEIGHT,
  DC_REVIEW_RESULT,
  DC_PMS_PROJECT_ROLE,
} = proxy.useCache([
  { key: 'DC_CONFERENCE' },
  { key: 'DC_PMS_PROJECT_ROLE' },
  { key: 'DC_REVIEW_ISSUES_RESULT' },
  { key: 'DC_REVIEW_WEIGHT' },
  { key: 'DC_REVIEW_RESULT' },
]);
const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});

const pageData = reactive({
  loading: false,
  formData: {},
  rules: {
    reviewProblem: [{ required: true, message: '请输入', trigger: 'blur' }],
    reviewProposer: [{ required: true, message: '请选择', trigger: 'blur' }],
    reviewCompletionTime: [{ required: true, message: '请选择', trigger: 'blur' }],
  },
  infoList: {},
  writeOpen: false,
  editableTabs: [],
  editableTabsValue: '0',
  problemAllocationMapItem: {},
  open: {
    drawer: false,
    operateTitle: '新建问题集',
  },
  reviewRecordProblemIds: [],
  tabIndex: null,
  reviewProsecutionIds: null,
});

const {
  loading,
  formData,
  rules,
  infoList,
  writeOpen,
  editableTabs,
  editableTabsValue,
  problemAllocationMapItem,
  open,
  reviewRecordProblemIds,
  tabIndex,
  reviewProsecutionIds,
} = toRefs(pageData);

watch(
  () => props.info,
  newValue => {
    infoList.value = props.info;
  },
  {
    immediate: true,
    deep: true,
  }
);

onMounted(() => {
  getWriteData();
  infoList.value = props.info;
  const timer = setTimeout(() => {
    formData.value = props.info.record;
    formData.value.reviewRecordReviewee = props.info.reviewReviewee;
    // 评审结论默认通过
    formData.value.reviewResult = '1866303255464820737';
    clearTimeout(timer);
  }, 400);
});

watch(
  () => editableTabs.value,
  newVal => {
    validateTabs();
  },
  { deep: true }
);

const errorMsgs = ref('');

const validateTabs = () => {
  if (editableTabs.value.length === 0) {
    return true;
  }
  let errorMsg = '';
  editableTabs.value.forEach((tabData, i) => {
    tabData.items.forEach((q, j) => {
      if (!q.reviewProblem) {
        errorMsg += `"${tabData.title}"中"问题${j + 1}"的"问题内容"不能为空;`;
      }
      if (!q.reviewProposer) {
        errorMsg += `"${tabData.title}"中"问题${j + 1}"的"提议人"不能为空;`;
      }
      if (!q.reviewCompletionTime) {
        errorMsg += `"${tabData.title}"中"问题${j + 1}"的"预计完成时间"不能为空;`;
      }
    });
  });
  errorMsgs.value = errorMsg;
  return !!errorMsg;
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
  editableTabs.value = [];
  if (Array.isArray(props.info.record.problemAllocationMap)) {
    props.info.record.problemAllocationMap.forEach(item => {
      editableTabs.value.push({
        title: `问题集(${item.reviewProsecutionName})`,
        ...item,
      });
    });
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

const getLabel = key => {
  return DC_PMS_PROJECT_ROLE.value.find(item => {
    return item.dictKey === key;
  })?.dictValue;
};

const cancel = () => {};

// 抽屉问题提交
const drawerSubmitForm = async () => {
  proxy.$refs['drawerSubmitFormRef'].validate(async valid => {
    if (valid) {
      const files = proxy.arrayToIdsString({
        array: problemAllocationMapItem.value.reviewAttachments,
      });
      const problemAllocationForm = {
        ...problemAllocationMapItem.value,
        targetId: props.info.record.id,
        reviewAttachments: files,
        reviewProsecution: reviewProsecutionIds.value,
      };
      const res = await Api.pdp.dcReviewProblem.submit(problemAllocationForm);
      const { code, data } = res.data;
      if (code === 200) {
        reviewRecordProblemIds.value.push(data.id);
        props.info.record.problemAllocationMap[editableTabsValue.value].items.push(data);
        open.value.drawer = false;
      }
    }
  });
};
</script>
<style lang="scss" scoped>
.tabs {
  display: flex;
  flex-flow: row nowrap;
}
.tab-item {
  cursor: pointer;
  margin-right: 8px;
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  text-transform: none;

  &.active {
    color: #f78431;
  }
}
:deep(.el-tabs--card > .el-tabs__header) {
  border: none !important;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: none !important;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: none !important;
}
:deep(.el-radio__input.is-disabled + span.el-radio__label) {
  color: #333 !important;
}
.close-icon {
  cursor: pointer;
  font-size: 16px;
  margin-left: 4px;
  transform: translateY(4px);
}
.form-item-info {
  width: 75% !important;
}
.row {
  flex: 1;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
}
.w-100 {
  width: 100%;

  .delete-box {
    width: 32px;

    .icon {
      cursor: pointer;
      width: 32px;
      height: 32px;
      line-height: 24px;
      border-radius: 16px;
      text-align: center;
      font-size: 32px;
      color: #666;
      background-color: rgba($color: #000000, $alpha: 0.05);
      &:hover {
        background-color: var(--el-color-primary);
        color: #fff;
      }
    }
  }
}
.w-50 {
  width: 40%;
  margin-right: 16px;
  :deep(.el-form-item__label) {
    line-height: 16px;
    align-items: center;
    display: flex;
    text-align: right;
  }

  :deep(.el-date-editor) {
    width: 100%;
  }
}
.err-msg {
  padding-left: 110px;
  .err {
    color: var(--el-color-danger);
    font-size: 12px;
    line-height: 20px;
    margin: 0;
    padding: 0;
  }
}
</style>
