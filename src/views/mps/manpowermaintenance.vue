<template>
  <basic-container>
    <div class="Manpower-maintenance">
      <div class="ManpowerTop">
        <div class="ManpowerTopTitle">
          <div class="manpowe-top-text">人力维护</div>
          <div><el-button type="primary" icon="Plus" @click="handleAdd">批量维护</el-button></div>
        </div>
      </div>

      <div class="Manpower">
        <!-- 左侧树 -->
        <div class="ManpowerLeft">
          <el-tree
            :data="treeData"
            :props="{ children: 'children', label: 'label' }"
            :default-expanded-keys="defaultExpandedKeys"
            node-key="id"
            :current-node-key="defaultCheckedKeys"
            :highlight-current="true"
            @node-click="handleNodeClick"
            ref="tree"
          />
        </div>

        <!-- 右侧日历 -->
        <div class="ManpowerRight" ref="rightPane">
          <el-calendar
            v-loading="loading"
            class="rightCalender"
            v-model="calendarParams.calendarYearMonth"
            ref="calendar"
          >
            <template #header>
              <el-button-group>
                <el-select
                  v-model="calendarParams.year"
                  @change="handleChangeDate"
                  placeholder="选择年份"
                  style="width: 240px"
                >
                  <el-option
                    v-for="item in yearOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>

                <el-select
                  v-model="calendarParams.month"
                  @change="handleChangeDate"
                  placeholder="选择月份"
                  style="width: 240px"
                >
                  <el-option
                    v-for="item in monthOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>

                <button class="SverchBtn" @click="selectDate('today')">今天</button>
              </el-button-group>

              <div class="type-hints">
                <div class="hint-item"><span class="hint-dot dot-bz"></span>编制人力</div>
                <div class="hint-item"><span class="hint-dot dot-jy"></span>借用人力</div>
                <div class="hint-item"><span class="hint-dot dot-mr"></span>默认人力</div>
              </div>
            </template>

            <template #date-cell="{ data }">
              <div
                class="day-content"
                @click="handleUpdate(data.day)"
                :class="data.isSelected ? 'is-selected' : ''"
                :style="{
                  backgroundColor: scheduleDataMap[data.day]?.colorCode || '',
                  height: elementHeight + 'px',
                }"
              >
                <div class="day-content-warp">
                  <div class="manpower-count" v-if="scheduleDataMap[data.day]">
                    <span>●</span>{{ scheduleDataMap[data.day].manpowerQuantity }}
                  </div>
                  <div class="manpower-count-labor" v-if="scheduleDataMap[data.day]">
                    <span>●</span>{{ scheduleDataMap[data.day].laborManpowerQuantity }}
                  </div>

                  <div class="manpower-count-default" v-if="!scheduleDataMap[data.day] && treeOnly">
                    <span>●</span
                    >{{ (treeOnly.manpowerQuantity || 0) + (treeOnly.laborManpowerQuantity || 0) }}
                  </div>

                  <div class="total-count" v-if="scheduleDataMap[data.day]">
                    <span>总计:</span>
                    {{
                      (scheduleDataMap[data.day].manpowerQuantity || 0) +
                      (scheduleDataMap[data.day].laborManpowerQuantity || 0)
                    }}
                  </div>

                  <div class="day-label">{{ (data.day || '').split('-').slice(2).join('-') }}</div>
                </div>
              </div>
            </template>
          </el-calendar>
        </div>
      </div>
    </div>

    <!-- 抽屉 -->
    <el-drawer v-model="open" size="600px" :title="title" @close="cancel">
      <div v-if="Object.keys(infoDate).length">
        <el-descriptions title="当前人力计划" :column="1">
          <el-descriptions-item label="编制人力：">{{
            infoDate.manpowerQuantity
          }}</el-descriptions-item>
          <el-descriptions-item label="借用人力：">{{
            infoDate.laborManpowerQuantity
          }}</el-descriptions-item>
          <el-descriptions-item label="总人力：">
            {{ (infoDate.manpowerQuantity || 0) + (infoDate.laborManpowerQuantity || 0) }}
          </el-descriptions-item>
          <el-descriptions-item label="当前计划时间：">
            {{ infoDate.workStartDate }} - {{ infoDate.workEndDate }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <h3>人力计划</h3>
      <el-form :model="formData">
        <el-form-item label="编制人力">
          <el-input-number v-model="formData.manpowerQuantity" :min="0" placeholder="请输入">
            <template #suffix><span>人</span></template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="借用人力">
          <el-input-number v-model="formData.laborManpowerQuantity" :min="0" placeholder="请输入">
            <template #suffix><span>人</span></template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="计划日期" class="el-form-item-timer">
          <el-date-picker
            v-model="formData.timers"
            type="daterange"
            range-separator="-"
            start-placeholder="请选择开始时间"
            end-placeholder="请选择结束时间"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitting" @click="submitForm">提交</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </basic-container>
</template>

<script>
import dayjs from 'dayjs';
import Api from '@/api/index';

export default {
  name: 'ManpowerMaintenance',
  data() {
    return {
      // 左侧树
      treeData: [],
      defaultExpandedKeys: [],
      defaultCheckedKeys: '',

      // 查询参数
      queryParams: {
        workGroupCode: '',
        workStartDate: '2024-01-01',
        workEndDate: '2027-01-01',
        current: 1,
        size: 10000,
      },

      // 日历
      calendarParams: {
        year: dayjs().format('YYYY'),
        month: dayjs().format('MM'),
        calendarYearMonth: new Date(), // 始终是 Date
      },

      // UI 状态
      loading: false,
      submitting: false,
      open: false,
      title: '',

      // 数据容器
      scheduleDataMap: {}, // { 'YYYY-MM-DD': item }
      treeOnly: null, // 当前树节点默认人力
      infoDate: {}, // 当前编辑项
      formData: {},

      // 选项
      yearOptions: [
        { value: '2024', label: '2024年' },
        { value: '2025', label: '2025年' },
        { value: '2026', label: '2026年' },
        { value: '2027', label: '2027年' },
      ],
      monthOptions: [
        { label: '1月', value: '01' },
        { label: '2月', value: '02' },
        { label: '3月', value: '03' },
        { label: '4月', value: '04' },
        { label: '5月', value: '05' },
        { label: '6月', value: '06' },
        { label: '7月', value: '07' },
        { label: '8月', value: '08' },
        { label: '9月', value: '09' },
        { label: '10月', value: '10' },
        { label: '11月', value: '11' },
        { label: '12月', value: '12' },
      ],

      // 计算日格高度
      elementHeight: 120,

      // 观察器
      resizeObserver: null,
    };
  },

  mounted() {
    this.bootstrap();
    this.installResizeObserver();
  },

  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  },

  methods: {
    async bootstrap() {
      this.loading = true;
      try {
        // 右侧树 & 默认选中组
        await this.getList();
        await this.getWorkGroupInfo(); // 覆盖/补齐默认选中
        await this.getData();
        // 根据当前日期设置 header 下拉
        this.calendarParams.year = dayjs(this.calendarParams.calendarYearMonth).format('YYYY');
        this.calendarParams.month = dayjs(this.calendarParams.calendarYearMonth).format('MM');
      } finally {
        this.loading = false;
      }
    },

    installResizeObserver() {
      const el = this.$refs.rightPane;
      if (!el) return;
      const compute = () => {
        // 顶部 header + 星期行等大致占用空间：约 130px（可按需调整）
        const H = el.offsetHeight || 0;
        const safe = Math.max(0, H - 130);
        // 一周 5 行或 6 行：大多数月份 5 行，按 5 行更紧凑；如需更稳妥可按 6 行
        this.elementHeight = Math.floor(safe / 5);
      };
      this.resizeObserver = new ResizeObserver(compute);
      this.resizeObserver.observe(el);
      // 初始算一次
      this.$nextTick(compute);
    },

    // 获取当前用户所在工作组信息（默认展开/选中）
    async getWorkGroupInfo() {
      const res = await Api.common.workGroup.getWorkGroupInfo();
      const { code, data } = res.data || {};
      if (code === 200 && data) {
        this.defaultExpandedKeys = [data.id];
        this.defaultCheckedKeys = data.id;
        if (!this.queryParams.workGroupCode) {
          this.queryParams.workGroupCode = data.workGroupCode;
        }
      }
    },

    // 获取树
    async getList() {
      const res = await Api.mps.manpowermaintenance.getWorkManpowerTreeGroup();
      const { code, data } = res.data || {};
      if (code !== 200 || !Array.isArray(data)) return;

      this.treeData = data.map(item => ({
        id: item.processCategoryCode,
        label: item.category,
        children: (item.children || []).map(child => {
          // 首次进入时，设置默认组
          if (!this.queryParams.workGroupCode) {
            this.queryParams.workGroupCode = child.workGroupCode;
            this.defaultExpandedKeys = [child.id];
            this.defaultCheckedKeys = child.id;
            this.treeOnly = child;
          }
          return {
            label: child.workGroupName,
            ...child,
          };
        }),
      }));
    },

    // 获取日历数据
    async getData() {
      if (!this.queryParams.workGroupCode) return;
      this.loading = true;
      try {
        const res = await Api.mps.manpowermaintenance.getWorkManpowerList(this.queryParams);
        const { code, data } = res.data || {};
        if (code === 200 && data?.records) {
          const map = {};
          data.records.forEach(it => {
            const key = dayjs(it.workDate).format('YYYY-MM-DD');
            map[key] = it;
          });
          this.scheduleDataMap = map;
        } else {
          this.scheduleDataMap = {};
        }
      } catch (e) {
        this.scheduleDataMap = {};
      } finally {
        this.loading = false;
      }
    },

    // 切换年月
    handleChangeDate() {
      const d = dayjs(`${this.calendarParams.year}-${this.calendarParams.month}-01`).toDate();
      this.calendarParams.calendarYearMonth = d;
    },

    // 树点击
    async handleNodeClick(node) {
      if (!node?.workGroupCode) return;
      if (this.queryParams.workGroupCode === node.workGroupCode) return; // 无变化不请求

      this.treeOnly = node;
      this.queryParams = {
        workGroupCode: node.workGroupCode,
        workStartDate: '2024-01-01',
        workEndDate: '2027-01-01',
        current: 1,
        size: 10000,
      };
      await this.getData();
    },

    // 打开新增
    handleAdd() {
      this.initAddData(dayjs(this.calendarParams.calendarYearMonth).format('YYYY-MM-DD'));
    },

    initAddData(date) {
      const baseQty = {
        manpowerQuantity: this.treeOnly?.manpowerQuantity || 0,
        laborManpowerQuantity: this.treeOnly?.laborManpowerQuantity || 0,
      };
      this.formData = {
        workGroupCode: this.queryParams.workGroupCode,
        ...baseQty,
        timers: [date, date],
      };
      this.infoDate = {};
      this.title = '新增人力计划';
      this.open = true;
    },

    initUpdateData(date) {
      this.infoDate = this.scheduleDataMap[date] || {};
      this.formData = {
        laborManpowerQuantity: this.infoDate.laborManpowerQuantity || 0,
        manpowerQuantity: this.infoDate.manpowerQuantity || 0,
        timers: [this.infoDate.workStartDate, this.infoDate.workEndDate],
        workGroupCode: this.infoDate.workGroupCode,
      };
      this.title = '调整人力计划';
      this.open = true;
    },

    cancel() {
      this.open = false;
      this.formData = {};
      this.infoDate = {};
    },

    async submitForm() {
      if (!Array.isArray(this.formData.timers) || this.formData.timers.length < 2) {
        this.$message.error('请选择日期');
        return;
      }
      const payload = {
        ...this.formData,
        workStartDate: dayjs(this.formData.timers[0]).format('YYYY-MM-DD'),
        workEndDate: dayjs(this.formData.timers[1]).format('YYYY-MM-DD'),
      };
      delete payload.timers;

      this.submitting = true;
      try {
        const res = await Api.mps.manpowermaintenance.postWorkManpowerInsert(payload);
        const { code, msg } = res.data || {};
        if (code === 200) {
          this.$message.success(msg || '提交成功');
          this.open = false;
          await this.getData();
        }
      } finally {
        this.submitting = false;
      }
    },

    // 点击日历格
    handleUpdate(date) {
      if (this.scheduleDataMap[date]) {
        this.initUpdateData(date);
      } else {
        this.initAddData(date);
      }
    },

    // 今天
    selectDate(val) {
      const cal = this.$refs.calendar;
      if (cal?.selectDate) cal.selectDate(val);
      // 同步下拉年/月
      const now = new Date();
      this.calendarParams.year = dayjs(now).format('YYYY');
      this.calendarParams.month = dayjs(now).format('MM');
    },
  },
};
</script>

