import request from '@/axios';

export default {
  // 加入打印
  postPrintJoin(data) {
    return request({
      url: '/pdf-printing/join',
      method: 'post',
      data,
    });
  },
  // 生产主计划生成工序
  getProdPlan(params) {
    return request({
      url: '/pdf-printing/join',
      method: 'get',
      params,
    });
  },
};
