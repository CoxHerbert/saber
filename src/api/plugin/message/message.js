import request from '@/axios';

//顶部导航栏消息
export const topList = () => {
  return request({
    url: '/blade-message/message/my/topList',
    method: 'get',
  });
};

//我接收的消息 分页
export const queryMyMessage = (current, size, params) => {
  return request({
    url: '/blade-message/message/my/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    },
  });
};

//我发送的消息 分页
export const mySendList = (current, size, params) => {
  return request({
    url: '/blade-message/message/my/sendList',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    },
  });
};

//我发送的消息 详情
export const getSendDetail = id => {
  return request({
    url: '/blade-message/message/sendDetail',
    method: 'get',
    params: {
      id,
    },
  });
};

//我接收的消息 详情
export const getDetail = id => {
  return request({
    url: '/blade-message/message/detail',
    method: 'get',
    params: {
      id,
    },
  });
};

//删除我接受的消息
export const remove = ids => {
  return request({
    url: '/blade-message/message/remove',
    method: 'post',
    params: {
      ids,
    },
  });
};

//发送消息
export const add = row => {
  return request({
    url: '/blade-message/message/save',
    method: 'post',
    data: row,
  });
};

//全部标记已读
export const readAll = () => {
  return request({
    url: '/blade-message/message/readAll',
    method: 'post',
  });
};

//获取字典内容
export const getDict = code => {
  return request({
    url: '/blade-system/dict/dictionary?code=' + code,
    method: 'get',
  });
};

//获取人员列表
export const getUserList = () => {
  return request({
    url: '/blade-system/user/user-list',
    method: 'get',
  });
};
