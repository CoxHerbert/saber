import { validatenull } from './validate';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import Const from '@/const';

//表单序列化
export const serialize = data => {
  let list = [];
  Object.keys(data).forEach(ele => {
    list.push(`${ele}=${data[ele]}`);
  });
  return list.join('&');
};

// 金额格式化  10000->10,000
export const toLocaleString = value => {
  return value.toLocaleString('en-US') || 0;
};

export const getObjType = obj => {
  var toString = Object.prototype.toString;
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
  };
  if (obj instanceof Element) {
    return 'element';
  }
  return map[toString.call(obj)];
};

// 对象去除空值
export const removeEmptyValues = obj => {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

/**
 * 对象深拷贝
 */
export const deepClone = data => {
  var type = getObjType(data);
  var obj;
  if (type === 'array') {
    obj = [];
  } else if (type === 'object') {
    obj = {};
  } else {
    //不再具有下一层次
    return data;
  }
  if (type === 'array') {
    for (var i = 0, len = data.length; i < len; i++) {
      obj.push(deepClone(data[i]));
    }
  } else if (type === 'object') {
    for (var key in data) {
      obj[key] = deepClone(data[key]);
    }
  }
  return obj;
};
/**
 * 设置灰度模式
 */
export const toggleGrayMode = status => {
  if (status) {
    document.body.className = document.body.className + ' grayMode';
  } else {
    document.body.className = document.body.className.replace(' grayMode', '');
  }
};
/**
 * 设置主题
 */
export const setTheme = name => {
  document.body.className = name;
};

/**
 * 加密处理
 */
export const encryption = params => {
  let { data = {}, type, param, key } = params;
  let result = JSON.parse(JSON.stringify(data));
  if (type == 'Base64') {
    param.forEach(ele => {
      result[ele] = Base64.stringify(result[ele]);
    });
  } else if (type == 'Aes') {
    param.forEach(ele => {
      result[ele] = sha256(result[ele], key);
    });
  }
  return result;
};

/**
 * 浏览器判断是否全屏
 */
export const fullscreenToggel = () => {
  if (fullscreenEnable()) {
    exitFullScreen();
  } else {
    reqFullScreen();
  }
};
/**
 * esc监听全屏
 */
export const listenfullscreen = callback => {
  function listen() {
    callback();
  }

  document.addEventListener('fullscreenchange', function () {
    listen();
  });
  document.addEventListener('mozfullscreenchange', function () {
    listen();
  });
  document.addEventListener('webkitfullscreenchange', function () {
    listen();
  });
  document.addEventListener('msfullscreenchange', function () {
    listen();
  });
};
/**
 * 浏览器判断是否全屏
 */
export const fullscreenEnable = () => {
  var isFullscreen =
    document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen;
  return isFullscreen;
};

/**
 * 浏览器全屏
 */
export const reqFullScreen = () => {
  if (document.documentElement.requestFullScreen) {
    document.documentElement.requestFullScreen();
  } else if (document.documentElement.webkitRequestFullScreen) {
    document.documentElement.webkitRequestFullScreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen();
  }
};
/**
 * 浏览器退出全屏
 */
export const exitFullScreen = () => {
  if (document.documentElement.requestFullScreen) {
    document.exitFullScreen();
  } else if (document.documentElement.webkitRequestFullScreen) {
    document.webkitCancelFullScreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    document.mozCancelFullScreen();
  }
};
/**
 * 递归寻找子类的父类
 */

export const findParent = (menu, id) => {
  for (let i = 0; i < menu.length; i++) {
    if (menu[i].children.length != 0) {
      for (let j = 0; j < menu[i].children.length; j++) {
        if (menu[i].children[j].id == id) {
          return menu[i];
        } else {
          if (menu[i].children[j].children.length != 0) {
            return findParent(menu[i].children[j].children, id);
          }
        }
      }
    }
  }
};
/**
 * 判断2个对象属性和值是否相等
 */

/**
 * 动态插入css
 */

export const loadStyle = url => {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
};
/**
 * 判断路由是否相等
 */
export const diff = (obj1, obj2) => {
  delete obj1.close;
  var o1 = obj1 instanceof Object;
  var o2 = obj2 instanceof Object;
  if (!o1 || !o2) {
    /*  判断不是对象  */
    return obj1 === obj2;
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
    //Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
  }

  for (var attr in obj1) {
    var t1 = obj1[attr] instanceof Object;
    var t2 = obj2[attr] instanceof Object;
    if (t1 && t2) {
      return diff(obj1[attr], obj2[attr]);
    } else if (obj1[attr] !== obj2[attr]) {
      return false;
    }
  }
  return true;
};
/**
 * 根据字典的value显示label
 */
export const findByvalue = (dic, value) => {
  let result = '';
  if (validatenull(dic)) return value;
  if (typeof value == 'string' || typeof value == 'number' || typeof value == 'boolean') {
    let index = 0;
    index = findArray(dic, value);
    if (index != -1) {
      result = dic[index].label;
    } else {
      result = value;
    }
  } else if (value instanceof Array) {
    result = [];
    let index = 0;
    value.forEach(ele => {
      index = findArray(dic, ele);
      if (index != -1) {
        result.push(dic[index].label);
      } else {
        result.push(value);
      }
    });
    result = result.toString();
  }
  return result;
};
/**
 * 根据字典的value查找对应的index
 */
export const findArray = (dic, value) => {
  for (let i = 0; i < dic.length; i++) {
    if (dic[i].value == value) {
      return i;
    }
  }
  return -1;
};
/**
 * 生成随机len位数字
 */
export const randomLenNum = (len, date) => {
  let random = '';
  random = Math.ceil(Math.random() * 100000000000000)
    .toString()
    .substr(0, len ? len : 4);
  if (date) random = random + Date.now();
  return random;
};
/**
 * 打开小窗口
 */
export const openWindow = (url, title, w, h) => {
  // Fixes dual-screen position                            Most browsers       Firefox
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height;

  const left = width / 2 - w / 2 + dualScreenLeft;
  const top = height / 2 - h / 2 + dualScreenTop;
  const newWindow = window.open(
    url,
    title,
    'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=' +
      w +
      ', height=' +
      h +
      ', top=' +
      top +
      ', left=' +
      left
  );

  // Puts focus on the newWindow
  if (window.focus) {
    newWindow.focus();
  }
};

export const getScreen = isCollapse => {
  if (document.body.clientWidth <= 768) {
    return !isCollapse;
  } else {
    return isCollapse;
  }
};

/**
 * 获取顶部地址栏地址
 */
export const getTopUrl = () => {
  return window.location.href.split('/#/')[0];
};

/**
 * 获取url参数
 * @param name 参数名
 */
export const getQueryString = name => {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  let r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(decodeURI(r[2]));
  return null;
};

/**
 * 下载文件
 * @param {String} path - 文件地址
 * @param {String} name - 文件名,eg: test.png
 */
export const downloadFileBlob = (path, name) => {
  const xhr = new XMLHttpRequest();
  xhr.open('get', path);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = function () {
    if (this.status === 200 || this.status === 304) {
      // 如果是IE10及以上，不支持download属性，采用msSaveOrOpenBlob方法，但是IE10以下也不支持msSaveOrOpenBlob
      if ('msSaveOrOpenBlob' in navigator) {
        navigator.msSaveOrOpenBlob(this.response, name);
        return;
      }
      const url = URL.createObjectURL(this.response);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
};

/**
 * 下载文件
 * @param {String} path - 文件地址
 * @param {String} name - 文件名,eg: test.png
 */
export const downloadFileBlobPromise = (path, name) => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('get', path);
      xhr.responseType = 'blob';
      xhr.send();
      xhr.onload = function () {
        if (this.status === 200 || this.status === 304) {
          // 如果是IE10及以上，不支持download属性，采用msSaveOrOpenBlob方法，但是IE10以下也不支持msSaveOrOpenBlob
          if ('msSaveOrOpenBlob' in navigator) {
            navigator.msSaveOrOpenBlob(this.response, name);
            return;
          }
          const url = URL.createObjectURL(this.response);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        } else {
          reject();
        }
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 下载文件
 * @param {String} path - 文件地址
 * @param {String} name - 文件名,eg: test.png
 */
export const downloadFileBase64 = (path, name) => {
  const xhr = new XMLHttpRequest();
  xhr.open('get', path);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = function () {
    if (this.status === 200 || this.status === 304) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(this.response);
      fileReader.onload = function () {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = this.result;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
    }
  };
};
/**
 * 下载excel
 * @param {blob} fileArrayBuffer 文件流
 * @param {String} filename 文件名称
 */
export const downloadXls = (fileArrayBuffer, filename) => {
  let data = new Blob([fileArrayBuffer], { type: 'application/vnd.ms-excel,charset=utf-8' });
  if (typeof window.chrome !== 'undefined') {
    // Chrome
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = filename;
    link.click();
  } else if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // IE
    var blob = new Blob([data], { type: 'application/force-download' });
    window.navigator.msSaveBlob(blob, filename);
  } else {
    // Firefox
    var file = new File([data], filename, { type: 'application/force-download' });
    window.open(URL.createObjectURL(file));
  }
};

export const downloadPdf = (fileArrayBuffer, filename) => {
  let data = new Blob([fileArrayBuffer], { type: 'application/pdf' });
  if (typeof window.chrome !== 'undefined') {
    // Chrome
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = filename;
    link.click();
  } else if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // IE
    var blob = new Blob([data], { type: 'application/force-download' });
    window.navigator.msSaveBlob(blob, filename);
  } else {
    // Firefox
    var file = new File([data], filename, { type: 'application/force-download' });
    window.open(URL.createObjectURL(file));
  }
};

// 封装生成 curl 命令的方法
export const generateCurlCommand = config => {
  const url =
    import.meta.env.VITE_APP_BASE_URL +
    config.url.replace(new RegExp(import.meta.env.VITE_APP_API), '');

  // 构建 curl 命令的基本结构
  let curlCommand = `====================\n`;
  curlCommand += `curl -X ${config.method.toUpperCase()} '${url}'`;

  // 添加请求头部分
  if (config.headers) {
    for (const [key, value] of Object.entries(config.headers)) {
      let headerValue = value;
      if (typeof value === 'object') {
        // 如果是对象，转换为 JSON 字符串
        headerValue = JSON.stringify(value);
      }
      curlCommand += ` \\\n  -H '${key}: ${headerValue}'`;
    }
  }

  // 检查并添加请求体
  let dataAdded = false;
  if (config.data) {
    curlCommand += ` \\\n  -d '${JSON.stringify(config.data)}'`;
    dataAdded = true;
  }

  // 检查并添加请求参数
  if (config.params) {
    curlCommand += ` \\\n  -d '${JSON.stringify(config.params)}'`;
    dataAdded = true;
  }

  // 如果有添加 data 或 params，最后追加分隔符
  if (dataAdded) {
    curlCommand += `\n====================`;
  }

  // 输出生成的 curl 命令
  return curlCommand;
};

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 获取 Dom ref 标记
export function getRef(refName) {
  if (this.$refs[refName]) {
    return this.$refs[refName];
  }
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments,
    flag = true,
    i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return arg;
  });
  return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str) {
  if (!str || str == 'undefined' || str == 'null') {
    return '';
  }
  return str;
}

