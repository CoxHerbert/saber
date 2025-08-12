import request from '@/axios';

export default {
  // 仓库列表
  list(params) {
    return request({
      url: '/blade-bip/dc-wms-warehouse/list',
      method: 'get',
      params,
    });
  },
  // 根据供应商ID获取入库单明细行
  supperList(params) {
    return request({
      url: '/blade-bip/scm-in-stock-detail/find-po-detail-by-supplier-id',
      method: 'get',
      params,
    });
  },
  // 保存&修改
  submit(data) {
    return request({
      url: '/blade-bip/dc-wms-warehouse/submit',
      method: 'post',
      data,
    });
  },
  // 明细查询
  detail(params) {
    return request({
      url: '/blade-bip/dc-wms-warehouse/detail',
      method: 'get',
      params,
    });
  },
  // 删除仓库
  remove(params) {
    return request({
      url: '/blade-bip/dc-wms-warehouse/remove',
      method: 'delete',
      params,
    });
  },
  // 修改仓库人员
  submitPerson(data) {
    return request({
      url: '/blade-bip/dc-wms-warehouse/submit-person',
      method: 'post',
      data,
    });
  },

  // 批量创建车位
  batchgenerationlocation(data) {
    return request({
      url: '/blade-bip/dc-wms-warehouse/batch-generation-location',
      method: 'post',
      data,
    });
  },
  // 异动记录
  getImrList(params) {
    return request({
      url: '/blade-bip/imr/list',
      method: 'get',
      params,
    });
  },
};
