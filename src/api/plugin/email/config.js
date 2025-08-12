import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/blade-email/config/list',
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
    url: '/api/blade-email/config/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/blade-email/config/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/blade-email/config/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/blade-email/config/submit',
    method: 'post',
    data: row
  })
}

export const enable = (id) => {
  return request({
    url: '/api/blade-email/config/enable',
    method: 'post',
    params: {
      id
    }
  })
}

export const sendMsg = (id, toUser) => {
  return request({
    url: '/api/blade-email/outbox/sendMsg',
    method: 'post',
    params: {
      id,
      toUser,
    }
  })
}

export const handleSync = (id) => {
  return request({
    url: '/api/blade-email/config/handleSync',
    method: 'post',
    params: {
      id
    }
  })
}