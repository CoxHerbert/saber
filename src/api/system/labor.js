import request from '@/axios';
// 登记列表
export const getList = params => {
  return request({
    url: '/blade-bip/laborRegister/list',
    method: 'get',
    params: {
      ...params,
    },
  });
};

export const getDetail = params => {
  return request({
    url: '/blade-bip/laborRegister/detail',
    method: 'get',
    params: {
      ...params,
    },
  });
};

// 登记面试审批
export const laborRegisterUpdate = row => {
  return request({
    url: '/blade-bip/laborRegister/update',
    method: 'post',
    data: row,
  });
};

export const laborRegisterLeave = row => {
  return request({
    url: '/blade-bip/laborRegister/leave',
    method: 'post',
    data: row,
  });
};

//  登记删除
export const remove = ids => {
  return request({
    url: '/blade-bip/laborRegister/remove',
    method: 'delete',
    params: {
      ids,
    },
  });
};

// 登记面试审批
export const laborDecision = row => {
  return request({
    url: '/blade-bip/laborRegister/labor-decision',
    method: 'post',
    data: row,
  });
};

// 劳务公司列表
export const getLaborCompanyList = params => {
  return request({
    url: '/blade-bip/LaborCompany/list',
    method: 'get',
    params: {
      ...params,
    },
  });
};

// 劳务公司添加和修改
export const addEditeLaborCompany = row => {
  return request({
    url: '/blade-bip/LaborCompany/submit',
    method: 'post',
    data: row,
  });
};

//  劳务公司删除
export const laborCompanyRemove = ids => {
  return request({
    url: '/blade-bip/LaborCompany/remove',
    method: 'delete',
    params: {
      ids,
    },
  });
};

// 批量入职
export const onboarding = ids => {
  return request({
    url: '/blade-bip/laborRegister/onboarding',
    method: 'post',
    data: ids,
  });
};

// 批量离职
export const leaving = ids => {
  return request({
    url: '/blade-bip/laborRegister/leaving',
    method: 'post',
    data: ids,
  });
};
