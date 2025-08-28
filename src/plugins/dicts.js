// /src/plugins/dicts.js
export default function createDictPlugin({ Api, store, optionName = 'dicts', ttl = 0 } = {}) {
  // ---- 工具：时间缓存（可选） ----
  const cache = new Map(); // code -> { at: number, value: list }

  function arrayToTree(data) {
    const map = new Map();
    const tree = [];
    // 第1轮：将“规范化后的对象”直接放进 map，children 放同一引用
    data.forEach(item => {
      map.set(item.id, {
        ...item,
        code: item.code,
        id: item.id,
        label: item.dictValue,
        value: item.dictKey,
        children: [],
      });
    });
    // 第2轮：只用 map 里的引用来组织父子关系
    data.forEach(item => {
      const node = map.get(item.id);
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(node);
      } else {
        tree.push(node);
      }
    });
    return tree;
  }

  function cleanEmptyChildren(nodes) {
    if (!Array.isArray(nodes)) return;
    nodes.forEach(n => {
      if (!n.children || n.children.length === 0) {
        delete n.children;
      } else {
        cleanEmptyChildren(n.children);
      }
    });
  }

  const inflight = new Map();

  async function fetchDictRaw(code) {
    const resp = await Api?.system?.dict?.getDicts?.(code);
    const list = arrayToTree(resp?.data?.data || []);
    cleanEmptyChildren(list);
    try {
      await store?.dispatch?.('setDict', { _key: code, value: list });
    } catch (e) {
      // store 未接入时可以忽略
      console.warn('[dict-plugin] dispatch setDict 失败（可忽略）', e);
    }
    return list;
  }

  async function fetchDictOnce(code, force = false) {
    // TTL 缓存（可选）
    if (!force && ttl > 0 && cache.has(code)) {
      const hit = cache.get(code);
      if (Date.now() - hit.at <= ttl) return hit.value;
    }

    if (inflight.has(code)) return inflight.get(code);
    const p = (async () => {
      const list = await fetchDictRaw(code);
      if (ttl > 0) cache.set(code, { at: Date.now(), value: list });
      return list;
    })().finally(() => inflight.delete(code));
    inflight.set(code, p);
    return p;
  }

  // 可选：工具函数
  function flatten(list) {
    const out = [];
    const walk = arr =>
      arr?.forEach(n => {
        out.push({ label: n.label, value: n.value, raw: n });
        if (n.children) walk(n.children);
      });
    walk(list);
    return out;
  }
  function findLabel(list, value) {
    const f = flatten(list);
    const hit = f.find(x => x.value === value);
    return hit ? hit.label : undefined;
  }

  return {
    install(app) {
      // 全局方法
      app.config.globalProperties.$fetchDict = (code, force = false) => fetchDictOnce(code, force);
      app.config.globalProperties.$refreshDict = code => fetchDictOnce(code, true);
      app.config.globalProperties.$dictUtils = { flatten, findLabel };

      // （可选）provide，组合式也能用
      app.provide('fetchDict', fetchDictOnce);
      app.provide('refreshDict', code => fetchDictOnce(code, true));
      app.provide('dictUtils', { flatten, findLabel });

      app.mixin({
        data() {
          return { __dictsData__: {} };
        },
        computed: {
          dicts() {
            return this.__dictsData__;
          },
        },
        async created() {
          // SSR 场景可换成 onMounted 防止服务端请求
          const need = this.$options?.[optionName];
          if (!Array.isArray(need) || need.length === 0) return;

          // 并行拉取
          const results = await Promise.all(need.map(code => fetchDictOnce(code)));
          need.forEach((code, idx) => {
            // Vue3 对对象新增 key 是响应式的，这里可直接赋值
            this.__dictsData__[code] = results[idx];
          });
        },
      });
    },
  };
}
