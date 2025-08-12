<template>
  <basic-container>
    <avue-crud
      :option="option"
      :table-loading="loading"
      :data="data"
      ref="crud"
      v-model="form"
      :permission="permissionList"
      :before-open="beforeOpen"
      @row-del="rowDel"
      @row-update="rowUpdate"
      @row-save="rowSave"
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
          v-if="func.isOperate(permission.role_delete)"
          plain
          @click="handleDelete"
          >删 除
        </el-button>
        <el-button
          icon="el-icon-setting"
          @click="handleRole"
          v-if="userInfo.role_name.includes('admin')"
          plain
          >权限设置
        </el-button>
        <!-- <el-button icon="el-icon-setting" @click="handleRoleBindUsers" plain
          >批量人员绑定
        </el-button> -->
      </template>
      <template #roleCategory-form="scoped">
        <el-select v-model="form[scoped.column.prop]" placeholder="请选择角色类别" clearable>
          <el-option
            v-for="(op, i) in dictMaps.DC_ROLE_CATEGORY || []"
            :key="i"
            :label="op.dictValue"
            :value="op.dictKey"
          ></el-option>
        </el-select>
      </template>
      <template #roleCategory="scoped">
        {{
          scoped.row.roleCategory
            ? dictMaps.DC_ROLE_CATEGORY.find(item => item.dictKey === scoped.row.roleCategory)
                ?.dictValue
            : '-'
        }}
      </template>
      <template #option="scoped">
        <!-- 
         // addBtn: true,
        // viewBtn: true,
        // delBtn: true,
        // editBtn: true,
        -->
        <el-button
          v-if="permissionList.viewBtn"
          type="text"
          icon="view"
          @click="doAction('view', scoped.row)"
          >查看</el-button
        >
        <el-button
          v-if="permissionList.editBtn"
          type="text"
          icon="edit"
          @click="doAction('edit', scoped.row)"
          >编辑</el-button
        >
        <el-button
          v-if="permissionList.delBtn"
          type="text"
          icon="delete"
          @click="doAction('delete', scoped.row)"
          >删除</el-button
        >
        <el-button type="text" icon="setting" @click="doAction('bindUser', scoped.row)"
          >批量绑定人员</el-button
        >
      </template>
    </avue-crud>
    <el-dialog title="角色权限配置" append-to-body v-model="box" width="345px">
      <el-tabs type="border-card">
        <el-tab-pane label="菜单权限">
          <el-tree
            :data="menuGrantList"
            show-checkbox
            node-key="id"
            ref="treeMenu"
            :default-checked-keys="menuTreeObj"
            :props="props"
          >
          </el-tree>
        </el-tab-pane>
        <el-tab-pane label="数据权限">
          <el-tree
            :data="dataScopeGrantList"
            show-checkbox
            node-key="id"
            ref="treeDataScope"
            :default-checked-keys="dataScopeTreeObj"
            :props="props"
          >
          </el-tree>
        </el-tab-pane>
        <el-tab-pane label="接口权限">
          <el-tree
            :data="apiScopeGrantList"
            show-checkbox
            node-key="id"
            ref="treeApiScope"
            :default-checked-keys="apiScopeTreeObj"
            :props="props"
          >
          </el-tree>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="box = false">取 消</el-button>
          <el-button type="primary" @click="submit" v-permission="{ id: 'role_edit' }"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <roleBindUserDialog ref="roleBindDialogRef" v-bind="roleBindUserProps" />
  </basic-container>
</template>

<script>
import {
  add,
  getList,
  getRole,
  getRoleTreeById,
  grant,
  grantTree,
  remove,
  update,
} from '@/api/system/role';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import func from '@/utils/func';
import roleBindUserDialog from './role-bind-user-dialog.vue';

