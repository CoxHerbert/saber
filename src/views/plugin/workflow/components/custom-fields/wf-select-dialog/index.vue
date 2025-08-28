<template>
  <!-- 触发区：自定义插槽或标签输入 -->
  <div v-if="$slots.default" @click="openDialog">
    <slot name="default"></slot>
  </div>
  <div class="input-tag-box" v-else @click="openDialog">
    <el-input-tag
      class="ipt-tag-select"
      :class="{
        'tag-input__hide': Array.isArray(value) && value.length,
      }"
      v-model="value"
      :placeholder="placeholder"
      :style="{ width: width }"
      :disabled="disabled"
      clearable
      @remove-tag="(val, $event) => handleInputTagAction('remove-tag', val, $event)"
      @clear="$event => handleInputTagAction('clear', null, $event)"
    >
      <template #tag="item">
        <div class="flex items-center">
          <span>{{ item.value[showKey || model?.defaultLabel] }}</span>
        </div>
      </template>
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
      <template #suffix>
        <el-icon><Edit /></el-icon>
      </template>
    </el-input-tag>
  </div>

  <!-- 选择弹窗 -->
  <el-dialog
    class="select-dialog"
    v-model="open"
    :show-close="false"
    @close="closeDialog"
    :width="dialogWidth"
    modal
    draggable
    destroy-on-close
    append-to-body
    size="default"
  >
    <template #header>
      <div class="head-title">{{ title || model?.title || '-' }}</div>
      <div class="head-close" @click="closeDialog">
        <el-icon><Close /></el-icon>
      </div>
    </template>

    <div class="dialog-body w-full h-full" v-loading="loading">
      <div class="data-content">
        <!-- 搜索 -->
        <div class="search-wrap">
          <dc-search
            v-if="searchConfig"
            v-model="queryParams"
            v-bind="searchConfig"
            @reset="handleReset"
            @search="handleSearch"
          />
        </div>

        <!-- 已选标签 -->
        <div class="tag-wrap">
          <div class="tag-list">
            <div class="no-data" v-if="selected.length === 0">暂无选中数据</div>
            <el-tag
              v-for="tag in selected"
              :key="getKey(tag)"
              closable
              size="small"
              effect="plain"
              @close="e => handleInputTagAction('remove-tag', tag, e)"
            >
              <template v-if="showCol?.type === 'dict'">
                <dc-dict
                  v-if="showCol?.component === 'dc-dict'"
                  type="text"
                  color="#f26c0c"
                  :value="tag[model?.defaultLabel]"
                  :options="dictMaps[showCol?.dictData]"
                />
                <dc-dict-key
                  v-else-if="showCol?.component === 'dc-dict-key'"
                  type="text"
                  color="#f26c0c"
                  :value="tag[model?.defaultLabel]"
                  :options="dictMaps[showCol?.dictData]"
                />
              </template>
              <template v-else-if="showCol?.type === 'dc-view'">
                <dc-view
                  v-if="showCol?.component === 'dc-view'"
                  color="#f26c0c"
                  v-model="tag[model?.defaultLabel]"
                  :objectName="showCol?.objectName"
                />
              </template>
              <template v-else>
                {{ tag[showKey || model?.defaultLabel] }}
              </template>
            </el-tag>
          </div>
          <div class="statistics-box">
            <span>
              已选 {{ Array.isArray(selected) ? selected.length : 0 }}
              <span class="clear-btn" text @click.stop="handleInputTagAction('clear')"> 清空 </span>
            </span>
          </div>
        </div>

        <!-- 表格 -->
        <div class="table-container">
          <el-table
            :data="tableData"
            @select="(_, row) => handleTableAction('select', row)"
            @row-click="row => handleTableAction('row-click', row)"
            @row-dblclick="row => handleTableAction('row-dblclick', row)"
            :row-class-name="getRowClass"
            :row-key="rowKey || 'id'"
            height="100%"
            ref="tableRef"
            border
          >
            <el-table-column
              type="selection"
              width="40"
              :reserve-selection="true"
              :selectable="() => true"
            />
            <el-table-column label="序号" width="60" type="index" align="center">
              <template #default="scoped">
                <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column
              v-for="(column, index) in model?.column || []"
              :key="index"
              :width="column?.width"
              :min-width="column?.minWidth"
              :prop="column?.prop"
              :label="column?.label"
              :align="column?.align || 'center'"
              :show-overflow-tooltip="!!column?.tooltip"
            >
              <template #default="scoped">
                <dc-view
                  v-if="column?.component === 'dc-view'"
                  color="#666"
                  v-model="scoped.row[column?.prop]"
                  :objectName="column?.objectName"
                />
                <dc-dict
                  v-else-if="column?.component === 'dc-dict'"
                  :value="scoped.row[column?.prop]"
                  :options="dictMaps[column.dictData]"
                />
                <dc-dict-key
                  v-else-if="column?.component === 'dc-dict-key'"
                  :value="scoped.row[column?.prop]"
                  :options="dictMaps[column?.dictData]"
                />
                <span v-else>
                  {{
                    [undefined, null, '', ' '].includes(scoped.row[column?.prop])
                      ? '-'
                      : scoped.row[column.prop]
                  }}
                </span>
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
</template>

