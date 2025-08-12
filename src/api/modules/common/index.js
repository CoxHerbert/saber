import request from '@/axios';
import process from './modules/process';
import workGroup from './modules/workGroup';
import note from './modules/note';

export default {
  // 根据ids获取文件
  getSelectData(url, data) {
    return request({
      url,
      method: 'post',
      data: data,
    });
  },
  // 物料查询V2
  getMaterialSearchV2(params) {
    return request({
      url: '/api/blade-pda/common/material-search-new',
      method: 'get',
      params,
    });
  },
  // MAP缓存键值对
  getCommonMapCache(entityName, key) {
    return request({
      url: `/api/blade-bip/${entityName}/map-cache?key=${key}`,
      method: 'get',
    });
  },
  // List缓存缓存
  getCommonListCache(entityName) {
    return request({
      url: `/api/blade-bip/${entityName}/list-cache`,
      method: 'get',
    });
  },
  // 单附件上传
  postSubmitFile(data) {
    return request({
      url: `/api/blade-bip/pms-file-manager/submit-file`,
      method: 'post',
      data,
    });
  },
  // 根据ids获取文件
  getFileByIds(ids) {
    return request({
      url: `/api/blade-bip/pms-file-manager/get-file-by-id?ids=${ids}`,
      method: 'get',
    });
  },
  // 用户菜单列表
  getRoleMenuList(params) {
    return request({
      url: `/api/blade-system/menu/role-menu-list`,
      method: 'get',
      params,
    });
  },
  process,
  workGroup,
  note,
};
