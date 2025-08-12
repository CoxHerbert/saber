import website from '@/config/website';
import { getLeafNodes } from '@/utils/util';

const modules = import.meta.glob('../**/**/*.vue');
console.log('global=');

function isURL(s) {
  return /^http[s]?:\/\/.*/.test(s);
}

let RouterPlugin = function () {
  this.$router = null;
  this.$store = null;
};
RouterPlugin.install = function (option = {}) {
  this.$router = option.router;
  this.$store = option.store;
  let i18n = option.i18n.global;
  this.$router.$avueRouter = {
    safe: this,
    // 设置标题
    setTitle: title => {
      const defaultTitle = i18n.t('title');
      title = title ? `${title} | ${defaultTitle}` : defaultTitle;
      document.title = title;
    },
    closeTag: value => {
      let tag = value || this.$store.getters.tag;
      if (typeof value === 'string') {
        tag = this.$store.getters.tagList.find(ele => ele.fullPath === value);
      }
      this.$store.commit('DEL_TAG', tag);
    },
    generateTitle: (item, props = {}) => {
      let query = item[props.query || 'query'] || {};
      let title = query.name || item[props.label || 'label'];
      let meta = item[props.meta || 'meta'] || {};
      let key = meta.i18n;
      if (key) {
        const hasKey = i18n.te('route.' + key);
        if (hasKey) return i18n.t('route.' + key);
      }
      return title ? title.split(',')[0] : title;
    },
    //动态路由
    formatRoutes: function (aMenu = [], first) {
      const aRouter = [];
      const propsDefault = website.menu;

      if (aMenu && aMenu.length === 0) return;
      for (let i = 0; i < aMenu.length; i++) {
        const oMenu = aMenu[i];
        let path = oMenu[propsDefault.path],
          isComponent = true,
          component = oMenu.component,
          name = oMenu[propsDefault.label] + ',' + oMenu.id,
          icon = oMenu[propsDefault.icon],
          children = oMenu[propsDefault.children],
          query = oMenu[propsDefault.query],
          meta = oMenu[propsDefault.meta],
          displayType = oMenu[propsDefault.displayType];
        if (option.keepAlive) {
          meta.keepAlive = option.keepAlive;
        }
        meta.menuId = oMenu.id;
        const isSidebarRouterMenu = displayType === 'menu_display_type_dhlly';
        const isChild = !!(children && children.length !== 0);
        const oRouter = {
          path: path,
          component: (() => {
            // 判断是否为首路由
            if (first) {
              return modules[
                !website.setting.menu ? '../page/index/layout.vue' : '../page/index/index.vue'
              ];
              // 判断是否为多层路由
            } else if (isChild && !first) {
              return modules['../page/index/layout.vue'];
              // 判断是否为最终的页面视图
            } else {
              let result = modules[`../${component}.vue`];
              if (result) result().then(mod => (mod.default.name = path));
              else {
                isComponent = false;
              }
              return result;
            }
          })(),
          name,
          icon,
          meta,
          query,
          redirect: (() => {
            if (!isChild && first) return `${path}`;
            else return '';
          })(),
          // 处理是否为一级路由
          children: !isChild
            ? (() => {
                if (first) {
                  oMenu[propsDefault.path] = `${path}`;
                  let result = modules[`../${component}.vue`];
                  if (result) result().then(mod => (mod.default.name = path));
                  else {
                    isComponent = false;
                  }
                  return [
                    {
                      component: result,
                      icon: icon,
                      name: name,
                      meta: meta,
                      query: query,
                      path: '',
                    },
                  ];
                } else if (isSidebarRouterMenu && oMenu.children_?.length > 0) {
                  // 找出叶子节点全部挂到children上面
                  return getLeafNodes(oMenu.children_).map(sMenu => {
                    return {
                      component: modules[`../views${sMenu.path}.vue`],
                      icon: sMenu.icon,
                      name: sMenu.name,
                      meta: sMenu.meta,
                      query: sMenu.query,
                      path: sMenu.path,
                    };
                  });
                }
                return [];
              })()
            : (() => {
                return this.formatRoutes(children, false);
              })(),
        };
        if (!isURL(path) && isComponent) aRouter.push(oRouter);
      }
      if (first) {
        aRouter.forEach(ele => this.safe.$router.addRoute(ele));
      } else {
        return aRouter;
      }
    },
  };
};
export const formatPath = (ele, first) => {
  const propsDefault = website.menu;
  const icon = ele[propsDefault.icon];
  ele[propsDefault.icon] = !icon ? propsDefault.iconDefault : icon;
  ele.meta = {
    isSidebarRouterMenu: ele.displayType === 'menu_display_type_dhlly',
    keepAlive: ele.isOpen === 2,
  };
  const iframeComponent = 'components/iframe/main';
  const iframeSrc = href => {
    return href.replace(/&/g, '#');
  };
  const isChild = !!(ele[propsDefault.children] && ele[propsDefault.children].length !== 0);
  if (!isChild && first) {
    ele.component = 'views' + ele[propsDefault.path];
    if (isURL(ele[propsDefault.href])) {
      let href = ele[propsDefault.href];
      ele.component = iframeComponent;
      ele[propsDefault.query] = {
        url: iframeSrc(href),
      };
    }
  } else {
    ele[propsDefault.children] &&
      ele[propsDefault.children].forEach(child => {
        child.component = 'views' + child[propsDefault.path];
        child.meta = {
          isSidebarRouterMenu: ele.displayType === 'menu_display_type_dhlly',
          keepAlive: child.isOpen === 2,
        };
        if (isURL(child[propsDefault.href])) {
          let href = child[propsDefault.href];
          child[propsDefault.path] = ele[propsDefault.path] + '/' + child.code;
          child.component = iframeComponent;
          child[propsDefault.query] = {
            url: iframeSrc(href),
          };
        }
        formatPath(child);
      });
  }
};
export default RouterPlugin;
