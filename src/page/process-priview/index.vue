<template>
  <div v-loading="loading" style="width: 100%; height: 100%">
    <nf-design v-if="bpmnOption" ref="bpmn" :options="bpmnOption"></nf-design>
  </div>
</template>

<script>
import { detail } from '@/views/plugin/workflow/api/process/process.js';
import dayjs from 'dayjs';
export default {
  data() {
    return {
      bpmnOption: null,
    };
  },

  mounted() {
    // 主要代码 开始
    let that = this;
    // 获取url 中的参数
    let datas = that.$route.query;
    // this.$store.commit('SET_TOKEN', datas.token);
    setTimeout(() => {
      this.getTaskDetail(datas.taskId, datas.processInsId);
    }, 100);
  },
  methods: {
    getTaskDetail(taskId, processInsId) {
      detail({
        taskId,
        processInsId,
      }).then(res => {
        const data = res.data.data;
        this.bpmnOption = {
          mode: 'view',
          xml: data.process.xml,
          flows: this.handleResolveFlows(data.flow),
        };
      });
    },

    // getUrlParams() {
    //   let queryParams = {};
    //   const queryString = window.location.search;
    //   const urlParams = new URLSearchParams(queryString);
    //   for (const param of urlParams.entries()) {
    //     queryParams[param[0]] = param[1];
    //   }
    //   return queryParams;
    // },

    handleResolveFlows(flow) {
      // 优化多实例节点人员显示。
      flow = this.deepClone(flow);
      const result = {};
      flow.forEach(f => {
        if (result[f.historyActivityId]) {
          result[f.historyActivityId].push(f);
        } else {
          result[f.historyActivityId] = [f];
        }
      });
      for (let key in result) {
        const list = result[key];
        if (list.length > 1) {
          const node = flow.findLast(f => f.historyActivityId == key);
          node.assigneeName = Array.from(new Set(list.map(l => l.assigneeName))).join('/');
        }
      }

      const flows = [];

      flow.forEach(f => {
        let { assigneeName, createTime, endTime, comments } = f;

        if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
          // safari
          createTime = createTime ? createTime.replace(/-/g, '/') : null;
          endTime = endTime ? endTime.replace(/-/g, '/') : null;
        }

        const ff = {
          id: f.historyActivityId,
          class: !endTime && f.historyActivityType != 'candidate' ? 'nodePrimary' : '',
        };
        let tooltip = '';
        if (assigneeName) {
          tooltip = `<span title='${assigneeName}'>${assigneeName}</span><br>`;
          if (createTime) console.log(createTime);
          tooltip += `<span title='${createTime}'>${dayjs(createTime).format(
            'YYYY-MM-DD HH:mm'
          )}</span><br>`;

          if (comments && comments.length > 0) {
            let comment;
            let { type, fullMessage } = comments.find(c => c.action == 'AddComment') || {};

            if (type == 'assigneeComment') {
              comment = '变更审核人：' + fullMessage;
              ff.class = 'nodeWarn';
            }
            if (type == 'dispatchComment') {
              comment = '调度：' + fullMessage;
              ff.class = 'nodeWarn';
            }
            if (type == 'transferComment') {
              comment = '转办：' + fullMessage;
              ff.class = 'nodeWarn';
            }
            if (type == 'delegateComment') {
              comment = '委托：' + fullMessage;
              ff.class = 'nodeWarn';
            }
            if (type == 'rollbackComment') {
              comment = '驳回：' + fullMessage;
              ff.class = 'nodeError';
            }
            if (type == 'terminateComment') {
              comment = '终止：' + fullMessage;
              ff.class = 'nodeError';
            }
            if (type == 'addMultiInstanceComment') {
              comment = '加签：' + fullMessage;
              ff.class = 'nodeWarn';
            }
            if (type == 'deleteMultiInstanceComment') {
              comment = '减签：' + fullMessage;
              ff.class = 'nodeError';
            }
            if (type == 'withdrawComment') {
              comment = '撤销：' + fullMessage;
              ff.class = 'nodeWarn';
            }
            if (type == 'deleteProcessComment') {
              comment = '删除流程：' + fullMessage;
              ff.class = 'nodeError';
            }
            if (type == 'comment') {
              comment = '审批：' + fullMessage;
              ff.class = 'nodeSuccess';
            }
            if (comment) tooltip += `<span title='${comment}'>${comment}</span>`;
          }
          ff.tooltip = tooltip;
        }

        if (f.historyActivityType == 'sequenceFlow') ff.class = 'lineWarn';
        else if (!ff.class && f.historyActivityType != 'candidate') ff.class = 'nodeSuccess';

        const index = flows.findIndex(fl => fl.id == f.historyActivityId);
        if (index != -1) flows.splice(index, 1, ff);
        else flows.push(ff);
      });
      return flows;
    },
  },
};
</script>

<style></style>
