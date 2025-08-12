<template>
  <div>
    <!-- 抽屉 -->
    <el-drawer
      class="master-drawer"
      v-if="open"
      v-model="open"
      :title="currentRow?.billNumber"
      size="1300px"
      @close="closeDrawer"
      append-to-body
    >
      <div class="drawer-wrap">
        <div class="drawer-wrap-left" ref="scrollContainer">
          <el-form ref="submitFormRef" :model="formData" :rules="rules" label-width="auto">
            <div class="left-title">工单基本信息</div>

            <el-descriptions :column="2">
              <el-descriptions-item label="单据编号："
                >{{ currentRow?.billNumber }}
              </el-descriptions-item>
              <el-descriptions-item label="单据类型："
                >{{ currentRow?.billType }}
              </el-descriptions-item>
              <el-descriptions-item label="单据日期："
                >{{ currentRow?.documentTime }}
              </el-descriptions-item>
              <el-descriptions-item label="拆分状态："
                >{{ currentRow?.splitStatus }}
              </el-descriptions-item>
              <el-descriptions-item label="物料编码："
                >{{ currentRow?.materialCode }}
              </el-descriptions-item>
              <el-descriptions-item label="物料名称：">
                <el-tooltip
                  effect="dark"
                  :content="currentRow?.materialName"
                  placement="bottom-start"
                >
                  <div class="ellipsis">{{ currentRow?.materialName }}</div>
                </el-tooltip>
              </el-descriptions-item>
              <el-descriptions-item label="规格型号：">
                <el-tooltip
                  effect="dark"
                  :content="currentRow?.specificationType"
                  placement="top-start"
                >
                  <div class="ellipsis">{{ currentRow?.specificationType }}</div>
                </el-tooltip>
              </el-descriptions-item>
              <el-descriptions-item label="单位：">{{ currentRow?.unit }}</el-descriptions-item>
              <el-descriptions-item label="业务状态：" span="2"
                >{{ currentRow?.businessStatus }}
              </el-descriptions-item>
              <el-descriptions-item label="齐套日期：" span="2">
                <el-form-item
                  prop="completionTime"
                  :rules="[{ required: true, message: '齐套日期为必选项' }]"
                >
                  <el-date-picker
                    class="form-item-width_220"
                    v-model="formData.completionTime"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择时间"
                    clearable
                  />
                </el-form-item>
              </el-descriptions-item>
              <el-descriptions-item label="拆分数量：" span="2">
                <div class="form-number">
                  <el-input-number
                    class="form-item-width_220"
                    v-model="formData.splitAmount"
                    :min="0"
                    :max="currentRow?.splitTotalQty - currentRow?.splitQty"
                    placeholder="请输入"
                    :disabled="numberDisabled"
                  />
                  <el-button
                    type="primary"
                    plain
                    @click="formData.splitAmount = currentRow?.splitTotalQty - currentRow?.splitQty"
                    v-if="!numberDisabled"
                    >全部拆分
                  </el-button>
                </div>
                <div class="form-clue-text" v-if="!numberDisabled">
                  <span>已拆分{{ currentRow?.splitQty }}</span>
                  <span>未拆{{ currentRow?.splitTotalQty - currentRow?.splitQty }}</span>
                  <span>总数{{ currentRow?.splitTotalQty }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="外购线材交期：" span="2">
                <el-form-item prop="outsourceStartTime">
                  <dc-date-range
                    v-model:startDate="formData.outsourceStartTime"
                    v-model:endDate="formData.outsourceEndTime"
                    valueFormat="YYYY-MM-DD"
                    :clearable="true"
                  />
                </el-form-item>
              </el-descriptions-item>
            </el-descriptions>
            <div class="left-title">工艺选择</div>
            <div>
              <el-checkbox
                v-model="item.checked"
                :label="item.processName"
                v-for="(item, index) in formData.selectedProcessOrder"
                :key="index"
                @change="handleSelectedProcessOrder(item)"
              />
            </div>

            <div class="table-container">
              <el-table
                row-key="uuid"
                :data="selectedProcessOrder"
                default-expand-all
                height="100%"
                :tree-props="{ children: 'assignedWorkOrders' }"
              >
                <el-table-column
                  prop="processName"
                  label="工艺"
                  align="center"
                  width="140"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="showBillNumber"
                  label="工单"
                  align="center"
                  width="140"
                  show-overflow-tooltip
                >
                  <template #default="scoped">{{ scoped.row.showBillNumber }}</template>
                </el-table-column>
                <el-table-column prop="projectCaseMo" label="时间周期" align="center" width="260">
                  <template #default="scoped">
                    <dc-date-range-picker
                      v-if="!scoped.row.isChild"
                      v-model:startDate="scoped.row.startTime"
                      v-model:endDate="scoped.row.endTime"
                      :earliestDate="lastTime"
                      @change="handleDateChange($event, scoped.row)"
                      :clearable="true"
                    />
                    <span v-else
                      >{{ scoped.row.startTime || '-' }}至{{ scoped.row.endTime || '-' }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column label="单件标工" align="center" width="160">
                  <template #default="scoped">
                    <el-input-number
                      class="processing-time"
                      v-model="scoped.row.processingTime"
                      controls-position="right"
                      :min="0"
                      :precision="3"
                      v-if="scoped.row.isChild"
                    >
                      <template #suffix>
                        <span>小时</span>
                      </template>
                      <template #decrease-icon>
                        <el-icon>
                          <Minus />
                        </el-icon>
                      </template>
                      <template #increase-icon>
                        <el-icon>
                          <Plus />
                        </el-icon>
                      </template>
                    </el-input-number>
                  </template>
                </el-table-column>
                <el-table-column prop="workGroupCode" label="小组" align="center" width="140">
                  <template #default="scoped">
                    <el-select
                      v-model="scoped.row.workGroupCode"
                      placeholder="请选择"
                      @change="handleGroupChange(scoped.row)"
                      v-if="!scoped.row.isChild"
                    >
                      <el-option
                        v-for="item in scoped.row.workGroups"
                        :key="item.workGroupCode"
                        :label="item.workGroupName"
                        :value="item.workGroupCode"
                      />
                    </el-select>
                    <span v-else>{{ scoped.row.workGroupName || '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" align="center" width="140">
                  <template #default="scoped">
                    <el-button text v-if="scoped.row.canAdd" @click="addChildren(scoped.row)">
                      添加工单
                    </el-button>
                    <el-button text v-if="!scoped.row.isVirtual" @click="removeRow(scoped.row)">
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form>
        </div>
        <div class="drawer-wrap-right">
          <div class="wrap-title">未分配工单</div>
          <ul class="unselect-list">
            <li
              class="list-item"
              v-for="(item, index) in formData.unallocatedWorkOrder"
              :key="index"
            >
              <span class="ellipsis">
                {{ item.showBillNumber }}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleVerify">提交</el-button>
          <el-button @click="closeDrawer">取消</el-button>
        </div>
      </template>
    </el-drawer>
    <!-- 工单数据校验弹 -->
    <el-dialog v-model="openVerify" destroy-on-close append-to-body @close="closeVerify">
      <template #header>
        <div class="warn-text">请仔细核对工单数据</div>
      </template>
      <el-table
        row-key="uuid"
        :data="selectedProcessOrder"
        default-expand-all
        height="100%"
        width="100%"
        :tree-props="{ children: 'assignedWorkOrders' }"
      >
        <el-table-column
          prop="processName"
          label="工艺"
          align="center"
          width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="showBillNumber"
          label="工单"
          align="center"
          min-width="140"
          show-overflow-tooltip
        >
          <template #default="scoped">{{ scoped.row.showBillNumber }}</template>
        </el-table-column>
        <el-table-column prop="projectCaseMo" label="时间周期" align="center" width="240">
          <template #default="scoped">
            <span>{{ scoped.row.startTime || '-' }}至{{ scoped.row.endTime || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单件标工" align="center" width="160">
          <template #default="scoped">
            {{ scoped.row.processingTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="workGroupName" label="小组" align="center" width="140">
          <template #default="scoped">
            <span>{{ scoped.row.workGroupName || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeVerify" v-loading="loading">返回修改</el-button>
          <el-button type="primary" @click="submitForm" v-loading="loading">确认提交</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 抽屉结束 -->
    <el-dialog
      v-model="openUnSelect"
      title="选择工单"
      width="500"
      append-to-body
      @close="closeSelect"
    >
      <el-checkbox-group v-model="checkList" v-if="!!formData.unallocatedWorkOrder.length">
        <el-checkbox
          :label="item.showBillNumber"
          :value="item.id"
          v-for="(item, index) in formData.unallocatedWorkOrder"
          :key="index"
        />
      </el-checkbox-group>
      <span v-else>无未分配订单</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirmSelect">确认</el-button>
          <el-button @click="closeSelect">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { nextTick } from 'vue';
import func from '@/utils/func';
import dayjs from 'dayjs';
import { deepClone } from '@/utils/util';
import Api from '@/api';

const { proxy } = getCurrentInstance();
const emit = defineEmits(['confirm']);

const pageData = reactive({
  loading: true,
  open: false,
  formData: {},
  rules: {
    hours: [{ required: true, message: '请输入默认工时', trigger: 'blur' }],
    completionTime: [{ required: true, message: '请选择时间', trigger: 'blur' }],
    splitAmount: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  },
  // 未选中选项
  unselectOptions: [],
  // 行信息
  currentRow: {},
  // 工单数据校验弹窗
  openVerify: false,
  openUnSelect: false,
  selectRow: {},
  checkList: [],
  drawerOptions: {
    params: {},
    infoApi: null,
    submitApi: null,
  },
  numberDisabled: false,
});

const {
  formData,
  loading,
  open,
  rules,
  currentRow,
  unselectOptions,
  openUnSelect,
  checkList,
  selectRow,
  openVerify,
  drawerOptions,
  numberDisabled,
} = toRefs(pageData);

const scrollContainer = ref(null);

const lastTime = computed(() => {
  return selectedProcessOrder.value.reduce((max, item) => {
    const itemMaxTime = dayjs(item.startTime).isAfter(dayjs(item.endTime))
      ? item.startTime
      : item.endTime;
    return dayjs(itemMaxTime).isAfter(dayjs(max)) ? itemMaxTime : max;
  }, selectedProcessOrder.value[0]?.startTime || selectedProcessOrder.value[0]?.endTime);
});

const selectedProcessOrder = computed(() => {
  return formData.value.selectedProcessOrder
    .map(item => {
      const { assignedWorkOrders } = item;
      if (Array.isArray(assignedWorkOrders) && assignedWorkOrders.length > 1) {
        assignedWorkOrders.forEach((assignedWorkOrder, assignedWorkOrderIndex) => {
          if (assignedWorkOrder.isVirtual) {
            assignedWorkOrder.isShow = false;
            item.virtual = deepClone(assignedWorkOrder);
            assignedWorkOrders.splice(assignedWorkOrderIndex, 1);
          } else {
            assignedWorkOrder.isShow = true;
          }
        });
      } else if (Array.isArray(assignedWorkOrders) && !assignedWorkOrders.length) {
        item.virtual.isShow = true;
        assignedWorkOrders.unshift(deepClone(item.virtual));
        item.virtual = null;
      }
      return item;
    })
    .filter(item => item.checked);
});

// 分解计划
const openDrawer = async (options, disabled) => {
  // options.params.moId = '1944968202616102917';
  try {
    const technologyInfo = await Api.mps.mo.getTechnologyInfo(options?.params);
    let { data: technologyInfoData } = technologyInfo.data;
    technologyInfoData = technologyInfoData.filter(
      item => item.startTime || item.endTime || item.workGroupId
    );
    numberDisabled.value = disabled;
    loading.value = true;
    drawerOptions.value = options;
    const res = await options?.infoApi?.(options?.params);
    const { code, data } = res.data;
    if (code !== 200) return;
    formData.value = data;
    const processList = data.selectedProcessOrder || [];
    formData.value.selectedProcessOrder = processList.map(process => {
      const curProcess = technologyInfoData.find(item => item.id === process.id);
      ensureWorkGroupExists(process);
      return mergeProcessWithInfo(process, curProcess);
    });
    currentRow.value = options?.row || data;
    formData.value.selectedProcessOrder.forEach(processOrder => {
      processOrder.uuid = func.generateUUID();
      processOrder.isVirtual = true;
      ensureWorkGroupExists(processOrder);

      const processInfo = technologyInfoData.find(item => item.id === processOrder.id);

      processOrder.assignedWorkOrders.forEach(child => {
        if (child.id <= 0 || child.id === null) {
          processOrder.processingTime = Math.max(0, proxy.secondToHour(child.processingTime || 0));
          processOrder.billNumber = child.billNumber;
          processOrder.showBillNumber = child.showBillNumber;

          Object.assign(processOrder, mergeProcessWithInfo(processOrder, processInfo));
        }

        Object.assign(child, {
          isChild: true,
          isVirtual: child.id <= 0 || child.id === null,
          uuid: func.generateUUID(),
          processingTime: Math.max(0, proxy.secondToHour(child.processingTime)),
          startTime: processOrder.startTime,
          endTime: processOrder.endTime,
          workGroupName: processOrder.workGroupName,
          workGroupCode: processOrder.workGroupCode,
        });
      });
    });
    // 标记未分配工单
    if (Array.isArray(formData.value.unallocatedWorkOrder)) {
      formData.value.unallocatedWorkOrder.forEach(item => {
        item.isChild = true;
      });
    }
    open.value = true;
  } catch (error) {
    console.error('openDrawer error:', error);
  } finally {
    loading.value = false;
  }
};

function ensureWorkGroupExists(process) {
  const exists = process?.workGroups?.some(item => item.workGroupCode === process.workGroupCode);
  if (!exists && process?.workGroupName && process?.workGroupCode) {
    process.workGroups = process.workGroups || [];
    process.workGroups.push({
      workGroupName: process.workGroupName,
      workGroupCode: process.workGroupCode,
    });
  }
}

function mergeProcessWithInfo(process, info) {
  return {
    ...process,
    startTime: info?.startTime ?? process.startTime,
    endTime: info?.endTime ?? process.endTime,
    workGroupCode: info?.workGroupId ?? process.workGroupCode,
    workGroupName: info?.workGroupName ?? process.workGroupName,
  };
}

// 处理组的变化
const handleGroupChange = row => {
  const workGroup = row.workGroups.find(item => item.workGroupCode === row.workGroupCode);

  const updateWorkGroupInfo = targetRow => {
    targetRow.workGroupName = workGroup?.workGroupName || null;
    targetRow.workGroupCode = workGroup?.workGroupCode || null;
    targetRow.assignedWorkOrders?.forEach(item => {
      item.workGroupName = workGroup?.workGroupName || null;
      item.workGroupCode = workGroup?.workGroupCode || null;
    });
  };

  updateWorkGroupInfo(row);

  const relatedProcessMap = {
    '1851181118047055877': '1851181118047055876',
    '1851181118047055876': '1851181118047055877',
  };

  const relatedCode = relatedProcessMap[row.processCode];
  if (relatedCode) {
    const relatedProcess = selectedProcessOrder.value.find(
      item => item.processCode === relatedCode
    );
    if (relatedProcess) {
      updateWorkGroupInfo(relatedProcess);
    }
  }
};

// 处理工艺变化
const handleSelectedProcessOrder = item => {
  if (item.checked) return;
  item.assignedWorkOrders.forEach((moItem, index) => {
    if (!moItem.isVirtual) {
      // 不是虚拟mo
      formData.value.unallocatedWorkOrder.push(moItem);
      item.assignedWorkOrders.splice(index, 1);
    }
  });
};

// 处理日期变化
const handleDateChange = (daterange, row) => {
  row.assignedWorkOrders.forEach(item => {
    item.startTime = daterange ? daterange.startDate : null;
    item.endTime = daterange ? daterange.endDate : null;
  });
};

// 添加子项
const addChildren = row => {
  selectRow.value = row;
  openUnSelect.value = true;
};

// 关闭未选中弹窗
const closeSelect = () => {
  openUnSelect.value = false;
  checkList.value = [];
  selectRow.value = {};
};

// 确认选择
const confirmSelect = () => {
  openUnSelect.value = false;

  checkList.value.forEach(id => {
    const moItem = formData.value.unallocatedWorkOrder.find(item => item.id === id);
    moItem.processingTime =
      moItem.processingTime <= 0 ? Number(0) : proxy.secondToHour(moItem.processingTime);
    selectRow.value.assignedWorkOrders.push({
      ...moItem,
      startTime: selectRow.value.startTime,
      endTime: selectRow.value.endTime,
      workGroupCode: selectRow.value.workGroupCode,
      workGroupName: selectRow.value.workGroupName,
    });
  });
  checkList.value.forEach(id => {
    const findIndex = formData.value.unallocatedWorkOrder.findIndex(item => item.id === id);
    formData.value.unallocatedWorkOrder.splice(findIndex, 1);
  });
  checkList.value = [];
  selectRow.value = {};
};

// 移除子项
const removeRow = row => {
  formData.value.selectedProcessOrder.forEach(processOrder => {
    for (let i = processOrder.assignedWorkOrders.length - 1; i >= 0; i--) {
      if (processOrder.assignedWorkOrders[i].id === row.id) {
        processOrder.assignedWorkOrders.splice(i, 1);
      }
    }
  });
  formData.value.unallocatedWorkOrder.push(row);
};

// 处理校验
const handleVerify = () => {
  const processOrder = formData.value.selectedProcessOrder;

  const hasUncheckedTime = processOrder.some(
    item => item.checked && (!item.startTime || !item.endTime)
  );
  if (hasUncheckedTime) {
    return proxy.$message({
      type: 'warning',
      message: '请选择时间周期',
    });
  }
  if (formData.value.unallocatedWorkOrder.length > 0) {
    return proxy.$message({
      type: 'warning',
      message: '仍有未分配工单',
    });
  }
  if (formData.value.splitAmount === null || formData.value.splitAmount === undefined) {
    return proxy.$message({
      type: 'warning',
      message: '拆分数量不能为空',
    });
  }
  const hasInvalidProcessingTime = processOrder.some(
    process => process.checked && process.assignedWorkOrders?.some(item => item.processingTime <= 0)
  );
  if (hasInvalidProcessingTime) {
    return proxy.$message({
      type: 'warning',
      message: '单件标工不能为0或小于0，请检查！',
    });
  }
  proxy.$refs['submitFormRef'].validate(valid => {
    if (valid) {
      openVerify.value = true;
    }
  });
};

// 关闭校验弹窗
const closeVerify = () => {
  openVerify.value = false;
};

// 弹出框提交表单
const submitForm = () => {
  const form = deepClone(formData.value);
  form.selectedProcessOrder.forEach(processOrder => {
    if (processOrder.virtual) processOrder.assignedWorkOrders.unshift(processOrder.virtual);
    processOrder.assignedWorkOrders = processOrder.assignedWorkOrders.map(item => {
      if (item.id <= 0 || item.id === null) {
        processOrder.processingTime = Number(proxy.hourToSecond(item.processingTime));
        processOrder.startTime = processOrder.startTime;
        processOrder.endTime = processOrder.endTime;
      }
      return {
        ...item,
        processingTime: Number(proxy.hourToSecond(item.processingTime)),
      };
    });
  });
  proxy.$refs['submitFormRef'].validate(async valid => {
    if (valid) {
      loading.value = true;
      const res = await drawerOptions.value?.submitApi(form);
      const { code, msg } = res.data;
      if (code === 200) {
        closeDrawer();
        closeVerify();
        emit('confirm');
        proxy.$message.success(msg);
      }
      loading.value = false;
    }
  });
};

// 取消
const closeDrawer = () => {
  open.value = false;
  nextTick(() => {
    unselectOptions.value = [];
    formData.value = {
      selectedProcessOrder: [],
    };
    proxy.resetForm('submitFormRef');
  });
};

defineExpose({
  openDrawer,
});
</script>
<style lang="scss">
@use '@/styles/masterDrawer';
</style>
<style scoped lang="scss">
.warn-text {
  color: red;
  font-size: 22px;
  font-weight: 600;
}
</style>
