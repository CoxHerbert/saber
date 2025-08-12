<template>
  <div class="page-process-create">
    <el-skeleton :loading="waiting" :rows="8">
      <div class="title-box">
        <h3 class="title">{{ process.name }}</h3>
        <div class="setting-box">
          <div @click="handleFlowShow" class="process icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 3C10.5523 3 11 3.40295 11 3.9V7.5C11 7.99705 10.5523 8.4 10 8.4H8V10.2H13V9.3C13 8.80295 13.4477 8.4 14 8.4H20C20.5523 8.4 21 8.80295 21 9.3V12.9C21 13.3971 20.5523 13.8 20 13.8H14C13.4477 13.8 13 13.3971 13 12.9V12H8V17.4H13V16.5C13 16.0029 13.4477 15.6 14 15.6H20C20.5523 15.6 21 16.0029 21 16.5V20.1C21 20.5971 20.5523 21 20 21H14C13.4477 21 13 20.5971 13 20.1V19.2H7C6.44772 19.2 6 18.7971 6 18.3V8.4H4C3.44772 8.4 3 7.99705 3 7.5V3.9C3 3.40295 3.44772 3 4 3H10ZM19 17.4H15V19.2H19V17.4ZM19 10.2H15V12H19V10.2ZM9 4.8H5V6.6H9V4.8Z"
              />
            </svg>
          </div>
          <el-popover placement="bottom" width="244px" popover-class="process-top-popover">
            <template #default>
              <div class="setting-box-tooltip">
                <div class="setting-title">自定义表单宽度(px)</div>
                <div class="progress">
                  <div class="line">
                    <div
                      v-for="(p, i) in points"
                      :key="i"
                      @click="handleClickPoint(p)"
                      class="point"
                      :style="{
                        left: `${i * 25}%`,
                      }"
                      :class="{
                        active: renderWidth === p,
                      }"
                    >
                      <span class="label">{{ p }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #reference>
              <div class="width-setting icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6V18H4V6H2ZM9.44975 7.05025L4.5 12L9.44727 16.9473L9.44826 13H14.5501L14.55 16.9492L19.5 11.9995L14.5503 7.04976L14.5502 11H9.44876L9.44975 7.05025ZM20 6H22V18H20V6Z"
                  />
                </svg></div
            ></template>
          </el-popover>
        </div>
      </div>
      <div ref="contentRef" class="page-content-box">
        <div
          class="content-render-box"
          :style="{
            width: renderWidth + 'px',
          }"
        >
          <!-- <el-card shadow="never" style="margin-top: 20px"> -->
          <div
            class="group-form-box"
            v-if="
              option &&
              ((option.column && option.column.length > 0) ||
                (option.group && option.group.length > 0))
            "
          >
            <div class="left">
              <div class="tab-box">
                <div
                  v-for="(item, i) in option.group.filter(g => !!g.display)"
                  :key="i"
                  class="group-item"
                  :class="{
                    active: activeIndex === i,
                  }"
                  @click="handleClickLeftItem(i)"
                >
                  {{ item.label }}
                </div>
              </div>
            </div>
            <div ref="formContentMain" class="right form-content-main">
              <nf-form
                v-model="form"
                ref="form"
                :option="option"
                v-model:defaults="defaults"
                :upload-preview="handleUploadPreview"
              >
              </nf-form>

              <div class="sub-form-box" v-if="showExamForm">
                <nf-examine-form
                  ref="examineForm"
                  :process="process"
                  @user-select="handleUserSelect"
                ></nf-examine-form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="foot-item">
        <el-button
          v-if="btn.download.includes(process.formKey)"
          class="mr-3"
          @click="doAction('download')"
          v-loading="loading"
        >
          模板下载
        </el-button>
        <el-upload
          v-if="btn.upload.includes(process.formKey)"
          class="wf-upload mr-3"
          accept="*"
          ref="fileUpload"
          :show-file-list="false"
          :auto-upload="false"
          :multiple="false"
          :on-change="
            val => {
              doAction('importData', val);
            }
          "
          v-loading="loading"
        >
          <template #trigger>
            <el-button type="primary">数据导入</el-button>
          </template>
        </el-upload>
        <el-button type="primary" size="default" v-loading="loading" @click="handleStartProcess">
          发起
        </el-button>
        <el-button
          v-if="permission.wf_process_draft"
          type="primary"
          size="default"
          v-loading="loading"
          @click="
            handleDraft({ processDefId: process.id, formKey: process.formKey, variables: form })
          "
        >
          存为草稿
        </el-button>
      </div>
    </el-skeleton>

    <!-- 人员选择弹窗 -->
    <nf-user-select
      ref="user-select"
      :check-type="checkType"
      :default-checked="defaultChecked"
      @onConfirm="handleUserSelectConfirm"
    ></nf-user-select>

    <el-dialog
      v-model="bpmnVisible"
      append-to-body
      destroy-on-close
      title="流程图"
      width="70%"
      class="nf-dialog"
    >
      <nf-design ref="bpmn" style="height: 60vh" :options="bpmnOption"></nf-design>
    </el-dialog>
  </div>
