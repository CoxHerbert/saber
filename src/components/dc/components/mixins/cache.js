import { ref } from 'vue';
import _cacheData from './../../constant/cacheData';

export function useCacheMixin() {
  const cacheData = ref(_cacheData);

  return {
    cacheData,
  };
}
