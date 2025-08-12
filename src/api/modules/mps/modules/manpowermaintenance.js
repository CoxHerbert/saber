import request from '@/axios';

export default {
  // 人力日历
  getWorkManpowerList(params) {
    return request({
      url: '/blade-bip/mps/work-manpower/list',
      method: 'get',
      params,
    });
  },

  //   新增数据接口
  postWorkManpowerInsert(params) {
    return request({
      url: '/blade-bip/mps/work-manpower/insert',
      method: 'post',
      params,
    });
  },

  //   树形数据接口
  getWorkManpowerTreeGroup(params) {
    return request({
      url: '/blade-bip/mps/work-manpower/tree-group',
      method: 'get',
      params,
    });
  },
};
