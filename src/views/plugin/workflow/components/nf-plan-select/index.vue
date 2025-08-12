<template>
  <el-dialog
    ref="nf-dialog"
    class="nf-dialog"
    v-model="visible"
    title="现场计划"
    width="60%"
    :before-close="handleClose"
    append-to-body
  >
    <nf-crud
      v-if="isInit && visible"
      :option="option"
      :table-loading="loading"
      :data="data"
      v-model:page="page"
      v-model="form"
      ref="crud"
      @search-change="searchChange"
      @search-reset="searchReset"
      @selection-change="selectionList = $event"
      @current-change="page.currentPage = $event"
      @size-change="page.pageSize = $event"
      @row-click="rowClick"
      @on-load="onLoad"
    >
      <template v-if="checkType == 'radio'" #radio="{ row }">
        <el-radio v-model="form.radio" :label="row.id"><i></i></el-radio>
      </template>
    </nf-crud>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose" size="default">取 消</el-button>
        <el-button type="primary" @click="handleConfirm" size="default">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { getMaterialDetail } from '@/api/system/user';

export default {
  props: {
    modelValue: [String, Number, Object],
    voUrl: {
      type: String,
      default: () => {
        return '/blade-bip/mmr-plan-order/list';
      },
    },
    customOption: Object,
    checkType: {
      type: String,
      default: () => {
        return 'radio';
      },
    },
    fuseorgid: {
      type: String,
      default: () => {
        return '';
      },
    },
  },
  watch: {
    checkType: {
      handler(val) {
        if (val == 'radio') {
          this.option.selection = false;
          this.findObject(this.option.column, 'radio').hide = false;
        } else {
          this.option.selection = true;
          this.findObject(this.option.column, 'radio').hide = true;
        }
      },
      immediate: true,
    },
  },
  computed: {
    fnumbers() {
      let fnumbers = new Set();
      this.selectionList.forEach(ele => {
        fnumbers.add(ele.fnumber);
      });
      return Array.from(fnumbers).join(',');
    },
    names() {
      let names = new Set();
      this.selectionList.forEach(ele => {
        names.add(ele.realName);
      });
      return Array.from(names).join(',');
    },
  },
  data() {
    return {
      isInit: false,
      visible: false,
      form: {},
      query: {},
      loading: false,
      page: {
        planOrderStatus: 'DC_MMR_PLAN_ORDER_STATUS_IP',
        total: 0,
      },
      selectionList: [],
      data: [],
      props: {
        id: 'id',
        name: 'realName',
        records: 'data.data.records',
        total: 'data.data.total',
      },
      option: {
        size: 'default',
        searchSize: 'default',
        align: 'center',
        menu: false,
        addBtn: false,
        header: false,
        border: true,
        tip: false,
        reserveSelection: true,
        highlightCurrentRow: true,
        gutter: 5,
        searchMenuSpan: 6,
        selection: true,
        column: [
          {
            label: '',
            prop: 'radio',
            type: 'radio',
            width: 55,
            hide: true,
          },
          {
            label: '计划单号',
            prop: 'lineCode',
            overHidden: true,
            search: true,
          },
          {
            label: '客户产品',
            prop: 'customerProductName',
            overHidden: true,
            search: true,
          },
          {
            label: '状态',
            prop: 'planOrderStatus',
            type: 'select', // 指定为下拉选择框
            overHidden: true,
            search: true, // 允许在搜索栏使用
            dicData: [
              { value: 'DC_MMR_PLAN_ORDER_STATUS_IP', label: '进行中' },
              { value: 'DC_MMR_PLAN_ORDER_STATUS_PP', label: '待排计划' },
              { value: 'DC_MMR_PLAN_ORDER_STATUS_C', label: '已完成' },
            ],
          },
          {
            label: '厂区',
            prop: 'customerName',
            overHidden: true,
          },
          {
            label: '创建人',
            prop: 'createUserName',
            overHidden: true,
          },
        ],
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (!this.isInit) {
        if (this.customOption) {
          const { column, userProps } = this.customOption;
          if (column) this.option.column = column;
          if (userProps) this.props = userProps;
        }
        this.isInit = true;
      }
    },
    handleConfirm() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      console.log(this.selectionList);

      this.$emit('onConfirm', this.selectionList);
      this.handleClose();
    },
    handleClose(done) {
      // this.selectionClear()
      this.visible = false;
      if (done && typeof done == 'function') done();
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.page.currentPage = 1;
      this.onLoad(this.page, params);
      done();
    },
    selectionClear() {
      this.selectionList = [];
      if (this.$refs.crud) this.$refs.crud.toggleSelection();
    },
    rowClick(row) {
      if (this.checkType == 'radio') {
        this.selectionList = [row];
        this.form.radio = row.id;
      } else this.$refs.crud.toggleSelection([row]);
    },
    async changeDefaultChecked() {
      if (!this.defaultChecked) return;
      let defaultChecked = this.defaultChecked;
      if (this.checkType == 'checkbox') {
        const checks = defaultChecked.split(',');
        if (checks.length > 0) {
          setTimeout(() => {
            checks.forEach(async c => {
              let row = this.data.find(d => d.fnumber == c); // 当前页查找
              if (!row) {
                row = this.selectionList.find(d => d.fnumber == c); // 勾选列表查找
                if (!row) {
                  let res = await getMaterialDetail(c); // 接口查找
                  if (res.data.data) row = res.data.data;
                }
              }
              if (row && this.$refs.crud) this.$refs.crud.toggleRowSelection(row, true);
            });
          }, 500);
        }
      } else {
        let row = this.data.find(d => d.fnumber == defaultChecked.fnumber);
        if (!row) {
          let res = await getMaterialDetail({
            materialCode: defaultChecked.fnumber,
          });
          if (res.data.data) row = res.data.data;
        }

        if (row) {
          this.selectionList = [row];
          this.form.radio = defaultChecked.fnumber;
        } else {
          this.selectionList = [];
          this.form.radio = '';
        }
      }
    },
    onLoad(page, params = {}) {
      this.loading = true;
      const param = {
        currentPage: page.currentPage || 1,
        pageSize: page.pageSize || 10,
        planOrderStatus: page.planOrderStatus || 'DC_MMR_PLAN_ORDER_STATUS_IP',
        ...Object.assign(params, this.query),
      };
      this.$axios.get(this.voUrl, { params: param }).then(res => {
        this.page.total = res.data.data.total;
        this.data = res.data.data.records;
        this.loading = false;
        this.changeDefaultChecked();
      });
    },
  },
};
</script>
<style lang="scss">
.nf-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -40%);
  max-height: calc(100% - 30px);
  max-width: calc(100% - 30px);
  .el-dialog__body {
    flex: 1;
    overflow: auto;
  }
}
</style>