export default {
  components: {
    roleBindUserDialog,
  },
  data() {
    return {
      settingFormData: {},
      dictMaps: {
        DC_ROLE_CATEGORY: [],
      },
      roleBindUserProps: {
        roleId: '',
        title: '角色批量绑定用户',
      },
      form: {},
      box: false,
      props: {
        label: 'title',
        value: 'key',
      },
      menuGrantList: [],
      dataScopeGrantList: [],
      apiScopeGrantList: [],
      apiGrantList: [],
      menuTreeObj: [],
      dataScopeTreeObj: [],
      apiScopeTreeObj: [],
      selectionList: [],
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      option: {
        tip: false,
        simplePage: true,
        searchShow: true,
        searchMenuSpan: 6,
        tree: true,
        menu: false,
        border: true,
        index: true,
        selection: true,
        viewBtn: true,
        dialogWidth: 900,
        dialogClickModal: true,
        column: [
          {
            label: '角色名称',
            prop: 'roleName',
            search: true,
            span: 24,
            rules: [
              {
                required: true,
                message: '请输入角色名称',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '所属租户',
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
            search: website.tenantMode,
            rules: [
              {
                required: true,
                message: '请输入所属租户',
                trigger: 'click',
              },
            ],
          },
          {
            label: '角色别名',
            prop: 'roleAlias',
            search: true,
            span: 24,
            rules: [
              {
                required: true,
                message: '请输入角色别名',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '上级角色',
            prop: 'parentId',
            dicData: [],
            type: 'tree',
            hide: true,
            span: 24,
            props: {
              label: 'title',
            },
            rules: [
              {
                required: false,
                message: '请选择上级角色',
                trigger: 'click',
              },
            ],
          },
          {
            label: '角色排序',
            prop: 'sort',
            type: 'number',
            span: 24,
            rules: [
              {
                required: true,
                message: '请输入角色排序',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '角色类别',
            prop: 'roleCategory',
          },
          {
            label: '操作',
            prop: 'option',
            align: 'center',
            width: '340px',
            slot: true,
            editDisplay: false, // 编辑时显示
            addDisplay: false, // 新增时显示（可选）
          },
        ],
      },
      data: [],
      func,
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'permission']),
    permissionList() {
      return {
        addBtn: func.isOperate(this.permission.role_add),
        viewBtn: func.isOperate(this.permission.role_view),
        delBtn: func.isOperate(this.permission.role_delete),
        editBtn: func.isOperate(this.permission.role_edit),
        // addBtn: true,
        // viewBtn: true,
        // delBtn: true,
        // editBtn: true,
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    idsArray() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids;
    },
  },
  mounted() {
    this.getDict();
  },
  methods: {
    async getDict() {
      const res = await this.getMultipleDict('DC_ROLE_CATEGORY');

      this.dictMaps = {
        ...this.dictMaps,
        ...(res || {}),
      };
    },
    handleRoleBindUsers(row) {
      this.roleBindUserProps.title = `${row.roleName}-批量绑定用户`;
      this.roleBindUserProps.roleId = row.id;
      setTimeout(() => {
        this.$refs.roleBindDialogRef.show();
      }, 30);
    },
    initData(roleId) {
      getRoleTreeById(roleId).then(res => {
        const column = this.findObject(this.option.column, 'parentId');
        column.dicData = res.data.data;
      });
    },
    submit() {
      const menuList = this.$refs.treeMenu.getCheckedKeys();
      const dataScopeList = this.$refs.treeDataScope.getCheckedKeys();
      const apiScopeList = this.$refs.treeApiScope.getCheckedKeys();
      grant(this.idsArray, menuList, dataScopeList, apiScopeList, null, this.settingFormData).then(
        () => {
          this.box = false;
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          this.onLoad(this.page);
        }
      );
    },
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
    beforeOpen(done, type) {
      if (['add', 'edit'].includes(type)) {
        this.initData(this.form.id);
      }
      done();
    },
    handleRole() {
      if (this.selectionList.length !== 1) {
        this.$message.warning('只能选择一条数据');
        return;
      }
      this.menuTreeObj = [];
      this.dataScopeTreeObj = [];
      this.apiScopeTreeObj = [];
      grantTree().then(res => {
        this.menuGrantList = res.data.data.menu;
        this.dataScopeGrantList = res.data.data.dataScope;
        this.apiScopeGrantList = res.data.data.apiScope;
        getRole(this.ids).then(res => {
          this.menuTreeObj = res.data.data.menu;
          this.dataScopeTreeObj = res.data.data.dataScope;
          this.apiScopeTreeObj = res.data.data.apiScope;
          this.settingFormData = {};
          this.box = true;
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
        this.data = res.data.data;
        this.loading = false;
        this.selectionClear();
      });
    },
    doAction(action, row) {
      const tableRef = this.$refs.crud;
      if (action === 'view') {
        tableRef.rowView(row);
      } else if (action === 'edit') {
        tableRef.rowEdit(row);
      } else if (action === 'delete') {
        this.rowDel(row);
      } else if (action === 'bindUser') {
        this.handleRoleBindUsers(row);
      }
    },
  },
};
</script>