// 数据合并
export function mergeRecursive(source, target) {
  for (var p in target) {
    try {
      if (target[p].constructor == Object) {
        source[p] = mergeRecursive(source[p], target[p]);
      } else {
        source[p] = target[p];
      }
    } catch (e) {
      source[p] = target[p];
    }
  }
  return source;
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  let config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  };

  var childrenListMap = {};
  var nodeIds = {};
  var tree = [];

  for (let d of data) {
    let parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (let d of data) {
    let parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (let t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (let c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }

  return tree;
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params) {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + '=';
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + '=';
            result += subPart + encodeURIComponent(value[key]) + '&';
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&';
      }
    }
  }
  if (typeof result === 'string') result = result.replace(/&$/, '');
  return result;
}

// 返回项目路径
export function getNormalPath(p) {
  if (p.length === 0 || !p || p == 'undefined') {
    return p;
  }
  let res = p.replace('//', '/');
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1);
  }
  return res;
}

// 验证是否为blob格式
export function blobValidate(data) {
  return data.type !== 'application/json';
}

// 获取maps的可以详情
export const getKeyObject = (maps, key, valueKey) => {
  try {
    if (valueKey) return maps[key][valueKey];
    return maps[key];
  } catch (error) {
    return '';
  }
};

// 秒转小时
export const secondToHour = (seconds, digits = 3) => {
  if (typeof seconds !== 'number' || seconds < 0) {
    return null;
  }
  return (seconds / 3600).toFixed(digits);
};

