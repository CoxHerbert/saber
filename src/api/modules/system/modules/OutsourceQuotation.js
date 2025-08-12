import request from '@/axios';

export default {
  // 分页查询列表
  list(params) {
    return request({
      url: `/blade-bip/OutsourceQuotation/list`,
      method: 'get',
      params,
    });
  },
  // 工序外发详情
  detail(params) {
    return request({
      url: `/blade-bip/OutsourceQuotation/detail`,
      method: 'get',
      params,
    });
  },
  // 新增或修改
  submit(data) {
    return request({
      url: `/blade-bip/OutsourceQuotation/submit`,
      method: 'post',
      data,
    });
  },
  // 删除
  remove(ids) {
    return request({
      url: `/blade-bip/OutsourceQuotation/remove`,
      method: 'delete',
      params: {
        ids,
      },
    });
  },
  // 通用-获取erp外协采购单以及委外订单-load-all-erp-outsoruce-data
  loadAllErpOutsoruceData(params) {
    return request({
      url: `/blade-bip/OutsourceQuotation/Opt/load-all-erp-outsoruce-data`,
      method: 'get',
      params,
    });
  },
  // 保存外协价格表-save
  save(data) {
    return request({
      url: `/blade-bip/OutsourceQuotation/Opt/save`,
      method: 'post',
      data,
    });
  },
  // 保存外协价格表-save
  saveErp(data, params) {
    return request({
      url: `/blade-bip/OutsourceQuotation/Opt/submit`,
      method: 'post',
      params,
      data,
    });
  },
  // 根据物料编码查询物料历史推送价格
  getHisPrice(params) {
    return request({
      url: `/blade-bip/OutsourceMaterialPrice/list-by-fnumber`,
      method: 'get',
      params,
    });
  },

  // 外协采购单-获取物料列表
  getRawList(params) {
    return request({
      url: `/blade-bip/OutsourceQuotation/Opt/get-raw-list`,
      method: 'get',
      params,
    });
  },
  // 根据订单编码查询订单详情
  getOrderDetail(params) {
    return request({
      url: `/blade-bip/OutsourceQuotation/Opt/load-by-entry-id`,
      method: 'get',
      params,
    });
  },
  // 根据物料编码查询历史工艺
  getHistoryProcess(params) {
    return request({
      url: `/blade-bip/OutsourceQuotation/Opt/get-history-process-by-material-code`,
      method: 'get',
      params,
    });
  },
  // 保存并推送至erp
  saveAndPushToErp(data) {
    return request({
      url: `/blade-bip/OutsourceQuotation/Opt/save-and-push-to-erp`,
      method: 'post',
      data,
    });
  },
  // 保存并推送至erp
  loadHistoryByEntryId(params) {
    return request({
      url: `/blade-bip/OutsourceQuotation/Opt/load-history-by-entry-id`,
      method: 'get',
      params,
    });
  },
};
