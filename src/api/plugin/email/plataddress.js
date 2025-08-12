import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: "/api/blade-email/plat-address/list",
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
    url: "/api/blade-email/plat-address/detail",
    method: "get",
    params: {
      id
    }
  });
};

export const remove = ids => {
  return request({
    url: "/api/blade-email/plat-address/remove",
    method: "post",
    params: {
      ids
    }
  });
};

export const add = row => {
  return request({
    url: "/api/blade-email/plat-address/save",
    method: "post",
    data: row
  });
};

export const update = row => {
  return request({
    url: "/api/blade-email/plat-address/update",
    method: "post",
    data: row
  });
};

export const getReceiverList = () => {
  return request({
    url: "/api/blade-email/plat-address/select",
    method: "get"
  });
};
