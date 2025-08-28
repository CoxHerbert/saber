// src/directives/drag-scroll.js
const DEFAULTS = {
  axis: 'yx', // 'x' | 'y' | 'xy'
  momentum: true, // 惯性滚动
  multiplier: 1, // 拖动速度倍数
  // Element Plus 常见交互控件 + 你已有的基础选择器 + 自定义逃逸属性
  exclude: [
    'input',
    'textarea',
    'button',
    'select',
    'a',
    '[role="button"]',
    '[contenteditable="true"]',
    '[data-drag-ignore]',
    '.el-checkbox',
    '.el-checkbox__input',
    '.el-radio',
    '.el-switch',
    '.el-input',
    '.el-input__inner',
    '.el-textarea',
    '.el-select',
    '.el-date-editor',
    '.el-cascader',
    '.el-slider',
    '.el-link',
    '.el-button',
  ].join(','),
  clickThreshold: 5, // 像素，超过视为拖动，阻止点击
  handle: null, // 仅允许从该选择器触发拖动（可选）
  pointerCapture: false, // 是否在真正开始拖动后调用 setPointerCapture
};

function assign(target, src) {
  for (const k in src) target[k] = src[k];
  return target;
}

/** 解析 binding：支持
 *  v-drag-scroll
 *  v-drag-scroll="' .inner '"
 *  v-drag-scroll="elementRef"
 *  v-drag-scroll="() => elementRef"
 *  v-drag-scroll="{ container: '.inner', axis: 'x', momentum: true, handle: '.drag-handle' }"
 */
function resolveContainerAndOptions(el, binding) {
  let container = el;
  const opt = assign({}, DEFAULTS);
  const v = binding?.value ?? '.el-scrollbar__wrap';

  if (v && typeof v === 'object' && !(v instanceof Element)) {
    if ('container' in v) container = normalizeContainer(el, v.container) ?? el;
    assign(opt, v);
    if ('container' in opt) delete opt.container;
  } else if (typeof v === 'string' || typeof v === 'function' || v instanceof Element) {
    container = normalizeContainer(el, v) ?? el;
  }
  return { container, opt };
}

/** 支持 selector / Element / () => Element */
function normalizeContainer(contextEl, input) {
  if (!input) return null;
  if (input instanceof Element) return input;
  if (typeof input === 'function') {
    try {
      const res = input();
      return res instanceof Element ? res : null;
    } catch {
      return null;
    }
  }
  if (typeof input === 'string') {
    return contextEl.querySelector(input) || document.querySelector(input);
  }
  return null;
}

