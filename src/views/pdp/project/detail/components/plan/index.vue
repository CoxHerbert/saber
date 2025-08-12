<template>
  <div class="content-wrap" v-loading="loading">
    <div class="main-container">
      <div class="operate-container">
        <div class="operate-container_left">
          <!-- <el-button
            type="primary"
            icon="Plus"
            @click="openCreatePlan({ plan: null, type: 'addMaster' })"
            >新增计划</el-button
          > -->
          <el-button type="primary" icon="Plus" @click="openCreatePlanNew()">新增计划</el-button>
          <el-button icon="CopyDocument" @click="openSelectTemp">选择模板</el-button>
          <el-button icon="Position" @click="handlePlanReleasedBach" :disabled="!ids.length"
            >计划下达</el-button
          >
          <el-button type="danger" @click="removePlans" :disabled="!ids.length">删除计划</el-button>
          <el-button type="primary" @click="toggleChart">{{ viewModelEnum[viewModel] }}</el-button>
        </div>
      </div>
      <div class="table-container">
        <el-table
          v-if="viewModel === 'table'"
          :data="dataList"
          :tree-props="treeProps"
          row-key="id"
          @selection-change="handleSelectionChange"
          height="100%"
          @row-click="openPlanPerformRef"
        >
          <template #empty>
            <div class="no-data">
              <img class="no-data-img" src="/img/views/pdp/no-data.png" alt="" />
              <div class="no-data-desc">暂无信息，请创建计划</div>
              <el-button type="primary" icon="CopyDocument" @click="openSelectTemp"
                >用模板创建</el-button
              >
            </div>
          </template>
          <!-- <el-table-column type="selection" width="55px"></el-table-column> -->
          <el-table-column width="30px" fixed="left" type="">
            <template #default="scoped">
              <el-popover
                placement="bottom-start"
                :width="112"
                trigger="hover"
                popper-style="padding-left: 0;padding-right: 0;"
              >
                <template #reference>
                  <el-icon class="more-filled" @click.stop><MoreFilled /></el-icon>
                </template>
                <ul class="list-group">
                  <li class="list-item" @click.stop="handlePlanReleased(scoped.row)">
                    <div class="list-item_name">计划下达</div>
                  </li>
                  <!-- <li class="list-item" @click.stop="openCreateChildPlan(scoped.row, 'addChild')">
                    <div class="list-item_name">创建子计划</div>
                  </li> -->
                  <li
                    class="list-item"
                    @click.stop="openCreateChildPlanNew(scoped.row, 'addChild')"
                  >
                    <div class="list-item_name">创建子计划</div>
                  </li>
                  <!-- <li class="list-item" @click.stop="openPlanEdit(scoped.row)">
                    <div class="list-item_name">编辑</div>
                  </li> -->
                  <li class="list-item" @click.stop="openPlanEditNew(scoped.row)">
                    <div class="list-item_name">编辑</div>
                  </li>
                  <li class="list-item" @click.stop="removePlan(scoped.row)">
                    <div class="list-item_name">删除计划</div>
                  </li>
                </ul>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column fixed="left" type="selection" width="30" align="center" />
          <el-table-column fixed="left" prop="planName" label="任务" min-width="280">
            <template #default="scoped">
              <span class="plan-name">
                <span
                  class="plan-type"
                  :style="{ backgroundColor: getPlanTypeColor(scoped.row.businessCategoryId) }"
                >
                  <dc-dict
                    type="text"
                    :options="DC_PMS_TEMPITEM_TYPE"
                    :value="scoped.row.businessCategoryId"
                    v-if="scoped.row.businessCategoryId"
                  />
                </span>
                {{ scoped.row.planName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="handlePersonId" label="处理人" min-width="140" align="center">
            <template #default="scoped">
              <dc-view v-model="scoped.row.handlePersonId" objectName="user" showKey="realName" />
            </template>
          </el-table-column>
          <el-table-column prop="planStatus" label="状态" align="center" min-width="180">
            <template #default="scoped">
              <el-progress
                v-if="
                  scoped.row.businessCategoryId === '1862011232290770945' &&
                  scoped.row.planStatusId === '1866034013076316162'
                "
                :percentage="scoped.row.taskProgress || 0"
              />
              <dc-dict v-else :options="DC_PMS_PLAN_STATUS" :value="scoped.row.planStatusId" />
            </template>
          </el-table-column>
          <el-table-column prop="planStatus" label="子计划完成情况" align="center" min-width="140">
            <template #default="scoped">
              <span class="task-completed-info" v-if="scoped.row.childrenCount > 0"
                >{{ scoped.row.childCompletedCount }}/{{ scoped.row.childrenCount }}</span
              >
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" align="center" min-width="140" />
          <el-table-column prop="endDate" label="结束日期" align="center" min-width="140" />
          <el-table-column prop="isMilestone" label="是否里程碑" align="center" min-width="140">
            <template #default="scoped">
              <!-- 
                       active-color="#23C69F"
                inactive-color="#BBBBBB"
              -->
              <el-switch
                :modelValue="scoped.row.isMilestone == 1"
                @click.stop="toggle(scoped.row)"
                :style="{
                  '--el-switch-on-color': 'rgba(35, 198, 159, 0.3)',
                  '--el-switch-off-color': 'rgba(187, 187, 187, 0.3)',
                  '--el-color-white': scoped.row.isMilestone == 1 ? '#23c69f' : '#BBBBBB',
                }"
              />
            </template>
          </el-table-column>
          <el-table-column prop="output" label="输出" align="center" min-width="140">
            <template #default="scoped">{{ scoped.row.output || '-' }}</template>
          </el-table-column>
        </el-table>
        <gantt
          ref="ganttRef"
          v-if="viewModel === 'gantt'"
          @attachEvent="handleGanttAttachEvent"
        ></gantt>
      </div>
    </div>
  </div>
  <!-- 模板选择 -->
  <selectTemp
    ref="selectTempRef"
    :categoryId="categoryId"
    :projectCaseId="projectCaseId"
    :projectId="projectId"
    @confirm="getData()"
  />
  <!-- 创建计划或创建子计划 -->
  <addPlan ref="addPlanRef" v-bind="addPlanProps" @closed="getData" />
  <!-- 编辑计划 -->
  <editPlan
    ref="editPlanRef"
    v-bind="editPlanProps"
    @closed="getData"
    @editRow="handleEditRow"
    @addChild="handleAddChild"
  />
  <!-- 查看计划 -->
  <viewPlan ref="viewPlanRef" v-bind="viewPlanProps" @closed="getData" @viewRow="handleViewRow" />
  <!-- 新增计划或者编辑计划 -->
  <!-- <createPlan
    ref="createPlanRef"
    :projectInfo="info"
    :projectCaseId="projectCaseId"
    :projectId="projectId"
    @confirm="getData()"
  /> -->
  <!-- 创建子计划 -->
  <!-- <createChildPlan
    ref="createChildPlanRef"
    :projectInfo="info"
    :projectCaseId="projectCaseId"
    :projectId="projectId"
    @confirm="getData()"
  /> -->
  <!-- 计划执行 -->
  <!-- <planPerform ref="planPerformRef" :projectInfo="info" @confirm="getData()" :mode="mode" /> -->
</template>
<script setup name="ProjectPlan">
import { reactive, toRefs, onMounted, defineProps } from 'vue';
import Api from '@/api/index';
import { arrayToTree } from '@/utils/util';
import addPlan from '@/views/pdp/planSheet/add/index.vue';
import editPlan from '@/views/pdp/planSheet/edit/index.vue';
import viewPlan from '@/views/pdp/planSheet/view/index.vue';
import gantt from './gantt.vue';
import options from './ganttConfig.js';
import dayjs from 'dayjs';

import selectTemp from './components/selectTemp.vue';
// import createPlan from './components/createPlan.vue';
// import createChildPlan from './components/createChildPlan.vue';
// import planPerform from './components/planPerform.vue';
import { getPlanTypeColor } from '@/utils/util';
import Const from '@/const';

const planStatus = Const.plan.DC_PMS_PLAN_STATUS;
const { proxy } = getCurrentInstance();

const addPlanRef = ref(null);
const editPlanRef = ref(null);
const viewPlanRef = ref(null);

const props = defineProps({
  mode: {
    type: String,
    default() {
      return '';
    },
  },
});

const route = useRoute();

const compData = reactive({
  loading: false,
  selectTempRef: null,
  createPlanRef: null,
  planPerformRef: null,
  createChildPlanRef: null,
  dataList: [],
  info: {},
  projectCaseId: null,
  projectId: null,
  treeProps: {
    checkStrictly: false,
  },
  ids: [],
  addPlanProps: {
    parentId: '',
    from: 'projectList',
    projectId: '',
    projectCaseId: '',
  },
  editPlanProps: {
    parentId: '',
    from: 'projectList',
    projectId: '',
    projectCaseId: '',
  },
  viewPlanProps: {
    parentId: '',
    from: 'projectList',
    projectId: '',
    projectCaseId: '',
  },
  viewModel: 'table',
  viewModelEnum: {
    table: '切换为甘特图',
    gantt: '切换为列表',
  },
  ganttOptions: options,
  ganttData: [],
  start_date: null,
  end_date: null,
  ganttRef: null,
  DC_PMS_PLAN_STATUS: [],
  DC_PMS_TEMPITEM_TYPE: [],
});

const {
  loading,
  selectTempRef,
  createPlanRef,
  planPerformRef,
  createChildPlanRef,
  dataList,
  info,
  projectCaseId,
  projectId,
  treeProps,
  ids,
  addPlanProps,
  editPlanProps,
  viewPlanProps,
  viewModel,
  viewModelEnum,
  ganttOptions,
  ganttRef,
  DC_PMS_PLAN_STATUS,
  DC_PMS_TEMPITEM_TYPE,
} = toRefs(compData);

const categoryId = computed(() =>
  projectCaseId.value ? '1854323339350822914' : '1854323301367205889'
);

const getDicts = async () => {
  try {
    const res = await proxy.useAsyncCache([
      { key: 'DC_PMS_PLAN_STATUS' },
      { key: 'DC_PMS_TEMPITEM_TYPE' },
    ]);
    DC_PMS_PLAN_STATUS.value = res.value.DC_PMS_PLAN_STATUS;
    DC_PMS_TEMPITEM_TYPE.value = res.value.DC_PMS_TEMPITEM_TYPE;
  } catch (error) {
    console.error('获取枚举失败', error);
  }
};

onMounted(async () => {
  await getDicts();
  projectCaseId.value = route.params.projectCaseId;
  projectId.value = route.params.projectId;
  getData();
  if (projectId.value) getDetail();
});

// 详情
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.planItem.getPlanitemListLazy({
      projectId: projectId.value,
      projectCaseId: projectCaseId.value,
      size: 999999,
      current: 1,
    });
    const { code, data } = res.data;
    if (code === 200) {
      dataList.value = data.records;
      // const arr = data.records.map(item => {
      //   item.isMilestone = item.isMilestone === 0 ? true : false;
      //   return item;
      // });
      // dataList.value = arrayToTree(arr);
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};

// 详情
const getDetail = async () => {
  try {
    loading.value = true;
    const res = await Api.pdp.project.detail({ id: projectId.value });
    const { code, data } = res.data;
    if (code === 200) {
      info.value = data;
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};

// 打开选择计划模板弹窗
const openSelectTemp = () => selectTempRef.value.openDialog();

// 打开新增计划抽屉
const openCreatePlan = ({ plan, type }) => {
  createPlanRef.value.openDrawer({ plan, type });
};

const openCreatePlanNew = (row = {}) => {
  addPlanProps.value.projectId = projectId.value;
  addPlanProps.value.projectCode = info.value?.projectCode;
  addPlanProps.value.parentId = '';
  addPlanProps.value.id = null;
  addPlanProps.value.projectCaseId = projectCaseId.value;
  addPlanRef.value?.open();
};

// 编辑
const openPlanEditNew = plan => {
  editPlanProps.value.projectId = projectId.value;
  editPlanProps.value.parentId = '';
  editPlanProps.value.projectCode = info.value?.projectCode;
  editPlanProps.value.id = plan.id;
  editPlanProps.value.projectCaseId = projectCaseId.value;
  editPlanRef.value?.open();
};

const handleEditRow = data => {
  editPlanProps.value = {
    ...editPlanProps.value,
    ...data,
  };
};

const handleViewRow = data => {
  viewPlanProps.value = {
    ...viewPlanProps.value,
    ...data,
  };
};

const handleAddChild = data => {
  addPlanProps.value = {
    ...addPlanProps.value,
    ...data,
  };
  addPlanRef.value?.open();
  editPlanRef.value?.close();
};

// 打开新增子计划
const openCreateChildPlan = (plan, type) => {
  createChildPlanRef.value.openDrawer({ plan, type });
};

const openCreateChildPlanNew = async plan => {
  addPlanProps.value.projectId = projectId.value;
  addPlanProps.value.parentId = plan.id;
  addPlanProps.value.projectCode = info.value?.projectCode;
  addPlanProps.value.id = null;
  addPlanProps.value.projectCaseId = projectCaseId.value;
  addPlanRef.value?.open();
};

// 打开编辑子计划或者主计划弹窗
const openPlanEdit = row => {
  const type = row?.parentId ? 'editChild' : 'editMaster';
  switch (type) {
    case 'editMaster':
      createPlanRef.value.openDrawer({ plan: row, type });
      break;
    case 'editChild':
      const parentPlan = proxy.findNode(dataList.value, row.parentId);
      createChildPlanRef.value.openDrawer({ plan: row, type, parentPlan });
      break;
  }
};

// 处理计划执行
const openPlanPerformRef = plan => {
  viewPlanProps.value.projectId = projectId.value;
  viewPlanProps.value.parentId = '';
  viewPlanProps.value.projectCode = info.value?.projectCode;
  viewPlanProps.value.id = plan.id;
  viewPlanProps.value.projectCaseId = projectCaseId.value;
  viewPlanRef.value?.open();
  // planPerformRef.value.openDrawer(plan);
};

// 删除计划
const removePlan = row => {
  if (row.planStatusId === '1866033974148980737')
    return proxy.$message({
      type: 'warning',
      message: '非规划中不可删除!',
    });
  proxy
    .$confirm(`确认是否删除任务名称为“${row.planName}”的计划?`, {
      confirmButtonText: '删除',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(async () => await Api.pdp.planItem.remove({ ids: row.id }))
    .then(() => {
      getData();
      proxy.$message({
        type: 'success',
        message: '删除成功!',
      });
    })
    .catch(() => {});
};

// 删除计划
const removePlans = row => {
  proxy
    .$confirm('确认是否删除选中的计划？', {
      confirmButtonText: '删除',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(async () => await Api.pdp.planItem.remove({ ids: ids.value }))
    .then(() => {
      getData();
      proxy.$message({
        type: 'success',
        message: '删除成功!',
      });
    })
    .catch(() => {});
};

const handlePlanReleasedBach = () => {
  const find = selectionRows.value?.find(item => {
    item.planStatus !== '1866033974148980737';
  });
  if (find) {
    proxy.$message.error('仅规划中的任务方可下达');
  } else {
    handlePlanReleased();
  }
};

// 计划下达
const handlePlanReleased = plan => {
  if (!ids.value.length && !plan.id) return;

  const planIds = ids.value.length ? ids.value.slice(',') : plan.id;
  const text = plan ? `确认是否下达名称为“${plan.planName}”的计划?` : `确认是否下达选中的计划?`;
  proxy
    .$confirm(text, {
      confirmButtonText: '确认下达',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(async () => await Api.pdp.planItem.sendDownPlan({ dcPmsPlanItemIds: planIds }))
    .then(res => {
      const { msg } = res.data;
      getData();
      proxy.$message({
        type: 'success',
        message: msg,
      });
    })
    .catch(() => {});
};

const toggle = row => {
  const timer = setTimeout(async () => {
    const res = await Api.pdp.planItem.submit({
      id: row.id,
      isMilestone: ['0', '', undefined, false, 0, null].includes(row.isMilestone) ? 1 : 0,
    });
    const { code } = res.data;
    if (code === 200) {
      getData();
    }
    clearTimeout(timer);
  });
};

const selectionRows = ref([]);

const handleSelectionChange = val => {
  selectionRows.value = val;
  ids.value = val.map(({ id }) => id).join(',');
};

const toggleChart = () => {
  viewModel.value = viewModel.value === 'table' ? 'gantt' : 'table';
  if (viewModel.value === 'gantt') {
    getGanttData();
  }
};

const getGanttData = async () => {
  Api.pdp.planItem
    .getPlanItemGatter({
      projectId: projectId.value,
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        compData.ganttData = data.map(item => {
          const start_date = new Date(dayjs(item.startDate));
          const end_date = new Date(dayjs(item.endDate).add(1, 'day'));

          // 初始化或比较
          if (!compData.start_date || start_date < compData.start_date) {
            compData.start_date = start_date;
            ganttOptions.value.config.start_date = start_date;
          }
          if (!compData.end_date || end_date > compData.end_date) {
            compData.end_date = end_date;
            ganttOptions.value.config.end_date = end_date;
          }
          const currentDict = DC_PMS_TEMPITEM_TYPE.value.find(
            dict => dict.id === item.businessCategoryId
          );
          const stateName = planStatus[item.planStatusId];

          const currentProgress =
            stateName === '已完成' || stateName === '延期完成'
              ? 1
              : typeof item.progress === 'number'
              ? item.progress / 100
              : 0;
          return {
            ...item,
            start_date,
            end_date,
            row_height: 30,
            parent: item.parentId,
            progress: currentProgress,
            text: `<div class="gantt_cell-content">
              <div class="task-name">
                <div class="plan-type" style="background-color:${getPlanTypeColor(
                  item.businessCategoryId
                )}">
                  ${currentDict?.label}
              </div>
              <div class="plan-name" title="${item?.planName}">
                ${item?.planName}
              </div>
              </div>
            </div>`,
          };
        });
        nextTick(() => {
          ganttRef.value.initGantt({
            options: ganttOptions.value,
            data: compData.ganttData,
            start_date: compData.start_date,
            end_date: compData.end_date,
          });
        });
      }
    })
    .catch(err => {
      console.error(err);
    });
};
const handleGanttAttachEvent = e => {
  console.log(e);
};
</script>
<style lang="scss">
.statistics-desc .el-progress-bar__inner {
  background: linear-gradient(90deg, #ffd1ac 0%, #f29346 100%);
}
</style>
<style lang="scss" scoped>
.content-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .more-filled {
    margin-right: 4px;
  }

  // .status-box {
  //   display: flex;
  //   justify-content: center;
  //   flex-flow: row nowrap;
  //   align-content: center;

  //   .task-completed-info {
  //     padding-left: 4px;
  //   }
  // }
  .main-container {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    .operate-container .toggle {
      cursor: pointer;
    }
    .table-container {
      .plan-name {
        cursor: pointer;
      }
    }
  }
}
</style>
