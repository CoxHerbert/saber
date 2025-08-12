<template>
  <div class="page-desk-index">
    <div class="left">
      <div class="w-66-33">
        <totalData />
        <appList />
      </div>
      <div class="w-66-33">
        <div class="w-66"><schedule /></div>
        <div class="w-33">
          <todoList></todoList>
        </div>
      </div>
      <div class="w-66-33">
        <div class="w-66"><processEfficiency /></div>
        <div class="w-33"><myProject /></div>
      </div>
    </div>
    <div class="right">
      <personalInformation />
      <notifyList />
      <recommendedKnowledge />
    </div>
  </div>
</template>

<script setup>
import totalData from './cpns/total-data.vue';
import appList from './cpns/app-list.vue';
import schedule from './cpns/schedule.vue';
import todoList from './cpns/todo-list.vue';
import processEfficiency from './cpns/process-efficiency.vue';
import myProject from './cpns/my-project.vue';
import personalInformation from './cpns/personal-information.vue';
import notifyList from './cpns/notify-list.vue';
import recommendedKnowledge from './cpns/recommended-knowledge.vue';
</script>

<style lang="scss" scoped>
.page-desk-index {
  padding: 15px;
  min-width: 1680px;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  // background-color: #fff;

  .left {
    flex: 1;
    margin-right: 17px;
  }
  .right {
    width: 396px;
  }

  .w-66-33 {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    .w-66 {
      margin-right: 20px;
      display: block;
      width: 66.67%;
    }
    .w-33 {
      flex: 1;
    }
  }
}
</style>
