import Const from '@/const';
export default {
  getGroups: mode => {
    return {
      groups: [
        {
          label: '评审基本信息',
          key: 'basic',
          expandable: true,
          infoObjectName: 'dcReview',
          mode: ['view', 'done', 'audit'],
          formItems: [
            {
              label: '项目名称',
              prop: 'materialName',
              type: 'el-input',
              props: {
                disabled: true,
              },
            },
            {
              label: '关联任务',
              prop: 'taskId',
              type: 'dc-view',
              props: {
                objectName: 'planItem',
              },
            },
            {
              label: '专案号',
              prop: 'projectCaseId',
              type: 'dc-view',
              props: {
                objectName: 'deliveredItem',
              },
            },
            {
              label: '评审说明',
              prop: 'assessment',
              type: 'el-input',
              props: {
                type: 'textarea',
                disabled: true,
                placeholder: '无',
              },
            },
            {
              label: '参考资料',
              prop: 'referenceMaterial',
              type: 'dc-upload',
              props: {
                pain: true,
                isUpload: false,
                isRemove: false,
                targetType: Const.targetType.CUSTOMER,
              },
            },
            {
              label: '相关附件',
              prop: 'reviewData',
              type: 'dc-upload',
              props: {
                pain: true,
                isUpload: false,
                isRemove: false,
                targetType: Const.targetType.CUSTOMER,
              },
            },
          ],
        },
        {
          label: '问题单信息',
          key: 'quesition',
          expandable: true,
          mode: ['view', 'done', 'audit'],
          infoObjectName: 'dcReviewProblemAllocation',
          formItems: [
            {
              label: '问题描述',
              prop: 'reviewProblem',
              type: 'text',
              props: {
                placholder: '请输入问题描述',
                disabled: true,
              },
            },
            {
              label: '提议人',
              prop: 'reviewProposer',
              type: 'dc-view',
              props: {
                objectName: 'user',
              },
            },
            {
              label: '附件',
              prop: 'reviewAttachments',
              type: 'dc-upload',
              props: {
                pain: true,
                isUpload: false,
                isRemove: false,
                targetType: Const.targetType.CUSTOMER,
              },
            },
          ],
        },
        {
          label: '问题单处理',
          expandable: true,
          mode: ['audit', 'done', 'view'],
          key: 'done',
          showFunc(formData, modeSet) {
            if (['audit', 'done'].includes(modeSet)) {
              return true;
            } else if (modeSet === 'view') {
              return ['DC_REVIEW_PROBLEM_STATUS_C', 'DC_REVIEW_PROBLEM_STATUS_IN_REVIEW'].includes(
                formData.reviewProblemStatus
              );
            }
            return false;
          },
          infoObjectName: mode === 'audit' ? 'dcReviewProblemAllocation' : '',
          formItems: [
            {
              label: '附件上传',
              prop: 'attachmentAddress',
              type: 'dc-upload',
              props: ['audit', 'view'].includes(mode)
                ? {
                    pain: true,
                    isUpload: false,
                    isRemove: false,
                    targetType: Const.targetType.CUSTOMER,
                  }
                : {
                    limit: 5,
                    isUpload: true,
                    isRemove: true,
                    targetType: Const.targetType.CUSTOMER,
                  },
            },
            {
              label: '处理描述',
              prop: 'reviewProblemResult',
              type: 'el-input',
              props: {
                type: 'textarea',
                rows: 4,
                placeholder: mode === 'audit' ? '无' : '请输入问题描述',
                disabled: ['audit', 'view'].includes(mode) ? true : false,
              },
            },
          ],
        },
        {
          label: '问题单审核',
          key: 'audit',
          expandable: true,
          mode: ['audit', 'view'],
          infoObjectName: 'dcReviewProblemAllocation',
          showFunc(formData, modeSet) {
            if (['audit', 'done'].includes(modeSet)) {
              return true;
            } else if (modeSet === 'view') {
              return ['DC_REVIEW_PROBLEM_STATUS_C'].includes(formData.reviewProblemStatus);
            }
            return false;
          },
          formItems: [
            {
              label: '审核结论',
              prop: 'auditResult',
              type: 'el-radio-group',
              required: true,
              dictKey: 'DC_REVIEW_PROBLEM_RESULT',
              props: {
                disabled: ['view'].includes(mode) ? true : false,
              },
            },
            {
              label: '建议结论',
              prop: 'superiorOpinion',
              type: 'el-input',
              required: true,
              props: {
                type: 'textarea',
                rows: 4,
                maxLength: 250,
                placeholder: '请输入问题描述',
                disabled: ['view'].includes(mode) ? true : false,
              },
            },
          ],
        },
      ],
    };
  },
};
