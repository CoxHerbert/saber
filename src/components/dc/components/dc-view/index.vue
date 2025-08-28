<template>
  <div v-if="type === 'tag'" class="tag-rows">
    <div
      class="tag"
      :style="{ background: bgColor, color: textColor }"
      v-for="(item, i) in (viewText || '-').split(',')"
      :key="`tag-${objectName}-${item}-${i}`"
    >
      {{ item || '-' }}
    </div>
  </div>

  <div class="dc-view" v-else-if="type === 'text'">
    {{ viewText || modelValue || '-' }}
  </div>
</template>

<script>
import ComponentApi from './../../api/index';
import store from '@/store/';
import cacheData from './../../constant/cacheData';

export default {
  name: 'DcView',
  props: {
    // 展示类型：tag | text
    type: { type: String, default: 'text' },
    bgColor: { type: String, default: 'rgb(252.5, 245.7, 235.5)' },
    textColor: { type: String, default: '#e6a23c' },
    // 需要展示的对象名（用于 cacheData 映射）
    objectName: { type: String, default: null },
    // 绑定值：Array | Object | String(逗号分隔) | Number
    modelValue: { type: [String, Number, Array, Object], default: null },
    // 指定显示的键名，优先级低于对象配置里的 defaultLabel
    showKey: { type: String, default: null },
  },

  data() {
    return {
      iptTagData: [], // 渲染用数据（对象或原始 id）
      currentObject: null,
      rowKey: 'id', // 唯一键，默认 id，可被对象配置覆盖
      loadingFlag: 0, // 简单竞态保护
    };
  },

  computed: {
    viewText() {
      if (Array.isArray(this.iptTagData) && this.iptTagData.length) {
        return this.iptTagData
          .map(item => {
            // 允许 item 是原始 id（字符串/数字）或对象
            if (item && typeof item === 'object') {
              const labelKey = this.currentObject?.defaultLabel || this.showKey || 'id';
              try {
                return item[labelKey] ?? item.id ?? '';
              } catch {
                return item.id ?? '';
              }
            }
            return String(item ?? '');
          })
          .filter(Boolean)
          .join(',');
      }
      return '';
    },
  },

  watch: {
    modelValue: {
      handler() {
        this.refreshFromValue();
      },
      immediate: true,
      deep: true,
    },
    objectName() {
      this.refreshFromValue();
    },
  },

  methods: {
    async refreshFromValue() {
      try {
        // 1) 基础映射
        this.currentObject = cacheData[this.objectName] || null;
        this.rowKey = this.currentObject?.rowKey || 'id';
        const url = this.currentObject?.url;
        const ids = this.normalizeIds(this.modelValue);

        if (!ids || (Array.isArray(ids) && ids.length === 0) || !url) {
          this.iptTagData = [];
          return;
        }

        // 2) 简单竞态保护：仅保留最后一次请求
        const token = ++this.loadingFlag;

        // 3) 触发缓存加载（全局 store 写入）
        await ComponentApi.cache.getView({ url, data: ids });

        if (token !== this.loadingFlag) return; // 有更新，丢弃旧结果

        // 4) 从全局数据拼装渲染用数据
        const globalData = (store.getters.globalData && store.getters.globalData[url]) || {};
        const asList = Object.keys(globalData).map(k => globalData[k]);

        if (this.rowKey !== 'id') {
          this.iptTagData = ids.map(id => {
            const found = asList.find(it => it?.[this.rowKey] === id);
            return found ? { ...found } : id;
          });
        } else {
          this.iptTagData = ids.map(id => globalData[id] || id);
        }
      } catch (err) {
        // 保持静默失败，不打断展示
        console.error('[DcView] refresh error:', err);
        this.iptTagData = [];
      }
    },

    // 将各种输入类型统一为 id 数组（字符串时按 , 拆分）
    normalizeIds(val) {
      if (Array.isArray(val))
        return val
          .map(v => (v && typeof v === 'object' ? v.id : v))
          .filter(v => v !== undefined && v !== null && v !== '');
      if (val && typeof val === 'object') return [val.id].filter(Boolean);
      if (typeof val === 'string')
        return val
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      if (typeof val === 'number') return [String(val)];
      return [];
    },
  },
};
</script>

<style lang="scss">
.tag-rows {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  .tag {
    margin: 0 2px;
    border-radius: 6px;
    padding: 0 8px;
    box-sizing: border-box;
    font-size: 12px;
  }
}
.dc-view {
  display: inline-block;
}
</style>
