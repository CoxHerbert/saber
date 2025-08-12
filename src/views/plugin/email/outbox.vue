<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data"
               :page.sync="page"
               :permission="permissionList"
               :before-open="beforeOpen"
               v-model="form"
               ref="crud"
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
                   v-if="permission.outbox_delete"
                   @click="handleDelete">删 除
        </el-button>
      </template>
      <template #toUser="{ row }">
        <el-tag :key="tag" v-for="tag in row.toUsers" >{{tag}}</el-tag>
      </template>
      <template #ccUser="{ row }">
        <el-tag :key="tag" v-for="tag in row.ccUsers" >{{tag}}</el-tag>
      </template>
      <template #bccUser="{ row }">
        <el-tag :key="tag" v-for="tag in row.bccUsers" >{{tag}}</el-tag>
      </template>


      <template #toUser-form="{type,disabled}">
        <input-tags v-model:value="form.toUser" :display="type!='view'"></input-tags>
      </template>
      <template #ccUser-form="{type,disabled}">
        <input-tags v-model:value="form.ccUser" :display="type!='view'"></input-tags>
      </template>
      <template #bccUser-form="{type,disabled}">
        <input-tags v-model:value="form.bccUser" :display="type!='view'"></input-tags>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, remove} from "@/api/plugin/email/outbox";
  import option from "@/option/plugin/email/outbox";
  import inputTags from '@/views/plugin/email/common/inputTags.vue';
  import {mapGetters} from "vuex";
  import func from "@/utils/func";

  export default {
    components: {
      inputTags,
    },
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
          addBtn: this.validData(this.permission.outbox_add, false),
          viewBtn: this.validData(this.permission.outbox_view, false),
          delBtn: this.validData(this.permission.outbox_delete, false),
          editBtn: this.validData(this.permission.outbox_edit, false)
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
    methods: {
      rowSave(row, done, loading) {
        row.attachInfo = JSON.stringify(row.attachInfo);
        add(row).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
          loading();
          window.console.log(error);
        });
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
            const data = res.data.data;
            this.form = data;
            if(func.notEmpty(data.attachInfo)){
              this.form.attachInfo = JSON.parse(data.attachInfo)
            }            
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
      currentChange(currentPage){
        this.page.currentPage = currentPage;
      },
      sizeChange(pageSize){
        this.page.pageSize = pageSize;
      },
      refreshChange() {
        this.onLoad(this.page, this.query);
      },
      onLoad(page, params = {}) {
        const {toUser} = this.query;
        let values = {
          ...params,
          ...this.query
        };
        if (toUser) {
          values = {
            ...values,
            toUser_like: toUser,
          };
          values.toUser = null;
        }
        this.loading = true;
        getList(page.currentPage, page.pageSize, values).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          this.loading = false;
          this.selectionClear();
        }, error => {
          window.console.log(error);
          this.loading = false;
        });
      }
    }
  };
</script>

<style>
</style>
