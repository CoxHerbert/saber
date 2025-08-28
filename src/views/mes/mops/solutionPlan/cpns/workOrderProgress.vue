<!-- components/WorkOrderProgress.vue (Options API) -->
<template>
  <div class="wo-progress" :style="{ gap: gap + 'px' }">
    <div
      v-for="(n, i) in nodes"
      :key="n.code || i"
      class="wo-item"
      :class="{ last: i === nodes.length - 1 }"
    >
      <div class="wo-line"></div>

      <el-popover placement="top" width="280" :show-after="120" trigger="hover">
        <template #reference>
          <div class="wo-dot">
            <!-- 最后一个：推送ERP（独立配色） -->
            <template v-if="i === nodes.length - 1">
              <el-progress class="erp-progress" v-bind="n.props" />
            </template>

            <!-- 普通节点 -->
            <template v-else>
              <el-progress v-bind="n.props">
                <el-icon v-if="n.props.percentage === 100"><Check /></el-icon>
              </el-progress>
            </template>
            <div class="wo-title" :title="n.label">{{ n.label }}</div>
          </div>
        </template>

        <!-- 悬浮明细 -->
        <div class="pop">
          <div class="pop-hd">
            <div class="name">{{ n.label }}</div>
            <div
              :style="{
                display: 'inline-block',
                backgroundColor: STATUS_COLOR?.[n?.prcessDetail?.processStatus] || '#999',
                color: '#fff',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '12px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }"
            >
              {{ n?.prcessDetail?.processStatus }}
            </div>
          </div>
          <div class="kv">
            生产工时：{{ n?.prcessDetail?.completedWorkingHour }}/{{
              n?.prcessDetail?.totalWorkingHour
            }}分钟
          </div>
          <div class="kv">
            生产数量：{{ n?.prcessDetail?.completedQty }}/{{ n?.prcessDetail?.qty }}Pcs
          </div>
          <div class="kv">最后报工时间：{{ n?.prcessDetail?.lastReportTime || '-' }}</div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
export default {
  name: 'workOrderProgress',
  props: {
    nodes: { type: Array, required: true },
    size: { type: Number, default: 40 },
    gap: { type: Number, default: 5 },
  },
  data() {
    return {
      STATUS_COLOR: {
        进行中: 'green',
        已完成: 'blue',
        延期: 'red',
        带下达: 'yellow',
      },
    };
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.wo-progress {
  display: flex;
  align-items: flex-start;

  .wo-item {
    display: flex;
    align-items: center;

    &.last {
      // 如果最后一个节点需要额外样式可以加这里
    }
    &:first-child {
      .wo-line {
        display: none;
      }
    }
    .wo-line {
      margin-top: -12px;
      width: 18px;
      height: 2px;
      background: #dcdfe6;
    }

    .wo-dot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 48px;
    }

    .wo-title {
      line-height: 14px;
      font-size: 12px;
      color: #606266;
      width: 100%;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/* Popover 样式 */
.pop {
  .pop-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .name {
      font-weight: 600;
    }
  }

  .kv {
    line-height: 22px;
    font-size: 13px;

    .ok {
      color: #67c23a;
    }

    .bad {
      color: #f56c6c;
    }
  }
}

/* Element Plus 的进度文字微调 */
:deep(.el-progress__text) {
  font-size: 12px !important;
  width: 40px;
  min-width: 40px;
  color: #4dc799;
}
.erp-progress {
  :deep(.el-progress__text) {
    color: #f26c0c;
  }
}
</style>
