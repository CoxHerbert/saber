import request from '@/axios';

export default {
  // 仓库列表
  list(params) {
    return request({
      url: '/blade-bip/dc-wms-warehouse-location/list',
      method: 'get',
      params,
    });
  },
  // 保存&修改
  submit(data) {
    return request({
      url: '/blade-bip/dc-wms-warehouse-location/submit',
      method: 'post',
      data,
    });
  },
  // 明细查询
  detail(params) {
    return request({
      url: '/blade-bip/dc-wms-warehouse-location/detail',
      method: 'get',
      params,
    });
  },
  // 删除仓库
  remove(params) {
    return request({
      url: '/blade-bip/dc-wms-warehouse-location/remove',
      method: 'delete',
      params,
    });
  },
};
