import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-bip/dc/scm/expense-reimbursement/list-with-flow',
      method: 'get',
      params,
    });
  },
};
