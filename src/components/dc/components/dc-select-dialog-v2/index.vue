<template>
  <div class="default" v-if="$slots.default" @click.stop="openDialog">
    <slot name="default"></slot>
  </div>
  <el-input-tag
    class="ipt-tag-select"
    :class="$attrs.class"
    v-model="iptTagData"
    clearable
    :placeholder="placeholder"
    @click.stop="openDialog"
    @change="changeValue"
    :style="{ width: width }"
    :disabled="disabled"
    v-else-if="type === 'input'"
  >
    <template #tag="item">
      <div class="flex items-center">
        <span>{{ item.value[props.showKey || currentObject?.defaultLabel] }}</span>
      </div>
    </template>
    <template #suffix>
      <el-icon><Search /></el-icon>
    </template>
  </el-input-tag>
  <span v-else></span>
  <el-dialog
    v-if="open"
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
      <div class="head-title">{{ title || currentObject?.title || '-' }}</div>
      <div class="head-close" @click="closeDialog">
        <el-icon><Close /></el-icon>
      </div>
    </template>
    <div class="dialog-body w-full h-full" v-loading="loading">
      <div class="data-content">
        <div class="search-wrap">
          <slot name="search-items" :queryParams="queryParams" :currentObject="currentObject">
            <el-input
              v-model="queryParams[currentObject?.defaultLabel]"
              :placeholder="currentObject?.placeholder"
              prefix-icon="Search"
              @keyup.enter="handleQuery"
              clearable
            />
          </slot>
          <el-button type="primary" @click.stop="handleQuery">查询</el-button>
          <el-button @click.stop="resetQuery">重置</el-button>
        </div>
        <div class="tag-container">
          <div class="tag-list">
            <div class="no-data" v-if="showSelectedRows.length === 0">暂无选中数据</div>
            <el-tag
              v-for="tag in showSelectedRows"
              :key="tag[rowKey]"
              closable
              size="large"
              effect="plain"
              @close="removeSelected(tag)"
            >
              {{ tag[currentObject?.defaultLabel] }}
            </el-tag>
          </div>
          <div class="statistics-box">
            <span>
              已选 {{ Array.isArray(showSelectedRows) ? showSelectedRows.length : 0 }}
              {{ multipleLimit !== 0 ? `最多可选 ${multipleLimit || 0}` : '' }}
              <el-button type="primary" text @click="clearableSelected"> 清空 </el-button>
            </span>
            <el-button type="primary" @click="handleCreate" v-if="currentObject?.dialogCreate"
              >新增</el-button
            >
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
            :row-key="rowKey"
            height="100%"
            ref="tableRef"
          >
            <el-table-column type="selection" width="40" :reserve-selection="true" />
            <el-table-column label="序号" width="80" type="index" align="center">
              <template #default="scoped">
                <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-for="(column, index) in currentObject?.column || []"
              :prop="column?.prop"
              :label="column?.label"
              :align="column?.align || 'center'"
              :show-overflow-tooltip="!!column?.tooltip"
              :width="column.width"
              :min-width="column.minWidth"
              :key="index"
            >
              <template #default="scoped">
                <dc-view
                  v-model="scoped.row[column?.prop]"
                  :objectName="column?.objectName"
                  v-if="column?.component === 'dc-view'"
                />
                <template v-else-if="column?.component === 'dc-dict'">
                  <template
                    v-if="column.multiple && scoped.row[column?.prop].indexOf(',') > -1"
                    v-for="(dcValue, k) in scoped.row[column?.prop].split(',')"
                  >
                    <dc-dict :value="dcValue" :options="dicts[column?.dictData]" />
                  </template>
                  <dc-dict
                    v-else
                    :value="scoped.row[column?.prop]"
                    :options="dicts[column?.dictData]"
                  />
                </template>
                <template v-else-if="column?.component === 'dc-dict-key'">
                  <template
                    v-if="column.multiple && scoped.row[column?.prop].indexOf(',') > -1"
                    v-for="(dcValue, k) in scoped.row[column?.prop].split(',')"
                  >
                    <dc-dict-key :value="dcValue" :options="dicts[column?.dictData]" />
                  </template>
                  <dc-dict-key
                    v-else
                    :value="scoped.row[column?.prop]"
                    :options="dicts[column?.dictData]"
                  />
                </template>
                <span v-else>{{ scoped.row[column?.prop] }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="160"
              align="center"
              fixed="right"
              v-if="!!currentObject?.dialogEdit || !!currentObject?.dialogRemove"
            >
              <template #default="scoped">
                <el-button
                  type="primary"
                  text
                  @click="handleEdit(scoped.row)"
                  v-if="!!currentObject?.dialogEdit"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  text
                  @click="handleRemove(scoped.row)"
                  v-if="!!currentObject?.dialogRemove"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <dc-pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.current"
          v-model:limit="queryParams.size"
          @pagination="getData"
        />
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </template>
  </el-dialog>
  <el-dialog :title="submitTitle" append-to-body v-model="openSubmit" width="800px">
    <avue-form
      v-if="currentObject && currentObject.column?.find(column => column.formSlot)"
      :option="currentObject"
      v-model="formData"
      @submit="submitForm"
    >
      <!-- 动态插槽传递到外面去,用于扩展 -->
      <template v-for="col in currentObject.column" #[col.prop]="scoped">
        <slot
          v-if="col.formSlot"
          :name="`form-${col?.prop}`"
          v-bind="{ ...scoped, formData }"
          :modalValue="formData[col.formProp || col.prop]"
        ></slot>
        <el-input v-else v-model="formData[col.prop]" :placeholder="`请输入${col.label}`" />
      </template>
    </avue-form>
    <avue-form v-else :option="currentObject" v-model="formData" @submit="submitForm"></avue-form>
  </el-dialog>
</template>

<script setup>
import { nextTick, reactive, toRefs } from 'vue';
import ComponentApi from './../../api/index';
import store from '@/store/';
import cacheData from './../../constant/cacheData';
const { proxy } = getCurrentInstance();
const emit = defineEmits(['update:modelValue', 'change', 'iptTagDataUpdate', 'innerTagChange']);
const props = defineProps({
  // 标题
  title: {
    type: String,
    default: '',
  },
  // 绑定的值
  modelValue: {
    type: [String, Array, Object], // 使用数组指定多个类型
    default: null,
  },
  // 类的名称
  objectName: {
    type: String,
    default: '',
    validator: value => Object.keys(cacheData).includes(value),
  },
  // 查询参数
  params: {
    type: Object,
    default: null,
  },
  // 展示的类型 default 和 text
  type: {
    type: String,
    default: '',
    validator: value => ['input', ''].includes(value),
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
  // 占位符，默认为“请点击选择”
  placeholder: {
    type: String,
    default: '请点击选择',
  },
  rowKey: {
    type: String,
    default() {
      return 'id';
    },
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
  // 需要展示的字段名称 比如 name deptName
  showKey: {
    type: String,
    default: '',
  },
  // 首次加载是否触发change事件
  initChangeable: {
    type: Boolean,
    default() {
      return false;
    },
  },
});
const componentData = reactive({
  open: false,
  loading: false,
  // 总条数
  total: 0,
  // 查询参数
  queryParams: {
    current: 1,
    size: 20,
  },
  // 展示数据
  infoRows: [],
  // 已选中的项，完整数据
  selectedRows: [],
  // 用户数据
  tableData: [],
  // 输入框数据
  iptTagData: [],
  // 用户列表Dom
  tableRef: null,
  // 定时器
  timer: null,
  // 延迟时长
  doubleClickDelay: 300,
  // 设置标志位
  isTriggeredByClick: false,
  // 当前对象
  currentObject: null,
  // 创建弹窗
  openSubmit: false,
  // 提交弹窗标题
  submitTitle: '',
  // 表单
  formData: {},
  // 是否为初始化
  init: true,
  // 字典集合
  dicts: {},
});
const {
  open,
  loading,
  total,
  queryParams,
  infoRows,
  selectedRows,
  tableData,
  iptTagData,
  tableRef,
  timer,
  doubleClickDelay,
  isTriggeredByClick,
  currentObject,
  openSubmit,
  submitTitle,
  formData,
  init,
  dicts,
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
watch(
  () => props.modelValue,
  async newVal => {
    currentObject.value = cacheData[props.objectName];
    let ids = [];
    if (Array.isArray(newVal)) {
      ids = newVal.map(item => item?.[props.rowKey] || item);
    } else if (newVal && typeof newVal === 'object') {
      ids = [newVal?.[props.rowKey]].filter(Boolean); // 确保 id 不为空
    } else if (typeof newVal === 'string') {
      ids = newVal.split(',').filter(Boolean);
    }

    if (!ids.length) {
      componentData.iptTagData = [];
      return;
    }

    if (currentObject.value.url) {
      try {
        await ComponentApi.cache.getView({
          url: currentObject.value.url,
          data: ids,
        });
        const currentGlobalData = store.getters.globalData[currentObject.value.url];
        componentData.iptTagData = ids.map(id => {
          const currentItem = currentGlobalData[id];
          return currentItem ? { ...currentItem, isInfo: true } : id;
        });
        emit('innerTagChange', componentData.iptTagData);
        if (init.value && props.initChangeable) {
          setTimeout(() => {
            changeValue();
            init.value = false;
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        componentData.iptTagData = [];
      }
    }
  },
  { deep: true, immediate: true }
);
// 更新table
watch(
  () => tableData.value,
  newVal => {
    nextTick(() => {
      newVal.forEach(row => {
        const newSelectedRow = showSelectedRows.value.find(
          item => item[props.rowKey] === row[props.rowKey]
        );
        if (newSelectedRow) {
          const findIndex = infoRows.value.findIndex(
            infoRow => infoRow[props.rowKey] === newSelectedRow[props.rowKey]
          );
          if (findIndex > -1) {
            tableRef.value.toggleRowSelection(row, true);
          }
        }
      });
    });
  },
  { deep: true, immediate: true }
);
const dictKeys = currentObject.value?.column
  .filter(item => item.dictData)
  .map(item => ({
    key: item.dictData,
  }));
dicts.value = proxy.useCache(dictKeys);
// 获取用户
const getData = async () => {
  let newqueryParams = {};
  if (props.params?.hasOwnProperty('currentPage')) {
    newqueryParams.currentPage = queryParams.value.current;
    newqueryParams.pageSize = queryParams.value.size;
  }
  const res = await currentObject.value?.dialogGet({
    ...queryParams.value,
    ...props.params,
    ...newqueryParams,
  });
  const { code, data: resData } = res.data;
  if (code === 200) {
    tableData.value = resData?.records || resData;
    total.value = resData?.total || 0;
  } else {
    let wldata = res.data.records.map(item => {
      return {
        ...item,
        id: item.fnumber,
      };
    });
    tableData.value = wldata;

    total.value = res.data.total || 0;
  }
};

// 处理创建
const handleCreate = () => {
  submitTitle.value = `创建${currentObject.value?.submitTitle}`;
  openSubmit.value = true;
};
// 处理编辑
const handleEdit = row => {
  submitTitle.value = `编辑${currentObject.value?.submitTitle}`;
  if (Array.isArray(currentObject.value?.column)) {
    currentObject.value.column.forEach(({ prop }) => (formData.value[prop] = row[prop]));
  }
  formData.value[props.rowKey] = row[props.rowKey];
  openSubmit.value = true;
};
// 处理删除
const handleRemove = row => {
  const ids = row[props.rowKey];
  proxy
    .$confirm(`确认是否删除"${row[currentObject.value?.defaultLabel]}"为的数据项？`)
    .then(async () => {
      return await currentObject.value?.dialogRemove({ ids });
    })
    .then(() => {
      proxy.$message.success('删除成功');
      getData();
    })
    .catch(() => {});
};
// 表单提交
const submitForm = async (form, done) => {
  const res = await currentObject.value?.dialogCreate(form);
  const { code } = res.data;
  if (code === 200) {
    proxy.$message.success('提交成功');
    getData();
  }
  openSubmit.value = false;
  done();
};
// 处理查询
const handleQuery = () => {
  queryParams.value.current = 1;
  getData();
};
// 重置查询
const resetQuery = () => {
  // queryParams.value[currentObject.value?.defaultLabel] = '';
  // queryParams.value.current = 1;
  queryParams.value = {
    current: 1,
    size: queryParams.value.size,
  };
  getData();
};
// 数据选择项
const removeSelected = option => {
  if (option?.isInfo) {
    const findIndex = infoRows.value.findIndex(item => item[props.rowKey] === option[props.rowKey]);
    const findRow = tableData.value.find(row => row[props.rowKey] === option[props.rowKey]);
    infoRows.value.splice(findIndex, 1);
    if (findRow) tableRef.value.toggleRowSelection(findRow, false);
  } else {
    const findIndex = selectedRows.value.findIndex(
      item => item[props.rowKey] === option[props.rowKey]
    );
    selectedRows.value.splice(findIndex, 1);
    tableRef.value.toggleRowSelection(option, false);
  }
};
// 清空已选中的数据
const clearableSelected = () => {
  selectedRows.value.forEach(selectedRow => {
    tableRef.value.toggleRowSelection(selectedRow);
  });
  selectedRows.value = [];
  infoRows.value = [];
};
// 处理单选
const handleSelect = (selection, row) => {
  if (props.multiple) {
    const isValidate = validateSelectionLimit({ selection });
    if (isValidate) {
      // 数量正常
      const infoRowIndex = infoRows.value.findIndex(
        item => item[props.rowKey] === row[props.rowKey]
      );
      const selectedRowIndex = selectedRows.value.findIndex(
        item => item[props.rowKey] === row[props.rowKey]
      );
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
      const infoRowIndex = infoRows.value.findIndex(
        item => item[props.rowKey] === selectedRow[props.rowKey]
      );
      const selectedRowIndex = selectedRows.value.findIndex(
        item => item[props.rowKey] === selectedRow[props.rowKey]
      );
      if (infoRowIndex > -1) {
        const userRow = tableData.value.find(
          item => item[props.rowKey] === selectedRow[props.rowKey]
        );
        infoRows.value.splice(infoRowIndex, 1);
        if (userRow) {
          tableRef.value.toggleRowSelection(userRow, false);
          tableRef.value.toggleRowSelection(row, true);
          selectedRows.value.push(row);
        }
      } else if (selectedRowIndex > -1) {
        if (row[props.rowKey] === selectedRow[props.rowKey]) {
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
  const isValidate = validateSelectionLimit({ selection });
  if (!isValidate) {
    selection.forEach(row => {
      const findItem = showSelectedRows.value.find(
        item => item[props.rowKey] === row[props.rowKey]
      );
      if (findItem) {
        tableRef.value.toggleRowSelection(row, true);
      } else {
        tableRef.value.toggleRowSelection(row, false);
      }
    });
  }
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
        const infoRowIndex = infoRows.value.findIndex(
          item => item[props.rowKey] === row[props.rowKey]
        );
        const selectedRowIndex = selectedRows.value.findIndex(
          item => item[props.rowKey] === row[props.rowKey]
        );
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
        const infoRowIndex = infoRows.value.findIndex(
          item => item[props.rowKey] === selectedRow[props.rowKey]
        );
        const selectedRowIndex = selectedRows.value.findIndex(
          item => item[props.rowKey] === selectedRow[props.rowKey]
        );
        if (infoRowIndex > -1) {
          const userRow = tableData.value.find(
            item => item[props.rowKey] === selectedRow[props.rowKey]
          );
          infoRows.value.splice(infoRowIndex, 1);
          if (userRow) {
            tableRef.value.toggleRowSelection(userRow, false);
            tableRef.value.toggleRowSelection(row, true);
            selectedRows.value.push(row);
          }
        } else if (selectedRowIndex > -1) {
          if (row[props.rowKey] === selectedRow[props.rowKey]) {
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
      const infoRowIndex = infoRows.value.findIndex(
        item => item[props.rowKey] === row[props.rowKey]
      );
      const selectedRowIndex = selectedRows.value.findIndex(
        item => item[props.rowKey] === row[props.rowKey]
      );
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
      const infoRowIndex = infoRows.value.findIndex(
        item => item[props.rowKey] === selectedRow[props.rowKey]
      );
      const selectedRowIndex = selectedRows.value.findIndex(
        item => item[props.rowKey] === selectedRow[props.rowKey]
      );
      if (infoRowIndex > -1) {
        const userRow = tableData.value.find(
          item => item[props.rowKey] === selectedRow[props.rowKey]
        );
        infoRows.value.splice(infoRowIndex, 1);
        if (userRow) {
          tableRef.value.toggleRowSelection(userRow, false);
          tableRef.value.toggleRowSelection(row, true);
          selectedRows.value.push(row);
        }
      } else if (selectedRowIndex > -1) {
        if (row[props.rowKey] === selectedRow[props.rowKey]) {
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
// 确认选择
const confirm = () => {
  iptTagData.value = showSelectedRows.value || [];
  if (props.multiple) {
    emit('update:modelValue', showSelectedRows.value);
    emit('change', showSelectedRows.value);
  } else {
    const user = showSelectedRows.value.length > 0 ? showSelectedRows.value[0] : null;
    emit('update:modelValue', user);
    emit('change', user);
  }
  setTimeout(() => {
    emit('iptTagDataUpdate', JSON.parse(JSON.stringify(iptTagData.value)));
    document.activeElement.blur();
  }, 10);
  closeDialog();
};
// 打开弹窗
const openDialog = async () => {
  open.value = true;
  loading.value = true;
  infoRows.value = iptTagData.value;
  await getData();
  loading.value = false;
};
// 关闭弹窗
const closeDialog = () => {
  total.value = 0;
  queryParams.value = {
    current: 1,
    size: 20,
  };
  selectedRows.value = [];
  tableData.value = [];
  timer.value = null;
  open.value = false;
};
// 选中的行名
const rowClassName = ({ row }) => {
  if (!!showSelectedRows) {
    const total = showSelectedRows.value?.length || 0;
    const isFind = Array.isArray(showSelectedRows.value)
      ? showSelectedRows.value.find(item => item[props.rowKey] === row[props.rowKey])
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
    if (props.multiple) {
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
      ? iptTagData.value.map(item => item[props.rowKey]).join(',')
      : '';
    emit('update:modelValue', ids);
    emit('change', ids);
  }
  setTimeout(() => {
    emit(
      'iptTagDataUpdate',
      iptTagData.value?.length === 0 ? null : JSON.parse(JSON.stringify(iptTagData.value))
    );
    document.activeElement.blur();
  }, 10);
};
// 校验数量（同步方式）
const validateSelectionLimit = ({ selection, row }) => {
  const mergedArray = selection
    ? [...showSelectedRows.value, ...selection]
    : [...showSelectedRows.value];

  const uniqueRows = Array.from(
    new Map(mergedArray.map(item => [item[props.rowKey], item])).values()
  );
  const total = uniqueRows.length;

  if (props.multipleLimit > 0 && total > props.multipleLimit) {
    proxy.$message({
      type: 'error',
      message: `最多可选 ${props.multipleLimit} 行`,
    });
    return false;
  }
  return true;
};
// 校验数量（异步方式）
const validateSelectionLimit2 = row => {
  return new Promise(resolve => {
    const isAlreadySelected = showSelectedRows.value.some(
      item => item[props.rowKey] === row[props.rowKey]
    );
    const mergedArray = isAlreadySelected
      ? [...showSelectedRows.value]
      : [...showSelectedRows.value, row];

    const uniqueRows = Array.from(
      new Map(mergedArray.map(item => [item[props.rowKey], item])).values()
    );
    const total = uniqueRows.length;

    if (props.multipleLimit > 0 && total > props.multipleLimit) {
      proxy.$message({
        type: 'error',
        message: `最多可选 ${props.multipleLimit} 行`,
      });
      return resolve(false);
    }
    return resolve(true);
  });
};
defineExpose({ openDialog, handleQuery });
</script>
<style lang="scss">
@use '../../styles/select-dialog.scss';
</style>
<style lang="scss" scoped>
.dialog-body {
  height: 70vh !important;
  max-height: 910px;
}
</style>
