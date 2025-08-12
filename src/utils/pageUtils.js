import prefixTextMaps from '@/const/modules/prefixTextMaps';

/** 获取列规则 **/
const getColumnRules = (col, scope) => {
  if (col.required || scope?.row?.$edit) {
    return [
      {
        required: true,
        message: `${prefixTextMaps[col.type]}${col.label}`,
        trigger: ['blur', 'input', 'change'],
      },
    ];
  }
  return undefined;
};

/** 获取占位符 **/
const getPlaceholder = col => {
  if (col.is === 'el-input') {
    return `请输入${col.label}`;
  } else if (col.type === 'remote-select') {
    return `请选择${col.label}`;
  } else if (col.type === 'select-price') {
    return `请选择${col.label}`;
  } else {
    return `${col.label}`;
  }
};

/** 获取table的规则 **/
const getTableRule = (columns, _this) => {
  let that = _this;
  return [
    {
      required: true,
      validator(_, value, callback) {
        if (value.length === 0) {
          callback(new Error('明细信息不能为空'));
        } else {
          let findCol = null;
          const findIndex = that.detailData[that.detailKey].findIndex(row => {
            findCol = columns.find(col => {
              return col.required && [null, undefined, ''].includes(row[col.prop]);
            });
            return !!findCol;
          });
          if (findIndex > -1) {
            callback(new Error(`第${findIndex + 1}行${findCol.label}不能为空`));
          } else {
            callback();
          }
        }
      },
      trigger: 'change',
    },
  ];
};

/** 获取 label 的code 是否必填符号 **/
const getLabelCode = col => {
  const result = col.required ? `<span class="label-suffix">*</span>${col.label}` : col.label;
  return result;
};

export { getColumnRules, getPlaceholder, getTableRule, getLabelCode };
