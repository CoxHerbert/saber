<template>
  <nf-container>
    <nf-crud
      :option="option"
      :table-loading="loading"
      :data="data"
      v-model:page="page"
      :permission="permissionList"
      v-model="form"
      ref="crud"
      @row-del="rowDel"
      @search-change="searchChange"
      @search-reset="searchReset"
      @selection-change="selectionChange"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >
      <template #datetime="{ row }">
        <span v-if="row.datetime"
          >{{ row.datetime.split(',')[0] }} ~ {{ row.datetime.split(',')[1] }}</span
        >
      </template>
      <template #menu-left>
        <el-button
          type="primary"
          size="default"
          icon="el-icon-plus"
          @click="dynamicRoute({ processDefKey }, 'start')"
        >
          创 建
        </el-button>
        <el-button
          type="danger"
          size="default"
          icon="el-icon-delete"
          plain
          v-if="permission.wf_demo_leave_delete"
          @click="handleDelete"
        >
          删 除
        </el-button>
      </template>
      <template #menu="{ row }">
        <el-button
          v-if="row.status != '18'"
          text
          type="primary"
          size="default"
          icon="el-icon-info-filled"
          @click="handleDetail(row)"
        >
          详情
        </el-button>
        <el-button
          v-if="row.status != '18'"
          text
          type="primary"
          size="default"
          icon="el-icon-search"
          @click="handleFlow(row)"
        >
          流程图
        </el-button>
      </template>
    </nf-crud>

    <el-drawer
      v-model="detailVisible"
      :title="form.processDefinitionName"
      class="nf-drawer"
      size="60%"
      append-to-body
    >
      <task-detail
        v-if="detailVisible"
        :taskId="form.taskId"
        :processInstanceId="form.processInsId"
      ></task-detail>
    </el-drawer>

    <el-dialog
      v-model="bpmnVisible"
      append-to-body
      destroy-on-close
      title="流程图"
      width="70%"
      class="nf-dialog"
    >
      <nf-design ref="bpmn" style="height: 60vh" :options="bpmnOption"></nf-design>
    </el-dialog>
  </nf-container>
</template>

<script>
import { getList, remove } from '../../../api/demo/leave';
import { detail } from '../../../api/process/process';
import { mapGetters } from 'vuex';

import exForm from '../../../mixins/ex-form';
import statusDic from '../../../utils/status';
import TaskDetail from '../../ops/detail.vue';

export default {
  mixins: [exForm],
  components: { TaskDetail },
  data() {
    return {
      processDefKey: 'leave',
      detailVisible: false,
      bpmnVisible: false,
      bpmnOption: {},
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
        height: 'auto',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        border: true,
        index: true,
        viewBtn: false,
        addBtn: false,
        editBtn: false,
        selection: true,
        size: 'default',
        searchSize: 'default',
        align: 'center',
        searchIndex: 3,
        searchIcon: true,
        menuWidth: 260,
        column: [
          {
            label: '创建人',
            prop: 'creator',
            search: true,
            type: 'tree',
            dicUrl: '/blade-system/user/list?size=-1',
            props: {
              label: 'name',
              value: 'id',
              desc: 'deptName',
            },
            dicFormatter: res => {
              return res.data.data.records;
            },
          },
          {
            label: '创建部门',
            prop: 'creatorDept',
            search: true,
            type: 'tree',
            dicUrl: '/blade-system/dept/lazy-list?parentId={{key}}',
            props: {
              label: 'deptName',
              value: 'id',
            },
            lazy: true,
            treeLoad: (node, resolve) => {
              let id = 0;
              if (node.level != 0) {
                id = node.data.id;
              }
              this.$http.get(`/blade-system/dept/lazy-list?parentId=${id}`).then(res => {
                resolve(res.data.data);
              });
            },
          },
          {
            label: '时间范围',
            prop: 'datetime',
            width: 260,
            overHidden: true,
          },
          {
            label: '请假天数',
            prop: 'days',
            width: 90,
            overHidden: true,
            search: true,
          },
          {
            label: '请假理由',
            prop: 'reason',
            overHidden: true,
            search: true,
          },
          {
            label: '附件',
            prop: 'attachment',
            type: 'upload',
            overHidden: true,
          },
          {
            label: '创建时间',
            prop: 'createTime',
            width: 150,
            overHidden: true,
          },
          {
            label: '当前节点',
            prop: 'currentNode',
            search: true,
          },
          {
            label: '状态',
            prop: 'status',
            type: 'select',
            dicData: statusDic,
            search: true,
          },
        ],
      },
      data: [],
    };
  },
  computed: {
    ...mapGetters(['permission']),
    permissionList() {
      return {
        addBtn: this.validData(this.permission.wf_demo_leave_add, false),
        viewBtn: this.validData(this.permission.wf_demo_leave_view, false),
        delBtn: this.validData(this.permission.wf_demo_leave_delete, false),
        editBtn: this.validData(this.permission.wf_demo_leave_edit, false),
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
    handleDetail(row) {
      this.dynamicRoute({ ...row, processInstanceId: row.processInsId }, 'detail', true).then(
        () => {
          this.form = { ...row };
          this.detailVisible = true;
        }
      );
    },
    handleFlow(row) {
      const { processInsId } = row;
      detail({ processInsId }).then(res => {
        const { process, flow } = res.data.data;

        this.bpmnOption = {
          mode: 'view',
          xml: process.xml,
          flows: this.handleResolveFlows(flow),
        };

        this.bpmnVisible = true;
      });
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
      if (params.creator) {
        params.createUser = params.creator;
        delete params.creator;
      }
      if (params.creatorDept) {
        params.createDept = params.creatorDept;
        delete params.creatorDept;
      }
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
