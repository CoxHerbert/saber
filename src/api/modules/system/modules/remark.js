import request from '@/axios';

export default {


  // 收藏 取消收藏
  collectRemark(remarkType, data) {
    return request({
      url: '/blade-bip/collect/remark?collectType=' + remarkType,
      method: 'post',
      headers: {
        'Content-Type': 'application/json', // 强制指定为 JSON 格式
      },
      data, // Axios 会自动序列化为 JSON
    });
  },

  // 查询收藏
  collectView(remarkType) {
    const params = { collectType: remarkType }
    return request({
      url: '/blade-bip/collect/view',
      method: 'get',
      params,
    });
  },
};
