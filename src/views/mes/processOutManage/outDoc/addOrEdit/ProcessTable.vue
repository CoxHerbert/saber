<template>
  <div class="process-table" v-loading="loading">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button
          ref="refBtn"
          size="small"
          color="blue"
          @click="showPicker = true"
          :disabled="disabled"
        >
          参考工艺
        </el-button>

        <el-button ref="addBtn" size="small" @click="addRow" :disabled="disabled"
          >添加工艺</el-button
        >

        <el-button
          ref="delBtn"
          size="small"
          :disabled="deleteDisabled || disabled"
          @click="removeSelected"
          >删除</el-button
        >

        <el-button
          v-if="!localNewLen"
          ref="transferBtn"
          size="small"
          :disabled="disabled"
          @click="openTransfer"
          color="blue"
          >转单</el-button
        >
      </div>
      <div class="toolbar-right" v-if="localNewLen">
        <el-tag size="small">已添加：{{ localNewLen }}条</el-tag>
        <el-button size="small" type="primary" @click="batchSave">批量保存</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        :data="rowsInner"
        border
        size="small"
        height="100%"
        @selection-change="onSelectionChange"
        @row-click="onRowClick"
        :row-key="rowKeyGetter"
        :row-class-name="tableRowClassName"
      >
        <el-table-column v-if="!disabled" type="selection" width="48" :selectable="rowSelectable" />
        <el-table-column type="index" label="序号" width="60" align="center" />

        <!-- 工艺名称 -->
        <el-table-column prop="processName" :label="labels.processName" min-width="140">
          <template #default="{ row }">
            <el-input
              v-if="row.$editing"
              v-model="row.processName"
              size="small"
              placeholder="请输入工艺名称"
            />
            <span v-else>{{ row.processName }}</span>
          </template>
        </el-table-column>

        <!-- 工序工艺类型（字典） -->
        <el-table-column prop="orderType" :label="labels.orderType" width="100">
          <template #default="{ row }">
            <el-select
              v-if="row.$editing"
              v-model="row.orderType"
              size="small"
              style="width: 100%"
              @change="handleTypeChange(row)"
              placeholder="请选择类型"
            >
              <el-option
                v-for="opt in dictOptions(typeDict)"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <dc-dict-key v-else :options="dicts.DC_FORWARD_TYPE" :value="row.orderType" />
          </template>
        </el-table-column>

        <!-- 已发数量 / 已收数量 -->
        <el-table-column prop="issuedQty" :label="labels.issuedQty" width="80" />
        <el-table-column prop="receivedQty" :label="labels.receivedQty" width="80" />

        <!-- 工序工艺状态（字典） -->
        <el-table-column prop="orderStatus" :label="labels.orderStatus" width="80">
          <template #default="{ row }">
            <dc-dict-key :options="dicts.DC_FORWARD_STATUS" :value="row.orderStatus" />
          </template>
        </el-table-column>

        <!-- <el-table-column v-if="!disabled" label="操作" width="80" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.$editing"
              link
              type="primary"
              size="small"
              :disabled="!isEditable(row)"
              @click.stop="saveRow(row)"
              >保存</el-button
            >
            <el-button
              v-else
              link
              type="primary"
              size="small"
              :disabled="!isEditable(row)"
              @click.stop="enterEdit(row)"
              >编辑</el-button
            >
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <ref-dialog
      v-model:visible="transferVisible"
      :detailData="detailData"
      :optional="optional"
      @submit="onRefSubmit"
    />
    <process-dialog
      :visible="showPicker"
      @update:visible="v => (showPicker = v)"
      :sourceOrderNumber="detailData.sourceOrderNumber"
      @confirm="onPicked"
    />
  </div>
</template>

<script>
import Api from '@/api';
import RefDialog from './RefDialog.vue';
import ProcessDialog from './ProcessDialog.vue';

// 为无 id 行分配本地唯一 key，修复选择列选中“全部无 id”问题
let __uid__ = 1;
const genUid = () => `__tmp_${Date.now()}_${__uid__++}`;

