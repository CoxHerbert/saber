<template>
  <el-dialog
    v-model="dialogVisbile"
    :title="(deptInfo?.deptName ? deptInfo?.deptName + '-' : '全部-') + title"
    width="80%"
    destroy-on-close
    append-to-body
  >
    <div v-loading="loading" class="content-role-bind-users">
      <dc-drag-panel leftInitWidth="240" :height="contentHeight">
        <template #left>
          <div
            class="left-box"
            :style="{
              height: contentHeight + 'px',
            }"
          >
            <el-input
              v-model="deptSearch"
              placeholder="请输入部门"
              prefix-icon="Search"
              clearable
            />
            <div
              class="tree-container"
              :style="{
                height: contentHeight - 64 + 'px',
                overflow: 'hidden',
              }"
            >
              <el-scrollbar :height="contentHeight - 60 + 'px'">
                <el-tree
                  ref="deptTreeRef"
                  :data="deptData"
                  @node-click="deptNodeClick"
                  node-key="id"
                  :filter-node-method="deptFilterNode"
                >
                  <template #default="{ data }">
                    <div
                      class="default-node"
                      :class="{
                        'is-active': data.id === left.queryParams.deptId,
                      }"
                    >
                      {{ data.deptName }}
                    </div>
                  </template>
                </el-tree>
              </el-scrollbar>
            </div>
          </div>
        </template>
        <template #right>
          <div class="right-box">
            <div class="table-box other-box">
              <div class="title">
                未绑定用户
                <el-button type="primary" class="bind-btn" @click="doAction('binddSelectData')"
                  >绑定已选{{
                    left.selectRows.length > 0 ? `(${left.selectRows.length})` : ''
                  }}</el-button
                >
              </div>
              <div class="search-box">
                <el-form inline :model="left.queryParams">
                  <el-form-item label="姓名" prop="realName">
                    <el-input
                      placeholder="请输入姓名"
                      v-model="left.queryParams.realName"
                      @keyup.enter="handleSearch('left')"
                    />
                  </el-form-item>
                  <el-form-item label="工号" prop="account">
                    <el-input
                      placeholder="请输入姓名"
                      v-model="left.queryParams.account"
                      @keyup.enter="handleSearch('left')"
                    />
                  </el-form-item>
                  <div class="row">
                    <el-button type="primary" @click="handleSearch('left')">查询</el-button>
                    <el-button @click="handleReset('left')">重置</el-button>
                  </div>
                </el-form>
              </div>
              <el-table
                ref="leftTableRef"
                :data="otherList"
                :style="{
                  height: contentHeight - 160 + 'px',
                }"
                @selection-change="handleSelectionChangeLeft"
                border
              >
                <el-table-column type="selection" width="40" :reserve-selection="true" />
                <el-table-column
                  v-for="(col, i) in columns"
                  :key="i"
                  :prop="col.prop"
                  :label="col.label"
                  min-width="100px"
                  align="center"
                >
                  <template #default="scoped">
                    {{ scoped.row[col.prop] ? scoped.row[col.prop] : '-' }}
                  </template>
                </el-table-column>
              </el-table>
              <div class="page-box">
                <dc-pagination
                  size="small"
                  v-show="left.total > 0"
                  :total="left.total"
                  :pagerCount="3"
                  v-model:page="left.queryParams.current"
                  v-model:limit="left.queryParams.size"
                  @pagination="getData(false)"
                />
              </div>
            </div>
            <div class="table-box select-box">
              <div class="title">
                已绑定用户
                <el-button class="bind-btn" type="primary" @click="doAction('unbinddSelectData')"
                  >解绑已选{{
                    right.selectRows.length > 0 ? `(${right.selectRows.length})` : ''
                  }}</el-button
                >
              </div>
              <div class="search-box">
                <el-form inline :model="left.queryParams">
                  <el-form-item label="姓名" prop="realName">
                    <el-input
                      placeholder="请输入姓名"
                      v-model="right.queryParams.realName"
                      @keyup.enter="handleSearch('right')"
                    />
                  </el-form-item>
                  <el-form-item label="工号" prop="account">
                    <el-input
                      placeholder="请输入姓名"
                      v-model="right.queryParams.account"
                      @keyup.enter="handleSearch('right')"
                    />
                  </el-form-item>
                  <div class="row">
                    <el-button type="primary" @click="handleSearch('right')">查询</el-button>
                    <el-button @click="handleReset('right')">重置</el-button>
                  </div>
                </el-form>
              </div>
              <el-table
                ref="rightTableRef"
                :data="selectedList"
                :style="{
                  height: contentHeight - 160 + 'px',
                }"
                border
                @selection-change="handleSelectionChangeRight"
              >
                <el-table-column type="selection" width="40" :reserve-selection="true" />
                <el-table-column
                  v-for="(col, i) in columns"
                  :key="i"
                  :prop="col.prop"
                  :label="col.label"
                  min-width="100px"
                  align="center"
                >
                  <template #default="scoped">
                    <div class="round-name">
                      {{ scoped.row[col.prop] ? scoped.row[col.prop] : '-' }}
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="page-box">
                <dc-pagination
                  size="small"
                  v-show="right.total > 0"
                  :total="right.total"
                  :pagerCount="3"
                  v-model:page="right.queryParams.current"
                  v-model:limit="right.queryParams.size"
                  @pagination="getData(true)"
                />
              </div>
            </div>
          </div>
        </template>
      </dc-drag-panel>
    </div>
  </el-dialog>
