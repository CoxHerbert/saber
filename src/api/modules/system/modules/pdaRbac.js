import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/pda/authority/list',
      method: 'get',
      params,
    });
  },

  // 保存
  submit(data) {
    return request({
      url: '/blade-bip/pda/authority/submit',
      method: 'post',
      data,
    });
  },

  // 详情
  detail(params) {
    return request({
      url: '/blade-bip/pda/authority/detail',
      method: 'get',
      params,
    });
  },

  // 删除
  remove(params) {
    return request({
      url: '/blade-bip/pda/authority/remove',
      method: 'DELETE',
      params,
    });
  },

  //标签打印服务
  cardDefaultPrinter(data) {
    return request({
      url: '/blade-pda/feign/client/pda/templdate-search',
      method: 'post',
      data,
    });
  },

  //标签打印服务
  printerSearch(data) {
    return request({
      url: '/blade-pda/feign/client/pda/printer-search',
      method: 'post',
      data,
    });
  },
};
