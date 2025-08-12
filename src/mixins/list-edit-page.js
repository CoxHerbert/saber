import search from './search';
import dict from './dict';
import unsavedChanges from '@/mixins/unsaved-changes';
import { getColumnRules, getPlaceholder, getTableRule, getLabelCode } from '@/utils/pageUtils';

export default {
  mixins: [search, dict, unsavedChanges],
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      batchSelectRows: [],
      columns: [],
      coordinate: {},
    };
  },
  watch: {
    tableData: {
      handler(newVal, oldVal) {
        // 添加深度比较，只有数据实际变化时才标记为未保存
        // if (!this.isEqual(newVal, oldVal)) {
        this.markAsUnsaved();
        // }
      },
      deep: true,
    },
  },
  beforeUnmount() {
    this.markAsSaved();
  },
  methods: {
    getColumnRules,
    getPlaceholder,
    getTableRule,
    getLabelCode,
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
    handleDeleteCommon(ids, message, deleteApi) {
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
    },
    /** 处理cell点击 **/
    handleCellClick(scoped, col) {
      const { rowIndex, cellIndex } = this.coordinate;
      if (col?.props && col?.props?.disabled) {
        this.coordinate = {};
        return;
      } else if (rowIndex === scoped.$index && cellIndex === scoped?.cellIndex) return;
      else
        this.coordinate = {
          rowIndex: scoped.$index,
          cellIndex: scoped.cellIndex,
        };
    },

    /** 处理cell点击 **/
    getCellBoxClass(scope, col) {
      const { row } = scope;
      const className = [];
      const rowKey = this?.rowKey ? this?.rowKey : 'id';
      if (!!row?.[rowKey] && row[`$${col.prop}`]) {
        className.push('cell-box__edit-row');
      } else if (row[`$${col.prop}`]) {
        className.push('cell-box__add-row');
      }
      if (
        this.coordinate?.rowIndex === scope.$index &&
        scope.cellIndex === this.coordinate?.cellIndex
      ) {
        className.push('cell-box__editing');
      }
      return className;
    },
    /**
     * 检查表格中未填写完成的必填字段
     * @param {Array} data 表格数据（例如 this.detailData[this.detailKey]）
     * @param {Array} columns 表格列配置
     * @param {string} editFlag 编辑标志字段，默认是 '$eidt'
     * @returns {Array} 返回未填写完整的行数组，每项包含行号和未填写字段的 label
     */
    getInvalidRows(data, columns, editFlag = '$eidt') {
      return new Promise((resolve, reject) => {
        if (!Array.isArray(data) || !Array.isArray(columns)) return [];

        const requiredFields = columns
          .filter(col => col.required && col.prop)
          .map(col => ({ prop: col.prop, label: col.label }));

        const result = [];

        data.forEach((item, index) => {
          if (!item[editFlag]) {
            const missing = requiredFields.filter(field => {
              const val = item[field.prop];
              return val === undefined || val === null || val === '';
            });

            if (missing.length > 0) {
              result.push({
                rowIndex: index + 1,
                missing: missing.map(f => f.label),
              });
            }
          }
        });
        if (!result.length) {
          resolve();
        } else {
          const msgs = result
            .map(item => {
              return `<div>第${item.rowIndex}行，字段未填写：${item.missing.join('、')}</div>`;
            })
            .join('');
          this.$alert(
            `<div style="color: red;">
                ${msgs}
              </div>`,
            '校验失败',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确定',
              customClass: 'custom-alert-box',
            }
          );
          reject();
        }
      });
    },
  },
};
