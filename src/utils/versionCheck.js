import { ElMessageBox } from 'element-plus';
import axios from 'axios';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const random = (Math.random() * 16) | 0;
    const value = c === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

// 版本检查
export const versionCheck = async () => {
  const isLocal = import.meta.env.VITE_APP_ENV === 'localhost';
  if (isLocal) return;
  const response = await axios.get(`${window.location.origin}/version.json?uuid=${generateUUID()}`);
  //import.meta.VITE__APP_VERSION__  获取环境变量设置的值，判断是否与生成的版本信息一致
  if (import.meta.env.VITE_APP_VERSION !== response.data.version) {
    ElMessageBox.confirm(
      `检测到新版本，更新之后将能体验到更多好用的功能，是否现在更新？`,
      '版本更新提示',
      {
        confirmButtonText: '更新',
        type: 'warning',
        showCancelButton: false,
        draggable: true,
      }
    )
      .then(async () => {
        window.location.reload();
      })
      .catch();
  }
};
