<template>
  <el-table
    :data="data"
    :tree-props="treeProps"
    row-key="id"
    @selection-change="handleSelectionChange"
    height="100%"
    @row-click="handlePerform"
  >
    <el-table-column width="20" type="">
      <template #default="scoped">
        <el-popover
          placement="bottom-start"
          :width="112"
          trigger="hover"
          popper-style="padding-left: 0;padding-right: 0;"
        >
          <template #reference>
            <el-icon class="more-filled"><MoreFilled /></el-icon>
          </template>
          <ul class="list-group">
            <li class="list-item" @click.stop="handlePlanReleased(scoped.row)">
              <div class="list-item_name">计划下达</div>
            </li>
            <li class="list-item" @click.stop="createPlan(scoped.row, 'addChild')">
              <div class="list-item_name">创建子计划</div>
            </li>
            <li class="list-item" @click.stop="editplan(scoped.row)">
              <div class="list-item_name">编辑</div>
            </li>
            <li class="list-item" @click.stop="removePlan(scoped.row)">
              <div class="list-item_name">删除计划</div>
            </li>
          </ul>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column type="selection" width="30" align="center" v-if="!isSwitch" />
    <el-table-column prop="planName" label="任务" min-width="240">
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
    <el-table-column prop="handlePersonId" label="处理人" width="140" align="center">
      <template #default="scoped">
        <dc-view v-model="scoped.row.handlePersonId" objectName="user" showKey="realName" />
      </template>
    </el-table-column>
    <el-table-column prop="planStatus" label="状态" align="center" width="140">
      <template #default="scoped">
        <dc-dict :options="DC_PMS_PLAN_STATUS" :value="scoped.row.planStatusId" />
      </template>
    </el-table-column>
    <el-table-column prop="startDate" label="开始日期" align="center" width="140" />
    <el-table-column prop="endDate" label="结束日期" align="center" width="140" />
    <el-table-column prop="isMilestone" label="是否里程碑" align="center" width="140">
      <template #default="scoped">
        <el-switch
          v-model="scoped.row.isMilestone"
          :disabled="isSwitch"
          @click="toggle(scoped.row)"
          style="
            --el-switch-on-color: rgba(35, 198, 159, 0.3);
            --el-switch-off-color: #eff1f3;
            --el-color-white: #23c69f;
          "
        />
      </template>
    </el-table-column>
    <el-table-column prop="output" label="输出" align="center" width="140">
      <template #default="scoped">{{ scoped.row.output || '-' }}</template>
    </el-table-column>
  </el-table>
</template>
<script setup name="PlanTable">
import { reactive, toRefs } from 'vue';
import Api from '@/api/index';
import { getPlanTypeColor } from '@/utils/util';

const emit = defineEmits(['change', 'update', 'create', 'perform']);
const { proxy } = getCurrentInstance();

const { DC_PMS_PLAN_STATUS, DC_CRM_TYPE, DC_PMS_TEMPITEM_TYPE } = proxy.useCache([
  { key: 'DC_PMS_PLAN_STATUS' },
  { key: 'DC_CRM_TYPE' },
  { key: 'DC_PMS_TEMPITEM_TYPE' },
]);

const props = defineProps({
  data: {
    type: Array,
    default: [],
  },
  isSwitch: {
    type: Boolean,
    default: false,
  },
});

const compData = reactive({
  treeProps: {
    checkStrictly: false,
  },
  ids: [],
});

const { treeProps, ids } = toRefs(compData);

// 删除计划
const removePlan = row => {
  proxy
    .$confirm(`确认是否删除任务名称为“${row.planName}”的计划?`, {
      confirmButtonText: '删除',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(async () => await Api.pdp.planItem.remove({ ids: row.id }))
    .then(() => {
      proxy.$message({
        type: 'success',
        message: '删除成功!',
      });
      emit('change');
    });
};

// 创建子计划
const createPlan = (plan, type) => {
  switch (type) {
    case 'addChild':
      emit('create', {
        plan,
        type,
      });
      break;
  }
};

// 编辑任务
const editplan = plan => {
  const type = plan?.parentId ? 'editChild' : 'editMaster';
  emit('update', { plan, type });
};

// 计划下达
const handlePlanReleased = plan => {
  const id = plan.id;
  proxy
    .$confirm(`确认是否下达名称为“${plan.planName}”的计划?`, {
      confirmButtonText: '确认下达',
      cancelButtonText: '关闭',
      type: 'warning',
    })
    .then(async () => await sendDownPlan(id))
    .then(res => {
      const { msg } = res.data;
      proxy.$message({
        type: 'success',
        message: msg,
      });
      emit('change');
    });
};

// 处理计划执行
const handlePerform = row => {
  emit('perform', row);
};

const sendDownPlan = async id => {
  const res = await Api.pdp.planItem.sendDownPlan({ dcPmsPlanItemIds: id || ids.value });
  return res;
};

const toggle = row => {
  setTimeout(async () => {
    const res = await Api.pdp.planItem.submit({
      id: row.id,
      isMilestone: row.isMilestone ? 0 : 1,
    });
    const { code } = res.data;
    if (code === 200) {
      emit('change');
    }
  });
};

const handleSelectionChange = val => {
  ids.value = val.map(({ id }) => id).join(',');
};

defineExpose({
  sendDownPlan,
});
</script>
<style lang="scss">
.el-progress-bar__inner {
  background: linear-gradient(90deg, #ffd1ac 0%, #f29346 100%);
}
</style>
<style lang="scss" scoped>
.plan-name {
  cursor: pointer;
}
</style>
