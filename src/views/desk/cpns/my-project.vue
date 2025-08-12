<template>
  <div class="comp-my-project-list">
    <div class="title">
      我的项目
      <span
        class="all"
        @click="
          goPage({
            path: '/pdp/project/list',
          })
        "
      >
        查看全部 <el-icon><ArrowRight /></el-icon>
      </span>
    </div>
    <div class="comp-content" v-loading="loading">
      <div
        class="item-row"
        v-for="(item, i) in projectList"
        :key="i"
        @click="
          goPage({
            path: `/pdp/project/detail/overview/${item.id}`,
            query: {
              parentMenuId: '1872125141990576129',
            },
          })
        "
      >
        <img class="type-icon" :src="imgEnum[item.type]" alt="" />
        <div class="item-row-title">
          {{ item.projectName }}
          <span class="moto">（{{ item.projectCode }}）</span>
        </div>
        <el-progress :text-inside="true" :stroke-width="12" :percentage="item.completionRate" />
        <div class="statistical-group">
          <div class="statistical-item">
            <div class="statistical-item-name">任务数</div>
            <div class="statistical-item-count">{{ item.planTotalNum || 0 }}</div>
          </div>
          <div class="statistical-item">
            <div class="statistical-item-name">已完成</div>
            <div class="statistical-item-count">{{ item.planCompletionsNum || 0 }}</div>
          </div>
          <div class="statistical-item">
            <div class="statistical-item-name">未完成</div>
            <div class="statistical-item-count">{{ item.planIncompleteNum || 0 }}</div>
          </div>
          <div class="statistical-item">
            <div class="statistical-item-name">完成率</div>
            <div class="statistical-item-count main-color">{{ item.completionRate }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import generallyIcon from './../../../../public/img/desk/generally-icon.png';
import importantIcon from './../../../../public/img/desk/important-icon.png';
import Api from '@/api';

const router = useRouter();
const { proxy } = getCurrentInstance();
const compData = reactive({
  loading: false,
  imgEnum: {
    generally: generallyIcon,
    important: importantIcon,
  },
  projectList: [],
});
const { loading, imgEnum, projectList } = toRefs(compData);

const getData = () => {
  loading.value = true;
  Api.pdp.project
    .list({
      levelClass: '我参与的',
      current: 1,
      size: 20,
    })
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        projectList.value = data.records.map(item => {
          const completionRate = item.planTotalNum
            ? +((item.planCompletionsNum / item.planTotalNum) * 100).toFixed(2)
            : 0;
          return {
            ...item,
            completionRate,
          };
        });
      }
      loading.value = false;
    })
    .catch(err => {
      loading.value = false;
      console.error(err);
    });
};
const goPage = route => {
  router.push(route);
};
onMounted(() => {
  getData();
});
</script>
<style lang="scss" scoped>
.comp-my-project-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 8px;
  height: 410px;
  .title {
    padding: 20px 16px 20px 16px;
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
  .comp-content {
    margin-left: 16px;
    margin-right: 8px;
    padding-right: 8px;
    margin-bottom: 20px;
    flex: 1;
    overflow: auto;
    .item-row {
      padding: 10px 0;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 12px 12px;
      margin-bottom: 8px;
      background: #f6f8fa;
      border-radius: 8px;
      cursor: pointer;
      :deep(.el-progress-bar) {
        margin: 20px 0;
        .el-progress-bar__outer {
          background: #cdd2d7;
          .el-progress-bar__inner {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            height: 100%;
            background: linear-gradient(90deg, #ffd1ac 0%, #f29346 100%);
            .el-progress-bar__innerText {
              transform: scale(0.8);
            }
          }
        }
      }
      &:last-child {
        margin-bottom: 0;
      }
      .type-icon {
        position: absolute;
        top: 0;
        right: 0;
        width: 44px;
      }
      &-title {
        display: flex;
        font-weight: bold;
        font-size: 14px;
        color: #333333;
        .moto {
          font-weight: 400;
        }
      }
      .statistical-group {
        display: flex;
        width: 100%;
        background: #f5f5f5;
        border-radius: 4px;
        .statistical-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          justify-content: flex-start;
          &-name {
            font-weight: 400;
            font-size: 14px;
            color: #666666;
            line-height: 14px;
          }
          &-count {
            margin-top: 5px;
            font-weight: bold;
            font-size: 16px;
            color: #333333;
            line-height: 16px;
            &.main-color {
              color: #f78431;
            }
          }
        }
      }
    }
  }
}
</style>
