<template>
  <el-popover placement="bottom" width="350" trigger="click" @show="queryTopMessage">
    <template #reference>
      <el-badge class="notice-badge" :hidden="unReadCount === 0" :value="unReadCount">
        <el-icon class="bell-icon"><Bell /></el-icon>
      </el-badge>
    </template>
    <el-tabs v-model="activeName">
      <el-tab-pane
        v-for="item in topMsgType"
        :label="item.label"
        :name="item.name"
        :key="item.name"
      >
        <ul class="msg-list">
          <li v-for="item in topMsgData" :key="item.id" :class="{ hasRead: item.isRead === 0 }">
            <em class="new" v-if="item.isRead === 1"></em>
            <i v-if="item.type === 3" class="el-icon-message ri-mail-fill" />
            <i v-else class="el-icon-user-solid ri-mail-fill" />
            <div class="info" @click="openMessageDetail(item)">
              <div class="title">{{ item.title }}</div>
              <div class="date">{{ item.createTime }}</div>
            </div>
          </li>
        </ul>
        <div class="msg-more" @click="allMessage">查看所有消息</div>
      </el-tab-pane>
    </el-tabs>

    <el-drawer title="我的消息" :visible.sync="drawer" direction="rtl" size="80%" append-to-body>
      <div class="msg-con">
        <el-form :inline="true" :model="params" class="demo-form-inline">
          <el-form-item label="消息类型">
            <el-select size="small" v-model="params.type" clearable placeholder="请选择类型">
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
            <el-button type="primary" size="small" @click="queryMessagePage">查询</el-button>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col :span="24">
            <div class="tool-box">
              <el-button
                icon="el-icon-check"
                size="small"
                :disabled="unReadCount === 0"
                type="success"
                @click="handleRead"
                >全部已读</el-button
              >
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-table :data="msgData" style="width: 100%" border>
            <el-table-column label="消息类型" prop="type" width="100">
              <template slot-scope="scope">
                {{ typeDict(scope.row.type) }}
              </template>
            </el-table-column>
            <el-table-column label="发送人" prop="createUserName" width="100" />
            <el-table-column label="标题" prop="title" width="180" />
            <el-table-column label="内容" prop="content" />
            <el-table-column label="状态" prop="isRead" width="80">
              <template slot-scope="scope">
                <el-tag :type="scope.row.isRead === 0 ? 'info' : 'danger'" effect="dark">
                  {{ scope.row.isRead === 0 ? '已读' : '未读' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="发送时间" prop="createTime" width="180" />
            <el-table-column fixed="right" label="操作" width="200">
              <template slot-scope="scope">
                <el-button plain size="mini" type="" @click="openMessageDetail(scope.row)"
                  >查看</el-button
                >
                <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)"
                  >删除</el-button
                >
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
      </div>
    </el-drawer>
  </el-popover>
</template>

<script>
import { config } from '@/api/plugin/message/mqtt';
import { topList, getDetail, queryMyMessage, readAll, remove } from '@/api/plugin/message/message';
import { mapGetters } from 'vuex';
import Stomp from 'stompjs';
const { MQTT_SERVICE, MQTT_USERNAME, MQTT_PASSWORD } = config();

export default {
  name: 'top-notice',
  data() {
    return {
      activeName: 'msg',
      newMessage: true,
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
          value: 3,
          label: '审批消息',
        },
        {
          value: 4,
          label: '角色群发',
        },
      ],
      topMsgType: [{ label: '消息', name: 'msg' }],
      //顶部消息数据，只查询未读
      topMsgData: [],
      //所有消息数据
      msgData: [],
      drawer: false,
      client: Stomp.client(MQTT_SERVICE),
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      query: {},
      params: {},
      topParams: { isRead: 0 },
      unReadCount: 0,
    };
  },
  created() {
    this.connect();
    //查询顶部消息数据
    this.queryTopMessage();
  },
  beforeUnmount() {
    // 销毁监听
    this.client.disconnect();
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
      if (value === 3) {
        return '审批消息';
      }
      if (value === 4) {
        return '角色群发';
      }
    },

    queryTopMessage() {
      if (this.newMessage) {
        topList().then(res => {
          const data = res.data.data;
          this.topMsgData = data.messageList;
          this.unReadCount = data.unReadCount;
        });
        this.newMessage = false;
      }
    },

    openMessageDetail(row) {
      getDetail(row.id).then(res => {
        if (row.isRead === 1) {
          this.unReadCount--;
        }
        row.isRead = 0;
        const data = res.data.data;
        this.$alert(data.content, data.title, {
          confirmButtonText: '确定',
        }).then(() => {});
      });
    },
    queryMessagePage() {
      queryMyMessage(
        this.page.currentPage,
        this.page.pageSize,
        Object.assign(this.params, this.query)
      ).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.msgData = data.records;
      });
    },

    //全部已读
    handleRead() {
      this.$confirm('确定将消息设为全部已读?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        readAll().then(res => {
          if (res.data.success) {
            this.queryMessagePage();
            this.newMessage = true;
            this.queryTopMessage();
            this.$message({
              type: 'success',
              message: '操作成功！',
            });
          } else {
            this.$message({ type: 'error', message: res.data.msg });
          }
        });
      });
    },

    //查看所有消息
    allMessage() {
      this.drawer = true;
      this.queryMessagePage();
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
      this.queryMessagePage();
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
      this.queryMessagePage();
    },

    handleDelete(index, row) {
      this.$confirm('确定删除此消息?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        remove(row.id).then(res => {
          if (res.data.success) {
            this.queryMessagePage();
            this.newMessage = true;
            this.queryTopMessage();
            this.$message({
              type: 'success',
              message: '操作成功！',
            });
          } else {
            this.$message({ type: 'error', message: res.data.msg });
          }
        });
      });
    },

    onConnected: function () {
      // 单消息订阅
      const singleTopic = '/exchange/directExchange/single_msg_' + this.userInfo.user_id;
      this.client.subscribe(singleTopic, this.messageCallback, this.onSingleFailed);
      this.client.debug = null;
    },
    onSingleFailed: function (frame) {
      // 可此处尝试重连
      console.log('连接mq失败: ' + frame);
    },
    //接收到消息回调
    messageCallback: function (frame) {
      this.unReadCount++;
      this.newMessage = true;
      const info = JSON.parse(frame.body);
      this.$notify({
        iconClass: 'el-icon-message',
        dangerouslyUseHTMLString: true,
        title: info.title,
        message: info.content,
        duration: 0,
      });
    },
    connect: function () {
      const headers = {
        login: MQTT_USERNAME,
        passcode: MQTT_PASSWORD,
      };
      this.client.connect(headers, this.onConnected, this.onFailed);
    },
  },
};
</script>

