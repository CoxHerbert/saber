<template>
  <basic-container>
    <el-form :inline="true" :model="params" class="demo-form-inline">
      <el-form-item label="消息类型">
        <el-select v-model="params.type" clearable placeholder="请选择类型">
          <el-option
            v-for="item in messageType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="list">查询</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-col :span="24">
        <div class="tool-box">
          <el-button icon="el-icon-position" type="primary" @click="handleAdd">发送消息</el-button>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-table :data="data" style="width: 100%" border>
        <el-table-column label="类型" prop="type" width="100">
          <template #default="scoped">
            {{ typeDict(scoped.row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title"></el-table-column>
        <el-table-column label="内容" prop="content"></el-table-column>
        <el-table-column label="接收人" prop="receiveUserName" width="100"></el-table-column>
        <el-table-column label="接收部门/角色" prop="receiveGroupName">
          <template #default="scoped">
            <el-tag v-for="item in scoped.row.receiveGroupName" :key="item" effect="plain">
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180"></el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scoped">
            <el-button plain type="" @click="handleView(scoped.$index, scoped.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-row>
      <el-pagination
        :page-size="10"
        :page-sizes="[10, 20, 30, 50]"
        :total="page.total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChange"
        @current-change="currentChange"
      ></el-pagination>
    </el-row>
    <el-dialog
      :title="dialogTitle"
      width="600px"
      v-model="formVisible"
      @close="resetForm('messageLogForm')"
      append-to-body
    >
      <el-form ref="messageLogForm" :model="messageLog" :rules="rules" label-width="85px">
        <el-form-item label="类型:" prop="type">
          <el-select v-model="messageLog.type" placeholder="请选择" v-if="!viewMode">
            <el-option
              v-for="item in messageType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <span v-else>{{ typeDict(messageLog.type) }}</span>
        </el-form-item>
        <el-form-item label="接收人:" v-if="messageLog.type === 1" prop="receiveUser">
          <el-select
            v-model="messageLog.receiveUser"
            filterable
            placeholder="请选择"
            v-if="!viewMode"
          >
            <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
          <span v-else>{{ messageLog.receiveUserName }}</span>
        </el-form-item>
        <el-form-item label="接收部门:" v-if="messageLog.type === 2" prop="receiveGroup">
          <el-cascader
            :options="deptTree"
            :props="optionProps"
            :show-all-levels="false"
            v-model="messageLog.receiveGroup"
            clearable
            v-if="!viewMode"
          >
          </el-cascader>
          <el-tag v-else v-for="item in messageLog.receiveGroupName" :key="item" effect="plain">
            {{ item }}
          </el-tag>
        </el-form-item>
        <el-form-item label="接收角色:" v-if="messageLog.type === 4" prop="receiveGroup">
          <el-cascader
            :options="roleTree"
            :props="optionProps"
            :show-all-levels="false"
            v-model="messageLog.receiveGroup"
            clearable
            v-if="!viewMode"
          >
          </el-cascader>
          <el-tag v-else v-for="item in messageLog.receiveGroupName" :key="item" effect="plain">
            {{ item }}
          </el-tag>
        </el-form-item>
        <el-form-item label="标题:" prop="title">
          <el-input v-model="messageLog.title" autocomplete="off" v-if="!viewMode" />
          <span v-else>{{ messageLog.title }}</span>
        </el-form-item>
        <el-form-item label="内容:" prop="content">
          <el-input
            v-model="messageLog.content"
            autocomplete="off"
            rows="5"
            type="textarea"
            v-if="!viewMode"
          />
          <span v-else>{{ messageLog.content }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取 消</el-button>
        <el-button v-if="!viewMode" type="primary" @click="submitMessage('messageLogForm')"
          >确 定</el-button
        >
      </template>
    </el-dialog>
  </basic-container>
</template>
<script>
import { add, getSendDetail, mySendList, getUserList } from '@/api/plugin/message/message';
import { getDeptTree } from '@/api/system/dept';
import { getRoleTree } from '@/api/system/role';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      //消息类型字典
      messageType: [
        {
          value: 1,
          label: '普通消息',
        },
        {
          value: 2,
          label: '部门群发',
        },
        {
          value: 4,
          label: '角色群发',
        },
      ],
      optionProps: {
        value: 'id',
        label: 'title',
        children: 'children',
        multiple: true,
        checkStrictly: true,
      },
      //人员列表
      userList: [],
      //部门树
      deptTree: [],
      //角色树
      roleTree: [],
      // 是否显示
      formVisible: false,
      // 是否查看
      viewMode: false,
      // dialog标题
      dialogTitle: '',
      // 列表数据
      data: [],
      // 选中的数据
      multiSelection: [],
      // 分页数据
      page: { pageSize: 10, currentPage: 1, total: 0 },
      query: {},
      params: {},
      // 校验规则
      rules: {
        type: [
          {
            required: true,
            message: '请选择类型',
            trigger: 'blur',
          },
        ],
        title: [
          {
            required: true,
            message: '请填写标题',
            trigger: 'blur',
          },
        ],
        content: [
          {
            required: true,
            message: '请输入内容',
            trigger: 'blur',
          },
        ],
      },
      // 表单映射模型
      messageLog: {
        id: '',
        title: '',
        type: '',
        content: '',
        receiveUser: '',
        receiveGroup: [],
      },
    };
  },
  created() {
    this.onLoad();
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    typeDict(value) {
      if (value === 1) {
        return '普通消息';
      }
      if (value === 2) {
        return '部门群发';
      }
      if (value === 4) {
        return '角色群发';
      }
    },

    onLoad() {
      this.list();
    },

    list() {
      mySendList(
        this.page.currentPage,
        this.page.pageSize,
        Object.assign(this.params, this.query)
      ).then(res => {
        this.data = res.data.data.records;
        this.page.total = res.data.data.total;
      });
    },
    selectUserList() {
      getUserList().then(res => {
        this.userList = res.data.data;
      });
    },
    selectDeptTree() {
      getDeptTree(this.userInfo.tenant_id).then(res => {
        this.deptTree = res.data.data;
      });
    },
    selectRoleTree() {
      getRoleTree(this.userInfo.tenant_id).then(res => {
        this.roleTree = res.data.data;
      });
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
      this.list();
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
      this.list();
    },
    resetForm(formName) {
      this.$refs[formName].clearValidate();
    },
    resetFormData() {
      // 表单映射模型
      this.messageLog = {
        id: '',
        title: '',
        type: '',
        content: '',
        receiveUser: '',
        receiveGroup: [],
      };
    },
    handleAdd() {
      this.resetFormData();
      this.selectUserList();
      this.selectDeptTree();
      this.selectRoleTree();
      this.dialogTitle = '发送消息';
      this.formVisible = true;
      this.viewMode = false;
    },
    handleView(index, row) {
      this.resetFormData();
      this.dialogTitle = '查看消息';
      this.formVisible = true;
      this.viewMode = true;
      getSendDetail(row.id).then(res => {
        if (res.data.success) {
          this.messageLog = res.data.data;
        }
      });
    },

    submitMessage(formName) {
      // 表单验证
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.messageLog.receiveGroupList = [];
          if (this.messageLog.receiveGroup.length > 0) {
            this.messageLog.receiveGroup.forEach(ele => {
              let arr = JSON.parse(JSON.stringify(ele));
              this.messageLog.receiveGroupList.push(arr.pop());
            });
          }
          add(this.messageLog).then(res => {
            if (res.data.success) {
              this.formVisible = false;
              this.$message({ type: 'success', message: '操作成功！' });
            } else {
              this.$message({ type: 'error', message: res.data.msg });
            }
            this.list();
          });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
