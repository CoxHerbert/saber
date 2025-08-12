import request from '@/axios';

export default {
  // 原有的代码生成接口（保持兼容）
  submit(data) {
    return request({
      url: '/blade-develop/code/generate',
      method: 'post',
      data,
    });
  },

  // ============ 新增的增强版接口 ============

  // 获取项目结构概览
  getProjectOverview() {
    return request({
      url: '/blade-develop/code/project-overview',
      method: 'get',
    });
  },

  // 获取可生成代码的目标模块列表
  getTargetModules() {
    return request({
      url: '/blade-develop/code/target-modules',
      method: 'get',
    });
  },

  // 预览代码生成配置
  previewConfig(data) {
    return request({
      url: '/blade-develop/code/preview-config',
      method: 'post',
      data,
    });
  },

  // 增强版代码生成
  generateEnhanced(data) {
    return request({
      url: '/blade-develop/code/generate-enhanced',
      method: 'post',
      data,
    });
  },
};