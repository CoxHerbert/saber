import Api from '@/api';
import { randomString } from './../utils';

export default {
  data() {
    return {
      widgetPropConfig: {
        model: {
          value: 'id',
          label: 'modelName',
          options: [],
          props: {
            change: e => {
              this.handleWidgetPropChang(e);
            },
          },
        },
      },
    };
  },
  methods: {
    handleDesignConfig(row) {
      const params = {
        modelId: row.modelId,
        datasourceId: row.datasourceId,
      };
      this.getModelOptions();
      if (row?.modelId && row?.datasourceId) {
        if (!row?.content || row?.content === '{column:[]}') {
          Api.configManage.model.getModelPrototype(params).then(res => {
            const { data } = res.data;
            const options = [];
            this.options = {
              column: [
                {
                  type: 'input',
                  label: '表单版本',
                  display: false,
                  prop: 'formVersion',
                  value: '1',
                  nfId: randomString(),
                  span: 24,
                  readonly: true,
                },
              ],
              group: [
                {
                  label: '基础信息',
                  prop: null,
                  arrow: true,
                  collapse: true,
                  display: true,
                  column: [],
                },
              ],
            };
            data.forEach(item => {
              options.push({
                label: item.jdbcComment,
                value: item.propertyName,
                isDisabled: option => {
                  return option?.disabled;
                },
              });
              if (item.componentType === 'dynamic') {
                this.options.column.push({
                  type: item.componentType,
                  label: item.jdbcComment,
                  span: 24,
                  display: true,
                  labelPosition: 'top',
                  children: {
                    align: 'center',
                    headerAlign: 'center',
                    index: false,
                    addBtn: true,
                    delBtn: true,
                    column: [],
                  },
                  prop: item.propertyName,
                });
              } else {
                this.options.group[0].column.push({
                  type: item.componentType,
                  label: item.jdbcComment,
                  span: 8,
                  display: !!item.isForm,
                  labelPosition: 'left',
                  prop: item.propertyName,
                });
              }
            });
          });
        } else {
          Api.configManage.model.getModelPrototype(params).then(res => {
            const { data } = res.data;
            const options = [];
            data.forEach(item => {
              options.push({
                label: item.jdbcComment,
                value: item.propertyName,
                isDisabled: option => {
                  return option?.disabled;
                },
              });
            });
          });
          this.options = this.deepClone(row.content || '{column: []}');
        }
      } else {
        this.options = row.content;
      }
    },
    getModelOptions() {
      Api.configManage.model
        .list({
          current: 1,
          size: 9999,
        })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.widgetPropConfig.model.options = data.records;
          }
        });
    },
    handleWidgetPropChang({ data, options, value, prop }) {
      if (prop === 'model') {
        if (!Array.isArray(options)) return;
        const currentItem = options.find(item => item.id === value);
        if (currentItem && currentItem?.id) {
          const params = {
            modelId: currentItem.id,
            datasourceId: currentItem.datasourceId,
          };
          Api.configManage.model.getModelPrototype(params).then(res => {
            const { data: resData } = res.data;
            const column = this.handleFormItem(resData);

            const subformParam = {
              label: 'value',
              value: 'value',
              options: resData.map(item => {
                return {
                  label: item.jdbcComment,
                  value: item.propertyName,
                };
              }),
            };
            data = {
              ...data,
              prop: currentItem.value,
              subformParam: subformParam,
            };
            data.children.column = column;
          });
        }
      }
    },
    handleFormItem(arr) {
      return arr.map(item => {
        if (item.componentType === 'wf-select-render') {
          return {
            label: item.jdbcComment,
            display: !!item.isForm,
            prop: item.propertyName,
            nfId: randomString(),
            subfield: true,
            component: 'wf-select-render',
            prentType: 'dynamic',
            // objectName: 'project',
            type: 'input',
            is: 'dc-select-dialog',
          };
        } else if (item.componentType === 'wf-select-remote-render') {
          return {
            label: item.jdbcComment,
            display: !!item.isForm,
            prop: item.propertyName,
            nfId: randomString(),
            subfield: true,
            component: 'wf-select-render',
            prentType: 'dynamic',
            // objectName: 'project',
            type: 'input',
            is: 'dc-select-remote',
          };
        } else if (item.componentType === 'wf-select-user-render') {
          return {
            label: item.jdbcComment,
            display: !!item.isForm,
            prop: item.propertyName,
            nfId: randomString(),
            subfield: true,
            component: 'wf-select-render',
            prentType: 'dynamic',
            // objectName: 'project',
            type: 'input',
            is: 'dc-select-user',
          };
        }
        return {
          type: item.componentType,
          label: item.jdbcComment,
          display: !!item.isForm,
          prop: item.propertyName,
          nfId: randomString(),
          subfield: true,
          prentType: 'dynamic',
        };
      });
    },
  },
};
