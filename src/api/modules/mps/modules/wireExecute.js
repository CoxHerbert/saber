import request from '@/axios';

export default {
  // 列表
  list(params) {
    return request({
      url: '/blade-bip/WireExecute/list',
      method: 'get',
      params,
    });
  },
  // 明细查询
  detail(params) {
    return request({
      url: '/blade-bip/WireExecute/execute-detail',
      method: 'get',
      params,
    });
  },
  // 删除
  remove() {
    return request({
      url: '/blade-bip/WireExecute/remove',
      method: 'get',
      params,
    });
  },
  // 打印列表
  printList(params) {
    return request({
      url: '/blade-bip/WireExecute/print-list-v2',
      method: 'get',
      params,
    });
  },

  // 打印
  printDraw(params) {
    return request({
      url: '/blade-bip/WireExecute/print-draw',
      method: 'get',
      params,
    });
  },
  printDrawv2(params) {
    return request({
      url: '/blade-bip/WireExecute/print-draw-v2',
      method: 'get',
      params,
    });
  },
  // 打印
  printOne(params) {
    return request({
      url: '/blade-bip/WireExecute/print-one',
      method: 'get',
      params,
    });
  },
  // 打印日志
  printLog(params) {
    return request({
      url: '/blade-bip/WireExecute/print-log',
      method: 'get',
      params,
    });
  },
};
