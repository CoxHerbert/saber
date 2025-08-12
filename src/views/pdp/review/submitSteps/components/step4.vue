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
          <!-- <el-form-item class="form-itme-width_50" label="电子负责人">
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
          </el-form-item> -->
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

        <div class="group-box" id="conclusion-and-recommendations">
          <div class="form-group-title">评审结论</div>
          <div class="w-full">
            <el-form-item
              class="form-itme-width_100"
              label="评审结论"
              prop="reviewRecordAttendee"
              disabled
            >
              <el-radio-group v-model="formData.reviewResult" v-if="props.info.edit">
                <el-radio v-for="item in DC_REVIEW_RESULT" :key="item.id" :label="item.value">
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
              <el-radio-group v-model="formData.reviewResult" v-else>
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
      </el-form>
      <div class="group-box" id="conclusion-and-recommendations">
        <div class="form-group-title">评审问题单</div>
        <div class="w-full">
          <div class="tabs" style="margin-bottom: 20px">
            <!-- <dc-select-dialog v-model="editableTabs" returnType="object" v-if="props.info.edit">
              <el-button size="small" plain> 新建问题集 </el-button>
            </dc-select-dialog> -->
            <div class="tab-items">
              <span
                class="tab-item"
                :class="{
                  active: editableTabsValue == i,
                }"
                v-for="(item, i) in editableTabs"
                :key="i"
                ><span class="title" @click="editableTabsValue = i"> {{ item.title }} </span
                ><el-icon class="close-icon" @click.stop="handleClose(item)"><Close /></el-icon>
              </span>
            </div>
            <wf-select-dialog
              v-model="reviewProsecutionIds"
              objectName="user"
              @change="
                val => {
                  handlePeopleSelector(val);
                }
              "
            >
              <template #default>
                <el-button size="small" plain icon="el-icon-plus" v-if="props.info.edit">
                  新建问题集
                </el-button>
              </template>
            </wf-select-dialog>

            <el-button
              size="small"
              plain
              @click="addProblem(editableTabsValue)"
              icon="el-icon-plus"
              v-if="props.info.edit"
              :disabled="!editableTabs?.length"
            >
              新建问题
            </el-button>
          </div>
          <div v-if="editableTabs[editableTabsValue]" class="form-box">
            <div
              v-for="(q, k) in editableTabs[editableTabsValue].items"
              :key="k"
              class="question-item"
            >
              <el-form
                label-suffix=":"
                label-width="100px"
                :model="editableTabs[editableTabsValue].items"
              >
                <div class="row w-100">
                  <div class="delete-box">
                    <div class="icon" @click="deleteProblem(k)">-</div>
                  </div>
                  <div class="row">
                    <el-form-item
                      class="w-50"
                      label-width="80px"
                      :label="`问题${k + 1}`"
                      prop="reviewProblem"
                    >
                      <el-input
                        v-model="editableTabs[editableTabsValue].items[k].reviewProblem"
                        type="textarea"
                        :rows="
                          editableTabs[editableTabsValue].items[k].reviewAttachmentsIds ? 8 : 5
                        "
                        placeholder="请输入问题"
                      ></el-input>
                    </el-form-item>
                    <el-form-item
                      class="w-50"
                      label-width="80px"
                      label="附件上传"
                      prop="reviewAttachmentsIds"
                    >
                      <dc-upload
                        v-model="editableTabs[editableTabsValue].items[k].reviewAttachmentsIds"
                        :targetType="Const.targetType.P_PROJECT"
                      ></dc-upload>
                    </el-form-item>
                  </div>
                </div>
                <div class="row w-100">
                  <div class="delete-box"></div>
                  <div class="row">
                    <el-form-item
                      class="w-50"
                      label-width="80px"
                      label="提议人"
                      prop="reviewProposer"
                    >
                      <dc-select-user
                        v-model="editableTabs[editableTabsValue].items[k].reviewProposer"
                        type="input"
                        :multiple="false"
                        :multipleLimit="1"
                        returnType="string"
                      ></dc-select-user>
                    </el-form-item>
                    <el-form-item
                      class="w-50"
                      label-width="80px"
                      label="预计完成时间"
                      prop="reviewCompletionTime"
                    >
                      <el-date-picker
                        type="date"
                        format="YYYY-MM-DD"
                        placeholder="请选择预计完成时间"
                        value-format="YYYY-MM-DD"
                        v-model="editableTabs[editableTabsValue].items[k].reviewCompletionTime"
                      ></el-date-picker>
                    </el-form-item>
                  </div>
                </div>
              </el-form>
            </div>
          </div>
          <div class="err-msg" v-if="errorMsgs">
            <p class="err" v-for="(err, e) in errorMsgs.split(';')">{{ err }}</p>
          </div>
          <!-- {{ editableTabsValue }} {{ editableTabs[editableTabsValue] }} -->
          <!-- <el-tabs v-model="editableTabsValue" type="card" class="demo-tabs">
            <el-tab-pane v-for="item in editableTabs" :key="item.name" :name="item.content">
              <template #label>
                <span
                  >{{ item.title
                  }}<el-icon class="close-icon" @click.stop="handleClose(item)"><Close /></el-icon
                ></span>
              </template>
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
                      >
                        <el-input
                          :value="item.reviewProblem"
                          :autosize="{ minRows: 2, maxRows: 4 }"
                          type="textarea"
                          placeholder="Please input"
                          readonly
                        />
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
                        <dc-select-user
                          v-model="item.reviewProposer"
                          placeholder="请选择"
                          :multiple="false"
                          :multiple-limit="1"
                        />
                      </el-form-item>
                      <el-form-item
                        class="form-itme-width_50 items-center"
                        label="预计完成时间"
                        prop="reviewCompletionTime"
                      >
                        <el-input :value="item.reviewCompletionTime" clearable readonly />
                      </el-form-item>
                    </div>
                  </el-form>
                </div>
                <el-button
                  size="small"
                  style="margin-bottom: 10px"
                  plain
                  @click="handleDrawerClick"
                  v-if="props.info.edit"
                  >新建问题</el-button
                >
              </template>
            </el-tab-pane>
          </el-tabs> -->
          <el-form-item class="form-itme-width_100">
            <div class="form-itme-btn">
              <el-button type="primary" @click="subimtForm">保存评审结论</el-button>
            </div>
          </el-form-item>
        </div>
      </div>
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

