<template>
  <basic-container>
    <div class="list-edit-page mrp-list-page" v-loading="loading">
      <div class="toolbar">
        <div class="title-info-container">
          <h3 class="section-title">员工绩效考核表</h3>
          <div class="info-wrapper">
            <span class="info-item">部门: {{ route.query.department }}</span>
            <span class="info-item">周期: {{ route.query.assessmentPeriod }}</span>
            <span class="info-item">考核人: {{ route.query.assessor }}</span>
          </div>
        </div>
        <div></div>
        <div class="button-wrapper" v-if="!isRouterEdit">
          <el-button type="primary" @click="saveAll('draft')">保存草稿</el-button>
          <el-button type="primary" @click="saveAll('all')">发布</el-button>
        </div>
      </div>

      <div class="table-container">
        <el-form ref="formRef" class="form-main" :model="tableData">
          <el-form-item class="form-item-table" :label-width="0">
            <el-table
              :data="tableData"
              border
              highlight-current-row
              width="100%"
              :cell-class-name="cellClassNameFunc"
            >
              <!-- 固定指标列 -->
              <el-table-column prop="序号" label="序号" align="center" width="60" fixed="left" />
              <el-table-column
                prop="权重分值"
                label="权重分值"
                width="90"
                align="center"
                fixed="left"
              />
              <el-table-column
                prop="考核维度"
                label="考核维度"
                align="center"
                width="150"
                fixed="left"
              />
              <el-table-column label="计分规则" align="left" fixed="left" width="250">
                <template #default="{ row }">
                  <div v-html="row['计分规则']"></div>
                </template>
              </el-table-column>

              <!-- 员工列 -->
              <el-table-column
                v-for="(employee, i) in employees"
                :key="i"
                :prop="employee"
                align="center"
                :width="employees.length <= 10 ? undefined : 100"
                min-width="100"
              >
                <template #header>
                  <div class="header-with-icon" @click="handleHeaderClick(employee)">
                    <span>{{ employee }}</span>
                    <el-icon class="el-icon-edit">
                      <el-icon-edit />
                    </el-icon>
                  </div>
                </template>
                <template v-slot:default="{ row, $index }">
                  <!-- 编辑标记 - 放在正确的容器内 -->
                  <div v-if="row.editedCells?.[employee]" class="edited-marker"></div>
                  <!-- 角标 -->
                  <div
                    class="corner-badge"
                    @mouseenter="handleBadgeMouseEnter(row, employee, $event)"
                    @mouseleave="handleBadgeMouseLeave"
                  >
                    <el-icon><InfoFilled /></el-icon>
                  </div>
                  <div class="editable-cell">
                    <!-- 非编辑状态 -->
                    <template v-if="!row.isEditing">
                      <span
                        class="cell-text"
                        @click="startRowEditing($index, employee)"
                        :data-row-index="$index"
                        :data-employee="employee"
                      >
                        {{ row[employee] !== undefined ? row[employee] : '-' }}
                      </span>
                    </template>

                    <!-- 编辑状态 -->
                    <template v-else>
                      <el-input
                        ref="inputRef"
                        v-model.number="row[employee]"
                        :min="0"
                        :max="row.权重分值"
                        @blur="validateRowScore(row, employee, $index)"
                        @keydown.enter="handleEnterKey($index, employee)"
                        @keydown.esc="handleEscapeKey($index)"
                        type="number"
                        style="text-align: center"
                        placeholder="请输入数字"
                        :data-row-index="$index"
                        :data-employee="employee"
                      />
                    </template>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 全局popover组件 -->
    <el-popover
      ref="globalPopover"
      placement="top"
      width="200"
      trigger="manual"
      :content="currentTooltipContent"
      :visible="popoverVisible"
      :virtual-ref="currentTargetElement"
      popper-class="custom-popover"
    >
    </el-popover>
  </basic-container>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue';
import Api from '@/api/index';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { InfoFilled } from '@element-plus/icons-vue';
const route = useRoute();

// 响应式数据
const employees = ref([]);
const tableData = ref([]);
const loading = ref(false);
const inputRef = ref(null);
const currentEditingRow = ref(null);
const currentEditingEmployee = ref(null);
const inputRefs = new Map(); // 存储input引用
const showTooltip = ref(false);
const isRouterEdit = ref(false);
// 新增的全局popover相关数据
const globalPopover = ref(null);
const currentTooltipContent = ref('');
const popoverVisible = ref(false);
const currentTargetElement = ref(null);

