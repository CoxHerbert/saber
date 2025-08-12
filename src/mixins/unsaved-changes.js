import { ElMessageBox } from 'element-plus';
import store from '@/store';

export default {
  data() {
    return {
      bindEvent: false,
    };
  },
  created() {
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  },
  beforeRouteLeave(to, from, next) {
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
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  },
  methods: {
    beforeUnloadHandler(event) {
      console.log(store.state.page.hasUnsavedChanges, '------');
      if (store.state.page.hasUnsavedChanges) {
        store.dispatch('updateHasUsavedChanges', false);
        event.preventDefault();
        event.returnValue = '';
      }
    },
    bindEventCallback() {
      if (this.bindEvent) return;
      this.bindEvent = true;
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    },
    unBindEventCallback() {
      this.bindEvent = false;
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    },
    markAsSaved() {
      store.dispatch('updateHasUsavedChanges', false);
    },
    markAsUnsaved() {
      store.dispatch('updateHasUsavedChanges', true);
    },
  },
};