/**
 * 秒、分钟、小时之间的时间单位转换
 * @param {number} value - 原始时间值
 * @param {'s' | 'm' | 'h'} from - 原始单位
 * @param {'s' | 'm' | 'h'} to - 目标单位
 * @param {number} decimal - 保留小数位数
 * @returns {number} - 转换后的数值
 */
export const convertTime = ({ value, from, to, decimal = 3 }) => {
  const unitToSeconds = {
    s: 1,
    m: 60,
    h: 3600,
  };

  if (!unitToSeconds[from] || !unitToSeconds[to]) {
    throw new Error(`不支持的时间单位: ${from} 或 ${to}`);
  }

  // 统一先转换成秒，再转换成目标单位
  const valueInSeconds = value * unitToSeconds[from];
  const result = valueInSeconds / unitToSeconds[to];

  return parseFloat(result.toFixed(decimal));
};

/**
 * 通用方法：将时间单位转换为秒
 * @param {number} time - 时间数值
 * @param {'hour' | 'minute'} unit - 单位（可选，默认 'hour'）
 * @returns {number | false} - 返回秒数，出错时返回 0
 */
export const hourToSecond = (time, unit = 'hour') => {
  try {
    if (time < 0) {
      return 0;
    }

    const unitMap = {
      hour: 3600,
      minute: 60,
    };

    const multiplier = unitMap[unit] ?? 3600; // 默认按小时转换

    return Math.ceil(time * multiplier);
  } catch (error) {
    return 0;
  }
};