// 初始化表格数据
const initTableData = async () => {
  try {
    loading.value = true;
    const params = {
      templateId: route.query.templateId,
      department: route.query.department,
      assessmentPeriod: route.query.assessmentPeriod,
      employeeNames: null,
      label: route.query.label,
    };

    const res = await Api.system.po.fillAssessment(params);
    const { code, data } = res.data;
    if (code === 200) {
      // let mock = {
      //   权重分值: 15,
      //   分类: '一、工作态度与纪律',
      //   考核维度: '工作态度',
      //   计分规则:
      //     '1）积极主动承担工作任务，认真负责，团队协作良好（13-15分）。<br/>2）能够完成工作任务，但主动性、责任心或团队协作能力一般（8-12分）。<br/>3）工作态度消极，缺乏责任心，团队协作差（0-7分）。',
      //   徐刚: {
      //     fraction: 110,
      //     tip: 1122,//可以是数组 根据当前人弹框内容决定
      //
      //   },
      //...Api
      // };
      // 初始化时为每行添加isEditing、isEdited和editedCells属性
      tableData.value = data.tableData.map(row => ({
        ...row,
        isEditing: false, // 是否处于编辑状态
        isEdited: false, // 是否被编辑过
        originalData: JSON.parse(JSON.stringify(row)), // 保存深拷贝的原始数据
        editedCells: {}, // 记录已编辑的单元格
      }));
      employees.value = data.userNames;
    }
  } catch (err) {
    console.error('初始化表格数据失败:', err);
    ElMessage.error('数据加载失败，请刷新页面重试');
  } finally {
    loading.value = false;
  }
};

// 单元格样式处理
const cellClassNameFunc = ({ row, column, rowIndex }) => {
  // 编辑过的单元格添加特殊背景
  if (row.editedCells?.[column.property]) {
    return 'edited-cell-bg';
  }

  // 当前正在编辑的行添加特殊样式
  if (row.isEditing) {
    return 'editing-row';
  }

  return '';
};

// 开始编辑行
const startRowEditing = (rowIndex, employee) => {
  if (isRouterEdit.value) {
    return;
  }
  console.log(rowIndex, employee);

  // 避免重复处理同一行
  if (currentEditingRow.value === rowIndex && currentEditingEmployee.value === employee) {
    return;
  }

  // 使用requestAnimationFrame优化渲染时序
  requestAnimationFrame(() => {
    // 只检查当前编辑的行，避免全量遍历
    const currentEditingIndex = tableData.value.findIndex(row => row.isEditing);
    if (currentEditingIndex !== -1 && currentEditingIndex !== rowIndex) {
      cancelRowEditing(currentEditingIndex);
    }

    // 优化深拷贝 - 只拷贝必要字段
    const row = tableData.value[rowIndex];
    const essentialData = {};
    employees.value.forEach(emp => {
      essentialData[emp] = row[emp];
    });
    essentialData.权重分值 = row.权重分值;
    row.originalData = essentialData;

    // 记录当前编辑状态
    currentEditingRow.value = rowIndex;
    currentEditingEmployee.value = employee;

    // 使用nextTick确保DOM更新
    nextTick(() => {
      row.isEditing = true;

      // 双重nextTick确保DOM完全更新
      nextTick(() => {
        focusInput(rowIndex, employee);
      });
    });
  });
};