// 确认创建
const subimtForm = async () => {
  proxy.$refs['formRef'].validate(async valid => {
    if (valid && !errorMsgs.value) {
      const files = proxy.arrayToIdsString({
        array: infoList.value.reviewData,
      });
      const form = {
        ...props.info,
        id: route.params.id,
        reviewData: files,
      };
      form.items = [];
      editableTabs.value.forEach(tabData => {
        tabData.items.forEach(q => {
          form.items.push({
            reviewProsecutionName: tabData.reviewProsecutionName,
            reviewProsecution: tabData.reviewProsecution,
            reviewProblem: q.reviewProblem,
            reviewProposer: q.reviewProposer,
            reviewCompletionTime: q.reviewCompletionTime,
            reviewAttachments: q.reviewAttachmentsIds
              ? q.reviewAttachmentsIds.map(item => item.id).join(',')
              : undefined,
          });
        });
      });

      // let reviewRecordProblemIds = [];
      // form.record.problemAllocationMap = form.record.problemAllocationMap?.map(dataItem => {
      //   const result = {
      //     ...dataItem,
      //     items: dataItem.items?.map(di => {
      //       reviewRecordProblemIds.push(di.id);
      //       return {
      //         ...di,
      //         reviewAttachments: undefined,
      //         reviewAttachmentsIds: di.reviewAttachments
      //           .map(at => {
      //             return at.id ? at.id : at;
      //           })
      //           .join(','),
      //       };
      //     }),
      //   };
      //   return result;
      // });
      // form.record.reviewRecordProblemIds = reviewRecordProblemIds.join(',');
      // const res = await Api.pdp.dcReview.ReviewConclusionSubmit(form);

      const res = await Api.pdp.dcReview.ReviewConclusionSubmitV2({
        ...form.record,
        items: form.items,
      });
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

const addProblem = index => {
  editableTabs.value[index].items.push({});
};

const deleteProblem = index => {
  editableTabs.value[editableTabsValue.value].items = editableTabs.value[
    editableTabsValue.value
  ].items.filter((_, i) => i !== index);
};

const handlePeopleSelector = data => {
  if (!data) {
    return;
  }
  const find = editableTabs.value.find(item => item.reviewProsecution === data?.id);
  if (find) {
    proxy.$message.error('问题集已存在');
    return;
  }
  const newTabName = `${tabIndex.value++}`;
  editableTabs.value.push({
    title: `问题集(${data.name})`,
    reviewProsecutionName: data.name,
    reviewProsecution: data.id,
    items: [{}],
  });
  editableTabsValue.value = newTabName;
};

const getLabel = key => {
  return DC_PMS_PROJECT_ROLE.value.find(item => {
    return item.dictKey === key;
  })?.dictValue;
};

const handleClose = item => {
  editableTabs.value = editableTabs.value.filter(tab => tab.title !== item.title);
  editableTabsValue.value = editableTabs.value.length > 0 ? 0 : -1;
};

// 打开抽屉 添加问题
const handleDrawerClick = () => {
  problemAllocationMapItem.value = {};
  open.value.drawer = true;
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
