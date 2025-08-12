import request from '@/axios';

export default {
  getInspectionRecordOrderList(params) {
    return request({
      url: '/blade-bip/InspectionRecordOrder/list',
      method: 'get',
      params,
    });
  },
  getInspectionRecordOrderDetail(params) {
    return request({
      url: '/blade-bip/InspectionRecordOrder/record-detail',
      method: 'get',
      params,
    });
  },
};
