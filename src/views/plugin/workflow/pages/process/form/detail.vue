<template>
  <nf-container>
    <el-skeleton :loading="waiting" :rows="8">
      <el-affix position="top" :offset="110">
        <div class="header">
          <h3>{{ process.processDefinitionName }}</h3>
          <div style="display: flex">
            <nf-theme
              v-if="process.status != 'todo'"
              v-model="theme"
              :theme-list="themeList"
            ></nf-theme>
            <nf-form-variable :process-ins-id="process.processInstanceId"></nf-form-variable>
          </div>
        </div>
      </el-affix>
      <el-tabs v-model="activeName">
        <el-tab-pane label="申请信息" name="first">
          <el-card shadow="never">
            <div
              id="printBody"
              :class="process.status != 'todo' ? `nf-theme-custom` : ''"
              :style="isPrintShow ? { padding: '20px' } : {}"
            >
              <!-- 汇总表单tab-->
              <el-tabs
                v-if="summaryOptionMode == 'tabs' && summaryOptionArr.length > 0"
                v-model="summaryActiveName"
              >
                <template v-for="(item, i) in summaryOptionArr" :key="i">
                  <el-tab-pane :label="item.label" :name="item.label">
                    <nf-form
                      v-if="
                        item &&
                        ((item.column && item.column.length > 0) ||
                          (item.group && item.group.length > 0))
                      "
                      v-model="form"
                      :style="themeCustomStyle"
                      :option="item"
                      style="margin-bottom: 20px"
                    ></nf-form>
                  </el-tab-pane>
                </template>
              </el-tabs>
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
              <el-card
                shadow="never"
                style="margin-top: 5px"
                header="流转信息"
                :body-style="{ padding: '20px 0' }"
                v-if="isPrintShow"
              >
                <nf-flow :flow-list="flow"></nf-flow>
              </el-card>
            </div>
          </el-card>
          <el-card shadow="never" style="margin-top: 20px" v-if="process.status == 'todo'">
            <nf-examine-form
              ref="examineForm"
              v-model:comment="comment"
              :process="process"
              @user-select="handleUserSelect"
            ></nf-examine-form>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="流转信息" name="second">
          <el-card shadow="never" style="margin-top: 5px">
            <nf-flow :flow-list="flow"></nf-flow>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="流程跟踪" name="third">
          <template v-if="activeName == 'third'">
            <el-card shadow="never" style="margin-top: 5px">
              <nf-design ref="bpmn" style="height: 500px" :options="bpmnOption"></nf-design>
            </el-card>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-skeleton>

    <!-- 底部按钮 -->
    <nf-button
      :loading="submitLoading"
      :button-list="buttonList"
      :process="process"
      :comment="comment"
      @draft="handleDraft({ taskId: process.taskId, variables: form })"
      @examine="handleExamine"
      @user-select="handleUserSelect"
      @print="handlePrint"
      @rollback="handleRollbackTask"
      @terminate="handleTerminateProcess"
      @withdraw="handleWithdrawTask"
      @drawingMatch="handleDrawingMatch('drawingMatch')"
    ></nf-button>
    <!-- 人员选择弹窗 -->
    <nf-user-select
      ref="user-select"
      :check-type="checkType"
      :default-checked="defaultChecked"
      @onConfirm="handleUserSelectConfirm"
    ></nf-user-select>
  </nf-container>
</template>

<script>
import NfExamineForm from '../../../components/nf-exam-form/index.vue';
import NfButton from '../../../components/nf-button/index.vue';
import NfFlow from '../../../components/nf-flow/index.vue';
import NfUserSelect from '../../../components/nf-user-select/index.vue';
import NfTheme from '../../../components/nf-theme/index.vue';
import NfFormVariable from '../../../components/nf-form-variable/index.vue';
import exForm from '../../../mixins/ex-form';
import theme from '../../../mixins/theme';
import draft from '../../../mixins/draft';
import action from '../../../mixins/action';

export default {
  mixins: [exForm, theme, draft, action],
  components: { NfUserSelect, NfExamineForm, NfButton, NfFlow, NfTheme, NfFormVariable },
  watch: {
    '$route.params.params': {
      handler(val) {
        if (val) {
          const param = JSON.parse(window.atob(val));
          const { taskId, processInsId } = param;
          if (taskId && processInsId) this.getDetail(taskId, processInsId);
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      activeName: 'first',
      defaults: {},
      form: {},
      option: {},
      vars: [], // 需要提交的字段
      submitLoading: false, // 提交时按钮loading
      summaryOption: {}, // 汇总表单option
      summaryOptionMode: 'collapse', // 汇总表单模式，需要汇总的表单不包含group时展示折叠，包含group时展示tabs
      summaryOptionArr: [], // 汇总表单option arr
      summaryActiveName: '', // 汇总表单当前激活的tab
    };
  },
  methods: {
    // 获取任务详情
    getDetail(taskId, processInsId) {
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
        .catch(() => {
          this.goback();
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
      const { form, summaryForm } = this.$refs;
      if (form) {
        this.$refs.form.validate((valid, done, msg) => {
          if (valid) {
            const variables = {};
            this.vars.forEach(v => {
              if (!this.validateNull(this.form[v])) {
                variables[v] = this.form[v];
                if (this.form[`$${v}`]) variables[`$${v}`] = this.form[`$${v}`];
              }
            });

            this.handleCompleteTask(pass, variables)
              .then(() => {
                this.$message.success('处理成功');
                this.goback();
                // this.handleCloseTag('/plugin/workflow/pages/process/todo');
                this.$store.dispatch('UpdateWorkCountStatistic');
              })
              .catch(error => {
                console.error('error', error);
                if (typeof done == 'function') done();
                this.submitLoading = false;
              });
          } else {
            done();
            this.submitLoading = false;
            if (msg) {
              const key = Object.keys(msg)[0];
              const rules = msg[key];
              this.$message.error(rules.map(r => r.message).join(' | '));
            }
          }
        });
      } else if (summaryForm) {
        this.handleCompleteTask(pass, {})
          .then(() => {
            this.$message.success('处理成功');
            this.goback();
            // this.handleCloseTag('/plugin/workflow/pages/process/todo');
            this.$store.dispatch('UpdateWorkCountStatistic');
          })
          .catch(() => {
            this.submitLoading = false;
          });
      } else this.$message.error('找不到需要提交的表单');
    },
  },
};
</script>

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
