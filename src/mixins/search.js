export default {
  data() {
    return {
      queryParams: {
        current: 1,
        size: 10,
      },
      searchConfig: null,
    };
  },
  methods: {
    /** 初始化搜索配置 **/
    initSearchConfig() {
      const baseParamType = this.columns
        .filter(item => item.search)
        .sort((a, b) => a.searchIndex - b.searchIndex)
        .reduce((rec, item) => {
          rec[item.prop] = this.getParamType(item);
          return rec;
        }, {});
      if (this.searchConfig) {
        const oldResetExcludeKeys = this.searchConfig?.resetExcludeKeys || [];
        const oldParamType = this.searchConfig?.searchItemConfig?.paramType || {};

        this.searchConfig = {
          resetExcludeKeys: ['page', 'current', ...oldResetExcludeKeys],
          searchItemConfig: {
            paramType: {
              ...baseParamType,
              ...oldParamType,
            },
          },
        };
      } else {
        this.searchConfig = {
          resetExcludeKeys: ['page', 'current'],
          searchItemConfig: {
            paramType: baseParamType,
          },
        };
      }
    },
    /** 获取搜索字段类型 **/
    getParamType(col) {
      if (col.searchProps.is === 'dict') {
        return {
          label: col.label,
          type: 'select',
          options: this.dictMaps[col?.dictKey] || [],
          labelKey: 'dictValue',
          placeholder: `请选择${col.label}`,
          valueKey: 'dictKey', // 'id', // 'dictKey',
          paramKey: col.prop,
        };
      } else if (col.searchProps.is === 'input') {
        return {
          label: col.label,
          type: 'input',
          placeholder: `请输入${col.label}`,
          paramKey: col.prop,
        };
      } else if (col.searchProps.is === 'dc-select-user') {
        return {
          label: col.label,
          type: 'dc-select-user',
          placeholder: `请选择${col.label}`,
          paramKey: col.prop,
          objectName: 'user',
          props: {
            multipleLimit: 1,
            returnType: 'string',
          },
        };
      } else if (col.searchProps.is === 'dc-date-range') {
        return {
          label: col.label,
          type: 'dc-date-range',
          placeholder: `请输入${col.label}`,
          paramKey: col.prop,
          // 注意这里使用的是ref类型参数
          clear(queryParams) {
            queryParams.value.startTime = null;
            queryParams.value.endTime = null;
          },
          getLabelValue(queryParams) {
            if (queryParams.startTime && queryParams.endTime) {
              return `${col.label}：${queryParams.startTime} 至 ${queryParams.endTime}`;
            }
            return null;
          },
        };
      } else if (col.searchProps.is === 'el-date-picker') {
        return {
          label: col.label,
          type: 'el-date-picker',
          paramKey: col.prop,
          props: {
            ...col.searchProps?.props,
            placeholder: `请选择${col.label}`,
            style: {
              width: '200px',
            },
          },
        };
      } else if (col.searchProps.is === 'wf-select-dialog') {
        return {
          label: col.label,
          type: 'wf-select-dialog',
          paramKey: col.prop,
          objectName: col.objectName,
          props: {
            objectName: col.objectName,
            placeholder: `请选择${col.label}`,
          },
        };
      } else {
        console.error('undefined type', col.type, col);
        return {
          label: col.label,
          type: 'input',
          placeholder: `请输入${col.label}`,
          paramKey: col.prop,
        };
      }
    },
    /** 搜索按钮操作 */
    handleSearch(params) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      };
      this.getData();
    },
    /** 重置 */
    handleReset() {
      this.getData();
    },
  },
};
