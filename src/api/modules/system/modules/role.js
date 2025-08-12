import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-system/role/list',
      method: 'get',
      params,
    });
  },
  grantTree() {
    return request({
      url: '/blade-system/menu/grant-tree',
      method: 'get',
    });
  },

  grant(roleIds, menuIds, dataScopeIds, apiScopeIds, topMenuIds) {
    return request({
      url: '/blade-system/role/grant',
      method: 'post',
      data: {
        roleIds,
        menuIds,
        dataScopeIds,
        apiScopeIds,
        topMenuIds,
      },
    });
  },

  removeids() {
    return request({
      url: '/blade-system/role/remove',
      method: 'post',
      params: {
        ids,
      },
    });
  },

  addrow() {
    return request({
      url: '/blade-system/role/submit',
      method: 'post',
      data: row,
    });
  },

  updaterow() {
    return request({
      url: '/blade-system/role/submit',
      method: 'post',
      data: row,
    });
  },

  getRoleroleIds() {
    return request({
      url: '/blade-system/menu/role-tree-keys',
      method: 'get',
      params: {
        roleIds,
      },
    });
  },

  getRoleTreetenantId() {
    return request({
      url: '/blade-system/role/tree',
      method: 'get',
    });
  },

  getRoleTreeByIdroleId() {
    return request({
      url: '/blade-system/role/tree-by-id',
      method: 'get',
      params: {
        roleId,
      },
    });
  },
};
