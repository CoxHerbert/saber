import request from '@/axios';
// 配置列表
export const getSetList = params => {
  return request({
    url: '/blade-bip/ExpectionSetting/list',
    method: 'get',
    params: {
      ...params,
    },
  });
};
// 配置删除
export const removeSet = ids => {
  return request({
    url: '/blade-bip/ExpectionSetting/remove',
    method: 'delete',
    params: {
      ids,
    },
  });
};
// 配置添加
export const addSet = row => {
  return request({
    url: '/blade-bip/ExpectionSetting/submit',
    method: 'post',
    data: row,
  });
};
// 配置更改
export const updateSet = row => {
  return request({
    url: '/blade-bip/ExpectionSetting/submit',
    method: 'post',
    data: row,
  });
};
// 配置详情
export const getSet = id => {
  return request({
    url: '/blade-bip/ExpectionSetting/detail',
    method: 'get',
    params: {
      id,
    },
  });
};

// 查询租户列表
export const getTenantList = row => {
  return request({
    url: '/blade-system/tenant/select',
    method: 'get',
    data: row,
  });
};

// 记录列表
export const getExpectionNoticeList = params => {
  return request({
    url: '/blade-bip/ExpectionNotice/list',
    method: 'get',
    params: {
      ...params,
    },
  });
};
// 记录删除
export const removeExpectionNotice = ids => {
  return request({
    url: '/blade-bip/ExpectionNotice/remove',
    method: 'delete',
    params: {
      ids,
    },
  });
};
// 记录添加
export const addExpectionNotice = row => {
  return request({
    url: '/blade-bip/ExpectionNotice/submit',
    method: 'post',
    data: row,
  });
};
// 记录更改
export const updateExpectionNotice = row => {
  return request({
    url: '/blade-bip/ExpectionNotice/submit',
    method: 'post',
    data: row,
  });
};
