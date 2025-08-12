import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/project/list',
      method: 'get',
      params,
    });
  },
  // 新增或修改
  submit(data) {
    return request({
      url: '/blade-bip/project/submit',
      method: 'post',
      data,
    });
  },
  // 项目详情
  detail(params) {
    return request({
      url: '/blade-bip/project/detail',
      method: 'get',
      params,
    });
  },
  endCustomerCodeList(params) {
    return request({
      url: '/blade-bip/end-customer-project-code/list',
      method: 'get',
      params,
    });
  },
  // 项目删除
  delete(params) {
    return request({
      url: '/blade-bip/project/remove',
      method: 'DELETE',
      params,
    });
  },

  // 获取项目信息
  findProjectVo(params) {
    return request({
      url: '/blade-bip/project/find-project-vo',
      method: 'GET',
      params,
    });
  },

  // 可创建交付启动会的项目列表
  findProjectDelivered(params) {
    return request({
      url: '/blade-bip/delivered/find-project-delivered',
      method: 'GET',
      params,
    });
  },
};
