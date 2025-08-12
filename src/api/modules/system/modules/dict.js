import request from '@/axios';

export default {
  getDicts(code) {
    return request({
      url: `/api/blade-system/dict-biz/dictionary?code=${code}`,
      method: 'get',
    });
  },
  getMultipleDict(codes) {
    return request({
      url: `/blade-system/dict-biz/dictionary-map?code=${codes}`,
      method: 'get',
    });
  },
};
