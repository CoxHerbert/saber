import request from '@/axios';

export default {
  // 仓库列表
  list(params) {
    return request({
      url: '/blade-bip/dc-wms-cargo-owner/list',
      method: 'get',
      params,
    });
  },
  // 保存&修改
  submit(data) {
    return request({
      url: '/blade-bip/dc-wms-cargo-owner/submit',
      method: 'post',
      data,
    });
  },
  // 明细查询
  detail(params) {
    return request({
      url: '/blade-bip/dc-wms-cargo-owner/detail',
      method: 'get',
      params,
    });
  },
};
