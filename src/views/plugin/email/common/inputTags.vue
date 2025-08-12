<template>
  <el-popover placement="top-start" :visible="visible" trigger="manual">
    <template #default>
      <span class="error" v-if="visible">{{ errorMessage }}</span>
    </template>
    <template #reference>
      <div class="tag-input">
        <el-autocomplete
          v-model="inputValue"
          :fetch-suggestions="querySearch"
          @select="handleSelect"
          @keyup.enter.native="addTag"
          placeholder="请输入邮箱地址，支持 逗号 或 分号 分隔多个邮箱，按回车结束"
          clearable
          v-if="display"
        />
        <div class="tags" v-if="tagShow">
          <el-tag
            v-for="(tag, index) in tags"
            :key="tag"
            :closable="display"
            @close="removeTag(index)"
            >{{ tag }}</el-tag
          >
        </div>
      </div>
    </template>
  </el-popover>
</template>

<script>
import { isEmail, validatenull } from '@/utils/validate';
import func from '@/utils/func';

export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    display: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      inputValue: '',
      errorMessage: '',
      visible: false,
      tagShow: false,
      tags: [],
      suffixes: [
        '@qq.com',
        '@163.com',
        '@126.com',
        '@gmail.com',
        '@yahoo.com',
        '@hotmail.com',
        '@msn.com',
        '@sina.com',
        '@sina.cn',
        '@sohu.com',
      ],
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      if (func.notEmpty(this.value)) {
        this.tagShow = true;
        this.tags = this.value.split(',');
      }
    },
    querySearch(queryString, cb) {
      if (queryString.trim() === '') {
        cb([]);
        return;
      }
      const results = this.suffixes.map(suffix => ({ value: queryString + suffix }));
      cb(results);
    },
    handleSelect(item) {
      this.inputValue = item.value;
      this.addTag();
    },
    addTag() {
      if (validatenull(this.inputValue)) {
        return;
      }

      const emails = this.inputValue.split(/[,;]\s*/).map(email => email.trim());
      for (const email of emails) {
        if (email) {
          if (this.tags.includes(email)) {
            this.errorMessage = '邮箱已存在: ' + email;
            this.visible = true;
            return;
          }
          if (!isEmail(email)) {
            this.errorMessage = '邮箱格式错误: ' + email;
            this.visible = true;
            return;
          }
          this.tags.push(email);
        }
      }

      this.inputValue = '';
      this.errorMessage = '';
      this.visible = false;
      this.tagShow = true;
      this.$emit('input', this.tags.join(','));
    },
    removeTag(index) {
      this.tags.splice(index, 1);
      if (this.tags.length === 0) {
        this.tagShow = false;
      }
      this.$emit('input', this.tags.join(','));
    },
  },
};
</script>

<style>
.tag-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  left: 0;
}
</style>
