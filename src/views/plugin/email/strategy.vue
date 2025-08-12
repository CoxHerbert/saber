<template>
  <basic-container>
    <avue-crud  :option="option"
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
                @on-load="onLoad">
      <template #menu-left>
        <el-button type="danger"
                   icon="el-icon-delete"
                   plain
                   v-if="permission.strategy_delete"
                   @click="handleDelete">删 除
        </el-button>
      </template>
      <template #toId="{ row }">
        <el-tag>{{ row.toName }}</el-tag>
      </template>
      <template #ccId="{ row }">
        <el-tag>{{ row.ccName }}</el-tag>
      </template>
      <template #bccId="{ row }">
        <el-tag>{{ row.bccName }}</el-tag>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import {  getList, getDetail, add, update, remove } from "@/api/plugin/email/strategy";
import {  getReceiverList } from "@/api/plugin/email/plataddress";
import {  getPlatList } from "@/api/plugin/email/platfrom";
import option from "@/option/plugin/email/strategy";
import { mapGetters } from "vuex";
import func from "@/utils/func";

export default {
  data() {
    return {
      form: {},
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      selectionList: [],
      option: option,
      data: []
    };
  },
  computed: {
    ...mapGetters(["permission"]),
    permissionList() {
      return {
        addBtn: this.validData(this.permission.strategy_add, false),
        viewBtn: this.validData(this.permission.strategy_view, false),
        delBtn: this.validData(this.permission.strategy_delete, false),
        editBtn: this.validData(this.permission.strategy_edit, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(",");
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      getReceiverList().then(res => {
        const columnToId = this.findObject(this.option.column, "toId");
        const columnBccId = this.findObject(this.option.column, "bccId");
        const columnCcId = this.findObject(this.option.column, "ccId");
        columnToId.dicData = res.data.data;
        columnBccId.dicData = res.data.data;
        columnCcId.dicData = res.data.data;
      });
      getPlatList().then(res => {
        const platMailId = this.findObject(this.option.column, "platMailId");
        platMailId.dicData = res.data.data;
      });
    },
    rowSave(row, loading, done) {
      row.toId = func.join(row.toId);
      row.ccId = func.join(row.ccId);
      row.bccId = func.join(row.bccId);

      add(row).then(
        () => {
          loading();
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        },
        error => {
          done();
          console.log(error);
        }
      );
    },
    rowUpdate(row, index, loading, done) {
      row.toId = func.join(row.toId);
      row.ccId = func.join(row.ccId);
      row.bccId = func.join(row.bccId);
      update(row).then(
        () => {
          loading();
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        },
        error => {
          done();
          console.log(error);
        }
      );
    },
    rowDel(row) {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          return remove(row.id);
        })
        .then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        });
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择至少一条数据");
        return;
      }
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          return remove(this.ids);
        })
        .then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          this.$refs.crud.toggleSelection();
        });
    },
    beforeOpen(done, type) {
      if (["edit", "view"].includes(type)) {
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
      getList(
        page.currentPage,
        page.pageSize,
        Object.assign(params, this.query)
      ).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      });
    }
  }
};
</script>

<style></style>
