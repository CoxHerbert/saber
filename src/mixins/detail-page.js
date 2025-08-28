import search from './search';
import dict from './dict';
import unsavedChanges from './unsaved-changes';
import { getColumnRules, getPlaceholder, getTableRule, getLabelCode } from '@/utils/pageUtils';

export default {
  mixins: [search, dict, unsavedChanges],
  data() {
    return {
      loading: false,
      detailId: '',
      pageMode: 'edit',
      boxWidth: 0,
      editIndex: null,
      detailData: {},
      selectionRows: [],
      columns: [],
      expand: {
        basic: true,
      },
    };
  },
  watch: {
    detailData: {
      handler(newVal) {
        if (Object.keys(newVal).length > 1) {
          // this.markAsUnsaved();
        }
      },
      deep: true,
    },
  },
  computed: {
    pageRenderSize() {
      if (this.boxWidth < 800) {
        return 'render-small';
      } else if (this.boxWidth >= 800 && this.boxWidth < 1200) {
        return 'render-middle';
      } else {
        return 'render-large';
      }
    },
  },
  created() {
    const { id, type } = this.$route.query;
    if (id) this.detailId = id;
    this.pageMode = type;
    this.expand[this.detailKey] = true;
    this.removeResize();
  },
  mounted() {
    this.addResize();
  },
  methods: {
    getColumnRules,
    getPlaceholder,
    getTableRule,
    getLabelCode,
    /** 删除 resize **/
    removeResize() {
      const box = this.$el;
      if (box) {
        this.$erd.uninstall(box);
      }
    },
    /** 添加 resize **/
    addResize() {
      const box = this.$el;
      if (box) {
        this.$erd.listenTo(box, element => {
          this.boxWidth = element.scrollWidth;
        });
      }
    },
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
    /** 切换展开或者关闭 **/
    toggleExpand(key, status) {
      this.expand[key] = !!status;
    },
    /** 返回上一页 **/
    close() {
      this.$router.go(-1);
    },
  },
};