// 数组转字符串
export const arrayToIdsString = ({ array, key = 'id' }) => {
  if (array && array instanceof Array) return array.map(item => item[key]).join(',');
  return '';
};

// 截取文件类型
export function getFileExtension(url) {
  if (!url) return '';
  const parts = url.split('?')[0].split('.'); // 忽略查询参数
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

// 截取文件类型
export function getFileIconByUrl(url) {
  const suffix = getFileExtension(url);
  return getFileIcon(suffix);
}

export const getFileIcon = suffix => {
  switch (suffix) {
    case 'doc':
    case 'docx':
      return '#icon-wenjianleixing-biaozhuntu-Wordwendang';
    case 'xls':
    case 'xlsx':
      return '#icon-wenjianleixing-suolvetu-gongzuobiao';
    case 'jpg':
    case 'png':
    case 'jpeg':
      return '#icon-wenjianleixing-biaozhuntu-tupianwenjian';
    default:
      return '#icon-wenjianleixing-biaozhuntu-weizhiwenjian';
  }
};

// 数组转为树
export const arrayToTree = items => {
  const tree = [];
  const map = {};

  // 创建一个以 id 为键的映射
  items.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  // 构建树
  items.forEach(item => {
    const current = map[item.id];
    if (!item.parentId || item.parentId === '0') {
      // 没有 parentId 的作为根节点
      tree.push(current);
    } else {
      // 找到父节点并将当前节点添加到其 children 中
      if (map[item.parentId]) {
        map[item.parentId].children.push(current);
      }
    }
  });

  return tree;
};

/**
 * 根据节点 ID 找到树状结构中的根级节点
 * @param {Array} tree 树状结构数组
 * @param {string|number} nodeId 要查找的节点 ID
 * @param {string} idKey 节点 ID 的字段名，默认 'id'
 * @param {string} childrenKey 子节点数组字段名，默认 'children'
 * @returns {Object|null} 根级节点对象，如果未找到则返回 null
 */
export const findRootInTreeArray = (tree, nodeId, idKey = 'id', childrenKey = 'children') => {
  let rootNode = null;

  /**
   * 递归函数
   * @param {Array} nodes 当前节点数组
   * @param {Object|null} currentRoot 当前根节点
   * @returns {boolean} 是否找到节点
   */
  function traverse(nodes, currentRoot) {
    for (const node of nodes) {
      if (node[idKey] === nodeId) {
        rootNode = currentRoot || node; // 找到节点时，当前根节点即为目标
        return true;
      }
      if (node[childrenKey] && traverse(node[childrenKey], currentRoot || node)) {
        return true;
      }
    }
    return false;
  }

  traverse(tree, null);
  return rootNode;
};

export const isExternalUrl = url => {
  // 创建一个元素用于解析url
  const link = document.createElement('a');
  link.href = url;

  // 获取当前页面的域名
  const currentHost = window.location.hostname;

  // 比较传入的url的域名和当前页面的域名
  return link.hostname !== currentHost;
};

// 递归查找树中的某个节点
export const findNode = (tree, id) => {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 根据计划类型id获取对应颜色
 * **/
export const getPlanTypeColor = id => {
  return Const.plan.PlanTypeColorEnum[id] || '';
};

/**
 * 根据计划类型id获取对应颜色
 * **/
export const getPlanTypeNameColor = name => {
  return Const.plan.PlanTypeNameColorEnum[name] || '';
};

/**
 * 处理菜单数据，将二级导航的children改为children_
 * @param {*} data
 * @returns
 */
export const transformTreeData = data => {
  if (!data) return data;

  // 处理数组形式的树结构
  if (Array.isArray(data)) {
    return data.map(item => transformTreeData(item));
  }

  // 处理对象节点
  const node = { ...data };

  // 检查displayType并进行重命名操作
  if (node.displayType === 'menu_display_type_dhlly' && node.children) {
    node.children_ = node.children;
    delete node.children;
  }

  // 递归处理子节点（同时检查children和children_）
  if (node.children && Array.isArray(node.children)) {
    node.children = node.children.map(child => transformTreeData(child));
  }
  if (node.children_ && Array.isArray(node.children_)) {
    node.children_ = node.children_.map(child => transformTreeData(child));
  }

  return node;
};

/**
 * 处理菜单数据 如果meta.，将二级导航的children改为children_
 * @param {*} data
 * @returns
 */
export const transformTreeDataByMeta = data => {
  if (!data) return data;

  // 处理数组形式的树结构
  if (Array.isArray(data)) {
    return data.map(item => transformTreeDataByMeta(item));
  }

  // 处理对象节点
  const node = { ...data };

  // 检查displayType并进行重命名操作
  if (node.meta.isSidebarRouterMenu) {
    node.children_ = node.children;
    delete node.children;
  }

  // 递归处理子节点（同时检查children和children_）
  if (node.children && Array.isArray(node.children)) {
    node.children = node.children.map(child => transformTreeDataByMeta(child));
  }
  if (node.children_ && Array.isArray(node.children_)) {
    node.children_ = node.children_.map(child => transformTreeDataByMeta(child));
  }

  return node;
};

/**
 * 获取树结构所有叶子节点（经典递归实现）
 * @param {Array} tree 树形数据
 * @returns {Array} 叶子节点数组
 */
export function getLeafNodes(tree) {
  let leaves = [];

  function traverse(node) {
    if (!node.children || node.children.length === 0) {
      leaves.push(node);
    } else {
      node.children.forEach(child => traverse(child));
    }
  }

  tree.forEach(root => traverse(root));
  return leaves;
}
