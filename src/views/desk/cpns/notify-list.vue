<template>
  <div class="comp-notify-list-list" v-loading="loading">
    <div class="title">
      通知公告
      <span class="all" @click="allMessage()">
        更多 <el-icon><ArrowRight /></el-icon>
      </span>
    </div>
    <el-tabs v-model="queryParams.type" @tab-change="resetQuery">
      <el-tab-pane
        :label="item.label"
        v-for="(item, index) in notifyType"
        :key="index"
      ></el-tab-pane>
    </el-tabs>
    <div class="comp-content">
      <div class="item-row" v-for="(item, i) in msgData" :key="i">
        <div class="item-row-left">
          <div class="notify-title">{{ item.title }}</div>
          <div class="notify-desc">{{ item.content }}</div>
        </div>
        <div class="item-row-right">
          <el-button type="primary" text size="small" @click="openMessageDetail(item)"
            >立即查看</el-button
          >
        </div>
      </div>
    </div>
    <el-drawer title="我的消息" v-model="drawer" size="80%" append-to-body>
      <div class="msg-con">
        <el-form :inline="true" :model="params" class="demo-form-inline">
          <el-form-item label="消息类型">
            <el-select
              v-model="params.type"
              clearable
              style="width: 160px"
              placeholder="请选择类型"
              @change="queryPageData"
            >
              <el-option
                v-for="item in notifyType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getPageData">查询</el-button>
          </el-form-item>
        </el-form>
        <!-- <el-row>
        <el-col :span="24">
          <div class="tool-box">
            <el-button
              icon="el-icon-check"
              size="small"
              :disabled="unReadCount === 0"
              type="primary"
              @click="handleRead"
              >全部已读</el-button
            >
          </div>
        </el-col>
      </el-row> -->
        <el-table
          :data="tableData"
          style="width: 100%"
          height="100%"
          border
          v-loading="pageLoading"
        >
          <el-table-column label="消息类型" prop="type" width="100">
            <template #default="scoped">
              {{ typeDict(scoped.row.type) }}
            </template>
          </el-table-column>
          <el-table-column label="发送人" prop="createUserName" width="100" />
          <el-table-column label="标题" prop="title" width="180" />
          <el-table-column label="内容" prop="content" />
          <el-table-column label="状态" prop="isRead" width="80">
            <template #default="scoped">
              <el-tag :type="scoped.row.isRead === 0 ? 'info' : 'danger'" effect="dark">
                {{ scoped.row.isRead === 0 ? '已读' : '未读' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发送时间" prop="createTime" width="180" />
          <el-table-column fixed="right" label="操作" width="200">
            <template #default="scoped">
              <el-button text type="primary" size="small" @click="openMessageDetail(scoped.row)"
                >查看</el-button
              >
              <el-button
                text
                type="danger"
                size="small"
                @click="handleDelete(scoped.$index, scoped.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-row class="mt-5">
          <dc-pagination
            :total="params.total"
            v-show="params.total > 0"
            v-model:page="params.currentPage"
            v-model:limit="params.pageSize"
            @pagination="getPageData"
          ></dc-pagination>
        </el-row>
      </div>
    </el-drawer>
  </div>
</template>
<script setup>
import Api from '@/api/';
const { proxy } = getCurrentInstance();
const compData = reactive({
  loading: false,
  notifyType: [
    {
      value: 0,
      label: '全部',
    },
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
  queryParams: {
    type: '0',
    pageSize: 10,
    currentPage: 1,
    total: 0,
  },
  pageLoading: false,
  params: {
    type: '',
    pageSize: 10,
    currentPage: 1,
    total: 0,
  },
  msgData: [],
  drawer: false,
  tableData: [],
});
const { loading, notifyType, queryParams, pageLoading, params, msgData, drawer, tableData } =
  toRefs(compData);
onMounted(() => {
  getData();
});

const getData = () => {
  loading.value = true;
  Api.desk.home
    .queryMyMessage(queryParams.value)
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        queryParams.value.total = data.total;
        msgData.value = data.records;
      }
      loading.value = false;
    })
    .catch(err => {
      console.error(err);
      loading.value = false;
    });
};

// 重置搜索
const resetQuery = () => {
  queryParams.value.currentPage = 1;
  getData();
};

const getPageData = () => {
  pageLoading.value = true;
  Api.desk.home
    .queryMyMessage({
      ...queryParams.value,
      type: queryParams.value?.type === '0' ? '' : queryParams.value?.type,
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        params.value.total = data.total;
        tableData.value = data.records;
      }
      pageLoading.value = false;
    })
    .catch(err => {
      console.error(err);
      pageLoading.value = false;
    });
};

// 重置搜索
const queryPageData = () => {
  params.value.currentPage = 1;
  getPageData();
};

const openMessageDetail = row => {
  Api.desk.home.getDetail({ id: row.id }).then(res => {
    row.isRead = 0;
    const data = res.data.data;
    proxy
      .$alert(data.content, data.title, {
        confirmButtonText: '确定',
      })
      .then(() => {})
      .catch();
  });
};

//查看所有消息
const allMessage = () => {
  drawer.value = true;
  getPageData();
};

const handleDelete = (index, row) => {
  proxy
    .$confirm('确定删除此消息?', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      remove(row.id).then(res => {
        if (res.data.success) {
          getPageData();
          getData();
          proxy.$message({
            type: 'success',
            message: '操作成功！',
          });
        } else {
          proxy.$message({ type: 'error', message: res.data.msg });
        }
      });
    });
};

const typeDict = value => {
  console.log(value);
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
};
</script>
<style lang="scss" scoped>
.comp-notify-list-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 16px;
  height: 346px;
  .title {
    padding: 18px 16px 11px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    .all {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #848488;
      line-height: 12px;
      text-align: right;
      font-style: normal;
      text-transform: none;
      user-select: none;
      cursor: pointer;
    }
  }
  :deep(.el-tabs) {
    margin: 0 10px;
    .el-tabs__header {
      margin: 0;
    }
    .el-tabs__nav-wrap:after,
    .el-tabs__active-bar {
      display: none;
    }
  }
  .comp-content {
    margin: 0 20px 15px 20px;
    flex: 1;
    overflow: auto;
    .item-row {
      padding: 10px 0;
      display: flex;
      &-left {
        flex: 1;
        overflow: hidden;
        .notify-title {
          margin-bottom: 12px;
          font-weight: bold;
          font-size: 14px;
          color: #333333;
          line-height: 14px;
        }
        .notify-desc {
          font-weight: 400;
          font-size: 12px;
          color: #666666;
          line-height: 12px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
