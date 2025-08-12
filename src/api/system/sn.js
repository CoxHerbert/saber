import request from '@/axios';
// sn记录
export const getList = params => {
  return request({
    url: '/blade-bip/SnRecord/list',
    method: 'get',
    params: {
      ...params,
    },
  });
};

// 删除
export const remove = ids => {
  return request({
    url: '/blade-bip/SnRecord/remove',
    method: 'delete',
    params: {
      ids,
    },
  });
};
// 批量生成sn
export const add = params => {
  return request({
    url: '/blade-bip/SnRecord/batchGenerate',
    method: 'post',
    params,
  });
};
