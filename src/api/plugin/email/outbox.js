import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/blade-email/outbox/list',
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
    url: '/api/blade-email/outbox/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/blade-email/outbox/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/blade-email/outbox/submitAndSend',
    method: 'post',
    data: row
  })
}