<script>
import { nextTick } from 'vue';
import ComponentApi from '@/components/dc/api/index';
import store from '@/store/';
import cacheData from '@/components/dc/constant/cacheData';
import search from '@/mixins/search';
import dict from '@/mixins/dict';
import selectProps from '@/views/plugin/workflow/mixins/select-props';

export default {
  name: 'select-dialog',
  mixins: [search, dict, selectProps],
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      rowKey: 'id',
      open: false,
      loading: false,
      total: 0,
      value: [],
      queryParams: { current: 1, size: 20 },
      tableData: [],
      selected: [],
      model: null,
      callBack: res => ({ ...res.data.data }),
      initDefaultSearch: true,
    };
  },
  computed: {
    showCol() {
      if (!this.model || !Array.isArray(this.model.column)) return null;
      return this.model.column.find(item => item.prop === this.model?.defaultLabel);
    },
  },
  watch: {
    // 外部 v-model 同步到内部选中态
    modelValue: {
      immediate: true,
      deep: true,
      handler(newVal) {
        nextTick(async () => {
          const ids = this.parseIds(newVal);
          if (!ids.length) {
            this.value = [];
            this.selected = [];
            return;
          }
          if (!this.model?.url) return;

          try {
            await ComponentApi.cache.getView({
              url: this.model.url,
              data: ids,
              masterKey: this.masterKey || this.rowKey,
            });

            const currentGlobalData = store.getters.globalData[this.model.url] || {};
            const rows = Array.isArray(currentGlobalData)
              ? currentGlobalData
              : Object.values(currentGlobalData);

            // 按 masterKey/rowKey 从缓存映射出完整对象
            const k = this.masterKey || this.rowKey || 'id';
            this.selected = ids.map(id => {
              const hit = rows.find(item => item?.[k] == id);
              return hit ? { ...hit } : { [k]: id };
            });
            this.value = this.selected;
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        });
      },
    },

    // 元对象变化：初始化列、字典、默认查询参数
    objectName: {
      handler(newVal) {
        this.model = cacheData[newVal];
        if (!this.model) return;

        this.columns = this.model.column;
        this.handleDictKeys();
        this.getDictData().then(() => {
          this.initSearchConfig();
          if (this.initDefaultSearch) {
            if (this.model?.search?.config && this.searchConfig?.searchItemConfig?.paramType) {
              console.log(this.model.search.config);
              this.searchConfig.searchItemConfig.paramType = {
                ...this.searchConfig.searchItemConfig.paramType,
                ...this.model.search.config,
              };
            }
            if (this.model?.search?.params) {
              this.queryParams = {
                ...this.queryParams,
                ...this.model.search.params,
              };
            }
            this.initDefaultSearch = false;
          }
        });

        if (this.model?.rowKey) {
          this.rowKey = this.model.rowKey;
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    /** 工具：获取行主键 */
    getKey(row) {
      const k = this.masterKey || this.rowKey || 'id';
      return row?.[k];
    },

    /** 工具：从外部 v-model 解析 id 数组 */
    parseIds(val) {
      const k = this.masterKey || this.rowKey || 'id';
      if (Array.isArray(val)) {
        return val.map(item => (typeof item === 'object' ? item?.[k] : item)).filter(Boolean);
      } else if (val && typeof val === 'object') {
        return [val?.[k]].filter(Boolean);
      } else if (typeof val === 'string') {
        return val.split(',').filter(Boolean);
      }
      return [];
    },

    openDialog() {
      if (this.disabled) return true;
      this.open = true;
      this.getData();
    },

    closeDialog() {
      this.total = 0;
      this.queryParams = { current: 1, size: 20 };
      this.tableData = [];
      this.open = false;
    },

    /** 拉取数据并同步勾选状态（替代 watch tableData 的逐行 toggle） */
    getData() {
      this.loading = true;
      const newParams = this.query?.currentPage
        ? { currentPage: this.queryParams.current, pageSize: this.queryParams.size }
        : {};

      this.model
        .dialogGet({
          ...this.queryParams,
          ...this.query,
          ...newParams,
        })
        .then(res => {
          const callBackData = this.model?.callBack ? this.model.callBack(res) : this.callBack(res);

          // 兼容两种返回格式
          if (res.data?.code === 200) {
            this.tableData = callBackData?.records || [];
            this.total = callBackData?.total || 0;
          } else {
            this.tableData = (callBackData?.records || []).map(item => ({ ...item }));
            this.total = callBackData?.total || 0;
          }

          nextTick(() => this.syncTableSelection());
          this.loading = false;
        })
        .catch(e => {
          console.error(e);
          this.loading = false;
        });
    },

    /** 同步表格勾选 */
    syncTableSelection() {
      if (!this.$refs.tableRef) return;
      this.$refs.tableRef.clearSelection();

      const k = this.masterKey || this.rowKey || 'id';
      const selectedKeys = new Set(this.selected.map(item => item?.[k]));
      this.tableData.forEach(row => {
        if (selectedKeys.has(row?.[k])) {
          this.$refs.tableRef.toggleRowSelection(row, true);
        }
      });
    },

    /** 统一“应用选择结果”逻辑 */
    applySelection() {
      const k = this.masterKey || this.rowKey || 'id';

      if (this.multiple) {
        let data =
          this.returnType === 'string'
            ? this.selected.map(item => item?.[k]).join(',')
            : this.selected;

        this.value = this.selected;
        this.$emit('update:modelValue', data);
        this.$emit('change', this.selected);

        const obj = { value: this.selected || null, column: this.column, index: this.dynamicIndex };
        if (typeof this.change === 'function') this.change(obj);
      } else {
        const data = this.selected.length ? this.selected[0] : null;
        this.value = this.selected;

        this.$emit('update:modelValue', data ? data?.[k] : null);
        this.$emit('change', data);

        const obj = { value: data || null, column: this.column, index: this.dynamicIndex };
        if (typeof this.change === 'function') this.change(obj);
      }
    },

    /** 点击“确定” */
    confirm() {
      this.applySelection();
      this.closeDialog();
    },

    /** 输入标签的删除/清空（使用 $event 而非 window.event） */
    handleInputTagAction(action, tag, e) {
      if (e?.stopPropagation) e.stopPropagation();

      const k = this.masterKey || this.rowKey || 'id';

      if (action === 'remove-tag') {
        const idx = this.selected.findIndex(item => item?.[k] === tag?.[k]);
        if (idx > -1) this.selected.splice(idx, 1);
        if (this.$refs.tableRef) {
          const row = this.tableData.find(r => r?.[k] === tag?.[k]);
          if (row) this.$refs.tableRef.toggleRowSelection(row, false);
        }
      } else if (action === 'clear') {
        this.selected = [];
        if (this.$refs.tableRef) this.$refs.tableRef.clearSelection();
      }

      this.applySelection();
    },

    /** 表格点击/双击/选择 */
    handleTableAction(action, row) {
      const k = this.masterKey || this.rowKey || 'id';
      const has = this.selected.some(item => item?.[k] === row?.[k]);

      if (action === 'row-click' || action === 'select') {
        if (this.multiple) {
          if (has) {
            const idx = this.selected.findIndex(i => i?.[k] === row?.[k]);
            if (idx > -1) this.selected.splice(idx, 1);
            this.$refs.tableRef?.toggleRowSelection(row, false);
          } else {
            this.selected.push(row);
            this.$refs.tableRef?.toggleRowSelection(row, true);
          }
        } else {
          if (has) {
            this.selected = [];
            this.$refs.tableRef?.clearSelection();
          } else {
            this.selected = [row];
            this.$refs.tableRef?.clearSelection();
            this.$refs.tableRef?.toggleRowSelection(row, true);
          }
        }
      } else if (action === 'row-dblclick') {
        if (this.multiple) {
          if (has) {
            const idx = this.selected.findIndex(i => i?.[k] === row?.[k]);
            if (idx > -1) this.selected.splice(idx, 1);
            this.$refs.tableRef?.toggleRowSelection(row, false);
          } else {
            this.selected.push(row);
            this.$refs.tableRef?.toggleRowSelection(row, true);
          }
          // 双击多选：立即提交并关闭
          this.applySelection();
          this.closeDialog();
        } else {
          if (has) {
            this.selected = [];
            this.$refs.tableRef?.clearSelection();
          } else {
            this.selected = [row];
            this.$refs.tableRef?.clearSelection();
            this.$refs.tableRef?.toggleRowSelection(row, true);
          }
          // 双击单选：立即提交并关闭
          this.applySelection();
          this.closeDialog();
        }
      }
    },

    /** 行样式：基于主键判断是否选中 */
    getRowClass({ row }) {
      const k = this.masterKey || this.rowKey || 'id';
      return this.selected.some(item => item?.[k] === row?.[k]) ? 'row-selected' : '';
    },
  },
};
</script>

<style lang="scss">
@use '@/components/dc/styles/select-dialog.scss';
</style>

<style lang="scss" scoped>
.dialog-body {
  height: 70vh !important;
}
.table-container {
  height: calc(70vh - 100px);
}
.input-tag-box {
  width: 100%;
  max-width: 100%;
  :deep(.el-input-tag__inner) {
    flex-wrap: unset;
    white-space: nowrap; /* 横向滚动更流畅 */
    overflow-x: auto;
  }

  .tag-input__hide {
    :deep(.el-input-tag__input) {
      display: none;
    }
  }
}
.tag-wrap {
  display: flex;
  column-gap: 5px;
  .tag-list {
    display: flex;
    flex: 1;
    column-gap: 5px;
    overflow: auto;
  }
  .statistics-box {
    margin-left: 5px;
    .clear-btn {
      color: #f26c0c;
      cursor: pointer;
    }
  }
}
</style>
