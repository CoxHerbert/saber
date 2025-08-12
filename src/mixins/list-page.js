import search from './search';
import dict from './dict';
export default {
  mixins: [search, dict],
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      batchSelectRows: [],
      columns: [],
    };
  },
  computed: {
    batchActionDisabled() {
      return !this.batchSelectRows.length;
    },
  },
  methods: {
    /** 加载初始化页面配置 **/
    loadModel() {
      return new Promise((resolve, reject) => {
        this.api.configManage.model
          .getModelPrototype(this.modelParams)
          .then(res => {
            const { code, data } = res.data;
            if (code === 200) {
              const columns = data
                .filter(item => !!item.isList)
                .map(item => {
                  let column = {
                    label: item.jdbcComment,
                    prop: item.propertyName,
                    search: !!item.isQuery,
                  };
                  if (
                    item.componentType === 'input' ||
                    item.componentType === 'textarea' ||
                    item.componentType === 'date' ||
                    item.componentType === 'wf-select-single'
                  ) {
                    column.type = 'rowText';
                    if (!!item.isQuery) {
                      column = {
                        ...column,
                        dictKey: item.dictCode,
                        searchProps: {
                          is: 'input',
                        },
                      };
                    }
                  } else if (
                    item.componentType === 'select' ||
                    item.componentType === 'tree' ||
                    item.componentType === 'checkbox'
                  ) {
                    column.type = 'dict';
                    if (!!item.isQuery) {
                      column = {
                        ...column,
                        dictKey: item.dictCode,
                        searchProps: {
                          is: 'dict',
                        },
                      };
                    }
                  } else if (item.componentType === 'wf-select-dialog') {
                    column.type = 'dc-view';
                    column.objectName = item.objectName;
                    if (!!item.isQuery) {
                      column = {
                        ...column,
                        searchProps: {
                          is: 'dict',
                        },
                      };
                    }
                  }
                  return column;
                });
              this.columns = [
                {
                  type: 'selection',
                  width: '40px',
                  align: 'center',
                },
                {
                  prop: '',
                  label: '序号',
                  width: '60px',
                  align: 'center',
                  type: 'index',
                  render(scope) {
                    return scope.$index + 1;
                  },
                },
                ...columns,
              ];
              resolve(columns);
            } else {
              reject(err);
            }
          })
          .catch(err => reject(err));
      });
    },
    /** 获取选中的数据 */
    handleSelectionChange(selection) {
      this.batchSelectRows = selection;
    },
    /** 单个选择 **/
    handleSelect(selection) {
      this.batchSelectRows = selection;
    },
    /** 全部选择 **/
    handleSelectAll(selection) {
      this.batchSelectRows = selection;
    },
    /** 删除and批量删除接口 **/
    handleDeleteCommon(ids, message, deleteApi, isAsync) {
      if (isAsync) {
        return new Promise((reslove, reject) => {
          this.$confirm(message)
            .then(async () => {
              await deleteApi(ids); // 调用传入的删除接口
            })
            .then(() => {
              this.$message.success('删除成功');
              reslove();
            })
            .catch(() => {
              reject();
            });
        });
      } else {
        this.$confirm(message)
          .then(async () => {
            await deleteApi(ids); // 调用传入的删除接口
          })
          .then(() => {
            this.getData(); // 更新数据
            this.$message.success('删除成功');
          })
          .catch(() => {
            // 错误处理
          });
      }
    },
    /** 处理行点击 **/
    handleRowClick(row) {
      this.doAction('row-click', row);
    },
  },
};
