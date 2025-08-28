<template>
  <div class="nameplateBatch">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="名称牌" name="nameplate">
        <nameplateList ref="nameplateListRef" />
      </el-tab-pane>
      <el-tab-pane label="名称牌批量操作" name="nameplateBatch">
        <nameplateBatchList ref="nameplateBatchListRef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
