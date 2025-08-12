import request from '@/axios';

export default {
  // 数据展示
  getPlanIndex(params) {
    return request({
      url: '/blade-bip/plan/index',
      method: 'get',
      authorization: false,
      params,
    });
  },
  // 数据展示
  getPlanIndexV2(params) {
    return request({
      url: '/blade-bip/plan/index-v2',
      method: 'get',
      authorization: false,
      params,
    });
  },
  // 数据展示
  getPlanIndex2(params) {
    return request({
      url: '/blade-bip/plan/index2',
      method: 'get',
      authorization: false,
      params,
    });
  },
  // 数据展示
  getPlanIndex3(params) {
    return request({
      url: '/blade-bip/plan/index3',
      method: 'get',
      authorization: false,
      params,
    });
  },
  // 获取日期
  getPlanDate(params) {
    return request({
      url: '/blade-bip/plan/get-date',
      method: 'get',
      params,
    });
  },
  // 获取专案号
  getPlanMto(params) {
    return request({
      url: '/blade-bip/plan/get-mto',
      method: 'get',
      params,
    });
  },
  // 更新专案项目
  updatePlanItem(params) {
    return request({
      url: '/blade-bip/plan/update-plan-item',
      method: 'post',
      params,
    });
  },
  // 分解计划查询接口
  getMoSplitItem(params) {
    return request({
      url: '/blade-bip/plan/select-mo-split-item',
      method: 'get',
      params,
    });
  },
  // 分解计划更新接口
  updateMoSplitItem(data) {
    return request({
      url: '/blade-bip/plan/update-mo-split-item',
      method: 'post',
      data,
    });
  },
  // 分解计划查询接口
  getPlanSplitList(params) {
    return request({
      url: '/blade-bip/plan/split-list',
      method: 'get',
      params,
    });
  },
  // 计划提交
  submit(data) {
    return request({
      url: '/blade-bip/plan/submit',
      method: 'post',
      data,
    });
  },
  // 计划提交
  butchSubmit(data) {
    return request({
      url: '/blade-bip/plan/butch-summit',
      method: 'post',
      data,
    });
  },
  // 控制指派人员按钮显示隐藏
  buttonControl() {
    return request({
      url: '/blade-bip/plan/button-control',
      method: 'get',
    });
  },
};
