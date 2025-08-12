import request from '@/axios';

export default {
  getAppList(params) {
    return request({
      url: '/blade-bip/collect/view',
      method: 'get',
      params,
    });
  },
  getUserInfo(params) {
    return request({
      url: '/blade-bip/home-user/info',
      method: 'get',
      params,
    });
  },
  // 获取天气
  getWeather(params) {
    return request({
      url: '/blade-bip/home-user/skip-url/weather',
      method: 'get',
      params,
    });
  },
  getRandomSentence() {
    return request({
      url: '/blade-bip/home-user/skip-url/random-sentence',
      method: 'get',
    });
  },
  updateAppList(data) {
    return request({
      url: '/blade-bip/collect/remark',
      method: 'post',
      data,
    });
  },
  getMonthPlan(params) {
    return request({
      url: '/blade-bip/plan-item/project-plan-list-by-month',
      method: 'get',
      params,
    });
  },
  getMonthPlanHome(params) {
    return request({
      url: '/blade-bip/plan-item/project-plan-list-home',
      method: 'get',
      params,
    });
  },
  getProcessAllCount(params) {
    return request({
      url: '/blade-bip/plan-item/all-task-count',
      method: 'get',
      params,
    });
  },
  getScheduleEfficiency(params) {
    return request({
      url: '/blade-bip/plan-item/schedule-efficiency',
      method: 'get',
      params,
    });
  },

  //我接收的消息 分页
  queryMyMessage(params) {
    return request({
      url: '/blade-message/message/my/list',
      method: 'get',
      params,
    });
  },

  //我接收的消息 详情
  getDetail(params) {
    return request({
      url: '/blade-message/message/detail',
      method: 'get',
      params,
    });
  },
};