<style lang="scss" scoped>
.notice-badge {
  margin-top: 11px;
}
.bell-icon {
  font-size: 22px;
}
.msg-list {
  max-height: 300px;
  overflow-y: auto;
  -ms-scroll-chaining: none;
  list-style: none;
  padding: 0;
  margin: 0;
  overscroll-behavior: contain;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    width: 8px;
    background: #ccc;
    border-radius: 4px;
  }
  li {
    display: flex;
    align-items: flex-start;
    padding: 15px 10px;
    -webkit-transition: 0.3s;
    transition: 0.3s;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    position: relative;
    &.hasRead {
      opacity: 0.6;
    }
    .new {
      position: absolute;
      top: 30px;
      left: 0;
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background: red;
    }
    i {
      margin-right: 10px;
      padding: 10px;
      border-radius: 50%;
      color: #fff;
      background-color: #3391e5;
      &.ri-service-fill {
        background-color: #fe5d58;
      }
      &.ri-file-edit-fill {
        background-color: #dab033;
      }
    }
    .info {
      .title[data-v-081b0652] {
        font-size: 14px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      .date[data-v-081b0652] {
        margin-top: 5px;
        font-size: 12px;
        color: #999;
      }
    }
  }
}
.msg-more {
  padding: 15px 0;
  margin-bottom: -10px;
  text-align: center;
  color: #666;
  border-top: 1px solid #eee;
  cursor: pointer;
}
.msg-con {
  padding: 0 20px;
  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
