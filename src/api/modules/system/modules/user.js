import request from '@/axios';
export default {
  getList(params) {
    return request({
      url: '/blade-system/user/page',
      method: 'get',
      params,
    });
  },

  remove(ids) {
    return request({
      url: '/blade-system/user/remove',
      method: 'post',
      params: {
        ids,
      },
    });
  },

  add(row) {
    return request({
      url: '/blade-system/user/submit',
      method: 'post',
      data: row,
    });
  },

  update(row) {
    return request({
      url: '/blade-system/user/update',
      method: 'post',
      data: row,
    });
  },

  getUser(id) {
    return request({
      url: '/blade-system/user/detail',
      method: 'get',
      params: {
        id,
      },
    });
  },

  checkOldPw(params) {
    return request({
      url: '/blade-system/dc-system-user/check-old-pw',
      method: 'get',
      params,
    });
  },

  updatePassword(data) {
    return request({
      url: '/blade-system/dc-system-user/update-password',
      method: 'post',
      data,
    });
  },
  // 保存已选
  collectSelectUser(params) {
    return request({
      url: '/blade-bip/collect/remark',
      method: 'post',
      noErrorMsg: true,
      data: params,
    });
  },
  // 查询已选
  recentlySelectedUsers() {
    return request({
      url: '/blade-bip/bip-blade-user/frequently-used-users',
      method: 'get',
    });
  },
};
