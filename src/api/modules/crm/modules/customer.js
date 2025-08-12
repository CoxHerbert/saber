import request from '@/axios';

export default {
  // 客户名称模糊查询
  getCustomerLikeList(params) {
    return request({
      url: '/blade-bip/customer/customer-like-list',
      method: 'get',
      params,
    });
  },

  // 客户主数据列表
  getCustomerList(params) {
    return request({
      url: '/blade-bip/customer/list',
      method: 'get',
      params,
    });
  },

  // 客户删除接口
  deleteCustomerRemove(params) {
    return request({
      url: '/blade-bip/customer/remove',
      method: 'DELETE',
      params,
    });
  },

  // 客户详情接口
  getDetail(params) {
    return request({
      url: '/blade-bip/customer/detail',
      method: 'get',
      params,
    });
  },

  getLog(data) {
    return request({
      url: '/blade-log/usual/list-by-log-id',
      method: 'post',
      data,
    });
  },

  // 客户保存接口
  postCustomerSubmit(data) {
    return request({
      url: '/blade-bip/customer/submit',
      method: 'post',
      data,
    });
  },

  // 企业名称模糊查询
  getCustomerFuzzySearchForEnterpriseName(params) {
    return request({
      url: '/blade-bip/customer/fuzzy-search-for-enterprise-name',
      method: 'get',
      params,
    });
  },

  // 企业工商照面查询
  getCustomerEnterpriseBusinessLicenseInquiry(params) {
    return request({
      url: '/blade-bip/customer/enterprise-business-license-inquiry',
      method: 'get',
      params,
    });
  },
};
