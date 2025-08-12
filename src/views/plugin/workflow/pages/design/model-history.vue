<template>
  <nf-container>
    <el-container>
      <el-aside width="200px">
        <nf-category
          @node-click="nodeClick"
          @list-change="findObject(option.column, 'categoryId').dicData = $event"
        ></nf-category>
      </el-aside>
      <el-main style="margin-left: 10px">
        <nf-crud
          :option="option"
          :table-loading="loading"
          :data="data"
          v-model:page="page"
          v-model:search="query"
          v-model="form"
          @row-del="rowDel"
          @search-change="searchChange"
          @search-reset="searchReset"
          @selection-change="selectionChange"
          @current-change="currentChange"
          @size-change="sizeChange"
          @refresh-change="onLoad(page, query)"
        >
          <template #menu-left>
            <el-button
              type="danger"
              size="default"
              icon="el-icon-delete"
              plain
              v-if="permission.wf_design_form_history_delete"
              @click="handleDelete"
            >
              删 除
            </el-button>
          </template>
          <template #menu="{ row }">
            <el-button
              v-if="permission.wf_design_form_history_view"
              text
              type="primary"
              size="default"
              icon="el-icon-view"
              @click="handlePreview(row)"
            >
              预览
            </el-button>
            <el-button
              v-if="permission.wf_design_form_history_main"
              text
              type="primary"
              size="default"
              icon="el-icon-edit"
              @click="handleMain(row)"
            >
              设为主版本
            </el-button>
          </template>
        </nf-crud>
      </el-main>
    </el-container>

    <el-dialog v-model="viewVisible" title="模型预览" destroy-on-close append-to-body>
      <nf-design ref="bpmn" style="height: 500px" :options="viewOption"></nf-design>
    </el-dialog>
  </nf-container>
</template>

<script>
import { getList, remove, setMainVersion } from '../../api/design/model-history';

import { mapGetters } from 'vuex';

import NfCategory from '../../components/nf-category/index.vue';

export default {
  components: { NfCategory },
  data() {
    return {
      formVisible: false,
      options: {},
      form: {},
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      selectionList: [],
      option: {
        size: 'default',
        height: 'auto',
        calcHeight: 30,
        tip: false,
        border: true,
        index: true,
        selection: true,
        addBtn: false,
        editBtn: false,
        delBtn: false,
        dialogType: 'drawer',
        align: 'center',
        searchMenuSpan: 6,
        column: [
          {
            label: '模型key',
            prop: 'modelKey',
            overHidden: true,
            search: true,
          },
          {
            label: '模型名称',
            prop: 'name',
            overHidden: true,
            search: true,
          },
          {
            label: '分类',
            prop: 'categoryId',
            type: 'tree',
            props: {
              label: 'name',
              value: 'id',
            },
            dicData: [],
            rules: [
              {
                required: true,
                message: '请选择分类',
                trigger: 'change',
              },
            ],
          },
          {
            label: '描述',
            prop: 'description',
            overHidden: true,
          },
          {
            label: '版本',
            prop: 'version',
            width: 80,
          },
        ],
      },
      data: [],
      viewVisible: false,
      viewOption: {},
    };
  },
  watch: {
    '$route.params.id': {
      handler(val) {
        this.modelId = val;
        this.onLoad(this.page, this.query);
      },
      immediate: true,
    },
  },
  computed: {
    ...mapGetters(['permission', 'tag']),
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
  },
  methods: {
    nodeClick({ id }) {
      this.categoryId = id;
      this.searchChange(this.query);
    },
    handleMain(row) {
      this.$confirm('当前主版本会自动保存到历史，确定要将此版本设为主版本吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        setMainVersion({ id: row.id }).then(() => {
          this.$message.success('操作成功');
          this.$store.commit('DEL_TAG', this.tag);
          this.$router.push('/plugin/workflow/pages/design/model');
        });
      });
    },
    handlePreview(row) {
      this.viewOption = {
        mode: 'view',
        xml: row.modelXml,
      };
      this.viewVisible = true;
    },
    rowDel(row) {
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return remove(row.id);
        })
        .then(() => {
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
        });
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return remove(this.ids);
        })
        .then(() => {
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          this.$refs.crud.toggleSelection();
        });
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.onLoad(this.page, params);
      if (done) done();
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
      this.onLoad(this.page, this.query);
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
      this.onLoad(this.page, this.query);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      params.modelId = this.modelId;

      if (this.categoryId) params['categoryId'] = this.categoryId;
      else delete params['categoryId'];

      getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
      });
    },
  },
};
</script>

<style></style>
