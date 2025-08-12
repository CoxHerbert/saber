<template>
  <div class="default" v-if="$slots.default" @click="openDialog">
    <slot name="default" :iptTagData="iptTagData"></slot>
  </div>
  <div v-else-if="disabled && type === 'text'">{{ viewText }}</div>
  <el-input-tag
    class="ipt-tag-select"
    v-model="iptTagData"
    clearable
    :placeholder="placeholder"
    @click="openDialog"
    @remove-tag="removeTag"
    @clear="handleClear"
    :style="{ width: width }"
    :disabled="disabled"
    :suffix-icon="suffixIcon"
    v-else-if="type === 'input'"
  >
    <template #tag="user">
      <div class="flex items-center">
        <el-icon><User /></el-icon>
        <span>{{ user.value.realName }}</span>
      </div>
    </template>
    <template #suffix>
      <el-icon><Search /></el-icon>
    </template>
  </el-input-tag>
  <el-dialog
    class="select-dialog"
    v-if="open"
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
    <div ref="content" class="dialog-body w-full h-full" v-loading="loading">
      <dc-drag-panel v-if="inited" :leftInitWidth="240" :height="treeHeight">
        <template #left>
          <div class="left-box">
            <el-tabs v-model="tab" @tab-change="handleChangeTab">
              <el-tab-pane name="normal" label="常用">
                <el-scrollbar :height="contentHeight - 80 + 'px'">
                  <div
                    :style="{
                      height: contentHeight - 80 + 'px',
                    }"
                  >
                    <template v-if="recentlyUsers?.length > 0">
                      <el-checkbox-group
                        v-if="props.multiple"
                        :modelValue="recentlySelectedUsers"
                        @update:modelValue="handleChangeRecently"
                      >
                        <el-checkbox
                          class="checkbox-item"
                          v-for="(item, i) in recentlyUsers"
                          :key="i"
                          :label="item.realName"
                          :value="item"
                        />
                      </el-checkbox-group>
                      <el-radio-group
                        v-else
                        :modelValue="recentlySelectedUsers"
                        @update:modelValue="handleChangeRecently"
                      >
                        <el-radio
                          v-for="(item, i) in recentlyUsers"
                          class="radio-item"
                          :value="item"
                          :key="i"
                          >{{ item.realName }}</el-radio
                        >
                      </el-radio-group>
                    </template>
                    <div v-else class="no-data">暂无数据</div>
                  </div>
                </el-scrollbar>
              </el-tab-pane>
              <el-tab-pane name="dept" label="部门">
                <div class="left-container-dept">
                  <el-input
                    v-model="deptSearch"
                    placeholder="请输入部门"
                    prefix-icon="Search"
                    clearable
                  />
                  <div
                    class="tree-container"
                    :style="{
                      height: contentHeight - 120 + 'px',
                      overflow: 'hidden',
                    }"
                  >
                    <el-scrollbar :height="contentHeight - 140 + 'px'">
                      <el-tree
                        ref="deptTreeRef"
                        :data="deptData"
                        @node-click="deptNodeClick"
                        :default-expanded-keys="['1']"
                        node-key="id"
                        :filter-node-method="deptFilterNode"
                      >
                        <template #default="{ data }">
                          <div
                            class="default-node"
                            :class="{
                              'is-active': data.id === queryParams.deptId,
                            }"
                          >
                            {{ data.deptName }}
                          </div>
                        </template>
                      </el-tree>
                    </el-scrollbar>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane name="role" label="角色">
                <div class="left-container-dept">
                  <el-input
                    v-model="roleSearch"
                    placeholder="请输入角色"
                    prefix-icon="Search"
                    clearable
                  />
                  <div
                    class="tree-container"
                    :style="{
                      height: contentHeight - 120 + 'px',
                      overflow: 'hidden',
                    }"
                  >
                    <el-scrollbar :height="contentHeight - 140 + 'px'">
                      <el-tree
                        ref="roleTreeRef"
                        :data="roleData"
                        @node-click="roleNodeClick"
                        node-key="id"
                        :filter-node-method="roleFilterNode"
                      >
                        <template #default="{ data }">
                          <div
                            class="default-node"
                            :class="{
                              'is-active': data.id === queryParams.roleId,
                            }"
                          >
                            {{ data.roleName }}
                          </div>
                        </template>
                      </el-tree>
                    </el-scrollbar>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </template>
        <template #right>
          <div class="data-content">
            <div class="search-wrap">
              <el-input
                v-model="queryParams.realName"
                placeholder="请输入姓名"
                prefix-icon="Search"
                @keyup.enter="getData"
                clearable
              />
              <el-button type="primary" @click="getData">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </div>
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
                  {{ tag?.realName }}
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
                :data="userData"
                @select="handleSelect"
                @select-all="handleSelectAll"
                @row-click="handleRowClick"
                @row-dblclick="handleRowDbClick"
                :row-class-name="rowClassName"
                :height="contentHeight - 180"
                row-key="id"
                height="100%"
                ref="userTableRef"
              >
                <el-table-column type="selection" width="40" :reserve-selection="true" />
                <el-table-column prop="" label="" width="60" align="center">
                  <template #default="scoped">
                    <div class="round-name">
                      {{ scoped.row?.realName ? scoped.row.realName.charAt(0) : '' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="realName" label="姓名" min-width="80" align="center">
                  <template #default="scoped">
                    {{ scoped.row?.realName || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="account" label="工号" min-width="80" align="center">
                  <template #default="scoped">
                    {{ scoped.row?.account || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="postName" label="岗位" min-width="80" align="center">
                  <template #default="scoped">
                    {{ scoped.row?.postName || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="deptName" label="部门" min-width="100" align="center">
                  <template #default="scoped">
                    {{ scoped.row?.deptName || '-' }}
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
        </template>
      </dc-drag-panel>
      <!-- <div class="tabs-container">
        <div class="left-container-dept">
          <el-input v-model="deptSearch" placeholder="请输入部门" prefix-icon="Search" clearable />
          <div class="tree-container">
            <el-tree
              ref="deptTreeRef"
              :data="deptData"
              @node-click="deptNodeClick"
              node-key="id"
              :filter-node-method="deptFilterNode"
            >
              <template #default="{ data }">
                <div
                  class="default-node"
                  :class="{
                    'is-active': data.id === queryParams.deptId,
                  }"
                >
                  {{ data.deptName }}
                </div>
              </template>
            </el-tree>
          </div>
        </div>
      </div>
      <div class="data-content">
        <div class="search-wrap">
          <el-input
            v-model="queryParams.realName"
            placeholder="请输入姓名"
            prefix-icon="Search"
            @keyup.enter="getData"
            clearable
          />
          <el-button type="primary" @click="getData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </div>
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
              {{ tag?.realName }}
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
            :data="userData"
            @select="handleSelect"
            @select-all="handleSelectAll"
            @row-click="handleRowClick"
            @row-dblclick="handleRowDbClick"
            :row-class-name="rowClassName"
            row-key="id"
            height="100%"
            ref="userTableRef"
          >
            <el-table-column type="selection" width="40" :reserve-selection="true" />
            <el-table-column prop="" label="" width="60" align="center">
              <template #default="scoped">
                <div class="round-name">
                  {{ scoped.row?.realName ? scoped.row.realName.charAt(0) : '' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="realName" label="姓名" min-width="80" align="center">
              <template #default="scoped">
                {{ scoped.row?.realName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="account" label="工号" min-width="80" align="center">
              <template #default="scoped">
                {{ scoped.row?.account || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="postName" label="岗位" min-width="80" align="center">
              <template #default="scoped">
                {{ scoped.row?.postName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="deptName" label="部门" min-width="100" align="center">
              <template #default="scoped">
                {{ scoped.row?.deptName || '-' }}
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
      </div> -->
    </div>

    <template #footer>
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { nextTick } from 'vue';
import Api from '@/api/index';
import ComponentApi from './../../api/index';
import store from '@/store/';
import { deepClone } from '@/utils/util';
import { getCacheUserList } from '@/api/system/user';

export default {
  name: 'UserSelect',
  emits: ['update:modelValue', 'change', 'iptTagDataUpdate'],
  props: {
    // 标题
    title: { type: String, default: '人员选择' },
    // 绑定的值
    modelValue: { type: [String, Array, Object], default: null },
    // 展示的类型 text 和 input
    type: {
      type: String,
      default: 'input',
      validator: v => ['text', 'input'].includes(v),
    },
    /**
     * 双向绑定数据返回的数据格式 object / string
     * object：单选{}，多选[{}]
     * string：单选/多选均返回逗号拼接 id
     */
    returnType: {
      type: String,
      default: 'string',
      validator: v => ['string', 'object'].includes(v),
    },
    // input tag 宽度
    width: { type: String, default: '100%' },
    // 占位符
    placeholder: { type: String, default: '请输入查询选择' },
    suffixIcon: { type: String, default: '' },
    // 是否多选
    multiple: { type: Boolean, default: true },
    // 多选上限，0 不限制
    multipleLimit: { type: Number, default: 1 },
    // 是否可以清空选项
    clearable: { type: Boolean, default: false },
    // 是否可编辑
    disabled: { type: Boolean, default: false },
  },

  data() {
    return {
      // 弹窗 & 加载
      open: false,
      loading: false,

      // 最近常用
      recentlySelectedUsers: [],
      recentlyUsers: [],

      // 选中的tab
      tab: 'normal',

      // 分页
      total: 0,

      // 查询参数
      queryParams: {
        current: 1,
        size: 20,
        realName: '',
        roleId: null,
        deptId: null,
      },

      // 展示&已选
      infoRows: [],
      selectedRows: [],

      // 树/表数据
      deptData: [],
      roleData: [],
      userData: [],

      // 输入框(回显)数据
      iptTagData: [],

      // 过滤
      deptSearch: '',
      roleSearch: '',

      // 防抖/双击
      timer: null,
      doubleClickDelay: 300,
      isTriggeredByClick: false,

      // 布局
      inited: false,
      contentHeight: 'auto',
    };
  },

  computed: {
    showSelectedRows() {
      const a = Array.isArray(this.infoRows) ? [...this.infoRows] : [];
      const b = Array.isArray(this.selectedRows) ? [...this.selectedRows] : [];
      return [...a, ...b];
    },
    viewText() {
      if (Array.isArray(this.iptTagData) && this.iptTagData.length) {
        return this.iptTagData
          .map(item => {
            let value = item.id;
            try {
              value = item?.realName;
            } catch (e) {
              value = item.id;
            }
            return value;
          })
          .join('，');
      }
      return '-';
    },
    // 侧栏最大高
    treeHeight() {
      return this.contentHeight !== 'auto' ? this.contentHeight - 20 : 'auto';
    },
  },

  watch: {
    // 外部 v-model -> 回显
    async modelValue(newVal) {
      if (
        [null, undefined, ''].includes(newVal) ||
        (Array.isArray(newVal) && newVal.length === 0)
      ) {
        this.iptTagData = [];
        return;
      }
      let ids;
      if (Array.isArray(newVal)) {
        ids = newVal.map(item => item?.id || item);
      } else if (typeof newVal === 'object' && newVal !== null) {
        ids = [newVal?.id];
      } else if (typeof newVal === 'string') {
        ids = newVal ? newVal.split(',') : [];
      } else {
        ids = '';
      }
      if (!ids || (Array.isArray(ids) && !ids.length)) {
        this.iptTagData = [];
        return;
      }
      await ComponentApi.cache.getView({
        url: '/blade-bip/bip-blade-user/select-data',
        data: ids,
      });
      const currentGlobalData = store.getters.globalData['/blade-bip/bip-blade-user/select-data'];
      this.iptTagData = ids.map(id => {
        const currentItem = currentGlobalData[id];
        return currentItem
          ? {
              ...currentItem,
              isInfo: true,
            }
          : id;
      });
    },

    // 部门过滤
    deptSearch(val) {
      if (this.$refs.deptTreeRef) this.$refs.deptTreeRef.filter(val);
    },

    // 角色过滤
    roleSearch(val) {
      if (this.$refs.roleTreeRef) this.$refs.roleTreeRef.filter(val);
    },

    // 表数据刷新时保持勾选状态
    userData: {
      deep: true,
      immediate: true,
      handler(newVal) {
        nextTick(() => {
          newVal.forEach(row => {
            const picked = this.showSelectedRows.find(item => item.id === row.id);
            if (picked) {
              const infoIndex = this.infoRows.findIndex(infoRow => infoRow.id === picked.id);
              if (infoIndex > -1) {
                this.$refs.userTableRef?.toggleRowSelection(row, true);
                this.selectedRows.push(this.infoRows[infoIndex]);
                this.infoRows.splice(infoIndex, 1);
              }
            }
          });
        });
      },
    },

    // 数量限制校验
    selectedRows: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        const isValidate = this.validateSelectionLimit({ selection: newVal });
        if (isValidate) {
          newVal.forEach(row => {
            this.$refs.userTableRef?.toggleRowSelection(row, true);
          });
        } else {
          newVal.forEach(row => this.$refs.userTableRef?.toggleRowSelection(row, false));
          oldVal?.forEach(row => this.$refs.userTableRef?.toggleRowSelection(row, true));
          this.selectedRows = oldVal || [];
        }
      },
    },
  },

  mounted() {
    // 初始根据外部值回显
    this.modelValue && this.$watch('modelValue', () => {}, { immediate: true });

    // 计算高度 & 监听窗口变化
    this.initDragPanel();
    window.addEventListener('resize', this.resizeCallback);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCallback);
    clearTimeout(this.timer);
  },

  methods: {
    /* ---------- 校验数量 ---------- */
    validateSelectionLimit({ selection }) {
      let mergedArray = [...this.showSelectedRows];
      if (selection) mergedArray = [...this.showSelectedRows, ...selection];
      const uniqueRows = Array.from(new Map(mergedArray.map(item => [item.id, item])).values());
      const total = uniqueRows?.length || 0;
      if (total > this.multipleLimit && this.multipleLimit !== 0) {
        this.$message({ type: 'error', message: `最多可选${this.multipleLimit}行` });
        return false;
      }
      return true;
    },
    validateSelectionLimit2(row) {
      return new Promise(resolve => {
        const findItem = this.showSelectedRows.find(item => item.id === row.id);
        let mergedArray = [...this.showSelectedRows];
        if (!findItem) mergedArray = [...this.showSelectedRows, row];
        const uniqueRows = Array.from(new Map(mergedArray.map(item => [item.id, item])).values());
        const total = uniqueRows?.length || 0;
        if (total > this.multipleLimit && this.multipleLimit !== 0) {
          this.$message({ type: 'error', message: `最多可选${this.multipleLimit}行` });
          return resolve(false);
        }
        return resolve(true);
      });
    },

    /* ---------- 基础数据 ---------- */
    async getDept() {
      const res = await Api.system.dept.getList();
      const { code, data } = res.data;
      if (code === 200) {
        this.deptData = [data?.[0]];
      }
    },
    async getRole() {
      const res = await Api.system.role.getList({ size: 99999, current: 1 });
      const { code, data } = res.data;
      if (code === 200) {
        this.roleData = [data[2]];
      }
    },
    async getData() {
      const res = await Api.system.user.getList(this.queryParams);
      const { code, data } = res.data;
      if (code === 200) {
        this.userData = data.records;
        this.total = data.total;
      }
    },

    /* ---------- Tab ---------- */
    handleChangeTab() {
      switch (this.tab) {
        case 'dept':
          this.roleSearch = '';
          this.queryParams.roleId = null;
          if (Array.isArray(this.deptData) && !this.deptData.length) this.getDept();
          this.resetQuery();
          break;
        case 'role':
          this.deptSearch = '';
          this.queryParams.deptId = null;
          if (Array.isArray(this.roleData) && !this.roleData.length) this.getRole();
          this.resetQuery();
          break;
      }
    },
    resetQuery() {
      this.queryParams.realName = '';
      this.queryParams.current = 1;
      this.getData();
    },

    /* ---------- 树过滤 ---------- */
    deptFilterNode(value, data) {
      if (!value) return true;
      return data.deptName.includes(value);
    },
    roleFilterNode(value, data) {
      if (!value) return true;
      return data.roleName.includes(value);
    },

    /* ---------- 最近常用 ---------- */
    handleChangeRecently(val) {
      const asArr = Array.isArray(val) ? val : val ? [val] : [];
      if (!this.multiple) {
        this.selectedRows = [];
        this.infoRows = asArr.slice(0, 1);
        this.$refs.userTableRef?.clearSelection();
        return;
      }
      // 多选：infoRows = “最近常用”去掉已选的集合
      const picked = new Set(this.selectedRows.map(i => i.id));
      this.infoRows = asArr.filter(r => !picked.has(r.id));
      this.recentlySelectedUsers = [...this.infoRows];
    },
    updateColectionUsers(dataSet) {
      const ids = dataSet?.map(u => u.id).join(',');
      Api.system.user.collectSelectUser({ tableName: 'SELECTUSER', targetIds: ids }).then(res => {
        const { code } = res.data;
        if (code === 200) {
          // do nothing
        }
      });
    },
    async getRecentlySelectedUsers() {
      const res = await Api.system.user.recentlySelectedUsers();
      const { code, data } = res.data;
      if (code === 200) {
        const dataSet = data || [];
        if (dataSet.length > 0 && !data[0]?.id) {
          const res2 = await getCacheUserList(data);
          if (res2.data.code == 200) {
            this.recentlyUsers = res2.data.data;
          }
        } else {
          this.recentlyUsers = data;
        }
      }
    },

    /* ---------- 表交互 ---------- */
    removeSelected(option) {
      if (option?.isInfo) {
        const findIndex = this.infoRows.findIndex(item => item.id === option.id);
        const findRow = this.userData.find(row => row.id === option.id);
        this.infoRows.splice(findIndex, 1);
        if (findRow) this.$refs.userTableRef?.toggleRowSelection(findRow, false);
      } else {
        const findIndex = this.selectedRows.findIndex(item => item.id === option.id);
        this.selectedRows.splice(findIndex, 1);
        this.$refs.userTableRef?.toggleRowSelection(option, false);
      }
    },
    clearableSelected() {
      this.selectedRows.forEach(selectedRow => {
        this.$refs.userTableRef?.toggleRowSelection(selectedRow);
      });
      this.selectedRows = [];
      this.infoRows = [];
    },
    isPicked(id) {
      return this.showSelectedRows.some(v => v.id === id);
    },
    pick(row) {
      if (this.isPicked(row.id)) return this.unpick(row);
      if (!this.multiple && this.showSelectedRows.length) {
        // 单选：先清，再选
        this.selectedRows = [];
        this.infoRows = [];
        this.$refs.userTableRef?.clearSelection();
      }
      // 数量校验
      const nextTotal = this.showSelectedRows.length + 1;
      if (this.multipleLimit !== 0 && nextTotal > this.multipleLimit) {
        this.$message.error(`最多可选${this.multipleLimit}行`);
        return;
      }
      this.selectedRows.push(row);
      this.$refs.userTableRef?.toggleRowSelection(row, true);
    },
    unpick(row) {
      const rm = arr => {
        const i = arr.findIndex(v => v.id === row.id);
        if (i > -1) arr.splice(i, 1);
      };
      rm(this.infoRows);
      rm(this.selectedRows);
      this.$refs.userTableRef?.toggleRowSelection(row, false);
    },
    handleSelect(selection, row) {
      this.isPicked(row.id) ? this.unpick(row) : this.pick(row);
    },
    handleRowClick(row) {
      this.isPicked(row.id) ? this.unpick(row) : this.pick(row);
    },
    async handleRowDbClick(row) {
      // 双击只在单选时直接确认
      this.isPicked(row.id) ? this.unpick(row) : this.pick(row);
      if (!this.multiple) this.confirm();
    },

    /* ---------- 树节点点击 ---------- */
    deptNodeClick(node) {
      this.queryParams.current = 1;
      this.queryParams.deptId = node.id;
      this.getData();
    },
    roleNodeClick(node) {
      this.queryParams.current = 1;
      this.queryParams.roleId = node.id;
      this.getData();
    },

    /* ---------- 结果确认/清空/Tag ---------- */
    emitChangeByRows(rows) {
      if (this.returnType === 'object') {
        const val = this.multiple ? rows : rows[0] || null;
        this.$emit('update:modelValue', val);
        this.$emit('change', val);
      } else {
        const ids = Array.isArray(rows) ? rows.map(i => i.id).join(',') : '';
        this.$emit('update:modelValue', ids);
        this.$emit('change', this.multiple ? rows : rows[0] || null);
      }
      // 同步 iptTagDataUpdate
      const tag = Array.isArray(rows) && rows.length === 0 ? null : rows;
      this.$emit('iptTagDataUpdate', tag);
    },
    confirm() {
      this.iptTagData = this.showSelectedRows || [];
      this.updateColectionUsers(this.iptTagData);
      this.emitChangeByRows(this.showSelectedRows);
      setTimeout(() => document.activeElement?.blur(), 10);
      this.closeDialog();
    },
    handleClear() {
      this.iptTagData = [];
      this.emitChangeByRows([]);
    },
    removeTag() {
      this.emitChangeByRows(this.iptTagData);
      setTimeout(() => document.activeElement?.blur(), 10);
    },

    /* ---------- 弹窗 ---------- */
    async openDialog() {
      if (this.disabled) return;
      this.open = true;
      this.loading = true;

      const tasks = [this.getDept(), this.getData(), this.getRecentlySelectedUsers()];
      await Promise.allSettled(tasks);

      this.inited = true;
      this.calcContentheight();
      this.infoRows = deepClone(this.iptTagData);
      this.loading = false;
      this.recentlySelectedUsers = this.multiple ? [] : null;
    },

    closeDialog() {
      this.tab = 'normal';
      this.total = 0;
      this.queryParams = {
        current: 1,
        size: 20,
        realName: '',
        roleId: null,
        deptId: null,
      };
      this.selectedRows = [];
      this.deptData = [];
      this.userData = [];
      this.deptSearch = '';
      this.roleSearch = '';
      this.timer = null;
      this.open = false;
      this.inited = false;
    },

    rowClassName({ row }) {
      if (!this.showSelectedRows) return '';
      const total = this.showSelectedRows?.length || 0;
      const isFind = Array.isArray(this.showSelectedRows)
        ? this.showSelectedRows.find(item => item.id === row.id)
        : false;

      if (isFind && this.multipleLimit !== 0) {
        return 'row-selected';
      } else if (!this.multiple && this.multipleLimit !== 0) {
        return 'row-cursor';
      } else if (total > this.multipleLimit - 1 && this.multipleLimit !== 0) {
        return 'row-disabled';
      }
      return '';
    },

    /* ---------- 布局/高度 ---------- */
    calcContentheight() {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      this.contentHeight = Math.min(viewportHeight * 0.7, 910);
    },
    resizeCallback() {
      this.calcContentheight();
    },
    initDragPanel() {
      // 拖拽容器出现后再计算
      setTimeout(() => {
        this.inited = true;
        this.calcContentheight();
      }, 100);
    },
  },
};
</script>
<style lang="scss">
@use '../../styles/select-dialog.scss';
</style>
<style lang="scss" scoped>
.left-box {
  padding-left: 16px;

  .no-data {
    width: 100%;
    height: 100%;
    color: #ccc;
    text-align: center;
  }

  :deep(.radio-item) {
    display: block;
    width: 100%;
  }
  :deep(.checkbox-item) {
    box-sizing: border-box;
    padding-left: 4px;
    padding-top: 8px;
    display: block;
    width: 100%;
    .el-checkbox__label {
      transform: translateY(-2px);
    }
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
