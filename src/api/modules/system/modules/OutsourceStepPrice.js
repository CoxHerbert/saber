import request from '@/axios';

export default {
  // 分页查询列表
  list(params) {
    return request({
      url: `/blade-bip/OutsourceStepPrice/list`,
      method: 'get',
      params,
    });
  },
  // 新增或修改
  submit(data) {
    return request({
      url: `/blade-bip/OutsourceStepPrice/submit`,
      method: 'post',
      data,
    });
  },
};
