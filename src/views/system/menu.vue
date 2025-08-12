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
      :before-close="beforeClose"
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
      @tree-load="treeLoad"
    >
      <template #name-label="scoped">
        {{ form.category === 2 ? '按钮名称' : scoped.column.label }}
      </template>

      <template #source-label="scoped">
        {{ form.category === 2 ? '按钮图标' : scoped.column.label }}
      </template>
      <template #code-label="scoped">
        {{ form.category === 2 ? '按钮编号' : scoped.column.label }}
      </template>
      <template #alias-label="scoped">
        {{ form.category === 2 ? '按钮别名' : scoped.column.label }}
      </template>
      <template #sort-label="scoped">
        {{ form.category === 2 ? '按钮排序' : scoped.column.label }}
      </template>
      <template #id-label="scoped">
        {{ form.category === 2 ? '按钮ID' : scoped.column.label }}
      </template>
      <template #remark-label="scoped">
        {{ form.category === 2 ? '按钮备注' : scoped.column.label }}
      </template>
      <template #category-form="scoped">
        <el-radio-group v-model="form.category">
          <el-radio
            v-for="(op, j) in scoped.column.dicData || []"
            :key="j"
            :value="op.value"
            :disabled="op.value === 2 && form.parentId === '0'"
            size="large"
            >{{ op.label }}</el-radio
          >
        </el-radio-group>
      </template>
      <template #btnType-form="scoped">
        <el-radio-group
          :disabled="!(form.category === 2)"
          v-model="form.btnType"
          @change="handleBtnTypeChange"
        >
          <el-radio
            v-for="(op, j) in dictData[scoped.column.dicKey] || []"
            :key="j"
            :value="op.dictKey"
            size="large"
            >{{ op.dictValue }}</el-radio
          >
        </el-radio-group>
      </template>
      <template #dataPromissionType-form="scoped">
        <el-checkbox-group
          :disabled="!(form.btnType && form.btnType === 'DC_MENU_BTN_TYPE_DATA')"
          v-model="form.dataPromissionType"
          @change="handleDataPromissionTypeChange"
        >
          <el-checkbox
            v-for="(op, j) in dictData[scoped.column.dicKey] || []"
            :key="j"
            :label="op.dictValue"
            :value="op.dictKey"
          ></el-checkbox>
        </el-checkbox-group>
      </template>
      <template #dataPromissionDeptType-form="scoped">
        <el-radio-group
          :disabled="!form.dataPromissionType?.includes('DC_MENU_DATA_PROMISSION_TYPE_DEPT')"
          v-model="form.dataPromissionDeptType"
        >
          <el-radio
            v-for="(op, j) in dictData[scoped.column.dicKey] || []"
            :key="j"
            :value="op.dictKey"
            size="large"
            >{{ op.dictValue }}</el-radio
          >
        </el-radio-group>
      </template>
      <template #sopDocPath-form="scoped">
        <el-select
          v-model="form.sopDocPath"
          filterable
          :disabled="form.category && form.category != 1"
          remote
          clearable
          :remote-method="getSopInfoList"
          :loading="sopLoading"
          placeholder="请输入关键字查询"
          @change="handleSopInfoChange"
        >
          <el-option
            v-for="(op, i) in dictData[scoped.column.dicKey] || []"
            :label="op.label"
            :value="op.value"
            >{{ op.label }}({{ op.value }})</el-option
          >
        </el-select>
      </template>
      <template #menu-left>
        <el-button
          type="danger"
          icon="el-icon-delete"
          v-if="func.isOperate(permission.menu_delete)"
          plain
          @click="handleDelete"
          >删 除
        </el-button>
      </template>
      <template #menu="scoped">
        <el-button
          type="primary"
          text
          icon="el-icon-plus"
          @click.stop="handleAdd(scoped.row, scoped.index)"
          v-if="userInfo.role_name.includes('admin') && scoped.row.category === 1"
          >新增子项
        </el-button>
      </template>
      <template #name="{ row }">
        <i :class="row.source" style="margin-right: 5px" />
        <span>{{ row.name }}</span>
      </template>
      <template #source="{ row }">
        <div style="text-align: center">
          <i :class="row.source" />
        </div>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import { getLazyList, remove, update, add, getMenu } from '@/api/system/menu';