</template>

<script>
import NfExamineForm from '../../../components/nf-exam-form/index.vue';
import NfUserSelect from '../../../components/nf-user-select/index.vue';
import exForm from '../../../mixins/ex-form';
import draft from '../../../mixins/draft';
import action from '../../../mixins/action';
import { mapMutations } from 'vuex';
import { processModelDetail } from '../../../api/process/process';

export default {
  components: {
    NfUserSelect,
    NfExamineForm,
  },
  mixins: [exForm, draft, action],
  watch: {
    '$route.params.params': {
      handler(val) {
        if (val) {
          const param = JSON.parse(window.atob(val));
          const { processId, processDefKey, planItemId, params } = param;
          if (processId || processDefKey) this.getForm(processId, processDefKey, planItemId);
          if (params) this.params = params;
        }
      },
      immediate: true,
    },
  },
  computed: {
    renderWidth() {
      return this.$store.state.process.processRenderWidth;
    },
    showExamForm() {
      const { hideComment, hideCopy, hideExamine } = this.process;
      return !hideComment || !hideCopy || !hideExamine;
    },
  },
  data() {
    return {
      defaultRenderWidth: -1,
      activeIndex: 0,
      bpmnOption: {},
      bpmnVisible: false,
      points: [900, 1200, 1440, 1600, 1920],
      defaults: {},
      form: {},
      option: {},
      process: {},
      loading: false,
      params: null,
    };
  },
  created() {
    if (!this.renderWidth) {
      this.SET_PROCESS_RENDER_WIDTH(1200);
    }
  },
  methods: {
    ...mapMutations(['SET_PROCESS_RENDER_WIDTH']),
    handleClickPoint(p) {
      this.SET_PROCESS_RENDER_WIDTH(p);
    },
    handleClickLeftItem(index) {
      const collapses = this.$el.querySelectorAll('.right .el-collapse-item') || [];
      collapses.forEach((el, i) => {
        if (i === index) {
          this.$refs.formContentMain.scrollTop = el.offsetTop - 10;
          this.activeIndex = i;
        }
      });
    },
    handleFlowShow() {
      // 测试数据
      const param = JSON.parse(window.atob(this.$route.params.params));
      console.log('param===>', param);
      processModelDetail({
        modelKey: param.key,
      }).then(res => {
        const { data, code } = res.data;
        if (code === 200) {
          this.bpmnOption = {
            mode: 'view',
            xml: data.modelXml,
            flows: [],
          };
          this.bpmnVisible = true;
        }
      });
    },
    getForm(processId, processDefKey, planItemId) {
      let param;
      let method;
      if (processId) {
        param = processId;
        method = 'getStartForm';
      } else if (processDefKey) {
        param = processDefKey;
        method = 'getStartFormByProcessDefKey';
      }
      this[method](param).then(res => {
        let { process, form, startForm } = res;
        this.defaultRenderWidth = process.defaultRenderWidth;
        if (this.defaultRenderWidth) {
          this.SET_PROCESS_RENDER_WIDTH(parseInt(this.defaultRenderWidth));
        } else {
          this.SET_PROCESS_RENDER_WIDTH(parseInt(1200));
        }
        this.form.processId = process.id;
        this.form.planItemId = planItemId;
        if (form) {
          const option = { ...eval('(' + form + ')'), menuBtn: false };
          const { column, group } = option;
          const groupArr = [];
          const columnArr = this.filterAvueColumn(column, startForm).column;
          if (group && group.length > 0) {
            // 处理group
            group.forEach(gro => {
              gro.column = this.filterAvueColumn(gro.column, startForm).column;
              if (gro.column.length > 0) groupArr.push(gro);
            });
          }

          option.column = columnArr;
          option.group = groupArr;
          this.option = option;

          if (!this.validatenull(this.params)) this.form = { ...this.form, ...this.params };

          if (this.permission.wf_process_draft) {
            // 查询是否有草稿箱
            this.initDraft({ processDefId: process.id }).then(data => {
              this.$confirm('是否恢复之前保存的草稿？', '提示', {})
                .then(() => {
                  this.form = JSON.parse(data);
                })
                .catch(() => {});
            });
          }
        }
        console.log('process-----------------', this.process);
        this.waiting = false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.foot-item {
  width: 100%;
  height: 66px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-transition: 0.3s;
  transition: 0.3s;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-process-create {
  width: 100%;
  height: 100%;
  background-color: #fff;
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  .title-box {
    height: 64px;
    border-bottom: 1px solid #e5e5e5;
    .title {
      padding: 22px 0;
      text-align: center;
      font-weight: bold;
      font-size: 20px;
      color: #333333;
      line-height: 20px;
      font-style: normal;
      text-transform: none;
    }
  }

  .page-content-box {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    padding: 0 24px;
    flex: 1;
    overflow: hidden;
  }

  .content-render-box {
    max-width: 100%;
    display: flex;
  }

  .setting-box {
    position: absolute;
    right: 24px;
    top: 16px;
    display: flex;

    .icon {
      width: 32px;
      height: 32px;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      & + .icon {
        margin-left: 12px;
      }
      &:hover {
        background-color: rgba(247, 132, 49, 0.1);
        border-color: rgba(247, 132, 49, 0.1);
      }
      svg {
        fill: #666;
        &:hover {
          fill: var(--el-color-primary);
        }
      }
    }
  }

  :deep(.el-collapse-item__header) {
    border-bottom: none !important;
    pointer-events: none;
    height: 32px;
    .nf-form__group--title {
      border-left: 4px solid #f78431 !important;
    }
    .el-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      align-content: center;
      text-align: center;
      width: 32px;
      height: 32px;
      pointer-events: all;
    }
  }

  :deep(.el-collapse-item__content) {
    border-bottom: none !important;
  }
  :deep(.el-table .el-table__body .el-table__cell) {
    padding-top: 0;
    padding-bottom: 0;
  }
  :deep(.el-table .el-table__body .cell) {
    padding-left: 2px;
    padding-right: 2px;
    .el-button {
      border: 1px solid red;
      transform: translateY(6px);
    }
  }
}

.process-top-popover {
  width: 244px;
  background-color: yellow;
}

.setting-title {
  font-weight: 400;
  font-size: 12px;
  color: #333333;
  line-height: 12px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 12px;
}
.progress {
  .line {
    width: 204px;
    display: flex;
    position: relative;

    &::before {
      background-color: #f6f8fa;
      content: ' ';
      display: block;
      height: 8px;
      width: 204px;
      border-radius: 4px;
    }
    .point {
      cursor: pointer;
      position: absolute;
      top: 0;
      display: flex;
      flex-flow: column;
      font-weight: 400;
      font-size: 10px;
      color: #666666;
      line-height: 12px;
      text-align: center;
      font-style: normal;
      text-transform: none;
      transform: translateX(-50%);
      align-items: center;

      &::before {
        content: ' ';
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background-color: #dadbe0;
      }
      &.active {
        &::before {
          background-color: #f78431;
        }
      }
    }
  }
}
.group-form-box {
  display: flex;
  flex-flow: row nowrap;
  flex: 1;
  overflow: hidden;
  justify-content: center;
  .left {
    padding-top: 16px;
    padding-right: 48px;

    .tab-box {
      position: relative;

      &::after {
        content: ' ';
        right: 0;
        top: 0;
        position: absolute;
        width: 2px;
        height: 100%;
        z-index: 1;
        background-color: #dadbe0;
      }

      .group-item {
        white-space: nowrap;
        font-weight: 500;
        font-size: 14px;
        color: #333333;
        line-height: 22px;
        height: 22px;
        text-align: right;
        font-style: normal;
        text-transform: none;
        margin-bottom: 16px;
        padding-right: 4px;
        position: relative;
        cursor: pointer;
        &.active {
          content: ' ';
          &::after {
            z-index: 10;
            right: 0;
            top: 0;
            position: absolute;
            content: ' ';
            height: 22px;
            width: 2px;
            background-color: #f78431;
          }
        }
      }
    }
  }

  .right {
    flex: 1;
    padding-right: 16px;
    height: 100%;
    overflow-y: scroll;
  }
}
</style>
