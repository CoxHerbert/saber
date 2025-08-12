<template>
  <!-- 查看SN -->
  <el-drawer v-model="open" size="1000px" @close="doAction('closeDrawer')">
    <template #header>
      <div class="drawer-title">
        {{ title }}
        <div class="drawer-download">
          <el-button
            @click="doAction('smallLabelPrint')"
            plain
            type="primary"
            :disabled="!multipleSelection.length"
            >小标签打印
          </el-button>
          <el-button
            @click="doAction('largeLabelPrint')"
            plain
            type="primary"
            :disabled="!multipleSelection.length"
            >大标签打印
          </el-button>
          <el-button
            @click="
              doAction('processCardPrintAll', {
                billNumber: rowInfo.billNumber,
              })
            "
            plain
            type="primary"
            >制程卡打印
          </el-button>
        </div>
      </div>
    </template>
    <el-table
      class="mb-5"
      :data="snInfo || []"
      :tree-props="{ children: 'snRecords' }"
      row-key="id"
      width="100%"
      height="97%"
      default-expand-all
      border
      @selection-change="handleSelectionChange"
    >
      <template v-for="(col, i) in columns">
        <!-- 多选 -->
        <el-table-column
          v-if="col.type === 'selection'"
          :key="i"
          type="selection"
          :width="col.width"
        />
        <!-- 序号类型 -->
        <el-table-column
          v-else-if="col.type === 'index'"
          :key="'index' + i"
          label="序号"
          :width="col.width"
        >
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <!-- 普通文字类型 -->
        <el-table-column
          v-else-if="col.type === 'rowText'"
          :key="'rowText' + i"
          :label="col.label"
          :width="col.width"
          :prop="col.prop"
          :align="col.align ? col.align : 'center'"
          show-overflow-tooltip
        >
          <template #default="scoped">
            {{ scoped.row[col.prop] || '-' }}
          </template>
        </el-table-column>
        <!-- 自定义文字类型 -->
        <el-table-column
          v-else-if="col.type === 'rowCustomText'"
          :key="'rowCustomText' + i"
          :label="col.label"
          :width="col.width"
          :prop="col.prop"
          :align="col.align ? col.align : 'center'"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <span v-html="col.render(scoped)"></span>
          </template>
        </el-table-column>
        <!-- 人员类型 -->
        <el-table-column
          v-else-if="col.type === 'dc-view'"
          :key="'dc-view' + i"
          :label="col.label"
          :width="col.width"
          :align="col.align ? col.align : 'center'"
          :prop="col.prop"
        >
          <template #default="scoped">
            <dc-view
              v-model="scoped.row[col.prop]"
              :objectName="col.objectName"
              :showKey="col.showKey"
            />
          </template>
        </el-table-column>
        <!-- 字典类型 -->
        <el-table-column
          v-else-if="col.type === 'dc-dict'"
          :key="'dc-dict' + i"
          :label="col.label"
          :width="col.width"
          :prop="col.prop"
          :align="col.align ? col.align : 'center'"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-dict :value="scoped.row[col.prop]" :options="dictCache[col.dictKey].value" />
          </template>
        </el-table-column>
        <!-- 字典类型 -->
        <el-table-column
          v-else-if="col.type === 'dc-dict-key'"
          :key="'dc-dict-key' + i"
          :label="col.label"
          :width="col.width"
          :prop="col.prop"
          :align="col.align ? col.align : 'center'"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-dict-key :value="scoped.row[col.prop]" :options="dictCache[col.dictKey].value" />
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="col.type === 'actions'"
          :key="'option' + i"
          :fixed="col.fixed"
          :label="col.label"
          :width="col.width ? col.width : 180"
          :align="col.align ? col.align : 'center'"
        >
          <template #default="scoped">
            <el-button
              v-for="(btn, j) in col.children"
              :key="j"
              link
              type="primary"
              v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped.row))"
              @click="doAction(btn.action, scoped.row)"
              >{{ btn.label }}</el-button
            >
          </template>
        </el-table-column>
      </template>
    </el-table>
  </el-drawer>
  <el-dialog
    body-class="sn-print-dialog-body"
    v-model="visible"
    :title="currentRow?.dialogTitle"
    :style="{ width: '300px', height: '150px' }"
    @close="doAction('closeCodeSelect')"
  >
    <el-select v-model="selected" placeholder="请选择">
      <el-option :label="code" :value="code" v-for="code in codeList" :key="code" />
    </el-select>
    <template #footer>
      <el-button @click="doAction('closeCodeSelect')">取消</el-button>
      <el-button type="primary" @click="doAction('confirmCodeSelect')" :disabled="!selected"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import Api from '@/api/index';
