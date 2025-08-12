import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/blade-email/plat-from/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/blade-email/plat-from/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/blade-email/plat-from/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/blade-email/plat-from/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/blade-email/plat-from/update',
    method: 'post',
    data: row
  })
}

export const copy = (id) => {
  return request({
    url: '/api/blade-email/plat-from/copy',
    method: 'post',
    params: {
      id,
    }
  })
}

export const enable = (id) => {
  return request({
    url: '/api/blade-email/plat-from/enable',
    method: 'post',
    params: {
      id
    }
  })
}

export const getPlatList = () => {
  return request({
    url: "/api/blade-email/plat-from/select",
    method: "get"
  });
};

export const sendMsg = (id, toUser) => {
  return request({
    url: '/api/blade-email/plat-from//sendMsg',
    method: 'post',
    params: {
      id,
      toUser,
    }
  })
}