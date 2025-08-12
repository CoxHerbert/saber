<template>
  <div class="wrap-left-form" v-loading="loading">
    <el-form
      class="custom-form"
      ref="formRef"
      label-suffix=":"
      :model="formData"
      label-width="120px"
      :inline="true"
      :rules="rules"
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
            v-if="infoList.reviewData"
            v-model="infoList.reviewData"
            :limit="10"
            :isUpload="false"
            pain
            :isRemove="false"
            :targetType="Const.targetType.CUSTOMER"
          />
          <span v-else>-</span>
        </el-form-item>
      </div>
      <!-- <div class="group-box" id="conclusion-and-recommendations">
        <div class="form-group-title">会议信息</div>
        <div>
          <el-form-item class="form-itme-width_50" label="评审方式" prop="dcConference">
            <el-select
              v-model="formData.dcConference"
              clearable
              placeholder="请选择评审方式"
              v-if="props.info.edit"
            >
              <el-option
                v-for="item in DC_CONFERENCE"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <span v-else>
              <dc-dict
                type="text"
                :options="DC_CONFERENCE"
                :value="formData.dcConference"
              ></dc-dict>
            </span>
          </el-form-item>
          <el-form-item
            class="form-itme-width_50"
            label="会议地址"
            prop="reviewRecordMeetingAddress"
          >
            <el-input
              v-model="formData.reviewRecordMeetingAddress"
              placeholder="请输入会议地址"
              clearable
              v-if="props.info.edit"
            />
            <span v-else>{{ formData.reviewRecordMeetingAddress || '-' }}</span>
          </el-form-item>
          <el-form-item class="form-itme-width_50" label="记录人" prop="reviewRecordNoteTaker">
            <dc-select-user
              v-model="formData.reviewRecordNoteTaker"
              placeholder="请选择记录人"
              :multiple="false"
              :multiple-limit="1"
              :disabled="!props.info.edit"
              type="input"
            />
          </el-form-item>
          <el-form-item class="form-itme-width_50 pssj" label="评审时间">
            <el-date-picker
              v-model="formData.reviewRecordTime"
              type="date"
              placeholder="请选择时间"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              v-if="props.info.edit"
            />
            <span v-else>{{ formData.reviewRecordTime || '-' }}</span>
          </el-form-item>

          <el-form-item class="form-itme-width_50" label="受评人">
            <dc-select-user
              v-model="formData.reviewReviewee"
              placeholder="请选择受评人"
              :multiple="false"
              :multiple-limit="1"
              :disabled="!props.info.edit"
              type="input"
            />
          </el-form-item>
          <el-form-item
            class="form-itme-width_50"
            label="常任负责人"
            prop="reviewRecordPersonLiable"
          >
            <dc-select-user
              v-model="formData.reviewRecordPersonLiable"
              placeholder="请选择常任负责人"
              :multiple="false"
              :multiple-limit="1"
              :disabled="!props.info.edit"
              type="input"
            />
          </el-form-item>
        </div>
      </div>
      <div class="group-box" id="conclusion-and-recommendations">
        <div class="form-group-title">参评人员</div>
        <div class="w-full">
          <el-form-item class="form-itme-width_100" label="参评人员" prop="reviewRecordAttendee">
            <dc-select-user
              v-model="formData.reviewRecordAttendee"
              placeholder="请点击选择"
              :multiple="true"
              :multiple-limit="0"
              :disabled="!props.info.edit"
            />
          </el-form-item>

          <el-form-item class="form-itme-width_100">
            <div class="form-itme-btn">
              <el-button type="primary" @click="subimtForm" v-if="props.info.edit"
                >发送通知</el-button
              >
            </div>
          </el-form-item>
        </div>
      </div> -->
    </el-form>
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
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted } from 'vue';
import Api from '@/api';
import Const from '@/const';
import { useRoute, useRouter } from 'vue-router';

const { proxy } = getCurrentInstance();

const route = useRoute();
const router = useRouter();

const { DC_PMS_PROJECT_ROLE, DC_CONFERENCE, DC_REVIEW_ISSUES_RESULT, DC_REVIEW_WEIGHT } =
  proxy.useCache([
    { key: 'DC_CONFERENCE' },
    { key: 'DC_PMS_PROJECT_ROLE' },
    { key: 'DC_REVIEW_ISSUES_RESULT' },
    { key: 'DC_REVIEW_WEIGHT' },
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
  rules: {},
  infoList: {},
  writeOpen: false,
});

const { loading, formData, rules, infoList, writeOpen } = toRefs(pageData);

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
  // infoList.value = props.info;
  const timer = setTimeout(() => {
    formData.value.reviewReviewee = props.info.reviewReviewee;
    clearTimeout(timer);
  }, 400);
});

const getLabel = key => {
  return DC_PMS_PROJECT_ROLE.value.find(item => {
    return item.dictKey === key;
  })?.dictValue;
};

// 确认创建
const subimtForm = async () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid) {
      const files = proxy.arrayToIdsString({
        array: infoList.value.reviewData,
      });
      const form = {
        ...props.info,
        referenceMaterial: props.info.referenceMaterial
          ? props.info.referenceMaterial.map(at => at.id).join(',')
          : undefined,
        record: {
          ...formData.value,
        },
        id: route.params.id,
        reviewData: files,
      };
      const res = await Api.pdp.dcReview.ReviewNoticeSubmit(form);
      const { code, msg } = res.data;
      if (code === 200) {
        proxy.$message.success(msg);
        router.push('/pdp/review/list');
      }
    }
  });
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
</script>