</template>
<script>
import Api from '@/api/index';
import { batchUserRole, cancelUserRole } from '@/api/system/role';
export default {
  props: {
    title: {
      type: String,
      default() {
        return '角色人员批量绑定';
      },
    },
    roleId: {
      type: String,
      default() {
        return '';
      },
    },
  },
  data() {
    return {
      deptInfo: null,
      loading: false,
      deptData: [],
      columns: [
        {
          label: '姓名',
          prop: 'realName',
          type: 'row-text',
        },
        {
          label: '工号',
          prop: 'account',
          type: 'row-text',
        },
        {
          label: '岗位',
          prop: 'postName',
          type: 'row-text',
        },
        {
          label: '部门',
          prop: 'deptName',
          type: 'row-text',
        },
      ],

      left: {
        total: 0,
        queryParams: {
          current: 1,
          size: 20,
          deptId: null,
        },
        selectRows: [],
      },
      right: {
        total: 0,
        queryParams: {
          current: 1,
          size: 20,
          deptId: null,
        },
        selectRows: [],
      },
      otherList: [],
      selectedList: [],
      deptSearch: '',
      contentHeight: 'auto',
      dialogVisbile: false,
    };
  },
  created() {
    this.getDept();
  },
  mounted() {
    const resizeCallback = () => {
      this.contentHeight = (document.documentElement.clientHeight || window.innerHeight) * 0.7;
    };
    this.resizeCallback = resizeCallback();
    window.addEventListener('resize', this.resizeCallback);
  },
  unmounted() {
    window.removeEventListener('resize', this.resizeCallback);
  },
  watch: {
    deptSearch: {
      handler(val) {
        this.$refs.deptTreeRef.filter(val);
      },
    },
  },
  methods: {
    async getDept() {
      const res = await Api.system.dept.getList();
      const { code, data } = res.data;
      if (code === 200) {
        this.deptData = data;
      }
    },
    doAction(action) {
      if (action === 'binddSelectData') {
        const rows = this.left.selectRows;
        if (rows.length < 1) {
          this.$message.error('请先选择需要绑定的人员');
          return;
        }
        const ids = rows.map(row => row.id);
        this.loading = true;
        batchUserRole(this.roleId, ids).then(res => {
          const { code, msg } = res.data;
          if (code === 200) {
            this.$message.success(msg);
            this.left.selectRows = [];
            this.$refs.leftTableRef.clearSelection();
            this.handleSearch();
          }
          this.loading = false;
        });
      } else if (action === 'unbinddSelectData') {
        const rows = this.right.selectRows;
        if (rows.length < 1) {
          this.$message.error('请先选择需要解除绑定的人员');
          return;
        }
        const ids = rows.map(row => row.id);
        this.loading = true;
        cancelUserRole(this.roleId, ids).then(res => {
          const { code, msg } = res.data;
          if (code === 200) {
            this.$message.success(msg);
            this.right.selectRows = [];
            this.$refs.rightTableRef.clearSelection();
            this.handleSearch();
          }
          this.loading = false;
        });
      }
    },
    show() {
      this.dialogVisbile = true;
      this.contentHeight = (document.documentElement.clientHeight || window.innerHeight) * 0.7;
      this.loading = true;
      this.getData(false);
      this.getData(true);
      this.loading = false;
    },
    // 点击部门节点
    deptNodeClick(node) {
      this.left.queryParams.deptId = node.id;
      this.right.queryParams.deptId = node.id;
      this.deptInfo = node;
      this.left.selectRows = [];
      this.right.selectRows = [];
      this.$refs.leftTableRef.clearSelection();
      this.$refs.rightTableRef.clearSelection();
      this.handleSearch();
    },
    deptFilterNode(value, data) {
      console.log('value', value, data);
      if (!value) return true;
      return data.deptName.includes(value);
    },
    handleSearch(action) {
      if (!action) {
        this.left.queryParams.current = 1;
        this.right.queryParams.current = 1;
        this.loading = true;
        this.getData(false);
        this.getData(true);
        this.loading = false;
      } else if (action === 'left') {
        this.left.queryParams.current = 1;
        this.loading = true;
        this.getData(false);
        this.loading = false;
      } else if (action === 'right') {
        this.right.queryParams.current = 1;
        this.loading = true;
        this.getData(true);
        this.loading = false;
      }
    },
    handleReset(action) {
      if (!action) {
        this.left.queryParams = {
          current: 1,
          size: 20,
        };
        this.right.queryParams = {
          current: 1,
          size: 20,
        };
        this.handleSearch();
      } else if (action === 'left') {
        this.left.queryParams = {
          current: 1,
          size: 20,
        };

        this.handleSearch(action);
      } else if (action === 'right') {
        this.right.queryParams = {
          current: 1,
          size: 20,
        };

        this.handleSearch(action);
      }
    },
    handleSelectionChangeLeft(val) {
      this.left.selectRows = val;
    },

    handleSelectionChangeRight(val) {
      this.right.selectRows = val;
    },
    async getData(isRight) {
      const dataSend = {
        ...(isRight ? this.right.queryParams : this.left.queryParams),
        roleStatus: !!isRight,
        personRoleId: this.roleId,
      };
      const res = await Api.system.user.getList(dataSend);
      const { code, data } = res.data;
      if (code === 200) {
        if (!isRight) {
          this.otherList = data.records;
          this.left.total = data.total;
        } else {
          this.selectedList = data.records;
          this.right.total = data.total;
        }
      }
    },
  },
};
</script>
<style lang="scss">
.content-role-bind-users {
  width: 100%;
  height: 70vh;
  display: flex;
  flex-flow: row nowrap;

  .tree-container {
    margin-top: 10px;
  }

  .is-active {
    font-weight: bold;
    color: #333;
  }

  .right-box {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
  }
  .table-box {
    width: 50%;
    box-sizing: border-box;
    padding: 0 10px;
  }

  .page-box {
    margin-top: 10px;
    width: 100%;
    overflow: hidden;
    padding: 0 10px;
  }

  .title {
    font-size: 16px;
    line-height: 40px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
    border-bottom: 1px solid #eaeaeb;

    .bind-btn {
      float: right;
    }
  }

  .search-box {
    .el-form,
    .row {
      display: flex;
      flex-flow: row nowrap;
    }
  }
}
</style>