// 聚焦到指定input
const focusInput = (rowIndex, employee) => {
  try {
    // 使用DOM选择器
    setTimeout(() => {
      const inputElement = document.querySelector(
        `input[data-row-index="${rowIndex}"][data-employee="${employee}"]`
      );
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 50);
  } catch (error) {
    console.error('聚焦input失败:', error);
  }
};

// 处理Enter键
const handleEnterKey = (rowIndex, employee) => {
  // 阻止默认行为
  event.preventDefault();

  // 找到当前员工的索引
  const currentIndex = employees.value.indexOf(employee);
  if (currentIndex === -1) return;

  // 计算下一个员工的索引
  const nextIndex = (currentIndex + 1) % employees.value.length;
  const nextEmployee = employees.value[nextIndex];

  // 聚焦到下一个input
  focusInput(rowIndex, nextEmployee);
};

// 处理Escape键
const handleEscapeKey = rowIndex => {
  // 阻止默认行为
  event.preventDefault();

  // 取消编辑状态
  cancelRowEditing(rowIndex);

  // 清理状态
  currentEditingRow.value = null;
  currentEditingEmployee.value = null;
};

// 取消编辑行
const cancelRowEditing = rowIndex => {
  const row = tableData.value[rowIndex];
  // 恢复原始数据
  if (row.originalData) {
    employees.value.forEach(employee => {
      row[employee] = row.originalData[employee];
    });
  }
  // 关闭编辑状态（保留editedCells状态）
  row.isEditing = false;
};

// 验证单个分数并标记编辑状态
const validateRowScore = (row, employee, rowIndex) => {
  let value = row[employee];
  // 限制分数范围
  if (value > row.权重分值) {
    row[employee] = row.权重分值;
    ElMessage.warning(`分数不能超过权重分值(${row.权重分值})`);
  } else if (value < 0 || isNaN(value)) {
    row[employee] = 0;
    ElMessage.warning('分数不能为负数');
  }

  // 检查值是否变化，标记单元格为已编辑
  if (row.originalData && row[employee] !== row.originalData[employee]) {
    if (!row.editedCells) row.editedCells = {};
    row.editedCells[employee] = true;
    row.isEdited = true;
    row.originalData[employee] = row[employee];
  } else if (row.editedCells) {
    // 如果值恢复为原始值，取消编辑标记
    row.editedCells[employee] = false;
    // 检查是否所有单元格都未编辑
    row.isEdited = Object.values(row.editedCells).some(cell => cell);
  }
};

// 行数据验证
const validateRowData = rowData => {
  // 检查权重分值
  if (rowData.权重分值 === undefined || rowData.权重分值 <= 0) {
    ElMessage.warning('权重分值必须大于0');
    return false;
  }
  // 检查所有员工分数
  const hasInvalidScore = employees.value.some(emp => {
    const score = rowData[emp];
    return (
      score < 0 || score > rowData.权重分值 || isNaN(score) || score === undefined || score === null
    );
  });

  if (hasInvalidScore) {
    ElMessage.warning('请确保所有考核员工的分数填写完整且在有效范围内');
    return false;
  }
  return true;
};

// 获取角标提示内容
const getTooltipContent = (row, employee) => {
  const score = row[employee] !== undefined ? row[employee] : 0;
  const maxScore = row.权重分值 || 0;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return `员工: ${employee}\n当前分数: ${score}\n当前分数: ${row[employee].tip}\n权重分值: ${maxScore}\n完成度: ${percentage}%`;
};

// 处理角标鼠标进入事件
const handleBadgeMouseEnter = (row, employee, event) => {
  currentTooltipContent.value = getTooltipContent(row, employee);
  currentTargetElement.value = event.target.closest('.corner-badge');
  popoverVisible.value = true;

  // 使用nextTick确保popover已经渲染
  nextTick(() => {
    if (globalPopover.value) {
      // 手动设置popover的位置
      const popover = globalPopover.value;
      if (popover && popover.popperRef) {
        const popperInstance = popover.popperRef;
        if (popperInstance && popperInstance.popperInstanceRef) {
          popperInstance.popperInstanceRef.update();
        }
      }
    }
  });
};

// 处理角标鼠标离开事件
const handleBadgeMouseLeave = () => {
  popoverVisible.value = false;
  currentTooltipContent.value = '';
  currentTargetElement.value = null;
};

// 保存全部数据
const saveAll = async type => {
  try {
    loading.value = true;
    // 先取消所有编辑状态
    tableData.value.forEach(row => {
      row.isEditing = false;
    });

    // 处理提交数据（移除编辑状态记录）
    const submitData = tableData.value.map(row => {
      const { isEditing, isEdited, originalData, editedCells, ...rest } = row;
      return rest;
    });

    let params = {
      templateId: route.query.templateId,
      department: route.query.department,
      assessor: route.query.assessor,
      assessmentPeriod: route.query.assessmentPeriod,
      userNames: employees.value,
      tableData: submitData,
    };

    const apiMethod = type === 'draft' ? Api.system.po.saveDraft : Api.system.po.submitAssessment;
    const allValid = tableData.value.every(row => validateRowData(row));
    if (type === 'all' && !allValid) {
      loading.value = false;
      return;
    }
    const response = await apiMethod(params);
    const { code, message } = response.data || {};
    if (code === 200) {
      await initTableData(); // 刷新表格数据（使用await确保加载状态正确）
      ElMessage.success(type === 'draft' ? '草稿保存成功' : '发布成功');
    } else {
      ElMessage.error(message || (type === 'draft' ? '草稿保存失败' : '发布失败'));
    }
  } catch (error) {
    ElMessage.error(error || (type === 'draft' ? '保存草稿时发生错误' : '发布时发生错误'));
    console.error(error);
  } finally {
    loading.value = false;
  }
};
const handleHeaderClick = employee => {
  console.log('点击了:', employee);
};

// 生命周期钩子
onMounted(() => {
  if (route.query.label === '已考核') {
    isRouterEdit.value = true;
  }
  initTableData();
  // 监听员工列表变化，初始化新增员工的分数
  watch(
    () => employees.value,
    (newEmployees, oldEmployees) => {
      if (!oldEmployees || newEmployees.length > oldEmployees.length) {
        const addedNames = newEmployees.filter(name => !oldEmployees?.includes(name));
        if (addedNames.length > 0) {
          tableData.value.forEach(row => {
            addedNames.forEach(name => {
              if (row[name] === undefined) {
                row[name] = 0; // 初始化新员工分数
              }
              // 初始化新员工的编辑状态
              if (!row.editedCells) row.editedCells = {};
              row.editedCells[name] = false;
            });
          });
        }
      }
    },
    { deep: true, immediate: true }
  );
});
</script>

<style scoped lang="scss">
.mrp-list-page {
  :deep(.form-main) {
    width: 100%;
    height: 100%;
  }
}

/* 编辑标记（左上角小三角） */
.edited-marker {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-top: 8px solid #ff4040; /* 红色标记 */
  border-right: 8px solid transparent;
  z-index: 1;
}

/* 编辑过的单元格背景 */
::v-deep .el-table .edited-cell-bg {
  background-color: #f0f7ff !important; /* 浅蓝色背景 */
}

/* 正在编辑的行样式 */
::v-deep .el-table .editing-row {
  background-color: #e6f7ff !important; /* 更浅的蓝色背景 */
}

.header-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  cursor: pointer;
}

