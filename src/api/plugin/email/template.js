import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/blade-email/template/list',
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
    url: '/api/blade-email/template/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/blade-email/template/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/blade-email/template/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/blade-email/template/update',
    method: 'post',
    data: row
  })
}

export const copy = (id) => {
  return request({
    url: '/api/blade-email/template/copy',
    method: 'post',
    params: {
      id,
    }
  })
}


export const sendMsg = (id, toUser, data) => {
  return request({
    url: '/api/blade-email/template//sendMsg',
    method: 'post',
    params: {
      id,
      toUser,
      data,
    }
  })
}