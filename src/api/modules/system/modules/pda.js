import request from '@/axios';

export default {
  // 获取最新版本号
  getAppLatestVersion() {
    return request({
      url: '/blade-bip/test/pda/version/the-latest-version',
      method: 'get',
    });
  },
  // 分解计划弹出框数据接口
  getPdaVersionList(params) {
    return request({
      url: '/blade-bip/test/pda/version/list',
      method: 'get',
      params,
    });
  },
  // 删除pda app版本表信息
  deletePdaVersion(ids) {
    return request({
      url: `/blade-bip/test/pda/version/remove?ids=${ids}`,
      method: 'DELETE',
    });
  },
  // 提交或保存
  postPdaVersion(data) {
    return request({
      url: '/blade-bip/test/pda/version/submit',
      method: 'POST',
      data,
    });
  },
};
