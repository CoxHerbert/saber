import request from '@/axios';

export default {
  // 列表分页查询
  getUnreceivedList(params) {
    return request({
      url: '/blade-bip/po/unreceived-list',
      method: 'get',
      params,
    });
  },
  // 标签补打
  replayPrint(data) {
    return request({
      url: '/blade-bip/po/replay-print',
      method: 'post',
      data,
    });
  },
  //员工绩效
  fillAssessment(data) {
    return request({
      url: '/blade-bip/assessment/fill/page-data',
      method: 'post',
      data,
    });
  },
  // 提交员工绩效
  submitAssessment(data) {
    return request({
      url: '/blade-bip/assessment/fill/submit-v2',
      method: 'post',
      data,
    });
  },
  // 员工绩效列表
  getAssessmentRecordList(params) {
    return request({
      url: '/blade-bip/assessment/fill/assessment-record-list',
      method: 'get',
      params,
    });
  },
  // 保存草稿
  saveDraft(data) {
    return request({
      url: '/blade-bip/assessment/fill/save-draft',
      method: 'post',
      data,
    });
  },

  // 员工绩效记录列表（所有）
  getAssessmentRecordListAll(params) {
    return request({
      url: '/blade-bip/assessment/fill/assessment-record-list-all',
      method: 'get',
      params,
    });
  },
  // 员工考核模板列表
  getEmployeeAssessmentTemplateList(params) {
    return request({
      url: '/blade-bip/EmployeeAssessmentTemplate/list',
      method: 'get',
      params,
    });
  },
};
