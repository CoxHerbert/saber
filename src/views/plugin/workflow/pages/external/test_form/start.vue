<template>
  <nf-container>
    <el-skeleton :loading="waiting" avatar :rows="8">
      <h3 style="margin-bottom: 20px">{{ process.name }}</h3>
      <el-card shadow="never" style="margin-top: 20px">
        <!-- 自定义表单区域 -->
        <nf-form
          v-if="
            option &&
            ((option.column && option.column.length > 0) ||
              (option.group && option.group.length > 0))
          "
          v-model="form"
          ref="form"
          :option="option"
          v-model:defaults="defaults"
          @submit="handleSubmit"
          @error="loading = false"
          :upload-preview="handleUploadPreview"
        >
        </nf-form>
        <!-- 自定义表单区域 -->
      </el-card>

      <el-card shadow="never" style="margin-top: 20px" v-if="showExamForm">
        <nf-examine-form
          ref="examineForm"
          :process="process"
          @user-select="handleUserSelect"
        ></nf-examine-form>
      </el-card>
      <div style="height: 80px"></div>
      <el-affix position="bottom" :offset="20">
        <el-row
          class="foot-item"
          :style="{ width: isCollapse ? 'calc(100% - 71px)' : 'calc(100% - 241px)' }"
        >
          <el-button type="primary" size="default" v-loading="loading" @click="handleSubmit">
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
        </el-row>
      </el-affix>
    </el-skeleton>

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
import { submit } from '../../../api/demo/leave.js';
import NfExamineForm from '../../../components/nf-exam-form/index.vue';
import NfUserSelect from '../../../components/nf-user-select/index.vue';
import exForm from '../../../mixins/ex-form';
import draft from '../../../mixins/draft';

export default {
  components: {
    NfUserSelect,
    NfExamineForm,
  },
  mixins: [exForm, draft],
  watch: {
    '$route.query.p': {
      handler(val) {
        if (val) {
          const param = JSON.parse(window.atob(val));
          const { processId, processDefKey } = param;
          if (processId || processDefKey) this.getForm(processId, processDefKey);
        }
      },
      immediate: true,
    },
  },
  computed: {
    showExamForm() {
      const { hideComment, hideCopy, hideExamine } = this.process;
      return !hideComment || !hideCopy || !hideExamine;
    },
  },
  data() {
    return {
      defaults: {},
      form: {},
      option: {
        menuBtn: false,
        column: [
          {
            type: 'input',
            label: '客户名称',
            span: 6,
            display: true,
            prop: 'customer',
          },
          {
            type: 'input',
            label: '商机名称',
            span: 6,
            display: true,
            prop: 'business',
          },
          {
            type: 'input',
            label: '联系人',
            span: 6,
            display: true,
            prop: 'contactPeople',
          },
          {
            type: 'input',
            label: '联系方式',
            span: 6,
            display: true,
            prop: 'contactPhone',
          },
        ],
      },
      process: {},
      loading: false,
    };
  },
  methods: {
    getForm(processId, processDefKey) {
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
        let { process, startForm } = res;
        this.form.processId = process.id;
        const option = this.option;
        const { column, group } = option;

        const groupArr = [];
        const columnArr = this.filterAvueColumn(column, startForm, true).column;
        if (group && group.length > 0) {
          // 处理group
          group.forEach(gro => {
            gro.column = this.filterAvueColumn(gro.column, startForm, true).column;
            if (gro.column.length > 0) groupArr.push(gro);
          });
        }

        option.column = columnArr;
        option.group = groupArr;
        this.option = option;

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
        this.waiting = false;
      });
    },
    handleSubmit() {
      let form = this.deepClone(this.form);
      form = {
        ...form,
        processDefId: form.processId,
        exFormKey: this.process.formKey,
        exFormUrl: this.process.formUrl,
      };
      submit(form).then(res => {
        const data = res.data.data;
        this.form.processDefKey = this.process.key;
        this.form.businessKey = data.id;
        this.handleStartProcessByKey(true)
          .then((res, done) => {
            const processInsId = res.data.data;
            submit({ id: data.id, processInsId }).then(() => {
              this.$message.success('发起成功');
              this.handleCloseTag('/plugin/workflow/pages/process/send');
              this.$store.dispatch('UpdateWorkCountStatistic');
              if (typeof done == 'function') done();
            });
          })
          .catch(() => {
            this.loading = false;
          });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.foot-item {
  position: fixed;
  bottom: 5px;
  margin-left: -20px;
  // right: 0;
  z-index: 101;
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
</style>
