<template>
  <basic-container>
    <avue-crud
      :option="option"
      :table-loading="loading"
      :data="data"
      :page.sync="page"
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
    >
      <template #menu-left>
        <el-button
          type="danger"
          icon="el-icon-delete"
          plain
          v-if="permission.platfrom_delete"
          @click="handleDelete"
          >删 除
        </el-button>
      </template>
      <template slot-scoped="{ row }" slot="status">
        <el-tag>{{ row.statusName }}</el-tag>
      </template>

      <template #menu="scoped">
        <el-button
          type="text"
          icon="el-icon-video-play"
          v-if="permission.platfrom_debug"
          @click="handleDebug(scoped.row)"
          >调试
        </el-button>
        <el-button
          type="text"
          icon="el-icon-circle-check"
          v-if="permission.platfrom_enable"
          @click.stop="handleEnable(scoped.row)"
          >启用
        </el-button>
        <el-button
          type="text"
          icon="el-icon-document-copy"
          v-if="permission.platfrom_copy"
          plain
          class="none-border"
          @click.stop="handleCopy(scoped.row)"
          >复制
        </el-button>
      </template>
    </avue-crud>
    <el-dialog title="发送调试" append-to-body v-model="box" width="550px">
      <avue-form :option="debugOption" v-model="debugForm" @submit="handleSend" />
    </el-dialog>
  </basic-container>
</template>

<script>
import {
  getList,
  getDetail,
  add,
  update,
  remove,
  copy,
  enable,
  sendMsg,
} from '@/api/plugin/email/platfrom';
import option from '@/option/plugin/email/platfrom';
import { mapGetters } from 'vuex';
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
      option: option,
      data: [],
      box: false,
      debugForm: {
        id: '',
      },
      debugOption: {
        submitText: '发送',
        column: [
          {
            label: '收件人',
            prop: 'toUser',
            span: 24,
          },
        ],
      },
    };
  },
  computed: {
    ...mapGetters(['permission']),
    permissionList() {
      return {
        addBtn: this.validData(this.permission.platfrom_add, false),
        viewBtn: this.validData(this.permission.platfrom_view, false),
        delBtn: this.validData(this.permission.platfrom_delete, false),
        editBtn: this.validData(this.permission.platfrom_edit, false),
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
  watch: {
    'form.enableSsl'(val) {
      if (func.notEmpty(val)) {
        this.form.port = val === 1 ? '25' : '465';
      }
    },
  },
  methods: {
    handleDebug(row) {
      this.box = true;
      this.debugForm.id = row.id;
    },
    handleSend(form, done, loading) {
      sendMsg(form.id, form.toUser).then(
        res => {
          this.$message({
            type: 'success',
            message: '发送成功!',
          });
          this.box = false;
        },
        error => {
          window.console.log(error);
          loading();
        }
      );
      done();
    },
    rowSave(row, loading, done) {
      add(row).then(
        () => {
          loading();
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
        },
        error => {
          done();
          console.log(error);
        }
      );
    },
    rowUpdate(row, index, loading, done) {
      update(row).then(
        () => {
          loading();
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
        },
        error => {
          done();
          console.log(error);
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
    handleCopy(row) {
      copy(row.id).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '复制成功!',
        });
      });
    },
    handleEnable(row) {
      this.$confirm('是否确定启用这条配置?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return enable(row.id);
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
  },
};
</script>

<style></style>
