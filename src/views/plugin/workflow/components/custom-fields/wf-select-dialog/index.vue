<template>
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
      @remove-tag="
        value => {
          handleInputTagAction('remove-tag', value);
        }
      "
      @clear="
        () => {
          handleInputTagAction('clear');
        }
      "
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
        <div class="search-wrap">
          <dc-search
            v-if="searchConfig"
            v-model="queryParams"
            v-bind="searchConfig"
            @reset="handleReset"
            @search="handleSearch"
          />
        </div>
        <div class="tag-wrap">
          <div class="tag-list">
            <div class="no-data" v-if="selected.length === 0">暂无选中数据</div>
            <el-tag
              v-for="tag in selected"
              :key="tag.id"
              closable
              size="small"
              effect="plain"
              @close="handleInputTagAction('remove-tag', value)"
            >
              <template v-if="showCol?.type === 'dict'">
                <dc-dict
                  type="text"
                  color="#f26c0c"
                  :value="tag[model?.defaultLabel]"
                  :options="dicts[showCol?.dictData]"
                  v-if="showCol?.component === 'dc-dict'"
                />
                <dc-dict-key
                  type="text"
                  color="#f26c0c"
                  :value="tag[model?.defaultLabel]"
                  :options="dicts[showCol?.dictData]"
                  v-else-if="showCol?.component === 'dc-dict-key'"
                />
              </template>
              <template v-else-if="showCol?.type === 'dc-view'">
                <dc-view
                  color="#f26c0c"
                  v-model="tag[model?.defaultLabel]"
                  :objectName="showCol?.objectName"
                  v-if="showCol?.component === 'dc-view'"
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
              <el-button type="primary" text @click="handleInputTagAction('clear')">
                清空
              </el-button>
            </span>
          </div>
        </div>
        <div class="table-container">
          <el-table
            :data="tableData"
            @select="
              (selection, row) => {
                handleTableAction('select', row);
              }
            "
            @row-click="
              row => {
                handleTableAction('row-click', row);
              }
            "
            @row-dblclick="
              row => {
                handleTableAction('row-dblclick', row);
              }
            "
            :row-class-name="getRowClass"
            :row-key="rowKey || 'id'"
            height="100%"
            ref="tableRef"
          >
            <el-table-column
              type="selection"
              width="40"
              :reserve-selection="true"
              :selectable="() => true"
            />
            <el-table-column label="序号" width="80" type="index" align="center">
              <template #default="scoped">
                <span>{{ (queryParams.current - 1) * queryParams.size + scoped.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-for="(column, index) in model?.column || []"
              :prop="column?.prop"
              :label="column?.label"
              :align="column?.align || 'center'"
              :show-overflow-tooltip="!!column?.tooltip"
              :key="index"
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
                  :options="dicts[column.dictData]"
                />
                <dc-dict-key
                  v-else-if="column?.component === 'dc-dict-key'"
                  :value="scoped.row[column?.prop]"
                  :options="dicts[column?.dictData]"
                />
                <span v-else>{{
                  [undefined, null, '', ' '].includes(scoped.row[column?.prop])
                    ? '-'
                    : scoped.row[column.prop]
                }}</span>
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
  mixins: [search, dict, selectProps],
  emits: ['update:modelValue', 'change'],
  name: 'select-dialog',
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
      callBack: res => {
        return {
          ...res.data.data,
        };
      },
      initDefaultSearch: true,
    };
  },
  computed: {
    showCol() {
      return this.model.column.find(item => item.prop === this.model?.defaultLabel);
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(newVal) {
        nextTick(() => {
          let ids = [];
          if (Array.isArray(newVal)) {
            if (!!this.masterKey) {
              ids = newVal.map(item => item?.[this.masterKey] || item);
            } else {
              ids = newVal.map(item => item?.[this.rowKey] || item);
            }
          } else if (newVal && typeof newVal === 'object') {
            if (!!this.masterKey) {
            } else {
              ids = [newVal?.[this.rowKey]].filter(Boolean);
            }
          } else if (typeof newVal === 'string') {
            ids = newVal.split(',').filter(Boolean);
          }
          if (!ids.length) {
            this.value = [];
            return;
          }
          if (this.model.url) {
            ComponentApi.cache
              .getView({
                url: this.model.url,
                data: ids,
                masterKey: this.masterKey || this.rowKey,
              })
              .then(() => {
                const currentGlobalData = store.getters.globalData[this.model.url];
                if (!!this.masterKey) {
                  const _currentGlobalData = Object.keys(currentGlobalData).map(
                    key => currentGlobalData[key]
                  );
                  this.selected = ids.map(id => {
                    const currentItem = _currentGlobalData.find(
                      item => item[this.masterKey] === id
                    );
                    return currentItem ? { ...currentItem } : id;
                  });
                  this.value = this.selected;
                } else if (this.rowKey !== 'id') {
                  const _currentGlobalData = Object.keys(currentGlobalData).map(
                    key => currentGlobalData[key]
                  );
                  this.selected = ids.map(id => {
                    const currentItem = _currentGlobalData.find(item => item[this.rowKey] === id);
                    return currentItem ? { ...currentItem } : id;
                  });
                  this.value = this.selected;
                } else {
                  this.selected = ids.map(id => {
                    const currentItem = currentGlobalData[id];
                    return currentItem ? { ...currentItem } : id;
                  });
                  this.value = this.selected;
                }
              })
              .catch(error => {
                console.error('Error fetching data:', error);
              });
          }
        });
      },
    },
    tableData: {
      immediate: true,
      handler(newVal) {
        nextTick(() => {
          newVal.forEach(row => {
            if (!!this.masterKey) {
              this.$refs.tableRef?.toggleRowSelection(
                row,
                this.selected.some(item => item[this.masterKey] === row[this.masterKey])
              );
            } else {
              this.$refs.tableRef?.toggleRowSelection(
                row,
                this.selected.some(item => item[this.rowKey] === row[this.rowKey])
              );
            }
          });
        });
      },
    },
    objectName: {
      handler(newVal) {
        this.model = cacheData[newVal];
        if (this.model) return;
        this.columns = this.model.column;
        this.initSearchConfig();
        if (!!this.model?.rowKey) {
          this.rowKey = this.model.rowKey;
        }
        if (this.initDefaultSearch) {
          if (
            ![undefined, null, ''].includes(this.model.search) &&
            ![undefined, null, ''].includes(this.model.search.config)
          ) {
            this.searchConfig.searchItemConfig.paramType = {
              ...this.searchConfig.searchItemConfig.paramType,
              ...this.model.search.config,
            };
          }
          if (
            ![undefined, null, ''].includes(this.model.search) &&
            ![undefined, null, ''].includes(this.model.search.params)
          ) {
            this.queryParams = {
              ...this.queryParams,
              ...this.model.search.params,
            };
          }
          this.initDefaultSearch = false;
        }
        this.getDictData();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
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
          const callBackData = !!this.model?.callBack
            ? this.model?.callBack(res)
            : this.callBack(res);
          if (res.data.code === 200) {
            this.tableData = callBackData?.records;
            this.total = callBackData?.total;
          } else {
            this.tableData = callBackData.records.map(item => ({ ...item }));
            this.total = callBackData.total;
          }
          this.loading = false;
        })
        .catch(e => {
          console.error(e);
          this.loading = false;
        });
    },
    confirm() {
      this.update();
      this.closeDialog();
    },
    handleInputTagAction(action, value) {
      if (action === 'remove-tag') {
        this.selected.splice(
          this.selected.findIndex(item => item.id === value.id),
          1
        );
      } else if (action === 'clear') {
        this.selected = [];
        if (this.$refs.tableRef) this.$refs.tableRef.clearSelection();
      }
      this.update();
      const e = window.event;
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation(); // 阻止事件冒泡
      }
    },
    update() {
      if (this.multiple) {
        let data =
          this.returnType === 'string'
            ? this.selected.map(item => item[this.rowKey]).join(',')
            : this.selected;
        if (!!this.masterKey) {
          data =
            this.returnType === 'string'
              ? this.selected.map(item => item[this.masterKey]).join(',')
              : this.selected;
        }
        this.value = this.selected;
        this.$emit('update:modelValue', data);
        this.$emit('change', this.selected);
        const obj = {
          value: this.selected || null,
          column: this.column,
          index: this.dynamicIndex,
        };
        if (typeof this.change === 'function') {
          this.change(obj);
        }
      } else {
        const data = this.selected.length ? this.selected[0] : null;
        this.value = this.selected;
        if (!!this.masterKey) {
          this.$emit('update:modelValue', data ? data[this.masterKey] : null);
        } else {
          this.$emit('update:modelValue', data ? data[this.rowKey] : null);
        }
        this.$emit('change', data);
        const obj = {
          value: data || null,
          column: this.column,
          index: this.dynamicIndex,
        };
        if (typeof this.change === 'function') {
          this.change(obj);
        }
      }
    },
    handleTableAction(action, row) {
      if (action === 'row-click' || action === 'select') {
        if (this.multiple) {
          if (this.selected.some(item => item.id === row.id)) {
            const selectedIndex = this.selected.findIndex(item => item.id === row.id);
            this.$refs.tableRef.toggleRowSelection(row, false);
            this.selected.splice(selectedIndex, 1);
          } else {
            this.selected.push(row);
            this.$refs.tableRef.toggleRowSelection(row, true);
          }
        } else {
          if (this.selected.some(item => item.id === row.id)) {
            this.selected = [];
            this.$refs.tableRef.clearSelection();
          } else {
            this.selected = [row];
            this.$refs.tableRef.clearSelection();
            this.$refs.tableRef.toggleRowSelection(row, true);
          }
        }
      } else if (action === 'row-dblclick') {
        if (this.multiple) {
          if (this.selected.some(item => item.id === row.id)) {
            const selectedIndex = this.selected.findIndex(item => item.id === row.id);
            this.$refs.tableRef.toggleRowSelection(row, false);
            this.selected.splice(selectedIndex, 1);
          } else {
            this.selected.push(row);
            this.$refs.tableRef.toggleRowSelection(row, true);
            this.confirm();
          }
        } else {
          if (this.selected.some(item => item.id === row.id)) {
            this.selected = [];
            this.$refs.tableRef.clearSelection();
          } else {
            this.selected = [row];
            this.$refs.tableRef.clearSelection();
            this.$refs.tableRef.toggleRowSelection(row, true);
            this.confirm();
          }
        }
      }
    },
    getRowClass({ row }) {
      return this.selected.some(item => item.id === row.id) ? 'row-selected' : '';
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
  }
}
</style>
