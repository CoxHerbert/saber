import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: "/api/blade-email/strategy/list",
    method: "get",
    params: {
      ...params,
      current,
      size
    }
  });
};

export const getDetail = id => {
  return request({
    url: "/api/blade-email/strategy/detail",
    method: "get",
    params: {
      id
    }
  });
};

export const remove = ids => {
  return request({
    url: "/api/blade-email/strategy/remove",
    method: "post",
    params: {
      ids
    }
  });
};

export const add = row => {
  return request({
    url: "/api/blade-email/strategy/save",
    method: "post",
    data: row
  });
};

export const update = row => {
  return request({
    url: "/api/blade-email/strategy/update",
    method: "post",
    data: row
  });
};
