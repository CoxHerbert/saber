import { createI18n } from 'vue-i18n';
import Store from '@/store';
import elementEnLocale from 'element-plus/es/locale/lang/en';
import elementZhLocale from 'element-plus/es/locale/lang/zh-cn';
import elementJaLocale from 'element-plus/es/locale/lang/ja';
import enLocale from './en';
import zhLocale from './zh';
import AvueEnLocale from '@smallwei/avue/lib/locale/lang/en';
import AvueZhLocale from '@smallwei/avue/lib/locale/lang/zh';

import NfDesignEnLocale from '@nutflow/nf-design-elp/lib/locale/lang/en';
import NfDesignZhLocale from '@nutflow/nf-design-elp/lib/locale/lang/zh';
export const messages = {
  en: {
    ...enLocale,
    ...AvueEnLocale,
    ...elementEnLocale,
    ...NfDesignEnLocale,
  },
  'zh-cn': {
    ...zhLocale,
    ...AvueZhLocale,
    ...elementZhLocale,
    ...NfDesignZhLocale,
  },
};
export const language = Store.getters.language;
export default createI18n({
  locale: language,
  messages,
});
