<template>
  <el-drawer
    class="custom-drawer"
    v-model="open"
    destroy-on-close
    append-to-body
    @close="closeDrawer"
  >
    <div class="close-icon" @click="closeDrawer">
      <el-icon><Close /></el-icon>
    </div>

    <div class="layout-process">
      <div class="layout-process-left">
        <div class="left-head">
          <div class="left-head_title">可行性评估（{{ info?.feaCode || '-' }}）</div>
          <div class="left-head_info">
            <div class="info-value">
              <dc-view v-model="info.createUserId" objectName="user" showKey="realName" />
            </div>
            |
            <div class="info-value">发起于{{ info?.createTime || '-' }}</div>
            |
            <div class="info-value">完成截止日：{{ info?.createTime || '-' }}</div>
          </div>
        </div>
        <div class="left-body">
          <div class="process-title">基本信息</div>
          <div class="process-content info-container mb-5">
            <div class="info-group">
              <div class="info-group_label">相关附件：</div>
              <div class="info-group_value">
                <dc-upload v-model="info.relatedAttachments" :isUpload="false" :isRemove="false" />
              </div>
            </div>
            <div class="info-group">
              <div class="info-group_label">商机名称：</div>
              <div class="info-group_value">
                {{ info?.oppsName || '-' }}
              </div>
            </div>
            <div class="info-group">
              <div class="info-group_label">产品类别：</div>
              <div class="info-group_value">
                {{ info?.projectTypeName || '-' }}
              </div>
            </div>
            <div class="info-group">
              <div class="info-group_label">时间：</div>
              <div class="info-group_value">{{ info?.createTime || '-' }}</div>
            </div>
            <div class="info-group">
              <div class="info-group_label">评估说明：</div>
              <div class="info-group_value">{{ info?.feaDesc || '-' }}</div>
            </div>
          </div>
          <!-- 汇总表单collapse -->
          <nf-form
            v-if="
              summaryOptionMode == 'collapse' &&
              summaryOption &&
              ((summaryOption.column && summaryOption.column.length > 0) ||
                (summaryOption.group && summaryOption.group.length > 0))
            "
            v-model="form"
            :style="themeCustomStyle"
            ref="summaryForm"
            :option="summaryOption"
            :upload-preview="handleUploadPreview"
            style="margin-bottom: 20px"
          ></nf-form>
          <!-- 当前节点表单 -->
          <nf-form
            v-if="
              option &&
              ((option.column && option.column.length > 0) ||
                (option.group && option.group.length > 0))
            "
            v-model="form"
            :style="themeCustomStyle"
            ref="form"
            v-model:defaults="defaults"
            :option="option"
            :upload-preview="handleUploadPreview"
          >
          </nf-form>
          <nf-examine-form
            ref="examineForm"
            v-model:comment="comment"
            :process="process"
            @user-select="handleUserSelect"
          ></nf-examine-form>
        </div>
        <div class="left-footer">
          <nf-button
            class="footer-btns"
            :loading="submitLoading"
            :button-list="buttonList"
            :process="process"
            :comment="comment"
            @examine="handleExamine"
            @user-select="handleUserSelect"
            @print="handlePrint"
            @rollback="handleRollbackTask"
            @terminate="handleTerminateProcess"
            @withdraw="handleWithdrawTask"
          ></nf-button>
          <el-button class="close-btn" @click="closeDrawer">取消</el-button>
        </div>
      </div>
      <div class="layout-process-right">
        <div class="right-title">流转记录</div>
        <nf-flow :flow-list="flow"></nf-flow>
      </div>
    </div>
    <nf-user-select
      ref="user-select"
      :check-type="checkType"
      :default-checked="defaultChecked"
      @onConfirm="handleUserSelectConfirm"
    ></nf-user-select>
  </el-drawer>
</template>
<script>
import NfExamineForm from '../../../../components/nf-exam-form/index.vue';
import NfButton from '../../../../components/nf-button/index.vue';
import NfFlow from '../../../../components/nf-flow/index.vue';
import NfUserSelect from '../../../../components/nf-user-select/index.vue';

import exForm from '../../../../mixins/ex-form';
import theme from '../../../../mixins/theme';
import draft from '../../../../mixins/draft';
import Api from '@/api/index';

