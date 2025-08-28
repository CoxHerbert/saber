// /src/plugins/index.js
import modal from './modal';
import createDictPlugin from './dicts';
import Api from '@/api';
import store from '@/store';

export default function installPlugins(app) {
  // 模态框
  app.config.globalProperties.$modal = modal;

  // 字典插件，ttl 例如 10 分钟
  app.use(createDictPlugin({ Api, store, optionName: 'dicts', ttl: 10 * 60 * 1000 }));
}
