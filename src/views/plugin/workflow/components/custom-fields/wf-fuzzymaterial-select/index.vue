<template>
  <div class="wl-wrapper">
    <el-select
      readonly
      :disabled="disabled"
      class="organization"
      v-model="fuseorgid"
      placeholder="请选组织"
      clearable
    >
      <el-option
        v-for="(item, index) in ORG_LIST_CACHE"
        :key="index"
        :value="item.value"
        :label="item.label"
      />
    </el-select>
    <el-select v-model="queryCriteria" placeholder="请选择" style="width: 260px">
      <el-option label="物料编码" value="FNUMBER"></el-option>
      <el-option label="物料名称" value="FNAME"></el-option>
      <el-option label="规格型号" value="FSPECIFICATION"></el-option>
    </el-select>
    <el-autocomplete
      :placeholder="`请输入${queryCriteriaMap[queryCriteria]}`"
      v-model="name"
      clear
      :fetch-suggestions="querySearchAsyncThrottled"
      @select="handleSelectConfirm"
    >
    </el-autocomplete>
  </div>
</template>
<script>
import { getCurrentInstance } from 'vue';
import { selectMaterial } from '@/api/system/user';
export default {
  name: 'wf-fuzzymaterial-select',
  emits: ['update:modelValue'],
  props: {
    modelValue: [String, Number, Object],
    checkType: {
      // radio单选 checkbox多选
      type: String,
      default: () => {
        return 'radio';
      },
    },
    size: {
      type: String,
      default: () => {
        return 'default';
      },
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
    userUrl: {
      type: String,
      default: () => {
        return '/blade-system/search/user';
      },
    },
    change: Function,
  },

  data() {
    return {
      queryCriteriaMap: {
        FNUMBER: '物料编码',
        FNAME: '物料名称',
        FSPECIFICATION: '规格型号',
      },
      queryCriteria: 'FNUMBER',
      name: '',
      fuseorgid: '100006',
      ORG_LIST_CACHE: [],
      queryString: '',
    };
  },

  mounted() {
    const { proxy } = getCurrentInstance();
    // 数据字典
    const { ORG_LIST_CACHE } = proxy.useCache([{ key: 'ORG_LIST_CACHE' }]);
    this.ORG_LIST_CACHE = ORG_LIST_CACHE;
  },
  methods: {
    handleSelect() {
      if (this.readonly || this.disabled) return;
      if (!this.fuseorgid) {
        this.$message.warning('请先选择组织');
        return;
      }
      this.$refs['material-select'].visible = true;
    },
    handleSelectConfirm(e) {
      console.log(e);
      this.name = e.value;
      this.$emit('update:modelValue', e);
      if (this.change && typeof this.change == 'function') this.change({ value: e });
    },

    throttle(func, wait) {
      let timeout = null;
      let lastArgs = null;
      let lastThis = null;
      let lastCallTime = 0;

      const throttled = function (...args) {
        const now = Date.now();
        const remainingTime = wait - (now - lastCallTime);

        lastArgs = args;
        lastThis = this;

        if (remainingTime <= 0 || remainingTime > wait) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          lastCallTime = now;
          func.apply(lastThis, lastArgs);
        } else if (!timeout) {
          timeout = setTimeout(() => {
            lastCallTime = Date.now();
            timeout = null;
            func.apply(lastThis, lastArgs);
          }, remainingTime);
        }
      };

      return throttled;
    },

    async querySearchAsync(queryString, cb) {
      if (!queryString || this.queryString == queryString) {
        cb([]);
      }
      if (!this.fuseorgid) {
        this.$message.warning('请先选择组织');
        cb([]);
        return;
      }
      this.queryString = queryString;
      var results = await selectMaterial({
        FUSEORGID: this.fuseorgid,
        [this.queryCriteria]: queryString,
      });

      let list = results.data.data.map(item => {
        return {
          ...item,
          value: item.fname,
          label: item.fname,
        };
      });

      console.log(list);
      console.log('哈哈哈哈h');
      cb(list || []);
    },

    querySearchAsyncThrottled: function (queryString, cb) {
      const throttledQuerySearchAsync = this.throttle(this.querySearchAsync, 2000);
      throttledQuerySearchAsync(queryString, cb);
    },

    createStateFilter(queryString) {
      return name => {
        return name.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.wl-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  .organization {
    margin-right: 20px;
  }
}
</style>
