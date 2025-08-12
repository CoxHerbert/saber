<template>
  <el-row>
    <el-col :span="5">
      <div class="box">
        <el-scrollbar height="760px">
          <basic-container>
            <avue-tree :option="treeOption" :data="treeData" @node-click="nodeClick" />
          </basic-container>
        </el-scrollbar>
      </div>
    </el-col>
    <el-col :span="19">
      <basic-container>
        <avue-crud
          :option="option"
          v-model:search="search"
          :table-loading="loading"
          :data="data"
          ref="crud"
          v-model="form"
          :permission="permissionList"
          @row-update="rowUpdate"
          :before-open="beforeOpen"
          v-model:page="page"
          @search-change="searchChange"
          @search-reset="searchReset"
          @on-load="onLoad"
        >
          <template #tenantName="{ row }">
            <el-tag>{{ row.tenantName }}</el-tag>
          </template>
          <template #roleName="{ row }">
            <el-tag>{{ row.roleName }}</el-tag>
          </template>
          <template #deptName="{ row }">
            <el-tag>{{ row.deptName }}</el-tag>
          </template>
          <template #userTypeName="{ row }">
            <el-tag>{{ row.userTypeName }}</el-tag>
          </template>
          <template #option="{ row }">
            <el-button
              v-permission="{ id: 'DC_USERSETTING_EDIT' }"
              @click="handleCustomEdit(row)"
              :size="size"
              icon="el-icon-edit"
              type="text"
            >
              编辑
            </el-button>
          </template>
        </avue-crud>
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
import { getList, configSubmit, configDetail } from '@/api/system/user';
import { getDeptTree, getDeptLazyTree } from '@/api/system/dept';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      DC_MMR_PERSON_LEVEL: [],
      DC_MMR_SKILL: [],
      form: {},
      search: {},
      initFlag: true,
      auditMode: false,
      selectionList: [],
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },

      init: {
        roleTree: [],
        deptTree: [],
      },
      props: {
        label: 'title',
        value: 'key',
      },
      treeDeptId: '',
      treeData: [],
      treeOption: {
        nodeKey: 'id',
        lazy: true,
        treeLoad: function (node, resolve) {
          const parentId = node.level === 0 ? 0 : node.data.id;
          getDeptLazyTree(parentId).then(res => {
            resolve(
              res.data.data.map(item => {
                return {
                  ...item,
                  leaf: !item.hasChildren,
                };
              })
            );
          });
        },
        addBtn: false,
        menu: false,
        size: 'small',
        props: {
          labelText: '标题',
          label: 'title',
          value: 'value',
          children: 'children',
        },
      },
      option: {
        height: 'auto',
        calcHeight: 140,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        dialogWidth: '800',
        border: true,
        index: true,
        selection: true,
        menu: false,
        addBtn: false,
        editBtn: false,
        delBtn: false,
        viewBtn: false,
        dialogType: 'drawer',
        dialogClickModal: true,
        enter: true,
        column: [
          {
            label: '登录账号',
            prop: 'account',
            search: true,
            display: false,
          },

          {
            label: '用户姓名',
            prop: 'realName',
            search: true,
            display: false,
          },

          {
            label: '所属部门',
            prop: 'deptName',
            slot: true,
            display: false,
          },

          {
            label: '操作',
            prop: 'option',
            slot: true,
            width: '100px',
            display: false,
            editDisplay: false, // 编辑时显示
            addDisplay: false, // 新增时显示（可选）
          },
        ],
        group: [
          {
            label: '基础信息',
            prop: 'baseInfo',
            icon: 'el-icon-user-solid',
            column: [
              {
                label: '登录账号',
                prop: 'account',
                rules: [
                  {
                    required: true,
                    message: '请输入登录账号',
                    trigger: 'blur',
                  },
                ],
                disabled: true,
              },
              {
                label: '用户昵称',
                prop: 'name',
                hide: true,
                rules: [
                  {
                    required: true,
                    message: '请输入用户昵称',
                    trigger: 'blur',
                  },
                ],
                disabled: true,
              },
              {
                label: '所属部门',
                prop: 'deptId',
                type: 'tree',
                multiple: true,
                dicData: [],
                props: {
                  label: 'title',
                },
                checkStrictly: true,
                slot: true,
                rules: [
                  {
                    required: true,
                    message: '请选择所属部门',
                    trigger: 'click',
                  },
                ],
                disabled: true,
              },
              {
                label: '等级',
                prop: 'userLevelDict', // 表单项的属性名
                type: 'select', // 类型是 select
                dicData: [],
                props: {
                  label: 'label',
                  value: 'dictKey',
                },
                rules: [
                  {
                    required: true,
                    message: '请选择等级',
                    trigger: 'blur',
                  },
                ],
              },
            ],
          },
          {
            label: '详细信息',
            prop: 'detailInfo',
            icon: 'el-icon-s-order',
            column: [
              {
                label: '技能',
                prop: 'userSkillDict', // 表单项的属性名
                type: 'checkbox', // 类型是 select
                class: 'box-checkbox',
                span: 24,
                border: true,
                dicData: [],
                props: {
                  label: 'label',
                  value: 'dictKey',
                },
                rules: [
                  {
                    required: true,
                    message: '请选择等级',
                    trigger: 'blur',
                  },
                ],
              },
            ],
          },
        ],
      },
      data: [],
    };
  },
  watch: {
    'form.tenantId'() {
      if (this.form.tenantId !== '' && this.initFlag) {
        this.initData(this.form.tenantId, this.form.id);
      }
    },

    'excelForm.isCovered'() {
      if (this.excelForm.isCovered !== '') {
        const column = this.findObject(this.excelOption.column, 'excelFile');
        column.action = `/blade-system/user/import-user?isCovered=${this.excelForm.isCovered}`;
      }
    },
  },

  computed: {
    ...mapGetters(['userInfo', 'permission']),
    permissionList() {
      return {
        addBtn: this.validData(this.permission.user_add, false),
        viewBtn: this.validData(this.permission.user_view, false),
        delBtn: this.validData(this.permission.user_delete, false),
        editBtn: this.validData(this.permission.user_edit, false),
      };
    },
    platformPermissionList() {
      return {
        addBtn: false,
        viewBtn: false,
        delBtn: false,
        editBtn: this.validData(this.permission.user_edit, false),
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

  mounted() {
    const { DC_MMR_PERSON_LEVEL, DC_MMR_SKILL } = this.useCache([
      { key: 'DC_MMR_PERSON_LEVEL' },
      { key: 'DC_MMR_SKILL' },
    ]);
    this.DC_MMR_PERSON_LEVEL = DC_MMR_PERSON_LEVEL;
    this.DC_MMR_SKILL = DC_MMR_SKILL;
    this.option.group[0].column[3].dicData = DC_MMR_PERSON_LEVEL;
    this.option.group[1].column[0].dicData = DC_MMR_SKILL;
  },

  methods: {
    nodeClick(data) {
      this.treeDeptId = data.id;
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    initData(tenantId, id) {
      getDeptTree(tenantId).then(res => {
        const column = this.findObject(this.option.group, 'deptId');
        column.dicData = res.data.data;
      });
      if (id != undefined) {
        configDetail({ id: id }).then(res => {
          const str = res.data.data.userSkillDict.split(',');
          this.form.userSkillDict = str;
          this.form.userLevelDict = res.data.data.userLevelDict;
        });
      } else {
        return;
      }
    },

    handleCustomEdit(row) {
      const tableRef = this.$refs.crud;
      tableRef.rowEdit(row);
    },

    searchChange(params, done) {
      this.query = params;
      this.page.currentPage = 1;
      this.onLoad(this.page, params);
      done();
    },
    searchReset() {
      this.query = {};
      this.treeDeptId = '';
      this.onLoad(this.page);
    },
    rowUpdate(row, index, done, loading) {
      const id = row.userSkillDict.join(',');
      const params = {
        userId: row.id,
        userLevelDict: row.userLevelDict,
        userSkillDict: id,
      };
      configSubmit(params).then(
        () => {
          this.initFlag = false;
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

    beforeOpen(done) {
      this.initFlag = true;
      done();
    },
    onLoad(page, params = {}) {
      this.loading = true;
      getList(
        page.currentPage,
        page.pageSize,
        Object.assign(params, this.query, { status: this.auditMode ? 0 : 1 }),
        this.treeDeptId
      ).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
      });
    },
  },
};
</script>

<style>
.box {
  padding-top: 10px;
  height: 800px;
  margin-right: 16px;
  background-color: #fff;
}

.el-scrollbar {
  height: 100%;
}

.box .el-scrollbar__wrap {
  overflow: scroll;
}
/* .box-checkbox .el-checkbox-group {
  display: flex;
} */
.box-checkbox .el-checkbox {
  margin-bottom: 10px;
  padding: 0 20px;
}
</style>
