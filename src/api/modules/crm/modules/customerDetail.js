import request from '@/axios';

export default {
  //   跟进记录
  getContactRecordsGetLitMap(params) {
    return request({
      url: '/blade-bip/contact-records/get-lit-map',
      method: 'get',
      params,
    });
  },
  //   跟进记录删除
  deleteContactRecordsRemove(params) {
    return request({
      url: '/blade-bip/contact-records/remove',
      method: 'DELETE',
      params,
    });
  },
  //   跟进记录明细
  getContactRecordsDetail(params) {
    return request({
      url: '/blade-bip/contact-records/detail',
      method: 'get',
      params,
    });
  },
  //   跟进记录保存
  postContactRecordsSubmit(data) {
    return request({
      url: '/blade-bip/contact-records/submit',
      method: 'post',
      data,
    });
  },
};
