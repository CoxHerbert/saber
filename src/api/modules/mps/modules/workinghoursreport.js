import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-bip/mps/Wksr/list',
      method: 'get',
      params,
    });
  },

  detail(params) {
    return request({
      url: '/blade-bip/mps/Wksr/detail',
      method: 'get',
      params,
    });
  },

  submit(data) {
    return request({
      url: '/blade-bip/mps/Wksr/submit',
      method: 'post',
      data,
    });
  },

  // 删除
  remove(params) {
    return request({
      url: '/blade-bip/mps/Wksr/remove-report',
      method: 'delete',
      params,
    });
  },

  // 明细列表
  planList(params) {
    return request({
      url: '/blade-bip/mps/Wksr/plan-list',
      method: 'get',
      params,
    });
  },

  // 计划明细
  planDetail(params) {
    return request({
      url: '/blade-bip/mps/Wksr/plan-detail',
      method: 'get',
      params,
    });
  },

  // 计划提交
  reporSavetSubmit(data, params) {
    return request({
      url: '/blade-bip/mps/Wksr/report-save',
      method: 'post',
      data,
      params,
    });
  },

  //获取明细
  queryDetailErp(params) {
    return request({
      url: '/blade-bip/mps/Wksr/query-erp',
      method: 'get',
      params,
    });
  },

  // 获取plan计划信息
  getPlanInfo(params) {
    return request({
      url: '/blade-bip/mps/work-schedule/get-plan-info',
      method: 'get',
      params,
    });
  },

  // 缺料查询接口
  getMaterialInfo(params) {
    return request({
      url: '/blade-bip/mps/work-schedule/get-material-info',
      method: 'get',
      params,
    });
  },
};
