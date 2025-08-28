import ExportJsonExcel from 'js-export-excel';

/**
 * Excel导出工具
 * @param {Object} options - 导出配置
 * @param {string} options.filename - 文件名，默认：导出数据_日期
 * @param {Array} options.sheets - 工作表配置数组
 * @param {Array} options.sheets[].data - 工作表数据
 * @param {string} options.sheets[].name - 工作表名称，默认：Sheet1, Sheet2...
 * @param {Array} options.sheets[].fields - 导出字段配置
 * @param {string} options.sheets[].fields[].key - 数据对象的属性名
 * @param {string} options.sheets[].fields[].title - 表头显示文本
 * @param {Function} [options.sheets[].formatter] - 数据格式化函数
 * @returns {boolean} 导出是否成功
 */
export const exportExcel = (options) => {
  try {
    // 默认配置
    const defaultFilename = `导出数据_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    
    // 处理工作表配置
    const sheets = options.sheets.map((sheet, index) => {
      // 处理字段映射
      const sheetFilter = sheet.fields.map(field => field.key);
      const sheetHeader = sheet.fields.map(field => field.title);
      
      // 处理数据格式化
      let sheetData = [...sheet.data];
      if (sheet.formatter && typeof sheet.formatter === 'function') {
        sheetData = sheet.formatter(sheetData);
      }
      
      return {
        sheetData,
        sheetName: sheet.name || `Sheet${index + 1}`,
        sheetFilter,
        sheetHeader
      };
    });
    
    // 创建导出实例
    const exportOptions = {
      fileName: options.filename || defaultFilename,
      datas: sheets
    };
    
    new ExportJsonExcel(exportOptions).saveExcel();
    return true;
  } catch (error) {
    console.error('Excel导出失败:', error);
    return false;
  }
};

/**
 * 创建单工作表的快捷导出函数
 * @param {Object} options - 单表导出配置
 * @param {Array} options.data - 导出数据
 * @param {Array} options.fields - 字段配置
 * @param {string} [options.filename] - 文件名
 * @param {string} [options.sheetName] - 工作表名
 * @param {Function} [options.formatter] - 数据格式化函数
 * @returns {boolean} 导出是否成功
 */
export const exportSingleSheetExcel = (options) => {
  return exportExcel({
    filename: options.filename,
    sheets: [{
      data: options.data,
      name: options.sheetName || '数据列表',
      fields: options.fields,
      formatter: options.formatter
    }]
  });
};