export default {
  name: 'ProcessTable',
  components: { RefDialog, ProcessDialog },
  props: {
    rowKey: { type: String, default: 'id' }, // 后端行主键字段名
    labels: {
      type: Object,
      default: () => ({
        processName: '工艺',
        orderType: '类型',
        issuedQty: '已发',
        receivedQty: '已收',
        orderStatus: '状态',
      }),
    },
    typeDict: { type: String, default: 'DC_FORWARD_TYPE' },
    statusDict: { type: String, default: 'DC_FORWARD_STATUS' },
    withTransfer: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    detailData: { type: Object, default: () => {} },
  },
  dicts: ['DC_FORWARD_TYPE', 'DC_FORWARD_STATUS'],
  emits: ['transfer', 'add', 'delete', 'saved'],
  data() {
    return {
      loading: false,
      routeId: null,
      routeType: null,

      rowsInner: [],
      selected: [],
      saving: false,

      transferVisible: false,
      showPicker: false,
    };
  },
  computed: {
    deleteDisabled() {
      return !this.selected.length || this.selected.some(r => !this.isEditable(r));
    },
    localNewLen() {
      return this.rowsInner.filter(row => row.$localNew).length;
    },
    optional() {
      return this.rowsInner.filter(row => row.issuedQty < this.detailData?.plannedQty);
    },
  },
  created() {
    const { id, type } = this.$route.query || {};
    this.routeId = id || null;
    this.routeType = type || null;
    this.getData();
  },
  methods: {
    updatePage(data) {
      console.log('updatePage', data);
      const { id, type } = data || {};
      this.routeId = id || null;
      this.routeType = type || null;
      this.getData();
    },
    /* -------- 工具：统一补 $uid 供 row-key 使用 -------- */
    decorateRows(list = []) {
      return list.map(r => ({ $uid: genUid(), ...r }));
    },
    rowKeyGetter(row) {
      return row?.[this.rowKey] ?? row?.$uid;
    },

    /* -------- 字典 -------- */
    dictOptions(key) {
      return this.dicts?.[key] || [];
    },
    dictLabel(val, key) {
      const it = (this.dicts?.[key] || []).find(o => o.value === val);
      return it ? it.label : val ?? '';
    },

    isEditable(row) {
      const label = this.dictLabel(row.orderStatus, 'DC_FORWARD_STATUS');
      return label === '未开始' || row.orderStatus === 'DC_FORWARD_STATUS_WKS';
    },

    /* -------- 数据加载（按路由 id） -------- */
    async getData() {
      if (!this.routeId) return;
      try {
        const res = await Api.mes.forwardItem.getForwardItem({ orderId: this.routeId });
        const { code, data, message } = res?.data || {};
        if (code !== 200) throw new Error(message || '获取数据失败');

        // 期望 data.items 或 data 为数组；**不新增列，仅替换字段名**
        const list = Array.isArray(data?.records) ? data.records : [];
        // 假设后端已是目标字段；若仍旧旧字段，这里做兜底映射：
        const mapped = list.map(it => ({
          [this.rowKey]: it[this.rowKey],
          processName: it.processName ?? it.process ?? '',
          orderType: it.orderType ?? it.type ?? '',
          issuedQty: Number(it.issuedQty ?? it.issued ?? 0),
          receivedQty: Number(it.receivedQty ?? it.received ?? 0),
          orderStatus: it.orderStatus ?? it.status ?? 'DC_FORWARD_STATUS_WKS',
          $editing: false,
          $localNew: !it[this.rowKey],
        }));
        this.rowsInner = this.decorateRows(mapped);
      } catch (e) {
        console.error(e);
        this.$message.error(e.message || '加载失败');
      }
    },

    /* -------- 表格交互 -------- */
    onSelectionChange(rows) {
      this.selected = rows;
    },
    rowSelectable(row) {
      return this.isEditable(row);
    },
    onRowClick(row, column, event) {
      if (this.disabled) return;
      const el = event?.target;
      if (el?.closest?.('input,textarea,select,.el-input,.el-select,.el-input-number')) return;
      if (column?.type === 'selection' || column?.property === undefined) return;
      if (!this.isEditable(row)) return;
      this.enterEdit(row);
    },
    enterEdit(row) {
      if (!this.isEditable(row)) return;
      this.rowsInner.forEach(r => (r.$editing = false));
      row.$editing = true;
    },

    /* -------- 新增 / 保存 / 删除（仅替换字段名） -------- */
    addRow() {
      const unstartKey =
        this.dicts.DC_FORWARD_STATUS?.find(d => d.label === '未开始')?.value ??
        'DC_FORWARD_STATUS_WKS';
      const row = {
        [this.rowKey]: undefined,
        $uid: genUid(),
        processName: '',
        orderType: '',
        issuedQty: 0,
        receivedQty: 0,
        orderStatus: unstartKey,
        $editing: true,
        $localNew: true,
      };
      this.rowsInner.push(row);
      this.$emit('add', row);
    },
    onPicked(val) {
      val.map(item => {
        const newObj = {
          $editing: true,
          $localNew: true,
          issuedQty: 0,
          receivedQty: 0,
        };
        console.log(Object.assign(item, newObj));
        this.rowsInner.push(Object.assign(item, newObj));
      });
    },

    async saveRow(row) {
      if (this.saving) return;
      if (!row.processName) return this.$message.warning('请填写工艺名称');
      if (!row.orderType) return this.$message.warning('请选择类型');
      if (!this.routeId) return this.$message.error('缺少路由 id');

      // items 中放“当前行”（**字段已改为新字段名**）
      const itemPayload = {
        [this.rowKey]: row[this.rowKey], // 可能为空
        processName: row.processName,
        orderType: row.orderType,
        issuedQty: row.issuedQty ?? 0,
        receivedQty: row.receivedQty ?? 0,
        orderStatus: row.orderStatus,
      };
      const payload = {
        id: this.routeId, // 头表 id（来自路由）
        items: [itemPayload], // 只提交当前行
      };

      this.saving = true;
      try {
        const res = await Api.mes.forwardItem.submitForwardItem(payload);
        const { code, data, message } = res?.data || {};
        if (code !== 200) throw new Error(message || '保存失败');

        // 回填新 id（如果返回）
        const newId = data?.items?.[0]?.[this.rowKey] || data?.[this.rowKey] || data?.id;
        if (!row[this.rowKey] && newId) row[this.rowKey] = newId;

        row.$editing = false;
        row.$localNew = false;
        this.$message.success('已保存');
        this.$emit('saved', {
          ...payload,
          items: [{ ...itemPayload, [this.rowKey]: row[this.rowKey] }],
        });
      } catch (e) {
        console.error(e);
        this.$message.error(e.message || '保存失败');
      } finally {
        this.saving = false;
      }
    },

    async removeSelected() {
      if (this.deleteDisabled) return;

      // 拆分“仅前端缓存的行”和“已落库的行”
      const serverRows = this.selected.filter(r => r[this.rowKey]); // 有 id

      // 已落库的调用后端
      const ids = serverRows.map(r => r[this.rowKey]).filter(Boolean);
      if (ids.length) {
        try {
          this.loading = true;
          await Api.mes.forwardItem.removeForwardItem({ ids: ids.join(',') });
          this.loading = false;
          this.$message.success('删除成功');
          // 本地删除（统一先删）
          const localUidSet = new Set(this.selected.map(r => r.$uid));
          this.rowsInner = this.rowsInner.filter(r => !localUidSet.has(r.$uid));
          this.selected = [];
          this.$emit('delete');
        } catch (e) {
          console.error(e);
          this.$message.error('部分数据删除失败，请刷新后核对');
        }
      }
    },

    /* -------- 类型变更后，修正选择集合 -------- */
    handleTypeChange(row) {
      const keyVal = this.rowKeyGetter(row);
      const inSelected = this.selected.some(s => this.rowKeyGetter(s) === keyVal);
      if (!inSelected) return;

      const keep = this.selected.filter(r => r.orderType === row.orderType);
      this.$nextTick(() => {
        this.$refs.tableRef?.clearSelection?.();
        keep.forEach(r => this.$refs.tableRef?.toggleRowSelection?.(r, true));
        this.selected = keep;
        this.$emit('selection-change', keep);
      });
    },

    /* -------- 转单（推进 issuedQty + 状态） -------- */
    openTransfer() {
      this.transferVisible = true;
    },
    batchSave() {
      this.loading = true;
      const form = {
        id: this.routeId,
        items: this.rowsInner,
      };
      Api.mes.forwardItem
        .submitForwardItem(form)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.getData();
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    onRefSubmit() {
      this.transferVisible = false;
      this.getData();
      this.$emit('update');
    },
    tableRowClassName({ row }) {
      console.log(row.orderStatus);
      if (row.orderStatus === 'DC_FORWARD_STATUS_JXZ') {
        return 'jxz-row';
      } else if (row.orderStatus === 'DC_FORWARD_STATUS_YWC') {
        return 'ywc-row';
      }
      return '';
    },
  },
};
</script>
<style lang="scss">
.jxz-row {
  .el-table__cell {
    color: #1d65f3;
    .dict-text {
      color: #1d65f3;
    }
  }
}
.ywc-row {
  .el-table__cell {
    color: #67c23a;
    .dict-text {
      color: #67c23a;
    }
  }
}
</style>
<style lang="scss" scoped>
.process-table {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.table-container {
  flex: 1;
  overflow: hidden;
}
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  justify-content: space-between;
  &-right,
  &-left {
    display: flex;
    align-items: center;
  }
  &-right {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
</style>