<style lang="scss">
.Manpower-maintenance {
  .el-calendar-table .el-calendar-day {
    height: 100% !important;
    padding: 0 !important;
  }

  :deep(.el-calendar__body) {
    height: calc(100% - 64px);
    padding: 0;
    .el-calendar-table {
      height: 100%;
      thead {
        height: 30px;
        line-height: 30px;
      }
      .rightCalenderItem {
        justify-content: space-between;
        height: 100%;
        .CalenderItem {
          height: 100%;
        }
        h2 {
          margin: 0;
          padding: 16px 14px 0 0;
          float: right;
        }
        .rightCalenderItemContext {
          height: 100%;
          .calender-item-title {
            padding: 16px 0 0 11px;
          }
          .rightCalenderItemContextText {
            font-weight: 400;
            font-size: 16px;
            color: #333333;
            span {
              font-weight: 400;
              font-size: 20px;
              color: #333333;
            }
          }
        }
        .ManpowerRightElse {
          padding: 16px 0 0 11px;
        }
      }
    }
  }
}
</style>

<style scoped lang="scss">
.Manpower-maintenance {
  width: 100%;
  height: 100%;

  .ManpowerTop {
    height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid #e1e2e5;

    .ManpowerTopTitle {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .manpowe-top-text {
        font-weight: bold;
        font-size: 16px;
        color: #333333;
        line-height: 16px;
      }
    }
  }

  .Manpower {
    display: flex;
    height: calc(100% - 50px);

    .ManpowerLeft {
      width: 240px;
      height: 100%;
      border-right: 1px solid #e1e2e5;
    }

    .ManpowerRight {
      width: 100%;
      height: 100%;

      .rightCalender {
        .day-content {
          padding: 0px;
          position: relative;

          .day-content-warp {
            padding: 5px;
          }

          .manpower-count,
          .manpower-count-labor,
          .manpower-count-default,
          .total-count {
            font-size: 20px;
            line-height: 20px;
            padding: 3px 0;
            color: #333;
            font-weight: 400;
          }
          .manpower-count span {
            font-size: 26px;
            padding-right: 3px;
            color: #1d65f3;
          }
          .manpower-count-labor span {
            font-size: 26px;
            color: #e37318;
          }
          .manpower-count-default span {
            font-size: 26px;
            color: #bbbbbb;
          }

          .total-count {
            height: 24px;
          }
          .total-count span {
            font-size: 16px;
          }

          .day-label {
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 22px;
            font-weight: 700;
          }
        }
      }

      .rightCalender {
        .el-calendar__header {
          height: 36px;
        }

        .type-hints {
          display: flex;
          align-items: center;
          gap: 10px;

          .hint-item {
            display: inline-flex;
            align-items: center;
            font-size: 18px;
            color: #050505;
            line-height: 32px;
            vertical-align: middle;

            .hint-dot {
              margin-right: 8px;
              width: 16px;
              height: 16px;
              border-radius: 50%;
            }
            .dot-bz {
              background: #1d65f3;
            }
            .dot-jy {
              background: #e37318;
            }
            .dot-mr {
              background: #bbbbbb;
            }
          }
        }

        .el-button-group {
          .SverchBtn {
            width: 64px;
            height: 32px;
            background: #f78431;
            border-radius: 3px;
            border: none;
            font-weight: 400;
            font-size: 15px;
            color: #fff;
            line-height: 24px;
            text-align: center;
            cursor: pointer;
          }
        }
      }
    }
  }
}

.el-form-item-timer {
  width: 400px;
}

.demo-date-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}
.demo-date-picker .block {
  padding: 30px 0;
  text-align: center;
  border-right: 1px solid var(--el-border-color);
  flex: 1;
}
.demo-date-picker .block:last-child {
  border-right: none;
}
.demo-date-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

:deep(.el-select) {
  width: 92px;
  padding-right: 12px;
  text-align: center;
}
:deep(.el-calendar-table thead) {
  background: #e5e5e5;
}
</style>
