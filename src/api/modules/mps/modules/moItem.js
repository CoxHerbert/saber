import request from '@/axios';

export default {
  //分解计划-领料查询-物料清单页面
  getMoItemMrList(params) {
    return request({
      url: '/blade-bip/mps/mo-item/mr-list',
      method: 'get',
      params,
    });
  },
  //二级列表
  getMoItemSecondList(params) {
    return request({
      url: '/blade-bip/mps/mo-item/second-list',
      method: 'get',
      params,
    });
  },
};
