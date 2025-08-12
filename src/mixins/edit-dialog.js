import search from './search';
import dict from './dict';
import { getColumnRules, getPlaceholder, getTableRule, getLabelCode } from '@/utils/pageUtils';

export default {
  mixins: [search, dict],
  data() {
    return {};
  },
  methods: {
    getColumnRules,
    getPlaceholder,
    getTableRule,
    getLabelCode,
    /** 处理行点击 **/
    handleRowClick(row) {
      if (this.pageMode !== 'look') {
        const index = this.detailData[this.detailKey].findIndex(item => item === row);
        console.log('------', index);
        this.editIndex = index;
      } else {
        this.doAction('row-click', { row });
      }
      return;
    },
    /** 处理点击行 **/
    handleClickCeil(index, prop) {
      if (this.pageMode !== 'look') {
        this.editIndex = index;
      }
    },
    /** 处理table checkbox 选中的变化 **/
    handleSelectionChange(val) {
      this.selectionRows = val;
    },
  },
};
