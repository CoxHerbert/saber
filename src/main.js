import { createApp } from 'vue';
import './utils/clearStorage.js';
import website from './config/website';
import axios from './axios';
import router from './router/';
import store from './store';
import i18n from './lang/';

import { language, messages } from './lang/';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import Avue from '@smallwei/avue';
import ElementResizeDetectorMaker from 'element-resize-detector';
import '@smallwei/avue/lib/index.css';
import crudCommon from '@/mixins/crud.js';
import { getScreen, downloadFileBlob, findRootInTreeArray, findNode } from './utils/util';
import Const from '@/const/index';
import api from '@/api/index';
import { hexToRgba } from './utils/gantt';
import { useCache, useAsyncCache, getKeyObject, findItem, getMultipleDict } from './utils/cache';
import './permission';
import error from './error';
import * as dc from './components/dc/index';
import avueUeditor from 'avue-plugin-ueditor';
import basicBlock from 'components/basic-block/main.vue';
import basicContainer from 'components/basic-container/main.vue';
import thirdRegister from './components/third-register/main.vue';
import NfDesignBase from '@saber/nf-design-base-elp';
import flowDesign from './components/flow-design/main.vue';
import App from './App.vue';
import dayjs from 'dayjs';
import 'styles/common.scss';
import 'tailwindcss/tailwind.css';
import permissionDirective, { hasPermissionCommon } from './directive/permission.js';
// graphql客户端
import apolloClient from './api/graphql/index.js';
// import { DefaultApolloClient } from '@apollo/client/core';

// 业务组件
import tenantPackage from './views/system/tenantpackage.vue';

window.$crudCommon = crudCommon;
window.axios = axios;
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
for (const [key, component] of Object.entries(dc)) {
  app.component(key, component);
}
app.component('basicContainer', basicContainer);
app.component('basicBlock', basicBlock);
app.component('thirdRegister', thirdRegister);
app.component('flowDesign', flowDesign);
app.component('tenantPackage', tenantPackage);

// 全局方法引入
import {
  resetForm,
  getRef,
  handleTree,
  secondToHour,
  hourToSecond,
  convertTime,
  arrayToIdsString,
} from '@/utils/util';
// 注册指令
import plugins from './plugins'; // plugins

// 全局方法加载
app.config.globalProperties.resetForm = resetForm;
app.config.globalProperties.getRef = getRef;
app.config.globalProperties.handleTree = handleTree;
app.config.globalProperties.$dayjs = dayjs;
app.config.globalProperties.website = website;
app.config.globalProperties.getScreen = getScreen;
app.config.globalProperties.useCache = useCache;
app.config.globalProperties.useAsyncCache = useAsyncCache;
app.config.globalProperties.getMultipleDict = getMultipleDict;
app.config.globalProperties.getKeyObject = getKeyObject;
app.config.globalProperties.findItem = findItem;
app.config.globalProperties.arrayToIdsString = arrayToIdsString;
app.config.globalProperties.secondToHour = secondToHour;
app.config.globalProperties.hourToSecond = hourToSecond;
app.config.globalProperties.convertTime = convertTime;
app.config.globalProperties.downloadFileBlob = downloadFileBlob;
app.config.globalProperties.findRootInTreeArray = findRootInTreeArray;
app.config.globalProperties.findNode = findNode;
app.config.globalProperties.hexToRgba = hexToRgba;
app.config.globalProperties.hasPermissionCommon = hasPermissionCommon;
app.config.globalProperties.constant = Const;
app.config.globalProperties.api = api;
app.config.globalProperties.pdfViewURL =
  '/api/blade-bip/skip-url/dc/mops/plan/pdf/get-pdf-with-api';
app.config.globalProperties.mrpPrintURL = '/api/pdf-printing/print/';

// app.provide(DefaultApolloClient, apolloClient);
// app.use(ApolloProvider, {
//   defaultClient: apolloClient,
// });
app.config.globalProperties.apolloClient = apolloClient;
// 元素（element）变化监听工具
app.config.globalProperties.$erd = ElementResizeDetectorMaker();
app.use(plugins);
app.use(error);
app.use(i18n);
app.use(store);
app.use(router);
app.directive('permission', permissionDirective);
app.use(ElementPlus, {
  locale: messages[language],
});
app.use(Avue, {
  axios,
  calcHeight: 10,
  locale: messages[language],
});

import NfDesign from '@nutflow/nf-design-elp'; // 流程设计器
import NfForm from '@nutflow/nf-form-elp'; // 表单组件
import NfFormDesign from '@nutflow/nf-form-design-elp'; // 表单设计器
import NfCustomFields from '@/views/plugin/workflow/components/custom-fields'; // 自定义字段

console.log('messages[language]', messages[language]);

app.use(NfDesign, { locale: messages[language] }).use(NfForm).use(NfFormDesign).use(NfCustomFields);

app.use(avueUeditor, { axios });
app.use(NfDesignBase);
app.mount('#app');