export default {
  mounted(el, binding) {
    const { container: ct, opt } = resolveContainerAndOptions(el, binding);

    el.__dragScroll__ = { container: ct, opt };

    // 基本样式与滚动方向
    if (opt.axis.includes('x')) ct.style.overflowX = ct.style.overflowX || 'auto';
    else ct.style.overflowX = 'hidden';

    if (opt.axis.includes('y')) ct.style.overflowY = ct.style.overflowY || 'auto';
    else ct.style.overflowY = 'hidden';

    ct.style.userSelect = ct.style.userSelect || 'none';
    ct.style.cursor = ct.style.cursor || 'grab';
    ct.style.touchAction =
      ct.style.touchAction || (opt.axis === 'x' ? 'pan-y' : opt.axis === 'y' ? 'pan-x' : 'none');

    // 状态
    let isPointerDown = false; // 按下但未必在拖
    let dragging = false; // 真正进入拖动（超过阈值后）
    let startX = 0,
      startY = 0;
    let startLeft = 0,
      startTop = 0;
    let lastX = 0,
      lastY = 0,
      lastT = 0;
    let vx = 0,
      vy = 0;
    let raf = 0;
    let movedDist = 0;
    let pointerId = null;

    const stopMomentum = () => cancelAnimationFrame(raf);
    const easeOutCubic = p => 1 - Math.pow(1 - p, 3);

    const hasExcluded = t => !!(t && t.closest && opt.exclude && t.closest(opt.exclude));
    const fromHandle = t => !opt.handle || (t && t.closest && t.closest(opt.handle));

    const onPointerDown = e => {
      // 1) 起点若在排除元素上，直接放行
      if (hasExcluded(e.target)) return;
      // 2) 如果设置了 handle，则必须从 handle 上开始才允许拖
      if (!fromHandle(e.target)) return;

      isPointerDown = true;
      dragging = false; // 先别进拖动态
      pointerId = e.pointerId;

      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      startLeft = ct.scrollLeft;
      startTop = ct.scrollTop;
      lastT = performance.now();
      vx = vy = 0;
      movedDist = 0;

      stopMomentum();
      // 注意：此时不设置 pointer capture，不改变光标，不阻断点击
    };

    const onPointerMove = e => {
      if (!isPointerDown) return;

      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();

      // 还没“宣布”为拖动 → 先累计位移，判断是否超过阈值
      if (!dragging) {
        movedDist += Math.hypot(x - lastX, y - lastY);
        lastX = x;
        lastY = y;
        lastT = now;

        if (movedDist > opt.clickThreshold) {
          // 进入拖动态：这一步才真的改变交互语义
          dragging = true;
          ct.classList.add('is-grabbing');
          if (opt.pointerCapture) ct.setPointerCapture?.(pointerId);
        } else {
          // 阈值内：保持点击特性，不阻止默认
          return;
        }
      }

      // 真正拖动时才执行滚动与阻止默认
      const dx = (x - startX) * opt.multiplier;
      const dy = (y - startY) * opt.multiplier;

      if (opt.axis.includes('x')) ct.scrollLeft = startLeft - dx;
      if (opt.axis.includes('y')) ct.scrollTop = startTop - dy;

      vx = (x - lastX) / (now - lastT || 1);
      vy = (y - lastY) / (now - lastT || 1);

      lastX = x;
      lastY = y;
      lastT = now;

      // 只有真正拖动时才阻止默认，避免吞掉表格/表单点击
      e.preventDefault();
    };

    const onPointerUpOrCancel = () => {
      if (!isPointerDown) return;

      // 结束按压
      isPointerDown = false;

      if (!dragging) {
        // 没有进入拖动，保持“点击”行为，不做其它处理
        movedDist = 0;
        return;
      }

      // 结束拖动
      dragging = false;
      ct.classList.remove('is-grabbing');

      if (!opt.momentum) return;

      const startL = ct.scrollLeft;
      const startT = ct.scrollTop;

      const K = 800;
      const targetL = startL - (opt.axis.includes('x') ? vx * K * 0.5 : 0);
      const targetT = startT - (opt.axis.includes('y') ? vy * K * 0.5 : 0);

      const duration = 400;
      const t0 = performance.now();

      const step = t => {
        const p = Math.min(1, (t - t0) / duration);
        const e = easeOutCubic(p);
        if (opt.axis.includes('x')) ct.scrollLeft = startL + (targetL - startL) * e;
        if (opt.axis.includes('y')) ct.scrollTop = startT + (targetT - startT) * e;
        if (p < 1) raf = requestAnimationFrame(step);
      };

      if (Math.abs(vx) > 0.02 || Math.abs(vy) > 0.02) {
        raf = requestAnimationFrame(step);
      }
    };

    // 仅当做横向滚动映射时拦截 wheel 的纵向 → 横向
    const onWheel = e => {
      if (e.shiftKey && opt.axis.includes('x')) {
        ct.scrollLeft += e.deltaY; // Shift + 滚轮 横向
        e.preventDefault();
      } else if (opt.axis.includes('y')) {
        ct.scrollTop += e.deltaY; // 默认纵向
        e.preventDefault();
      }
    };

    // **只有发生过拖动**才阻断 click，普通点击不干预
    const onClick = e => {
      if (movedDist > opt.clickThreshold) {
        e.stopImmediatePropagation?.();
        e.preventDefault?.();
      }
      movedDist = 0;
    };

    // 保存句柄用于销毁
    el.__dragScroll__.handlers = {
      onPointerDown,
      onPointerMove,
      onPointerUpOrCancel,
      onWheel,
      onClick,
    };
    el.__dragScroll__.raf = raf;

    // 绑定事件
    ct.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUpOrCancel, { passive: true });
    window.addEventListener('pointercancel', onPointerUpOrCancel, { passive: true });
    ct.addEventListener('wheel', onWheel, { passive: false });
    ct.addEventListener('click', onClick, true);
  },

  unmounted(el) {
    const state = el.__dragScroll__;
    if (!state) return;

    const ct = state.container || el;
    const h = state.handlers || {};

    cancelAnimationFrame?.(state.raf);

    ct.removeEventListener?.('pointerdown', h.onPointerDown);
    window.removeEventListener?.('pointermove', h.onPointerMove);
    window.removeEventListener?.('pointerup', h.onPointerUpOrCancel);
    window.removeEventListener?.('pointercancel', h.onPointerUpOrCancel);
    ct.removeEventListener?.('wheel', h.onWheel);
    ct.removeEventListener?.('click', h.onClick, true);

    delete el.__dragScroll__;
  },
};
