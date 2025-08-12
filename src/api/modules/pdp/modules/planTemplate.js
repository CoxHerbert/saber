import request from '@/axios';

export default {
  // 计划模板列表
  list(params) {
    return request({
      url: '/blade-bip/plan-template/list',
      method: 'get',
      params,
    });
  },
  // 提交或保存
  submit(data) {
    return request({
      url: '/blade-bip/plan-template/submit',
      method: 'post',
      data,
    });
  },
  // 模板详情
  detail(params) {
    return request({
      url: '/blade-bip/plan-tempitem/detail',
      method: 'get',
      params,
    });
  },
  // 模板删除
  remove(params) {
    return request({
      url: '/blade-bip/plan-template/remove',
      method: 'delete',
      params,
    });
  },
};
