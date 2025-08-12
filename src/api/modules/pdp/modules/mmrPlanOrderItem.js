import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-item/list',
      method: 'get',
      params,
    });
  },

  // 保存接口
  submit(data) {
    return request({
      url: '/blade-bip/mmr-plan-order-item/submit',
      method: 'post',
      data,
    });
  },

  // 删除接口
  remove(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-item/remove',
      method: 'DELETE',
      params,
    });
  },

  // 详情接口
  detail(params) {
    return request({
      url: '/blade-bip/mmr-plan-order-item/detail',
      method: 'GET',
      params,
    });
  },

  // 排计划
  SchedulingPlanSubmit(data, params) {
    return request({
      url: `/blade-bip/mmr-plan-order-phase/scheduling-plan?planOrderId=${params.planOrderId}`,
      method: 'post',
      data,
    });
  },

  // 阶段计划甘特图
  getProjectPhaseScheduling(params) {
    return request({
      url: `/blade-bip/mmr-plan-order-phase/project-phase-scheduling`,
      method: 'get',
      params,
    });
  },

  // 阶段计划甘特图
  getTimeInterval() {
    return request({
      url: `/blade-bip/mmr-plan-order-phase/time-interval`,
      method: 'get',
    });
  },

  // 查询已排计划
  getPlanDetail(params) {
    return request({
      url: `/blade-bip/mmr-plan-order-phase/find-scheduling-plan-by-plan-order-id`,
      method: 'get',
      params,
    });
  },

  // 排计划
  resetPlan(data, params) {
    return request({
      url: `/blade-bip/mmr-plan-order-phase/scheduling-plan`,
      method: 'post',
      params,
      data,
    });
  },

  // 我的任务
  getPlanItemList(params) {
    return request({
      url: `/blade-bip/mmr-plan-order-plan-item/plan-item-list`,
      method: 'get',
      params,
    });
  },

  // 现场计划-任务-批量完成
  batchComplete(params) {
    return request({
      url: `/blade-bip/mmr-plan-order-plan-item/batch-complete`,
      method: 'get',
      params,
    });
  },

  // 现场计划-提交单个执行
  submitSingle(data) {
    return request({
      url: `/blade-bip/mmr-plan-order-plan-item/submit-single`,
      method: 'POST',
      data,
    });
  },
};
