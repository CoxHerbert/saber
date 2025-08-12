import request from '@/axios';

export default {
  // excel导入
  upload(data) {
    return request({
      url: '/blade-bip/WireBomItem/importExcel',
      method: 'post',
      data,
    });
  },
  // 图纸匹配
  drawingMatch(params) {
    return request({
      url: '/blade-bip/WireBomItem/drawingMatch',
      method: 'post',
      params,
    });
  },

  // 列表
  list(params) {
    return request({
      url: '/blade-bip/WireBomItem/list',
      method: 'get',
      params,
    });
  },

  // 明细查询
  detail(params) {
    return request({
      url: '/blade-bip/WireBomItem/detail',
      method: 'get',
      params,
    });
  },
};
