<template>
  <el-select
    v-model="innerValue"
    :placeholder="placeholder"
    :size="size"
    filterable
    remote
    clearable
    :remote-method="onRemote"
    :loading="loading"
    :disabled="disabled"
    @visible-change="handleVisibleChange"
    @clear="handleClear"
    class="dc-supplier-select"
  >
    <el-option
      v-for="item in options"
      :key="item[valueField]"
      :label="(item[labelField] || '-') + '    (' + (item[valueField] || '-') + ')'"
      :value="item[valueField]"
    />
    <template #empty>
      <div class="p-2 text-gray-400" style="padding: 8px; color: var(--el-text-color-secondary)">
        {{ loading ? '正在加载...' : '暂无数据' }}
      </div>
    </template>
  </el-select>
</template>

<script>
import Api from '@/api'; // 确保指向你项目里的 Api 入口

export default {
  name: 'dc-supplier-select',
  props: {
    modelValue: [String, Number, null],
    placeholder: { type: String, default: '请选择' },
    size: { type: String, default: 'default' },
    disabled: { type: Boolean, default: false },
    // 可根据实际返回字段自定义
    valueField: { type: String, default: 'supplierNumber' },
    labelField: { type: String, default: 'supplierName' },
    // 默认初始化查询参数
    defaultQuery: {
      type: Object,
      default: () => ({
        current: 1,
        size: 20,
      }),
    },
    // 远程搜索去抖时间
    debounce: { type: Number, default: 300 },
  },
  data() {
    return {
      options: [],
      loading: false,
      innerValue: this.modelValue ?? null,
      _debounceTimer: null,
      _hasInitialLoaded: false,
      // 内部维护分页/查询
      queryParams: {
        current: 1,
        size: 20,
        supplierName: '', // 搜索关键字
      },
      lastKeyword: '',
    };
  },
  watch: {
    modelValue(val) {
      this.innerValue = val ?? null;
    },
    innerValue(val) {
      this.$emit('update:modelValue', val);
      // 同时把选中的完整对象回传给父组件（可选）
      const hit = this.options.find(x => String(x[this.valueField]) === String(val));
      this.$emit('change', hit || null);
    },
  },
  mounted() {
    // 初始化 query 为默认参数
    this.queryParams.current = this.defaultQuery.current ?? 1;
    this.queryParams.size = this.defaultQuery.size ?? 20;
    // 挂载后先加载一页
    this.fetchList();
  },
  methods: {
    async fetchList(keyword = '') {
      try {
        this.loading = true;
        // 组合参数：默认分页 + 关键字
        const params = {
          current: this.queryParams.current,
          size: this.queryParams.size,
        };
        if (keyword && keyword.trim()) {
          params.supplierName = keyword.trim();
        }
        const res = await Api.mes.transfer.getSupplierList(params);
        // 兼容常见响应结构：res.data / res.data.data / res.data.records
        const payload =
          res?.data?.data?.records ?? res?.data?.records ?? res?.data?.data ?? res?.data ?? [];
        // 确保是数组
        this.options = Array.isArray(payload) ? payload : [];
      } catch (e) {
        console.error('获取供应商列表失败：', e);
        this.options = [];
      } finally {
        this.loading = false;
        this._hasInitialLoaded = true;
      }
    },
    onRemote(keyword) {
      // 去抖搜索；仅当关键字变化时触发
      if (this.lastKeyword === keyword) return;
      this.lastKeyword = keyword;
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        // 搜索时重置到第一页
        this.queryParams.current = this.defaultQuery.current ?? 1;
        this.fetchList(keyword);
      }, this.debounce);
    },
    handleVisibleChange(visible) {
      // 第一次展开但还未加载过，或者被清空后需要重新拉取
      if (visible && !this._hasInitialLoaded) {
        this.fetchList('');
      }
    },
    handleClear() {
      this.lastKeyword = '';
      // 清空后恢复默认第一页数据，便于再次选择
      this.queryParams.current = this.defaultQuery.current ?? 1;
      this.fetchList('');
    },
  },
};
</script>

<style scoped>
.dc-supplier-select {
  width: 100%;
}
</style>
