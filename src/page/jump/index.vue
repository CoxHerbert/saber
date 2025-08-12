<template>
  <div>页面跳转中...</div>
</template>
<script>
export default {
  mounted() {
    const stringPath = this.$route.params.id;
    try {
      let result = this.decodeBase64(stringPath);
      if (result) {
        this.$router.push({
          path: result.split('?')[0],
          query: this.getQueryParams(result),
        });
      }
    } catch (error) {}
  },
  methods: {
    decodeBase64(base64Str, isURLSafe = false) {
      // 参数校验
      if (typeof base64Str !== 'string') {
        throw new Error('Input must be a string');
      }
      try {
        let str = base64Str;
        // 处理URL安全的Base64（可选）
        if (isURLSafe) {
          str = str.replace(/-/g, '+').replace(/_/g, '/');
        }

        // 补全可能的缺失填充符
        const padLength = str.length % 4;
        if (padLength) {
          str += '='.repeat(4 - padLength);
        }

        // 浏览器环境使用atob
        if (typeof atob === 'function') {
          return decodeURIComponent(escape(atob(str)));
        }
        // Node.js 环境使用Buffer
        else if (typeof Buffer === 'function') {
          return Buffer.from(str, 'base64').toString('utf8');
        }
        // 兼容性兜底（如React Native）
        else {
          throw new Error('Unsupported environment: neither atob nor Buffer is available');
        }
      } catch (e) {
        throw new Error(`Base64 decode failed: ${e.message}`);
      }
    },
    getQueryParams(url = window.location.href) {
      try {
        // 处理URL字符串（兼容没有协议/域名的纯查询字符串）
        const urlToParse = url.includes('?') ? url : `?${url}`;
        const queryString = new URL(urlToParse, 'http://dummy.base').search;

        // 使用URLSearchParams解析
        const params = new URLSearchParams(queryString);
        const result = {};

        // 转换为普通对象（自动处理重复键和数组值）
        for (const [key, value] of params.entries()) {
          if (key in result) {
            // 如果键已存在，转换为数组或追加值
            result[key] = Array.isArray(result[key])
              ? [...result[key], value]
              : [result[key], value];
          } else {
            result[key] = value;
          }
        }

        return result;
      } catch (e) {
        console.error('URL 解析失败:', e);
        return {};
      }
    },
  },
};
</script>