import options from './snPrintDrawerUtils';
const pageData = reactive({
  columns: options.columns,
  title: '',
  open: false,
  snInfo: [],
  rowInfo: {},
  multipleSelection: [],
  visible: false,
  selected: null,
  codeList: [],
  dialogTitleEnum: {
    rowSmallLabelPrint: '小标签',
    rowSargeLabelPrint: '大标签',
    rowProcessCardPrint: '制程卡',
  },
  currentRow: {},
});

const {
  columns,
  title,
  open,
  snInfo,
  rowInfo,
  multipleSelection,
  visible,
  selected,
  codeList,
  dialogTitleEnum,
  currentRow,
} = toRefs(pageData);

// 获取物料列表
const getInfo = async () => {
  try {
    const res = await Api.qms.sn.getSnRecordMoList(rowInfo.value);
    const { code, data } = res.data;
    if (code === 200) {
      snInfo.value = [
        {
          ...data,
          master: true,
        },
      ];
    }
  } catch (error) {
    console.error(error);
  } finally {
  }
};

// 关闭抽屉方式
const close = () => {
  title.value = '';
  open.value = false;
  snInfo.value = [];
};

const openDrawer = row => {
  title.value = `[${row.billNumber}]-SN查看`;
  open.value = true;
  rowInfo.value = { ...row };
  snInfo.value = [];
  getInfo();
};

/**处理制程卡打印**/
const handleProcessCardPrint = row => {
  visible.value = true;
  codeList.value = row.codeList;
  selected.value = null;
  currentRow.value = row;
};

/** 关闭 Code 选择弹窗 **/
const closeCodeSelect = () => {
  visible.value = false;
  codeList.value = [];
  selected.value = null;
  currentRow.value = {};
};

/** 通用方法：构造 URL 并打开新窗口 **/
const openPrintWindow = (baseUrl, moNumber, snCode = '') => {
  let url = `${baseUrl}?moNumber=${moNumber}`;
  if (snCode) {
    url += `&snCode=${snCode}`;
  }
  window.open(url, '_blank');
};

/** 处理确认 Code 选择 **/
const handleConfirmCodeSelect = () => {
  const snCode = selected.value;
  const action = currentRow.value?.action;
  const moNumber = currentRow.value?.purpose;

  const urlMap = {
    rowSmallLabelPrint: '/api/blade-bip/skip-url/mps/assembly-progress/small-label',
    rowSargeLabelPrint: '/api/blade-bip/skip-url/mps/assembly-progress/big-label',
    rowProcessCardPrint: '/api/blade-bip/skip-url/mps/assembly-progress/get-pdf',
  };

  const baseUrl = urlMap[action];

  if (baseUrl) {
    openPrintWindow(baseUrl, moNumber, snCode);
  }

  closeCodeSelect();
};

/** 操作 **/
const doAction = (action, row) => {
  const moNumberList = multipleSelection.value.map(item => item.purpose).join();

  switch (action) {
    case 'closeDrawer':
      // 关闭抽屉
      close();
      break;

    case 'rowProcessCardPrint':
    case 'rowSmallLabelPrint':
    case 'rowSargeLabelPrint':
      // 弹出选择序列号弹窗
      handleProcessCardPrint({ ...row, action, dialogTitle: dialogTitleEnum.value[action] });
      break;

    case 'processCardPrintAll':
      // 全部工艺卡打印（不需选 SN）
      openPrintWindow('/api/blade-bip/skip-url/mps/assembly-progress/get-pdf', row.billNumber);
      break;

    case 'smallLabelPrint':
      // 小标签批量打印
      openPrintWindow('/api/blade-bip/skip-url/mps/assembly-progress/small-label', moNumberList);
      break;

    case 'largeLabelPrint':
      // 大标签打印（可能带 SN）
      openPrintWindow(
        '/api/blade-bip/skip-url/mps/assembly-progress/big-label',
        moNumberList,
        row?.snCode
      );
      break;

    case 'closeCodeSelect':
      // 手动关闭序列号弹窗
      closeCodeSelect();
      break;

    case 'confirmCodeSelect':
      // 确认序列号选择后打印
      handleConfirmCodeSelect();
      break;
  }
};

const handleSelectionChange = val => {
  multipleSelection.value = val;
};

defineExpose({
  openDrawer,
});
</script>
<style lang="scss">
.sn-print-dialog-body {
  height: auto !important;
}
</style>
<style lang="scss" scoped>
.drawer-title {
  display: flex;
  justify-content: space-between;

  .drawer-download {
    flex: end;
  }
}
</style>
