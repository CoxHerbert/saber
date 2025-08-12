import request from '@/axios';

export default {
  // 列表
  list(params) {
    return request({
      url: '/blade-bip/CrmCustomerArea/list',
      method: 'get',
      params,
    });
  },

  // 保存或新增
  submit(data) {
    return request({
      url: '/blade-bip/CrmCustomerArea/submit',
      method: 'post',
      data,
    });
  },
  // 商代工厂删除数据
  remove(params) {
    return request({
      url: `/blade-bip/CrmCustomerArea/remove`,
      method: 'delete',
      params,
    });
  },
};
