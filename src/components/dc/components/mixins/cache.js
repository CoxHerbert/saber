import { ref } from 'vue';
import cacheDataConfig from './../../constant/cacheData';

export const useCacheMixin = () => {
  const cacheData = ref(cacheDataConfig);

  return {
    cacheData,
  };
};
