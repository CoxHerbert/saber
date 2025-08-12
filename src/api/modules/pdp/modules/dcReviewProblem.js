import request from '@/axios';

export default {
  //   问题抽屉提交
  submit(data) {
    return request({
      url: '/blade-bip/dc-review-problem/submit',
      method: 'post',
      data,
    });
  },
};
