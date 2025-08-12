import { getQueryString } from './util';
import { ElMessage } from 'element-plus';
/**
 * 通用工具类
 */
export default class func {
  /**
   * 不为空
   * @param val
   * @returns {boolean}
   */
  static notEmpty(val) {
    return !this.isEmpty(val);
  }

  /**
   * 是否为定义
   * @param val
   * @returns {boolean}
   */
  static isUndefined(val) {
    return val === null || typeof val === 'undefined';
  }

  /**
   * 为空
   * @param val
   * @returns {boolean}
   */
  static isEmpty(val) {
    if (
      val === null ||
      typeof val === 'undefined' ||
      (typeof val === 'string' && val === '' && val !== 'undefined')
    ) {
      return true;
    }
    return false;
  }

  /**
   * 强转int型
   * @param val
   * @param defaultValue
   * @returns {number}
   */
  static toInt(val, defaultValue) {
    if (this.isEmpty(val)) {
      return defaultValue === undefined ? -1 : defaultValue;
    }
    const num = parseInt(val, 0);
    return Number.isNaN(num) ? (defaultValue === undefined ? -1 : defaultValue) : num;
  }

  /**
   * Json强转为Form类型
   * @param obj
   * @returns {FormData}
   */
  static toFormData(obj) {
    const data = new FormData();
    Object.keys(obj).forEach(key => {
      data.append(key, Array.isArray(obj[key]) ? obj[key].join(',') : obj[key]);
    });
    return data;
  }

  /**
   * date类转为字符串格式
   * @param date
   * @param format
   * @returns {null}
   */
  static format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return date ? date.format(format) : null;
  }

  /**
   * data类格式化
   * @param timestamp
   * @returns {string}
   */
  static formatDateTime(timestamp) {
    return this.formatDate(new Date(timestamp));
  }

  /**
   * data类格式化
   * @param date
   * @returns {string}
   */
  static formatDate(date) {
    const pad = num => (num < 10 ? '0' + num : num);

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 月份从0开始，所以+1
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  /**
   * 格式化时区解决时间差问题
   * @param datetime
   * @returns {string}
   */
  static toLocalISOString(datetime) {
    let timezoneOffset = datetime.getTimezoneOffset() * 60000; // 获取当前时区与UTC的时间差（以毫秒为单位）
    let localDatetime = new Date(datetime - timezoneOffset); // 调整时间，得到当前时区时间
    return localDatetime.toISOString();
  }

  /**
   * 根据逗号联合
   * @param arr
   * @returns {string}
   */
  static join(arr) {
    return Array.isArray(arr) ? arr.join(',') : arr;
  }

  /**
   * 根据逗号分隔
   * @param str
   * @returns {string}
   */
  static split(str) {
    return str ? String(str).split(',') : '';
  }

  /**
   * 转换空字符串
   * @param str
   * @returns {string|*}
   */
  static toStr(str) {
    if (typeof str === 'undefined' || str === null) {
      return '';
    }
    return str;
  }

  /**
   * 判断是否为数组
   * @param param
   * @returns {boolean}
   */
  static isArrayAndNotEmpty(param) {
    return Array.isArray(param) && param.length > 0;
  }

  /**
   * 格式化URL
   * @param url
   * @returns {*|string}
   */
  static formatUrl(url) {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    } else {
      return `http://${url}`;
    }
  }

  /**
   * bytes转换为kb单位
   * @param bytes
   * @returns {string}
   */
  static bytesToKB(bytes) {
    const kb = bytes / 1024;
    return kb.toFixed(2);
  }

  /**
   * json数组转换成key value字符串
   * @param jsonArray "[{enumKey: 'key', enumValue: 'value'}]"
   * @returns {*}
   */
  static jsonArrayToKeyValue(jsonArray) {
    if (this.isEmpty(jsonArray)) {
      return '';
    }
    return jsonArray.map(item => `${item.enumKey}:${item.enumValue}`).join(';');
  }

  /**
   * key value字符串转换成json数组
   * @param keyValue key:value;key:value
   * @returns {*[]}
   */
  static keyValueToJsonArray(keyValue) {
    if (this.isEmpty(keyValue)) {
      return [];
    }
    return keyValue.split(';').map((kv, index) => {
      const [key, value] = kv.split(':');
      return {
        id: index,
        enumKey: key,
        enumValue: value,
      };
    });
  }

  /**
   * 生成随机字符串
   * @param length 长度
   * @returns {string}
   */
  static strGenerate(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const maxLength = 256;
    if (length > maxLength) {
      throw new Error(`长度最大值不能超过 ${maxLength}`);
    }

    return Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  }

  /**
   * 生成UUID
   * @returns {string}
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 权限
   * @returns {boolean}
   */
  static isOperate(permission) {
    const operate = getQueryString('isOperate');
    // 测试环境也要权限可测试
    const isProd = ['test', 'production'].includes(import.meta.env.VITE_APP_ENV);
    if (operate !== null) return operate;

    return permission ? isProd : false;
  }

  static async copyText(text) {
    if (!text) return;
    try {
      // 使用 Clipboard API 实现复制
      await navigator.clipboard.writeText(text);
      ElMessage({
        message: '复制成功',
        type: 'success',
      });
    } catch (err) {
      ElMessage({
        message: '复制失败',
        type: 'error',
      });
    }
  }
}
