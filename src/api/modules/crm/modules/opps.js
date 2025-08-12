import request from '@/axios';

export default {
  // 商机保存接口
  postOppsSubmit(data) {
    return request({
      url: '/blade-bip/opps/submit',
      method: 'post',
      data,
    });
  },

  // 商机主数据列表
  getOppsList(params) {
    return request({
      url: '/blade-bip/opps/list',
      method: 'get',
      params,
    });
  },

  // 商机查询列表
  getOppsDetail(params) {
    return request({
      url: '/blade-bip/opps/detail',
      method: 'get',
      params,
    });
  },

  // 商机删除接口
  DeleteOppsRemove(params) {
    return request({
      url: '/blade-bip/opps/remove',
      method: 'DELETE',
      params,
    });
  },

  // 商机上传附件
  getOppDsetail(params) {
    return request({
      url: '/blade-bip/opps/detail',
      method: 'get',
      params,
    });
  },

  // 商机详情
  getOppsUploadAttachments(data) {
    return request({
      url: '/blade-bip/opps/upload-attachments',
      method: 'post',
      data,
    });
  },
};
