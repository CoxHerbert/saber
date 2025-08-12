import request from '@/axios';

/**
 * 图片上传接口
 * @param {FormData} formData - 包含图片文件的FormData对象
 * @param {string} formData.file - 图片文件
 * @param {string} [formData.businessType] - 业务类型，可选
 * @returns {Promise<Object>} - 上传结果，包含图片URL
 */
export const uploadImage = formData => {
  return request({
    url: '/blade-resource/oss/endpoint/put-file-attach',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 上传超时时间设置为60秒
  });
};

/**
 * 简化的图片上传方法
 * @param {File} file - 图片文件对象
 * @param {string} [businessType='floor_leader'] - 业务类型，默认为楼层负责人
 * @returns {Promise<string>} - 图片URL地址
 */
export const simpleUploadImage = async (file, businessType = 'floor_leader') => {
  if (!file) {
    throw new Error('请选择图片文件');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('businessType', businessType);

  try {
    const response = await uploadImage(formData);
    if (response.data.code === 200 && response.data.data) {
      // 假设接口返回格式为 { code: 200, data: { url: 'https://example.com/image.jpg' } }
      return response.data.data.link;
    } else {
      throw new Error(response.data.msg || '图片上传失败');
    }
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
};

export default {
  uploadImage,
  simpleUploadImage,
};
