export default {
  data() {
    return {
      searchConfig: null,
      dictMaps: {},
      dicts: {},
    };
  },
  methods: {
    getSearchConfig() {
      const generatePlaceholder = (label, action = '请输入') => `${action}${label}`;
      const generateSearchItem = item => {
        const { label, prop, searchType, type } = item;

        if (searchType === 'user') {
          return {
            label,
            type: 'dc-select-user',
            placeholder: generatePlaceholder(label, '请选择'),
            paramKey: prop,
            objectName: 'user',
            props: {
              multipleLimit: 1,
              returnType: 'string',
            },
          };
        }

        if (type === 'timeRange') {
          return {
            label,
            type: 'dc-date-range',
            placeholder: generatePlaceholder(label, '请选择'),
            paramKey: prop,
            props: {
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
            },
            clear(queryParams) {
              queryParams.startTime = null;
              queryParams.endTime = null;
            },
          };
        }

        if (type === 'dc-view') {
          return {
            label,
            type: 'dc-select-dialog',
            placeholder: generatePlaceholder(label, '请选择'),
            paramKey: prop,
            props: {
              showKey: item.showKey,
              type: 'input',
              objectName: item.objectName,
              clearable: true,
              returnType: 'string',
              multiple: false,
              'multiple-limit': 1,
            },
          };
        }

        return {
          label,
          type: 'input',
          placeholder: generatePlaceholder(label),
          paramKey: prop,
        };
      };

      const paramType = this.model.column
        .filter(item => item.search)
        .reduce((rec, item) => {
          rec[item.prop] = generateSearchItem(item);
          return rec;
        }, {});

      // 合并额外配置
      if (this.model?.search?.params) {
        this.queryParams = {
          ...this.queryParams,
          ...this.model.search.params,
        };

        Object.assign(paramType, this.model.search.config || {});
      }

      return {
        searchItemConfig: {
          paramType,
        },
      };
    },
    async getDictData() {
      const res = await this.useAsyncCache(this.dictKeys);
      this.dicts = res.value;
      return true;
    },
  },
};