export default {
  mixins: [exForm, theme, draft],
  components: { NfUserSelect, NfExamineForm, NfButton, NfFlow },
  data() {
    return {
      open: false,
      defaults: {},
      form: {},
      option: {},
      vars: [], // 需要提交的字段
      submitLoading: false, // 提交时按钮loading
      summaryOption: {}, // 汇总表单option
      summaryOptionMode: 'collapse', // 汇总表单模式，需要汇总的表单不包含group时展示折叠，包含group时展示tabs
      summaryOptionArr: [], // 汇总表单option arr
      summaryActiveName: '', // 汇总表单当前激活的tab
      info: {},
      OPPS_LIST_CACHE: [],
      DC_FEA_PRODUCT_TYPE: [],
    };
  },
  methods: {
    // 获取任务详情
    async getDetail(taskId, processInsId) {
      try {
        const res = await Api.desk.feaEvaluation.getProcessInformation({
          processInsId,
          // processInsId: '1a6eba96-b2ba-11ef-a444-00ff64884847',
        });
        const { code, data } = res.data;
        if (code === 200) {
          this.info = data;
        }
      } catch (error) {}
      this.getTaskDetail(taskId, processInsId)
        .then(res => {
          const { process, form } = res;
          const { variables, status } = process;

          let { allForm, taskForm, formList } = form;
          if (!allForm && !taskForm && !formList) {
            this.$message.error('未获取到表单信息或流程已不存在');
            this.handleCloseTag();
            this.$router.go(-1);
            return;
          }
          if (formList && formList.length > 0) {
            const options = {
              menuBtn: false,
              detail: true,
              group: [],
            };
            const arr = [];
            formList.forEach((f, i) => {
              const { content, taskName, taskKey } = f;
              const { option } = this.handleResolveOption(eval('(' + content + ')'), null, 'done');
              const { column, group } = option;
              options.group.push({
                label: taskName || taskKey,
                collapse: allForm ? false : true,
                column: column,
              });
              arr.push({
                label: taskName || taskKey,
                column: column,
                group: group,
                menuBtn: false,
                detail: true,
              });
              if (i == 0) {
                this.summaryActiveName = taskName || taskKey;
              }
              if (group && group.length > 0) {
                this.summaryOptionMode = 'tabs';
              }
            });
            this.summaryOptionArr = arr;
            this.summaryOption = options;
          }
          if (allForm) {
            const { option, vars } = this.handleResolveOption(
              eval('(' + allForm + ')'),
              taskForm,
              status
            );
            option.menuBtn = false;
            for (let key in variables) {
              if (this.validateNull(variables[key])) delete variables[key];
            }
            if (option.column && process.variables && process.variables.serialNumber) {
              option.column.unshift({
                label: '流水号',
                prop: 'serialNumber',
                span: 24,
                detail: true,
              });
            }
            this.option = option;
            this.vars = vars;
          }
          if (this.permission.wf_process_draft && status == 'todo') {
            // 查询是否有草稿箱
            this.initDraft({ taskId })
              .then(data => {
                this.$confirm('是否恢复之前保存的草稿？', '提示', {})
                  .then(() => {
                    this.form = { ...JSON.parse(data) };
                  })
                  .catch(() => {
                    this.form = { ...variables };
                  });
              })
              .catch(() => {
                this.form = { ...variables };
              });
          } else this.form = { ...variables };
          this.waiting = false;
        })
        .catch(err => {
          console.log(err);
          // this.handleCloseTag('/plugin/workflow/pages/process/todo');
        });
    },
    handleResolveOption(option, taskForm, status) {
      let { column, group } = option;
      let vars = [];
      if (taskForm && taskForm.length > 0) {
        const columnFilter = this.filterAvueColumn(column, taskForm);
        column = columnFilter.column;
        vars = columnFilter.vars || [];

        const groupArr = [];
        if (group && group.length > 0) {
          // 处理group
          group.forEach(gro => {
            const groupFilter = this.filterAvueColumn(gro.column, taskForm);
            gro.column = groupFilter.column;
            vars = vars.concat(groupFilter.vars);
            if (gro.column.length > 0) groupArr.push(gro);
          });
        }
        group = groupArr;
      }

      if (status != 'todo') {
        // 已办，删除字段默认值
        option.detail = true;
        if (column && column.length > 0) {
          // 处理column
          column.forEach(col => this.handleResolveEvent(col, taskForm));
        }

        if (group && group.length > 0) {
          // 处理group
          group.forEach(gro => {
            if (gro.column && gro.column.length > 0) {
              gro.column.forEach(col => this.handleResolveEvent(col, taskForm));
            }
          });
        }
      }
      option.column = column;
      option.group = group;
      return { option, vars };
    },
    handleResolveEvent(col, taskForm) {
      const _this = this;
      delete col.value;
      if (!taskForm || taskForm.length == 0) {
        let event = ['change', 'blur', 'click', 'focus', 'lazyLoad', 'onLoad'];
        event.forEach(e => {
          if (col[e]) col[e] = eval((col[e] + '').replace(/this/g, '_this'));
        });
        if (col.event)
          Object.keys(col.event).forEach(
            key => (col.event[key] = eval((col.event[key] + '').replace(/this/g, '_this')))
          );
      }
      if (col.type == 'dynamic')
        col.children.column.forEach(cc => _this.handleResolveEvent(cc, taskForm));
    },
    // 审核
    handleExamine(pass) {
      this.submitLoading = true;
      this.$refs.form.validate((valid, done) => {
        if (valid) {
          const variables = {};
          this.vars.forEach(v => {
            if (!this.validatenull(this.form[v])) {
              variables[v] = this.form[v];
              if (this.form[`$${v}`]) variables[`$${v}`] = this.form[`$${v}`];
            }
          });

          this.handleCompleteTask(pass, variables)
            .then(() => {
              this.$message.success('处理成功');
              this.handleCloseTag('/desk/myprocess');
              this.$store.dispatch('UpdateWorkCountStatistic');
              this.closeDrawer();
              this.submitLoading = false;
            })
            .catch(() => {
              done();
              this.submitLoading = false;
            });
        } else {
          done();
          this.submitLoading = false;
        }
      });
    },
    // 关闭抽屉
    closeDrawer() {
      this.open = false;
      this.defaults = {};
      this.form = {};
      this.vars = [];
      this.info = {};
      this.$emit('close');
    },
    // 打开抽屉
    openDrawer(params) {
      const { OPPS_LIST_CACHE, DC_FEA_PRODUCT_TYPE } = this.useCache([
        { key: 'OPPS_LIST_CACHE' },
        { key: 'DC_FEA_PRODUCT_TYPE' },
      ]);
      this.OPPS_LIST_CACHE = OPPS_LIST_CACHE;
      this.DC_FEA_PRODUCT_TYPE = DC_FEA_PRODUCT_TYPE;
      this.open = true;
      const { taskId, processInsId } = params;
      if ((taskId && processInsId) || processInsId) this.getDetail(taskId, processInsId);
    },
  },
};
</script>
<style lang="scss">
.custom-drawer {
  padding-left: 24px;
  width: 1200px !important;
  .close-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 27px;
    height: 27px;
    background-color: #bbb;
    border-radius: 50%;
    left: 7px;
    top: 15px;
    font-size: 18px;
    color: #fff;
    font-weight: 600;
  }
  .el-drawer__header {
    display: none;
  }
  .el-drawer__body {
    padding: 0;
  }
  .layout-process {
    display: flex;
    width: 100%;
    height: 100%;
    &-left {
      display: flex;
      flex-direction: column;
      border-right: 1px solid #f5f5f5;
      flex: 1;
      overflow: auto;
      .left-head {
        padding: 24px;
        border-bottom: 1px solid #f5f5f5;
        &_title {
          font-weight: bold;
          font-size: 18px;
          color: #333;
          line-height: 18px;
        }
        &_info {
          margin-top: 20px;
          display: flex;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
          color: #666;
          line-height: 14px;
          gap: 12px;
        }
      }
      .left-body {
        flex: 1;
        box-sizing: border-box;
        padding: 24px;
        overflow: auto;
        .process-title {
          margin: 24px 0;
          font-weight: bold;
          font-size: 16px;
          color: #333;
          line-height: 16px;
          &:first-child {
            margin-top: 0;
          }
        }
        .info-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          .info-group {
            display: flex;
            align-items: flex-start;
            font-weight: 400;
            font-size: 14px;
            line-height: 18px;
            &_label {
              width: 94px;
              color: #666;
            }
            &_value {
              width: 336px;
              color: #333;
              overflow: auto;
            }
          }
        }
        .nf-form {
          .el-form-item__label {
            display: none;
          }
        }
      }
      .left-footer {
        display: flex;
        align-items: center;
        border-top: 1px solid #f5f5f5;
        height: 64px;
        .footer-btns {
          position: relative;
          & > div {
            height: auto !important;
          }
          .foot-item {
            position: relative;
            margin-left: 0;
            width: auto !important;
            box-shadow: unset;
            height: 63px;
          }
        }
        .close-btn {
          margin-left: 12px;
        }
      }
    }
    &-right {
      padding: 24px;
      width: 370px;
      box-sizing: border-box;
      .right-title {
        margin: 24px 0;
        font-weight: bold;
        font-size: 18px;
        color: #333;
        line-height: 18px;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.header {
  width: 100%;
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 10px 0;
}
</style>
