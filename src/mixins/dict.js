export default {
  data() {
    return {
      dictMaps: {},
      dictKeys: [],
    };
  },
  methods: {
    /** 处理字典key **/
    handleDictKeys() {
      this.dictKeys = this.columns
        ? this.columns
            .filter(col => col.type === 'dict')
            .map(col => ({
              key: col.dictData || col.dictKey,
            }))
        : [];
    },
    /** 获取字典数据 **/
    getDictData() {
      return new Promise((resolve, reject) => {
        if (!this.dictKeys.length) {
          return resolve();
        }
        this.useAsyncCache(this.dictKeys)
          .then(res => {
            this.dictMaps = {
              ...res.value,
              ...this.dictMaps,
            };
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      });
    },
  },
};
