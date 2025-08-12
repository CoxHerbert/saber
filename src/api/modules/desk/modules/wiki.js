import request from '@/axios';

export default {
  startWiki() {
    return request({
      url: '/blade-bip/dc-wiki-user-info/register',
      // url: '/blade-bip/user-wiki/start-wiki',
      method: 'post',
    });
  },
  loginWiki() {
    return request({
      url: '/blade-bip/dc-wiki-user-info/login',
      // url: '/blade-bip/user-wiki/wiki-login',
      method: 'get',
    });
  },
  getPageTree(params) {
    return request({
      url: '/blade-bip/feign/client/skip/wiki/pages/tree',
      method: 'get',
      params,
    });
  },
  getPageByPath(params) {
    return request({
      url: '/blade-bip/feign/client/skip/wiki/pages/by-path',
      method: 'get',
      params,
    });
  },
  getAllPage(params) {
    return request({
      url: '/blade-bip/feign/client/skip/wiki/pages',
      method: 'get',
      params,
    });
  },
  createArticle(data) {
    return request({
      url: '/blade-bip/dc-wiki-document-publishing/create',
      // url: '/blade-bip/user-wiki/wiki-document-insert',
      // url: '/blade-bip/feign/client/skip/wiki/pages',
      method: 'post',
      data,
    });
  },
  updateArticle(data) {
    return request({
      url: '/blade-bip/dc-wiki-document-publishing/update',
      // url: '/blade-bip/user-wiki/wiki-document-update/' + data.id,
      method: 'post',
      data,
    });
  },
  /** 发布 */
  publishArticle(params) {
    return request({
      url: `/blade-bip/dc-wiki-document-publishing/${params.id}/publish`,
      params,
      method: 'post',
    });
  },
  deletePageByid(id) {
    return request({
      url: `/blade-bip/dc-wiki-document-publishing/${id}`,
      method: 'delete',
    });
  },
  getPageById(id) {
    return request({
      url: `/blade-bip/dc-wiki-document-publishing/${id}`,
      method: 'get',
    });
  },
  getFolderTree(params) {
    return request({
      url: '/blade-bip/feign/client/skip/wiki/pages/trees',
      params,
    });
  },
  // wikiRelease(id) {
  //   return request({
  //     url: `/blade-bip/user-wiki/wiki-release/${id}`,
  //     method: 'get',
  //   });
  // },
};
