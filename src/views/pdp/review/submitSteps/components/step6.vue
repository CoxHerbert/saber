<template>
  <div class="wrap-left-form" v-loading="loading">
    <el-form
      class="custom-form"
      ref="formRef"
      :model="formData"
      label-width="120px"
      label-suffix=":"
      :inline="true"
      :rules="rules"
    >
      <div class="form-group-title" id="detail">基本信息</div>
      <div class="group-box">
        <el-form-item class="form-itme-width_50" label="项目名称" prop="rlistName">
          <dc-view v-model="infoList.reviewProjectId" objectName="pdpProject" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="关联任务" prop="relatedAttachments">
          <dc-view objectName="planItem" v-model="formData.taskId" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="专案号">
          {{ infoList.planTrackingNumber || '-' }}
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
        <el-form-item class="form-itme-width_50" label="电子负责人">
          <dc-view v-model="infoList.electricalDriId" objectName="user" showKey="realName" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="机构负责人">
          <dc-view v-model="infoList.institutionsDriId" objectName="user" showKey="realName" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="软件负责人">
          <dc-view v-model="infoList.softwareDriId" objectName="user" showKey="realName" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="电气负责人">
          <dc-view v-model="infoList.electricalDriId" objectName="user" showKey="realName" />
        </el-form-item>
        <el-form-item class="form-itme-width_50" label="PM负责人">
          <dc-view v-model="infoList.pmDriId" objectName="user" showKey="realName" />
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
            <dc-view v-model="formData.reviewRecordReviewee" objectName="user" showKey="realName" />
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
            <dc-view v-model="formData.reviewRecordAttendee" objectName="user" showKey="realName" />
          </el-form-item>
        </div>
      </div>

      <div class="group-box" id="conclusion-and-recommendations">
        <div class="form-group-title">评审结论</div>
        <div class="w-full">
          <el-form-item
            class="form-itme-width_100"
            label="评审结论"
            prop="reviewRecordAttendee"
            disabled
          >
            <el-radio-group v-model="formData.reviewResult">
              <el-radio
                v-for="item in DC_REVIEW_RESULT"
                :key="item.id"
                :label="item.value"
                disabled
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </div>

      <div class="group-box" id="conclusion-and-recommendations">
        <div class="form-group-title">评审问题单</div>
        <div class="w-full">
          <el-tabs v-model="editableTabsValue" type="card" class="demo-tabs">
            <el-tab-pane
              v-for="item in props.info.record.problemAllocationMap"
              :key="item.name"
              :label="item.reviewProsecutionName"
              :name="item.name"
            >
              <template #default>
                <div
                  v-for="(item, index) in props.info.record.problemAllocationMap[editableTabsValue]
                    .items"
                  :key="index"
                >
                  <el-form
                    ref="submitFormRef"
                    :model="problemAllocationMapItem"
                    :rules="rules"
                    label-width="120px"
                    class="custom-form mt-4"
                  >
                    <div class="form-item-info">
                      <el-form-item
                        class="form-itme-width_50 items-center"
                        :label="`问题${index + 1}`"
                        prop="reviewProblem"
                        >{{ item.reviewProblem }}
                      </el-form-item>
                      <el-form-item
                        class="form-itme-width_50 items-center"
                        label="附件"
                        prop="reviewAttachments"
                      >
                        <dc-upload
                          v-model="item.reviewAttachments"
                          :isUpload="false"
                          :isRemove="false"
                          :targetType="Const.targetType.P_PROJECT"
                        />
                      </el-form-item>
                      <el-form-item
                        class="form-itme-width_50 items-center"
                        label="提议人"
                        prop="reviewProposer"
                      >
                        <dc-view
                          v-model="item.reviewProposer"
                          objectName="user"
                          showKey="realName"
                        />
                      </el-form-item>
                      <el-form-item
                        class="form-itme-width_50 items-center"
                        label="预计完成时间"
                        prop="reviewCompletionTime"
                      >
                        {{ item.reviewCompletionTime }}
                      </el-form-item>
                    </div>
                  </el-form>
                </div>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
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

const { DC_CONFERENCE, DC_REVIEW_ISSUES_RESULT, DC_REVIEW_WEIGHT, DC_REVIEW_RESULT } =
  proxy.useCache([
    { key: 'DC_CONFERENCE' },
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
  rules: {},
  infoList: {},
  writeOpen: false,
  editableTabsValue: '0',
  problemAllocationMapItem: {},
});

const {
  loading,
  formData,
  rules,
  infoList,
  writeOpen,
  editableTabsValue,
  problemAllocationMapItem,
} = toRefs(pageData);
onMounted(() => {
  getWriteData();
  infoList.value = props.info;
  const timer = setTimeout(() => {
    formData.value = props.info.record;
    formData.value.reviewRecordReviewee = props.info.reviewReviewee;
    clearTimeout(timer);
  }, 400);
});

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
<style lang="scss" scoped>
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
.form-item-info {
  width: 75% !important;
}
</style>
