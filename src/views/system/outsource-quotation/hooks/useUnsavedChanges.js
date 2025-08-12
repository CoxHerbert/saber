import { onMounted, onBeforeUnmount, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useStore } from 'vuex';

export function useUnsavedChanges() {
  const store = useStore();
  const bindEvent = ref(false);

  // 页面刷新/关闭前的处理
  const beforeUnloadHandler = event => {
    if (store.state.page.hasUnsavedChanges) {
      store.dispatch('updateHasUsavedChanges', false);
      event.preventDefault();
      event.returnValue = ''; // 部分浏览器需要设置returnValue才会显示提示
    }
  };

  // 路由离开前的确认逻辑
  onBeforeRouteLeave((to, from, next) => {
    const hasUnsavedChanges = store.state.page.hasUnsavedChanges;
    if (hasUnsavedChanges) {
      ElMessageBox.confirm('当前页面有未保存的数据，确定要离开吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          store.dispatch('updateHasUsavedChanges', false);
          next();
        })
        .catch(() => {
          next(false);
        });
    } else {
      next();
    }
  });

  // 绑定事件
  const bindEventCallback = () => {
    if (bindEvent.value) return;
    bindEvent.value = true;
    window.addEventListener('beforeunload', beforeUnloadHandler);
  };

  // 解绑事件
  const unBindEventCallback = () => {
    bindEvent.value = false;
    window.removeEventListener('beforeunload', beforeUnloadHandler);
  };

  // 标记为已保存
  const markAsSaved = () => {
    store.dispatch('updateHasUsavedChanges', false);
  };

  // 标记为未保存
  const markAsUnsaved = () => {
    store.dispatch('updateHasUsavedChanges', true);
  };

  // 组件挂载时初始化事件绑定
  onMounted(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler);
  });

  // 组件卸载时移除事件监听
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
  });

  return {
    bindEvent,
    bindEventCallback,
    unBindEventCallback,
    markAsSaved,
    markAsUnsaved,
  };
}
