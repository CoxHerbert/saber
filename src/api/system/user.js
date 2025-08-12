import request from '@/axios';

export const getList = (current, size, params, deptId) => {
  return request({
    url: '/blade-system/user/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
      deptId,
    },
  });
};

export const remove = ids => {
  return request({
    url: '/blade-system/user/remove',
    method: 'post',
    params: {
      ids,
    },
  });
};

export const add = row => {
  return request({
    url: '/blade-system/user/submit',
    method: 'post',
    data: row,
  });
};

export const update = row => {
  return request({
    url: '/blade-system/user/update',
    method: 'post',
    data: row,
  });
};

export const configSubmit = row => {
  return request({
    url: '/blade-bip/mmr-user-config/submit',
    method: 'post',
    data: row,
  });
};

export const configDetail = params => {
  return request({
    url: '/blade-bip/mmr-user-config/detail',
    method: 'get',
    params,
  });
};

export const updatePlatform = (userId, userType, userExt) => {
  return request({
    url: '/blade-system/user/update-platform',
    method: 'post',
    params: {
      userId,
      userType,
      userExt,
    },
  });
};

export const getUser = id => {
  return request({
    url: '/blade-system/user/detail',
    method: 'get',
    params: {
      id,
    },
  });
};

// 查询物料详情
export const getMaterialDetail = params => {
  return request({
    url: '/blade-erp/material/search-material-code',
    method: 'get',
    params,
  });
};

export const mmrPlanOrder = params => {
  return request({
    url: '/blade-bip/mmr-plan-order/list',
    method: 'get',
    params,
  });
};

export const getSearchUser = params => {
  return request({
    url: '/blade-system/search/user',
    method: 'get',
    params,
  });
};

// 模糊查询物料详情
export const selectMaterial = params => {
  return request({
    url: '/blade-erp/material/select-material',
    method: 'get',
    params,
  });
};

// 现场报工
export const selectmmrPlanOrder = params => {
  return request({
    url: '/blade-bip/mmr-plan-order/list',
    method: 'get',
    params,
  });
};

export const findEffectivePhase = params => {
  return request({
    url: '/blade-bip/mmr-plan-order/find-effective-phase',
    method: 'GET',
    params,
  });
};

export const getUserPlatform = id => {
  return request({
    url: '/blade-system/user/platform-detail',
    method: 'get',
    params: {
      id,
    },
  });
};

export const getCacheUserList = ids => {
  return request({
    url: '/blade-bip/bip-blade-user/select-data',
    method: 'POST',
    data: ids,
  });
};

export const getUserInfo = () => {
  return request({
    url: '/blade-system/user/info',
    method: 'get',
  });
};

export const resetPassword = userIds => {
  return request({
    url: '/blade-system/user/reset-password',
    method: 'post',
    params: {
      userIds,
    },
  });
};

export const updatePassword = (oldPassword, newPassword, newPassword1) => {
  return request({
    url: '/blade-system/user/update-password',
    method: 'post',
    params: {
      oldPassword,
      newPassword,
      newPassword1,
    },
  });
};

export const updateInfo = row => {
  return request({
    url: '/blade-system/user/update-info',
    method: 'post',
    data: row,
  });
};

export const grant = (userIds, roleIds) => {
  return request({
    url: '/blade-system/user/grant',
    method: 'post',
    params: {
      userIds,
      roleIds,
    },
  });
};

export const unlock = userIds => {
  return request({
    url: '/blade-system/user/unlock',
    method: 'post',
    params: {
      userIds,
    },
  });
};

export const auditPass = userIds => {
  return request({
    url: '/blade-system/user/audit-pass',
    method: 'post',
    params: {
      userIds,
    },
  });
};

export const auditRefuse = userIds => {
  return request({
    url: '/blade-system/user/audit-refuse',
    method: 'post',
    params: {
      userIds,
    },
  });
};

// 企业微信
export const wechatCreate = userid => {
  return request({
    url: '/blade-bip/wechat/create',
    method: 'post',
    data: { userid },
  });
};
