import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/dc-pdp-func-user-config/list',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-bip/dc-pdp-func-user-config/submit',
      method: 'post',
      data,
    });
  },
  getReviewDimensionTemplate(params) {
    return request({
      url: '/blade-bip/dc-review-dimension/review-dimension-template',
      method: 'get',
      params,
    });
  },
  submitReviewDimension(data) {
    return request({
      url: '/blade-bip/dc-review-dimension/submit',
      method: 'post',
      data,
    });
  },
  submitReviewIssues(data) {
    return request({
      url: '/blade-bip/dc-review-issues/submit',
      method: 'post',
      data,
    });
  },
  getReviewDimension(params) {
    return request({
      url: '/blade-bip/dc-review-issues/get-detail',
      method: 'get',
      params,
    });
  },
  removeReviewDimension(params) {
    return request({
      url: '/blade-bip/dc-review-dimension/remove',
      method: 'delete',
      params,
    });
  },
  removeIssues(params) {
    return request({
      url: '/blade-bip/dc-review-issues/remove',
      method: 'delete',
      params,
    });
  },
};
