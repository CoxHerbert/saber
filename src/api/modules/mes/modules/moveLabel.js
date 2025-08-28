import request from '@/axios';

export default {
  // 移动标签列表
  mesMoveLabelList(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/transferList',
      method: 'get',
      params,
    });
  },
  // 移动标签打印
  //   mesMoveLabelDetail(data) {
  //     return request({
  //       url: '/blade-bip/dc/mes/transfer/get-pdf-with-api',
  //       method: 'post',
  //       data,
  //     });
  //   },
};
