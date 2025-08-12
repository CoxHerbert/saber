import { onBeforeRouteLeave } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import store from '@/store';

window.bindEvent = false;

const confirmLeave = async () => {
  try {
    await ElMessageBox.confirm('当前页面有未保存的数据，确定要离开吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    return true;
  } catch {
    return false;
  }
};

const callback = async function (event) {
  event.preventDefault();
  store.dispatch('updateHasUsavedChanges', false);
  event.returnValue = '';
};

function useUnsavedChanges() {
  // const hasUnsavedChanges = ref(false);

  // 路由守卫逻辑
  onBeforeRouteLeave((to, from, next) => {
    const hasUnsavedChanges = store.state.page.hasUnsavedChanges;
    if (hasUnsavedChanges) {
      confirmLeave().then(allowLeave => {
        if (allowLeave) {
          store.dispatch('updateHasUsavedChanges', false);
          next();
        } else {
          next(false);
        }
      });
    } else {
      next();
    }
  });

  return {
    bindEventCallback: () => {
      if (window.bindEvent) {
        return;
      }
      window.bindEvent = true;
      window.addEventListener('beforeunload', callback);
    },

    unBindEventCallback: () => {
      window.bindEvent = true;
      window.removeEventListener('beforeunload', callback);
    },
    markAsSaved: () => {
      store.dispatch('updateHasUsavedChanges', false);
    },
    markAsUnsaved: () => {
      store.dispatch('updateHasUsavedChanges', true);
    },
  };
}

export default useUnsavedChanges;
