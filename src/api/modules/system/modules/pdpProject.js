import request from '@/axios';

export default {
  list(params) {
    return request({
      url: `/blade-bip/pdp-project-file/list`,
      method: 'get',
      params,
    });
  },
  detail(params) {
    return request({
      url: `/blade-bip/pdp-project-file/detail`,
      method: 'get',
      params,
    });
  },
  submit(params, data) {
    return request({
      url: `/blade-bip/pdp-project-file/submit`,
      method: 'post',
      params,
      data,
    });
  },
  upload(params, data) {
    return request({
      url: `/blade-bip/pdp-project-file/upload-file`,
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params,
      data,
    });
  },
  remove(params) {
    return request({
      url: `/blade-bip/pdp-project-file/remove`,
      method: 'post',
      params,
    });
  },
  removes(params) {
    return request({
      url: `/blade-bip/pdp-project-file/remove-file`,
      method: 'post',
      params,
    });
  },
  fileShare(params) {
    return request({
      url: `/blade-bip/pdp-project-file/file-share`,
      method: 'post',
      params,
    });
  },
};
