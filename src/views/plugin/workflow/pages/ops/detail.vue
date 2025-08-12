<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="申请信息" name="first">
      <el-card shadow="never">
        <div ref="printBody" class="nf-theme-default">
          <nf-form
            v-if="
              option &&
              ((option.column && option.column.length > 0) ||
                (option.group && option.group.length > 0))
            "
            v-model="form"
            ref="form"
            :option="option"
            :upload-preview="handleUploadPreview"
          >
          </nf-form>
        </div>
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
</template>

<script>
import NfFlow from '../../components/nf-flow/index.vue';

import exForm from '../../mixins/ex-form';
import theme from '../../mixins/theme';

export default {
  mixins: [exForm, theme],
  components: { NfFlow },
  props: {
    processInstanceId: String,
    taskId: String,
  },
  watch: {
    processInstanceId: {
      handler() {
        const { taskId, processInstanceId } = this;
        if ((taskId && processInstanceId) || processInstanceId)
          this.getDetail(taskId, processInstanceId);
      },
      immediate: true,
    },
  },
  data() {
    return {
      activeName: 'first',
      form: {},
      option: {},
      vars: [], // 需要提交的字段
      submitLoading: false, // 提交时按钮loading
    };
  },
  methods: {
    // 获取任务详情
    getDetail(taskId, processInsId) {
      this.getTaskDetail(taskId, processInsId).then(res => {
        const { process, form } = res;
        const { variables } = process;

        let { allForm } = form;
        if (allForm) {
          const option = eval('(' + allForm + ')');
          option.menuBtn = false;
          const { column, group } = option;
          option.detail = true;
          let event = ['change', 'blur', 'click', 'focus'];
          if (column && column.length > 0) {
            // 处理column
            column.forEach(col => {
              if (col.type == 'dynamic')
                col.children.column.forEach(cc => {
                  delete cc.value;
                  delete cc.event;
                  event.forEach(e => delete cc[e]);
                });
              else {
                delete col.value;
                delete col.event;
                event.forEach(e => delete col[e]);
              }
            });
          }

          if (group && group.length > 0) {
            // 处理group
            group.forEach(gro => {
              if (gro.column && gro.column.length > 0) {
                gro.column.forEach(col => {
                  if (col.type == 'dynamic')
                    col.children.column.forEach(cc => {
                      delete cc.value;
                      delete cc.event;
                      event.forEach(e => delete cc[e]);
                    });
                  else {
                    delete col.value;
                    delete col.event;
                    event.forEach(e => delete col[e]);
                  }
                });
              }
            });
          }
          for (let key in variables) {
            if (!variables[key]) delete variables[key];
          }
          if (process.variables && process.variables.serialNumber) {
            column.unshift({
              label: '流水号',
              prop: 'serialNumber',
              span: 24,
              detail: true,
            });
          }
          option.column = column;
          option.group = group;

          this.option = option;
          this.form = variables;
        }
      });
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