/* 角标样式 */
/* 角标样式 - 改为三角形 */
.corner-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-top: 10px solid var(--el-color-primary); /* 上边框形成三角形的底边 */
  border-left: 10px solid transparent; /* 左边框形成三角形的斜边 */
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  transform-origin: top right;
}

.corner-badge:hover {
  border-bottom-color: var(--el-color-primary);
  transform: scale(1.1);
}

/* 移除原来的图标样式，因为三角形不需要图标 */
.corner-badge .el-icon {
  display: none;
}

/* 单元格样式 */
.editable-cell {
  position: relative;
  padding: 5px 20px 5px 0; /* 右侧留出角标空间 */
  height: 100%;
  contain: content; /* 限制重绘范围 */
}

.cell-text {
  display: inline-block;
  width: 100%;
  height: 100%;
  padding: 5px;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

.cell-text:hover {
  background-color: #f0f5ff;
  border-radius: 4px;
}

.el-table__body tr:hover > td {
  background-color: #f5f7fa !important;
}

.el-input-number {
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.title-info-container {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f4 100%);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
  flex-wrap: wrap;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.info-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  font-size: 14px;
  color: #606266;
  padding: 4px 8px;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

/* 性能优化：减少重绘 */
.el-table {
  will-change: transform; /* GPU加速 */
}

.el-input {
  will-change: transform; /* GPU加速 */
}

/* 自定义popover样式 */
::v-deep .custom-popover {
  z-index: 3000 !important;

  .el-popover__title {
    font-weight: 600;
    color: #303133;
  }

  .el-popover__content {
    line-height: 1.6;
    white-space: pre-line;
  }
}
</style>
