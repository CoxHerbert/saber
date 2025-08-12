import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/blade-system/role/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    },
  });
};
export const grantTree = () => {
  return request({
    url: '/blade-system/menu/grant-tree',
    method: 'get',
  });
};

export const grant = (
  roleIds,
  menuIds,
  dataScopeIds,
  apiScopeIds,
  topMenuIds,
  settingFormData = {}
) => {
  return request({
    url: '/blade-system/role/grant',
    method: 'post',
    data: {
      ...settingFormData,
      roleIds,
      menuIds,
      dataScopeIds,
      apiScopeIds,
      topMenuIds,
    },
  });
};

export const remove = ids => {
  return request({
    url: '/blade-system/role/remove',
    method: 'post',
    params: {
      ids,
    },
  });
};

// 批量绑定人员
export const batchUserRole = (roleId, params) => {
  return request({
    url: `/blade-system/user/batch-user-role?roleId=${roleId}`,
    method: 'post',
    data: params,
  });
};

// 批量解除绑定人员
export const cancelUserRole = (roleId, params) => {
  return request({
    url: `/blade-system/user/cancel-user-role?roleId=${roleId}`,
    method: 'post',
    data: params,
  });
};

export const add = row => {
  return request({
    url: '/blade-system/role/submit',
    method: 'post',
    data: row,
  });
};

export const update = row => {
  return request({
    url: '/blade-system/role/submit',
    method: 'post',
    data: row,
  });
};

export const getRole = roleIds => {
  return request({
    url: '/blade-system/menu/role-tree-keys',
    method: 'get',
    params: {
      roleIds,
    },
  });
};

export const getRoleTree = tenantId => {
  return request({
    url: '/blade-system/role/tree',
    method: 'get',
    params: {
      tenantId,
    },
  });
};

export const getRoleTreeById = roleId => {
  return request({
    url: '/blade-system/role/tree-by-id',
    method: 'get',
    params: {
      roleId,
    },
  });
};
