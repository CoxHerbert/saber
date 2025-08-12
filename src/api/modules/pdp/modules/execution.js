import request from '@/axios';

export default {
  /**
   * tpm列表查询
   * */
  tpm(params) {
    return request({
      url: '/blade-bip/dc/erp/select/tpm',
      method: 'get',
      params,
    });
  },
  /** 查询产品系列 */
  productSeriation(params) {
    return request({
      url: '/blade-bip/dc/erp/select/productSeriation',
      method: 'get',
      params,
    });
  },
  /** 主管审核人员列表 */
  headerAudit(params) {
    return request({
      url: '/blade-bip/dc/erp/select/header-audit',
      method: 'get',
      params,
    });
  },
  /** 客户列表 */
  customers(params) {
    return request({
      url: '/blade-bip/dc/erp/select/customers',
      method: 'get',
      params,
    });
  },
  /** 客户列表 */
  endCustomers(params) {
    return request({
      url: '/blade-bip/dc/erp/select/end-customers',
      method: 'get',
      params,
    });
  },
  /** 查询币种 */
  currencies(params) {
    return request({
      url: '/blade-bip/dc/erp/select/currencies',
      method: 'get',
      params,
    });
  },

  /** 查询币种 */
  collectionTerms(params) {
    return request({
      url: '/blade-bip/dc/erp/select/collectionTerms',
      method: 'get',
      params,
    });
  },

  /** 查询收款条件 */
  collectionTerms(params) {
    return request({
      url: '/blade-bip/dc/erp/select/collectionTerms',
      method: 'get',
      params,
    });
  },
  /** 查询收款条件 */
  salers(params) {
    return request({
      url: '/blade-bip/dc/erp/select/salers',
      method: 'get',
      params,
    });
  },

  /** 查询项目编号 */
  projectNumbers(params) {
    return request({
      url: '/blade-bip/dc/erp/select/projectNumbers',
      method: 'get',
      params,
    });
  },
  equipmentName(params) {
    return request({
      url: '/blade-bip/dc/erp/select/equipment-name',
      method: 'get',
      params,
    });
  },
  /** 查询跟单 */
  documentaries(params) {
    return request({
      url: '/blade-bip/dc/erp/select/documentaries',
      method: 'get',
      params,
    });
  },
  /** 查询物料 */
  materials(params) {
    return request({
      url: '/blade-bip/dc/erp/select/materials',
      method: 'get',
      params,
    });
  },
  /** 查询项目名称 */
  projectNames(params) {
    return request({
      url: '/blade-bip/dc/erp/select/projectNames',
      method: 'get',
      params,
    });
  },
  /** 组织 */
  orgList(params) {
    return request({
      url: '/blade-bip/org/list-cache',
      method: 'get',
      params,
    });
  },
  optionTypeMap(params) {
    return request({
      url: '/blade-bip/dc/erp/biz/type-map',
      method: 'get',
      params,
    });
  },
  //   // 保存
  //   submit(data) {
  //     return request({
  //       url: '/blade-bip/fea-evaluation-problem/submit',
  //       method: 'post',
  //       data,
  //     });
  //   },

  //   // 删除
  //   remove(params) {
  //     return request({
  //       url: '/blade-bip/fea-evaluation-problem/remove',
  //       method: 'DELETE',
  //       params,
  //     });
  //   },

  //   planList(params) {
  //     return request({
  //       url: '/blade-bip/plan-item/list',
  //       method: 'get',
  //       params,
  //     });
  //   },
};
