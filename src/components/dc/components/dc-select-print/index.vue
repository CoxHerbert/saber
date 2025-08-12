<template>
  <div class="default" v-if="$slots.default" @click="openDialog">
    <slot name="default"></slot>
  </div>
  <div v-else-if="disabled && type === 'text'">{{ viewText }}</div>
  <el-input-tag
    class="ipt-tag-select"
    v-model="iptTagData"
    clearable
    :placeholder="placeholder"
    @click="openDialog"
    @remove-tag="removeTag"
    :style="{ width: width }"
    :disabled="disabled"
    v-else-if="type === 'input'"
  >
    <template #tag="item">
      <div class="flex items-center">
        <span>{{ item.value.id }}</span>
      </div>
    </template>
  </el-input-tag>
  <el-dialog
    class="select-dialog"
    v-model="open"
    :show-close="false"
    @close="closeDialog"
    width="1200px"
    modal
    draggable
    destroy-on-close
    append-to-body
  >
    <template #header>
      <div class="head-title">
        {{ title || '' }}
      </div>
      <div class="head-close" @click="closeDialog">
        <el-icon><Close /></el-icon>
      </div>
    </template>
    <div class="dialog-body w-full h-full" v-loading="loading">
      <div class="tabs-container">
        <el-input
          v-model="printerSearch"
          placeholder="请输入打印机"
          prefix-icon="Search"
          clearable
        />
        <div class="tree-container">
          <el-tree
            ref="treeRef"
            :data="DC_PDA_PRINTER_SERVER"
            @node-click="printerNodeClick"
            node-key="dictKey"
            :filter-node-method="printerFilterNode"
          >
            <template #default="{ data }">
              <div
                class="default-node"
                :class="{
                  'is-active': data.dictKey === queryParams.server,
                }"
              >
                {{ data.label }}
              </div>
            </template>
          </el-tree>
        </div>
      </div>
      <div class="data-content">
        <div class="tag-container">
          <div class="tag-list">
            <div class="no-data" v-if="showSelectedRows.length === 0">暂无选中数据</div>
            <el-tag
              v-for="tag in showSelectedRows"
              :key="tag.id"
              closable
              size="large"
              effect="plain"
              @close="removeSelected(tag)"
            >
              {{ tag?.id }}
            </el-tag>
          </div>
          <div class="statistics-box">
            <span>
              已选 {{ Array.isArray(showSelectedRows) ? showSelectedRows.length : 0 }}
              {{ multipleLimit !== 0 ? `最多可选 ${multipleLimit || 0}` : '' }}
            </span>

            <el-button type="primary" text @click="clearableSelected"> 清空 </el-button>
          </div>
        </div>
        <div class="table-container">
          <el-table
            :data="tableData"
            @select="handleSelect"
            @select-all="handleSelectAll"
            @row-click="handleRowClick"
            @row-dblclick="handleRowDbClick"
            :row-class-name="rowClassName"
            row-key="id"
            height="100%"
            ref="tableRef"
          >
            <el-table-column type="selection" width="40" :reserve-selection="true" />
            <el-table-column prop="id" label="打印机设备名称" align="center">
              <template #default="scoped">
                {{ scoped.row?.id || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { nextTick, reactive, toRefs } from 'vue';
import Api from '@/api/index';
import ComponentApi from './../../api/index';
import store from '@/store/';
import { deepClone } from '@/utils/util';
// 校验数量
const validateSelectionLimit = ({ selection }) => {
  let mergedArray = [...showSelectedRows.value];
  if (selection) mergedArray = [...showSelectedRows.value, ...selection];
  const uniqueRows = Array.from(new Map(mergedArray.map(item => [item.id, item])).values());
  const total = uniqueRows?.length || 0;
  if (total > props.multipleLimit && props.multipleLimit !== 0) {
    proxy.$message({
      type: 'error',
      message: `最多可选${props.multipleLimit}行`,
    });
    return false;
  }
  return true;
};
const { proxy } = getCurrentInstance();
const { DC_PDA_PRINTER_SERVER } = proxy.useCache([{ key: 'DC_PDA_PRINTER_SERVER' }]);
const emit = defineEmits(['update:modelValue', 'change']);
const props = defineProps({
  // 标题
  title: {
    type: String,
    default: '打印机选择',
  },
  // 绑定的值
  modelValue: {
    type: [String, Array, Object], // 使用数组指定多个类型
    default: null,
  },
  // 展示的类型 text 和 input
  type: {
    type: String,
    default: 'input',
    validator: value => ['text', 'input'].includes(value),
  },
  /**
   * 双向绑定数据返回的数据格式 object string
   * object 单选时返回 {}
   * object 多选时返回 [{}]
   * string 单选和多选时''
   * **/
  returnType: {
    type: String,
    default: 'string',
    validator: value => ['string', 'object'].includes(value),
  },
  // input tag 宽度
  width: {
    type: String,
    default: '100%',
  },
  // 占位符，默认为“请输入查询选择”
  placeholder: {
    type: String,
    default: '请输入查询选择',
  },
  // 是否多选 true开启多选 false关闭多选
  multiple: {
    type: Boolean,
    default: true,
  },
  // multiple 属性设置为 true 时，代表多选场景下用户最多可以选择的项目数， 为 0 则不限制
  multipleLimit: {
    type: Number,
    default: 1,
  },
  // 是否可以清空选项
  clearable: {
    type: Boolean,
    default: false,
  },
  // 是否可编辑
  disabled: {
    type: Boolean,
    default: false,
  },
});
const componentData = reactive({
  open: false,
  loading: false,
  // 总条数
  total: 0,
  // 查询参数
  queryParams: {
    server: null,
  },
  // 展示数据
  infoRows: [],
  // 已选中的项，完整数据
  selectedRows: [],
  // 打印机树数据
  printerTreeData: [],
  // 列表数据
  tableData: [],
  // 输入框数据
  iptTagData: [],
  // 打印机过滤字段
  printerSearch: '',
  // 打印机树Dom
  treeRef: null,
  // 用户列表Dom
  tableRef: null,
  // 定时器
  timer: null,
  // 延迟时长
  doubleClickDelay: 300,
  // 设置标志位
  isTriggeredByClick: false,
});
const {
  open,
  loading,
  total,
  queryParams,
  infoRows,
  selectedRows,
  printerTreeData,
  tableData,
  iptTagData,
  printerSearch,
  treeRef,
  tableRef,
  timer,
  doubleClickDelay,
  isTriggeredByClick,
} = toRefs(componentData);
const showSelectedRows = computed(() => {
  let result = [];
  if (Array.isArray(infoRows.value)) {
    result = [...infoRows.value];
  }
  if (Array.isArray(selectedRows.value)) {
    result = [...result, ...selectedRows.value];
  }
  return result;
});
const viewText = computed(() => {
  if (Array.isArray(iptTagData.value) && iptTagData.value.length) {
    return iptTagData.value
      .map(item => {
        let value = item.id;
        try {
          value = item?.realName;
        } catch (error) {
          value = item.id;
        }
        return value;
      })
      .join('，');
  } else {
    return '-';
  }
});
watch(
  () => props.modelValue,
  async newVal => {
    let ids;
    if (Array.isArray(newVal)) {
      ids = newVal.map(item => item?.id || item);
    } else if (typeof newVal === 'object' && newVal !== null) {
      try {
        ids = [newVal?.id];
      } catch (error) {
        ids = '';
      }
    } else if (typeof newVal === 'string') {
      ids = !!newVal ? newVal.split(',') : [];
    } else {
      ids = '';
    }
    if (!ids || (Array.isArray(ids) && !ids.length)) {
      componentData.iptTagData = [];
      return;
    }
    componentData.iptTagData = ids.map(id => ({
      id,
      isInfo: true,
    }));
  },
  { deep: true, immediate: true }
);
// 打印机字典过滤
watch(
  () => printerSearch.value,
  val => {
    if (treeRef.value) treeRef.value.filter(val);
  },
  { deep: true, immediate: true }
);
// 更新table
watch(
  () => tableData.value,
  newVal => {
    nextTick(() => {
      newVal.forEach(row => {
        const newSelectedRow = showSelectedRows.value.find(item => item.id === row.id);
        if (newSelectedRow) {
          const infoIndex = infoRows.value.findIndex(infoRow => infoRow.id === newSelectedRow.id);
          if (infoIndex > -1) {
            tableRef.value.toggleRowSelection(row, true);
            selectedRows.value.push(infoRows.value[infoIndex]);
            infoRows.value.splice(infoIndex, 1);
          }
        }
      });
    });
  },
  { deep: true, immediate: true }
);
watch(
  () => selectedRows.value,
  (newVal, oldVal) => {
    const isValidate = validateSelectionLimit({ selection: newVal });
    if (isValidate) {
      // 校验通过
      newVal.forEach(row => {
        tableRef.value.toggleRowSelection(row, true);
      });
    } else {
      // 校验未通过
      newVal.forEach(row => {
        tableRef.value.toggleRowSelection(row, false);
      });
      oldVal.forEach(row => {
        tableRef.value.toggleRowSelection(row, true);
      });
      selectedRows.value = oldVal;
    }
  },
  { deep: true, immediate: true }
);
// 获取数据
const getData = async () => {
  const res = await Api.system.pdaRbac.printerSearch(queryParams.value);
  const { code, data } = res.data;
  if (code === 200) {
    tableData.value = data.map(id => ({ id }));
  }
};
// 过滤部门节点
const printerFilterNode = (value, data) => {
  if (!value) return true;
  return data.deptName.includes(value);
};
// 数据选择项
const removeSelected = option => {
  if (option?.isInfo) {
    const findIndex = infoRows.value.findIndex(item => item.id === option.id);
    const findRow = tableData.value.find(row => row.id === option.id);
    infoRows.value.splice(findIndex, 1);
    if (findRow) tableRef.value.toggleRowSelection(findRow, false);
  } else {
    const findIndex = selectedRows.value.findIndex(item => item.id === option.id);
    selectedRows.value.splice(findIndex, 1);
    tableRef.value.toggleRowSelection(option, false);
  }
};
// 清空已选中的数据
const clearableSelected = () => {
  tableRef.value?.clearSelection();
  selectedRows.value = [];
  infoRows.value = [];
};
// 处理单选
const handleSelect = (selection, row) => {
  if (props.multiple) {
    const isValidate = validateSelectionLimit({ selection });
    if (isValidate) {
      // 数量正常
      const infoRowIndex = infoRows.value.findIndex(item => item.id === row.id);
      const selectedRowIndex = selectedRows.value.findIndex(item => item.id === row.id);
      if (infoRowIndex > -1) {
        // 已选中
        infoRows.value.splice(infoRowIndex, 1);
        tableRef.value.toggleRowSelection(row, false);
      } else if (selectedRowIndex > -1) {
        // 已选中
        selectedRows.value.splice(selectedRowIndex, 1);
        tableRef.value.toggleRowSelection(row, false);
      } else {
        // 未选中
        selectedRows.value.push(row);
        tableRef.value.toggleRowSelection(row, true);
      }
    } else {
      // 数量超出
      tableRef.value.toggleRowSelection(row, false);
    }
  } else {
    // 处理单选逻辑
    const isSelected = !!showSelectedRows.value.length;
    if (isSelected) {
      const selectedRow = showSelectedRows.value[0];
      const infoRowIndex = infoRows.value.findIndex(item => item.id === selectedRow.id);
      const selectedRowIndex = selectedRows.value.findIndex(item => item.id === selectedRow.id);
      if (infoRowIndex > -1) {
        const userRow = tableData.value.find(item => item.id === selectedRow.id);
        infoRows.value.splice(infoRowIndex, 1);
        if (userRow) {
          tableRef.value.toggleRowSelection(userRow, false);
          tableRef.value.toggleRowSelection(row, true);
          selectedRows.value.push(row);
        }
      } else if (selectedRowIndex > -1) {
        if (row.id === selectedRow.id) {
          selectedRows.value.splice(row, 1);
          tableRef.value.toggleRowSelection(selectedRow, false);
        } else {
          selectedRows.value.splice(row, 1);
          tableRef.value.toggleRowSelection(selectedRow, false);
          tableRef.value.toggleRowSelection(row, true);
          selectedRows.value.push(row);
        }
      }
    } else {
      // 未选中
      selectedRows.value.push(row);
      tableRef.value.toggleRowSelection(row, true);
    }
  }
};
// 处理全选
const handleSelectAll = selection => {
  selectedRows.value = selection;
};
// 点击某一行
const handleRowClick = row => {
  isTriggeredByClick.value = true;
  clearTimeout(timer.value);
  timer.value = setTimeout(async () => {
    if (props.multiple) {
      const isValidate = await validateSelectionLimit2(row);
      if (isValidate) {
        // 数量正常
        const infoRowIndex = infoRows.value.findIndex(item => item.id === row.id);
        const selectedRowIndex = selectedRows.value.findIndex(item => item.id === row.id);
        if (infoRowIndex > -1) {
          // 已选中
          infoRows.value.splice(infoRowIndex, 1);
          tableRef.value.toggleRowSelection(row, false);
        } else if (selectedRowIndex > -1) {
          // 已选中
          selectedRows.value.splice(selectedRowIndex, 1);
          tableRef.value.toggleRowSelection(row, false);
        } else {
          // 未选中
          selectedRows.value.push(row);
          tableRef.value.toggleRowSelection(row, true);
        }
      } else {
        // 数量超出
        tableRef.value.toggleRowSelection(row, false);
      }
    } else {
      // 处理单选逻辑
      const isSelected = !!showSelectedRows.value.length;
      if (isSelected) {
        const selectedRow = showSelectedRows.value[0];
        const infoRowIndex = infoRows.value.findIndex(item => item.id === selectedRow.id);
        const selectedRowIndex = selectedRows.value.findIndex(item => item.id === selectedRow.id);
        if (infoRowIndex > -1) {
          const userRow = tableData.value.find(item => item.id === selectedRow.id);
          infoRows.value.splice(infoRowIndex, 1);
          if (userRow) {
            tableRef.value.toggleRowSelection(userRow, false);
            tableRef.value.toggleRowSelection(row, true);
            selectedRows.value.push(row);
          }
        } else if (selectedRowIndex > -1) {
          if (row.id === selectedRow.id) {
            selectedRows.value.splice(row, 1);
            tableRef.value.toggleRowSelection(selectedRow, false);
          } else {
            selectedRows.value.splice(row, 1);
            tableRef.value.toggleRowSelection(selectedRow, false);
            tableRef.value.toggleRowSelection(row, true);
            selectedRows.value.push(row);
          }
        }
      } else {
        // 未选中
        selectedRows.value.push(row);
        tableRef.value.toggleRowSelection(row, true);
      }
    }
  }, doubleClickDelay.value);
};
// 双击某一行
const handleRowDbClick = async row => {
  isTriggeredByClick.value = true;
  clearTimeout(timer.value);
  if (props.multiple) {
    // 处理多选逻辑
    const isValidate = await validateSelectionLimit2(row);

    if (isValidate) {
      // 数量正常
      const infoRowIndex = infoRows.value.findIndex(item => item.id === row.id);
      const selectedRowIndex = selectedRows.value.findIndex(item => item.id === row.id);
      if (infoRowIndex > -1) {
        // 已选中
        infoRows.value.splice(infoRowIndex, 1);
        tableRef.value.toggleRowSelection(row, false);
      } else if (selectedRowIndex > -1) {
        // 已选中
        selectedRows.value.splice(selectedRowIndex, 1);
        tableRef.value.toggleRowSelection(row, false);
      } else {
        // 未选中
        selectedRows.value.push(row);
        tableRef.value.toggleRowSelection(row, true);
      }
    } else {
      // 数量超出
      tableRef.value.toggleRowSelection(row, false);
    }
  } else {
    // 处理单选逻辑
    const isSelected = !!showSelectedRows.value.length;
    if (isSelected) {
      const selectedRow = showSelectedRows.value[0];
      const infoRowIndex = infoRows.value.findIndex(item => item.id === selectedRow.id);
      const selectedRowIndex = selectedRows.value.findIndex(item => item.id === selectedRow.id);
      if (infoRowIndex > -1) {
        const userRow = tableData.value.find(item => item.id === selectedRow.id);
        infoRows.value.splice(infoRowIndex, 1);
        if (userRow) {
          tableRef.value.toggleRowSelection(userRow, false);
          tableRef.value.toggleRowSelection(row, true);
          selectedRows.value.push(row);
        }
      } else if (selectedRowIndex > -1) {
        if (row.id === selectedRow.id) {
          selectedRows.value.splice(row, 1);
          tableRef.value.toggleRowSelection(selectedRow, false);
        } else {
          selectedRows.value.splice(row, 1);
          tableRef.value.toggleRowSelection(selectedRow, false);
          tableRef.value.toggleRowSelection(row, true);
          selectedRows.value.push(row);
        }
      }
      if (showSelectedRows.value.length === 1) {
        confirm();
      }
    } else {
      // 未选中
      selectedRows.value.push(row);
      tableRef.value.toggleRowSelection(row, true);
      confirm();
    }
  }
};
// 点击部门节点
const printerNodeClick = node => {
  queryParams.value.server = node.dictKey;
  getData();
};
// 确认选择
const confirm = () => {
  iptTagData.value = showSelectedRows.value || [];
  if (props.returnType === 'object') {
    if (props.multiple && props.multipleLimit !== 1) {
      emit('update:modelValue', showSelectedRows.value);
      emit('change', showSelectedRows.value);
    } else {
      const user = showSelectedRows.value.length > 0 ? showSelectedRows.value[0] : null;
      emit('update:modelValue', user);
      emit('change', user);
    }
  } else if (props.returnType === 'string') {
    const ids = Array.isArray(showSelectedRows.value)
      ? showSelectedRows.value.map(item => item.id).join(',')
      : '';
    emit('update:modelValue', ids);
    emit('change', ids);
  }
  closeDialog();
};
// 打开弹窗
const openDialog = async () => {
  open.value = true;
  loading.value = true;
  const mountedTimer = setInterval(() => {
    if (Array.isArray(DC_PDA_PRINTER_SERVER.value) && DC_PDA_PRINTER_SERVER.value.length) {
      queryParams.value.server = DC_PDA_PRINTER_SERVER.value[1].dictKey;
      getData();
      clearInterval(mountedTimer);
    }
  }, 100);
  infoRows.value = deepClone(iptTagData.value);
  loading.value = false;
};
// 关闭弹窗
const closeDialog = () => {
  total.value = 0;
  selectedRows.value = [];
  printerTreeData.value = [];
  tableData.value = [];
  // printerSearch.value = '';
  timer.value = null;
  open.value = false;
};
// 选中的行名
const rowClassName = ({ row }) => {
  if (!!showSelectedRows) {
    const total = showSelectedRows.value?.length || 0;
    const isFind = Array.isArray(showSelectedRows.value)
      ? showSelectedRows.value.find(item => item.id === row.id)
      : false;
    if (isFind && props.multipleLimit !== 0) {
      return 'row-selected';
    } else if (!props.multiple && props.multipleLimit !== 0) {
      return 'row-cursor';
    } else if (total > props.multipleLimit - 1 && props.multipleLimit !== 0) {
      return 'row-disabled';
    } else {
      return '';
    }
  }
};
// 处理变化
const changeValue = () => {
  if (props.returnType === 'object') {
    if (props.multiple && props.multipleLimit !== 1) {
      emit('update:modelValue', iptTagData.value);
      emit('change', iptTagData.value);
    } else {
      const user =
        Array.isArray(iptTagData.value) && iptTagData.value.length ? iptTagData.value[0] : null;
      emit('update:modelValue', user);
      emit('change', user);
    }
  } else if (props.returnType === 'string') {
    const ids = Array.isArray(iptTagData.value)
      ? iptTagData.value.map(item => item.id).join(',')
      : '';
    emit('update:modelValue', ids);
  }
};
const removeTag = () => {
  if (props.returnType === 'object') {
    if (props.multiple && props.multipleLimit !== 1) {
      emit('update:modelValue', iptTagData.value);
      emit('change', iptTagData.value);
    } else {
      const user =
        Array.isArray(iptTagData.value) && iptTagData.value.length ? iptTagData.value[0] : null;
      emit('update:modelValue', user);
      emit('change', user);
    }
  } else if (props.returnType === 'string') {
    const ids = Array.isArray(iptTagData.value)
      ? iptTagData.value.map(item => item.id).join(',')
      : '';
    emit('update:modelValue', ids);
  }
};
// 校验数量
const validateSelectionLimit2 = row => {
  return new Promise((reslove, reject) => {
    const findItem = showSelectedRows.value.find(item => item.id === row.id);
    let mergedArray = [...showSelectedRows.value];
    if (!findItem) mergedArray = [...showSelectedRows.value, row];
    const uniqueRows = Array.from(new Map(mergedArray.map(item => [item.id, item])).values());
    const total = uniqueRows?.length || 0;
    if (total > props.multipleLimit && props.multipleLimit !== 0) {
      proxy.$message({
        type: 'error',
        message: `最多可选${props.multipleLimit}行`,
      });
      return reslove(false);
    }
    return reslove(true);
  });
};
defineExpose({
  queryParams,
});
</script>
<style lang="scss">
@use '../../styles/select-dialog.scss';
</style>
