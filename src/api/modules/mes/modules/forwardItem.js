import request from '@/axios';

export default {
  // 详情
  getForwardItem(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/item/list',
      method: 'get',
      params: {
        ...params,
        current: 1,
        size: 999999,
      },
    });
  },
  // 保存或新增
  submitForwardItem(data) {
    return request({
      url: '/blade-bip/dc/mes/forward/save-item',
      method: 'post',
      data,
    });
  },
  // 删除
  removeForwardItem(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/item/remove',
      method: 'delete',
      params,
    });
  },
  // 获取工序列表
  getProcessList(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/item/process-list',
      method: 'get',
      params,
    });
  },
};
