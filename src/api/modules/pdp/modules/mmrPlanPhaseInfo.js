import request from '@/axios';
import { exportBlob } from '@/api/common';
import { downloadXls } from '@/utils/util';
import dayjs from 'dayjs';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/mmr-plan-phase-info/list',
      method: 'get',
      params,
    });
  },

  // 保存接口
  submit(data) {
    return request({
      url: '/blade-bip/mmr-plan-phase-info/submit',
      method: 'post',
      data,
    });
  },

  //   删除接口
  remove(params) {
    return request({
      url: '/blade-bip/mmr-plan-phase-info/remove',
      method: 'DELETE',
      params,
    });
  },

  /** 导出 */
  exportAll() {
    exportBlob('/blade-bip/mmr-plan-order-count/export-details-all').then(res => {
      downloadXls(res.data, `计划统计${dayjs().format('YYYY-MM-DD')}.xlsx`);
    });
  },
  /** 导出当前 */
  exportCurrent(params) {
    exportBlob(
      `/blade-bip/mmr-plan-order-count/export-current-page?current=${params.current}&size=${params.size}`
    ).then(res => {
      downloadXls(res.data, `计划统计${dayjs().format('YYYY-MM-DD')}.xlsx`);
    });
  },
  /** 导出mrp当前 */
  exportPage(params) {
    exportBlob(`/blade-erp/plan-order/find-mrp-split-order-export`, params).then(res => {
      downloadXls(res.data, `MRP${dayjs().format('YYYY-MM-DD')}.xlsx`);
    });
  },
};
