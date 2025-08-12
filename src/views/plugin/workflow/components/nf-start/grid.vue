<template>
  <div class="grid" :class="['animated fadeIn']">
    <!-- search -->
    <el-row>
      <el-form inline label-suffix=":" label-position="left">
        <el-form-item label="流程名称">
          <el-input placeholder="流程名称" v-model="form.name" size="default" clearable></el-input>
        </el-form-item>
        <el-form-item label="流程标识">
          <el-input placeholder="流程标识" v-model="form.key" size="default" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="default"
            icon="el-icon-search"
            @click="$emit('search', form)"
          >
            搜索
          </el-button>
          <el-button size="default" icon="el-icon-delete" @click="$emit('reset')">清空</el-button>
          <el-button
            size="default"
            circle
            icon="el-icon-histogram"
            @click="$emit('mode', 'list')"
          ></el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row :gutter="20" v-if="data.length > 0">
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
        :lg="6"
        :xl="6"
        v-for="(item, index) in data"
        :key="index"
        class="grid-col"
      >
        <el-card
          shadow="hover"
          :body-style="{ padding: '10px 20px' }"
          @click="$emit('route', item)"
        >
          <div class="grid-item" :title="item.name">
            <img :src="item.icon || IconDefault" class="icon" />
            <div class="info">
              <div class="name txt-cut">{{ item.name }}：v{{ item.version }}</div>
              <div class="key txt-cut">{{ item.key }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <template v-else>
      <el-empty description="没有可发起的流程" style="margin-top: 20%"></el-empty>
    </template>
  </div>
</template>

<script>
import IconDefault from '../../assets/img/icon-default.png';
export default {
  props: {
    data: Array,
    form: Object,
  },
  data() {
    return {
      IconDefault,
    };
  },
};
</script>

<style lang="scss" scoped>
.txt-cut {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.grid {
  padding: 0 15px;
  height: calc(100vh - 165px);
  overflow: hidden scroll;
  &-col {
    margin-bottom: 16px;
  }
  .el-card {
    border-radius: 14px;
    &:hover {
      border-color: #388ef8;
    }
  }

  &-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    .icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .info {
      margin-left: 10px;
      flex: 1;
      word-break: break-all;

      .name {
        color: #388ef8;
        font-size: 15px;
        margin-bottom: 4px;
      }
      .key {
        font-size: 13px;
        color: #999;
      }
    }
  }
}
</style>
