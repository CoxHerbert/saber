<template>
  <basic-container>
    <avue-crud
      :option="option"
      :table-loading="loading"
      :data="data"
      v-model:page="page"
      :permission="permissionList"
      :before-open="beforeOpen"
      v-model="form"
      ref="crud"
      @row-update="rowUpdate"
      @row-save="rowSave"
      @row-del="rowDel"
      @search-change="searchChange"
      @search-reset="searchReset"
      @selection-change="selectionChange"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
      @tree-load="treeLoad"
    >
      <template #menu-left>
        <el-button
          type="danger"
          icon="el-icon-delete"
          plain
          v-if="func.isOperate(this.permission.post_delete)"
          @click="handleDelete"
          >删 除
        </el-button>
      </template>
      <template #category="{ row }">
        <el-tag>{{ row.categoryName }}</el-tag>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import { getList, getListChild, getDetail, add, update, remove } from '@/api/system/post';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import func from '@/utils/func';

export default {
  data() {
    return {
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
        lazy: true,
        tree: true,
        expandColumnIndex: 0,
        height: 'auto',
        calcHeight: 32,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        border: true,
        index: true,
        viewBtn: true,
        selection: true,
        dialogClickModal: true,
        column: [
          {
            label: '所属租户',
            tree: true,
            prop: 'tenantId',
            type: 'tree',
            dicUrl: '/blade-system/tenant/select',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: website.tenantMode,
            span: 24,
            props: {
              label: 'tenantName',
              value: 'tenantId',
            },
            hide: !website.tenantMode,
            rules: [
              {
                required: true,
                message: '请输入所属租户',
                trigger: 'click',
              },
            ],
          },
          // {
          //   label: '岗位类型',
          //   prop: 'category',
          //   type: 'select',
          //   dicUrl: '/blade-system/dict/dictionary?code=post_category',
          //   props: {
          //     label: 'dictValue',
          //     value: 'dictKey',
          //   },
          //   dataType: 'number',
          //   slot: true,
          //   search: true,
          //   rules: [
          //     {
          //       required: true,
          //       message: '请选择岗位类型',
          //       trigger: 'blur',
          //     },
          //   ],
          // },
          {
            label: '岗位名称',
            prop: 'postName',
            search: true,
            rules: [
              {
                required: true,
                message: '请输入岗位名称',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '岗位编号',
            prop: 'postCode',
            search: true,
            rules: [
              {
                required: true,
                message: '请输入岗位编号',
                trigger: 'blur',
              },
            ],
          },
          // {
          //   label: '岗位排序',
          //   prop: 'sort',
          //   type: 'number',
          //   rules: [
          //     {
          //       required: true,
          //       message: '请输入岗位排序',
          //       trigger: 'blur',
          //     },
          //   ],
          // },
          {
            label: '岗位描述',
            prop: 'remark',
            type: 'textarea',
            span: 24,
            minRows: 6,
            hide: true,
          },
        ],
      },
      data: [],
      func,
    };
  },
  computed: {
    ...mapGetters(['permission']),
    permissionList() {
      return {
        addBtn: func.isOperate(this.permission.post_delete),
        viewBtn: this.validData(this.permission.post_view, false),
        delBtn: func.isOperate(this.permission.post_delete),
        editBtn: func.isOperate(this.permission.post_edit),
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
  },
  methods: {
    rowSave(row, done, loading) {
      add(row).then(
        () => {
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          done();
        },
        error => {
          window.console.log(error);
          loading();
        }
      );
    },
    rowUpdate(row, index, done, loading) {
      update(row).then(
        () => {
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          done();
        },
        error => {
          window.console.log(error);
          loading();
        }
      );
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
    beforeOpen(done, type) {
      if (['edit', 'view'].includes(type)) {
        getDetail(this.form.id).then(res => {
          this.form = res.data.data;
        });
      }
      done();
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
    selectionChange(list) {
      this.selectionList = list;
    },
    selectionClear() {
      this.selectionList = [];
      this.$refs.crud.toggleSelection();
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
    },
    refreshChange() {
      this.onLoad(this.page, this.query);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      });
    },
    treeLoad(tree, treeNode, resolve) {
      const parentId = tree.id;
      getListChild({
        parentId,
      }).then(res => {
        resolve(res.data.data);
      });
    },
  },
};
</script>

<style></style>