import { mapGetters } from 'vuex';
import iconList from '@/config/iconList';
import func from '@/utils/func';
import { getMenuTree } from '@/api/system/menu';
import gql from 'graphql-tag';

export default {
  data() {
    return {
      apolloClient_: null,
      sopLoading: true,

      dictData: {},
      form: {
        dataPromissionType: [],
        dataPromissionDeptType: '',
      },
      query: {},
      loading: true,
      selectionList: [],
      parentId: 0,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      option: {
        lazy: true,
        tip: false,
        simplePage: true,
        searchShow: true,
        searchMenuSpan: 6,
        dialogWidth: '800',
        tree: true,
        border: true,
        index: true,
        selection: true,
        viewBtn: true,
        menuWidth: 320,
        dialogClickModal: true,
        column: [
          {
            label: '节点类型',
            prop: 'category',
            type: 'radio',
            dicData: [
              {
                label: '菜单',
                value: 1,
              },
              {
                label: '按钮',
                value: 2,
              },
            ],
            hide: true,
            rules: [
              {
                required: true,
                message: '请选择菜单类型',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '菜单名称',
            prop: 'name',
            width: 300,
            search: true,
            rules: [
              {
                required: true,
                message: '请输入菜单名称',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '路由类型',
            prop: 'routeType',
            type: 'select',
            dicUrl: '/blade-system/dict/dictionary?code=menu_route_type',
            props: {
              label: 'dictValue',
              value: 'dictKey',
            },
            rules: [
              {
                required: true,
                message: '请输入路由类型',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '路由地址',
            prop: 'path',
            rules: [
              {
                required: true,
                message: '请输入路由地址',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '上级菜单',
            prop: 'parentId',
            type: 'tree',
            dicData: [],
            hide: true,
            addDisabled: false,
            props: {
              label: 'title',
            },
            rules: [
              {
                required: false,
                message: '请选择上级菜单',
                trigger: 'click',
              },
            ],
          },
          {
            label: '菜单图标',
            prop: 'source',
            type: 'icon',
            slot: true,
            iconList: iconList,
            rules: [
              {
                required: true,
                message: '请输入菜单图标',
                trigger: 'click',
              },
            ],
          },
          {
            label: '菜单编号',
            prop: 'code',
            search: true,
            rules: [
              {
                required: true,
                message: '请输入菜单编号',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '展示类型',
            type: 'select',
            dicUrl: '/blade-system/dict/dictionary?code=menu_display_type',
            props: {
              label: 'dictValue',
              value: 'dictKey',
            },
            // dataType: 'number',
            // width: 120,
            prop: 'displayType',
            // slot: true,
            hide: true,
            rules: [
              {
                required: true,
                message: '请选择菜单类型',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '菜单别名',
            prop: 'alias',
            search: true,
            rules: [
              {
                required: true,
                message: '请输入菜单别名',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '是否缓存',
            prop: 'isOpen',
            type: 'radio',
            hide: true,
            dicData: [
              {
                label: '否',
                value: 1,
              },
              {
                label: '是',
                value: 2,
              },
            ],
            value: 1,
            rules: [
              {
                required: true,
                message: '请选择新窗口打开',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '菜单排序',
            prop: 'sort',
            type: 'number',
            rules: [
              {
                required: true,
                message: '请输入菜单排序',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '菜单ID',
            prop: 'id',
            type: 'input',
            hide: true,
            disabled: true,
          },
          {
            label: '按钮类型',
            prop: 'btnType',
            type: 'radio',
            dicKey: 'DC_MENU_BTN_TYPE',
            rules: [
              {
                required: true,
                message: '请选择按钮类型',
                trigger: 'blur',
              },
            ],
            span: 12,
            hide: true,
          },
          {
            label: '数据权限',
            prop: 'dataPromissionType',
            type: 'checkbox',
            dicKey: 'DC_MENU_DATA_PROMISSION_TYPE',
            span: 12,
            hide: true,
          },
          {
            label: '数据授权',
            prop: 'dataPromissionDeptType',
            type: 'radio',
            dicKey: 'DC_MENU_PROMISSION_DEPT_TYPE',
            span: 12,
            hide: true,
          },
          {
            label: '菜单备注',
            prop: 'remark',
            type: 'textarea',
            span: 24,
            minRows: 2,
            hide: true,
          },
          {
            label: 'SOP文档',
            prop: 'sopDocPath',
            type: 'select',
            dicKey: 'sopInfoList',
          },
        ],
      },
      data: [],
      func,
    };
  },
  watch: {
    'form.category'() {
      const category = func.toInt(this.form.category);
      this.$refs.crud.option.column.filter(item => {
        if (category === 2) {
          this.form.displayType = '';
          this.form.sopDocId = '';
          this.form.sopDocName = '';
          this.form.sopDocPath = '';
        }
        if (item.prop === 'path') {
          item.rules[0].required = category === 1;
        }
        if (item.prop === 'isOpen') {
          item.disabled = category === 2;
        }

        if (category === 2) {
          if (['routeType', 'path', 'source'].includes(item.prop)) {
            this.form[item.prop] = '';
          }
        } else if (category === 1) {
          if (['dataPromissionDeptType', 'dataPromissionType', 'btnType'].includes(item.prop)) {
            this.form[item.prop] = '';
          }
        }
        if (['dataPromissionDeptType', 'dataPromissionType', 'btnType'].includes(item.prop)) {
          item.editDisplay = category === 2;
          item.addDisplay = category === 2;
        }
        if (['routeType', 'path', 'source', 'sopDocPath', 'displayType'].includes(item.prop)) {
          item.editDisplay = category === 1;
          item.addDisplay = category === 1;
        }
      });
    },
  },
  computed: {
    ...mapGetters(['userInfo', 'permission']),
    permissionList() {
      return {
        addBtn: func.isOperate(this.permission.menu_add),
        viewBtn: func.isOperate(this.permission.menu_view),
        delBtn: func.isOperate(this.permission.menu_delete),
        editBtn: func.isOperate(this.permission.menu_edit),
        // // 临时放开
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
  },
  async beforeMount() {
    this.apolloClient_ = await this.apolloClient();
    await this.getDictData();
    await this.getSopInfoList('');
  },
  methods: {
    handleSopInfoChange(val) {
      this.getSopIdByPath(val);
    },
    async getSopInfoList(queryString) {
      this.sopLoading = true;

      const result = await this.apolloClient_.query({
        query: gql`
          query ($query: String!) {
            pages {
              search(query: $query) {
                results {
                  path
                  title
                }
              }
            }
          }
        `,
        variables: {
          // 传递实际参数值
          query: queryString, // 键名需与查询中的变量名一致
        },
      });

      const options = result.data.pages.search.results;

      this.dictData = {
        ...this.dictData,
        sopInfoList: options.map(op => {
          return {
            label: op.title,
            value: op.path,
          };
        }),
      };
      this.sopLoading = false;
    },
    async getSopIdByPath(pathString) {
      const result = await this.apolloClient_.query({
        query: gql`
          query ($path: String, $locale: String!) {
            pages {
              tree(path: $path, mode: ALL, locale: $locale, includeAncestors: false) {
                id
                path
                title
                isFolder
                pageId
                parent
                locale
              }
            }
          }
        `,
        variables: {
          path: pathString,
          locale: 'zh',
        },
      });
      const data = result.data.pages.tree?.find(d => d.path === pathString);
      if (!data) {
        this.$message.error('获取文档id失败');
        this.form.sopDocPath = '';
      } else {
        this.form.sopDocId = data.pageId;
        this.form.sopDocName = data.title;
        // this.form.sopDocPath = data.path;
      }
    },
    async getDictData() {
      const res = await this.getMultipleDict(
        'DC_MENU_BTN_TYPE,DC_MENU_DATA_PROMISSION_TYPE,DC_MENU_PROMISSION_DEPT_TYPE'
      );

      this.dictData = {
        ...this.dicData,
        ...(res || {}),
      };
    },
    initData() {
      getMenuTree().then(res => {
        const column = this.findObject(this.option.column, 'parentId');
        column.dicData = res.data.data;
      });
    },
    handleBtnTypeChange(value) {
      // 常规
      if (value === 'DC_MENU_BTN_TYPE_NORMAL') {
        this.form.dataPromissionDeptType = '';
        this.form.dataPromissionType = [];
      }
    },
    handleDataPromissionTypeChange(value) {
      if (!(value && value.includes('DC_MENU_DATA_PROMISSION_TYPE_DEPT'))) {
        this.form.dataPromissionDeptType = '';
      }
    },
    handleAdd(row) {
      this.parentId = row.id;
      const column = this.findObject(this.option.column, 'parentId');
      column.value = row.id;
      column.addDisabled = true;
      this.$refs.crud.rowAdd();
    },
    rowSave(row, done, loading) {
      add({
        ...row,
        dataPromissionType: Array.isArray(row.dataPromissionType)
          ? row.dataPromissionType?.join(',')
          : row.dataPromissionType,
      }).then(
        res => {
          // 获取新增数据的相关字段
          const data = res.data.data;
          row.id = data.id;
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          // 数据回调进行刷新
          done(row);
        },
        error => {
          window.console.error(error);
          loading();
        }
      );
    },
    rowUpdate(row, index, done, loading) {
      update({
        ...row,
        dataPromissionType: Array.isArray(row.dataPromissionType)
          ? row.dataPromissionType?.join(',')
          : row.dataPromissionType,
      }).then(
        () => {
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          // 数据回调进行刷新
          done(row);
        },
        error => {
          window.console.log(error);
          loading();
        }
      );
    },
    rowDel(row, index, done) {
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return remove(row.id);
        })
        .then(() => {
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          // 数据回调进行刷新
          done(row);
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
          // 刷新表格数据并重载
          this.data = [];
          this.parentId = 0;
          this.$refs.crud.refreshTable();
          this.$refs.crud.toggleSelection();
          // 表格数据重载
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
        });
    },
    searchReset() {
      this.query = {};
      this.parentId = 0;
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.parentId = '';
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
        this.initData(type);
      }
      if (['edit', 'view'].includes(type)) {
        getMenu(this.form.id).then(res => {
          this.form = Object.assign(
            {
              ...res.data.data,
              dataPromissionType: res.data.data.dataPromissionType?.split(',') || [],
            },
            {
              hasChildren: this.form.hasChildren,
            }
          );
        });
      }
      if (['edit', 'view'].includes(type)) {
        if (this.form.sopDocId && this.form.sopDocName && this.form.sopDocPath) {
          this.form.docInfo = this.form.sopDocPath;
          this.dictData.sopInfoList = [
            {
              label: this.form.sopDocName,
              value: this.form.sopDocPath,
            },
          ];
        }
      }
      done();
    },
    beforeClose(done) {
      this.parentId = '';
      const column = this.findObject(this.option.column, 'parentId');
      column.value = '';
      column.addDisabled = false;
      done();
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
      getLazyList(this.parentId, Object.assign(params, this.query)).then(res => {
        this.data = res.data.data;
        this.loading = false;
        this.selectionClear();
      });
    },
    treeLoad(tree, treeNode, resolve) {
      const parentId = tree.id;
      getLazyList(parentId).then(res => {
        resolve(res.data.data);
      });
    },
  },
};
</script>

<style></style>
