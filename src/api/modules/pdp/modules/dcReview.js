import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/dc-review/list',
      method: 'get',
      params,
    });
  },

  // 评审类型
  reviewType() {
    return request({
      url: '/blade-bip/dc-review/review-type',
      method: 'get',
    });
  },
  findPlanItemByProjectId(params) {
    return request({
      url: '/blade-bip/dc-review/find-plan-item-by-project-id',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-bip/dc-review/submit',
      method: 'POST',
      data,
    });
  },
  // 提交  创建评审
  initiateReviewSubmit(data) {
    return request({
      url: '/blade-bip/dc-review/initiate-review',
      method: 'POST',
      data,
    });
  },
  //评审资料审核
  dataReviewSubmit(data) {
    return request({
      url: '/blade-bip/dc-review/data-review',
      method: 'POST',
      data,
    });
  },

  // 评审资料审核  主管审核
  dataReViewSubmit(data) {
    return request({
      url: '/blade-bip/dc-review/data-review',
      method: 'POST',
      data,
    });
  },

  // 召集评审提交
  ReviewNoticeSubmit(data) {
    return request({
      url: '/blade-bip/dc-review/review-notice',
      method: 'POST',
      data,
    });
  },
  // 召集评审提交
  ReviewConclusionSubmit(data) {
    return request({
      url: '/blade-bip/dc-review/review-conclusion',
      method: 'POST',
      data,
    });
  },
  // 召集评审提交
  ReviewConclusionSubmitV2(data) {
    return request({
      url: '/blade-bip/dc-review/review-conclusion-v2',
      method: 'POST',
      data,
    });
  },

  // 评审明细查询
  detail(params) {
    return request({
      url: '/blade-bip/dc-review/detail-by-id',
      method: 'get',
      params,
    });
  },
};
