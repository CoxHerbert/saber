import request from '@/axios';

export default {
  // 列表
  list(params) {
    return request({
      url: '/blade-bip/WireChange/list',
      method: 'get',
      params,
    });
  },
  // 变更单关联查询
  changeDetail(params) {
    return request({
      url: '/blade-bip/WireChange/change-detail',
      method: 'post',
      params,
    });
  },
  // excel导入
  upload(data) {
    return request({
      url: '/blade-bip/WireChange/importExcel',
      method: 'post',
      data,
    });
  },
  // 删除
  remove() {
    return request({
      url: '/blade-bip/WireChange/importExcel',
      method: 'post',
      data,
    });
  },
  // 图纸变更
  wireChange(params) {
    return request({
      url: '/blade-bip/WireChange/wire-change',
      method: 'post',
      params,
    });
  },
};
