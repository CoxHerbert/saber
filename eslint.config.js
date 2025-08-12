import { defineConfig } from "eslint/config";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,vue}"]},
  { files: ["**/*.{js,mjs,cjs,vue}"], languageOptions: { globals: globals.browser }},
  pluginVue.configs["flat/essential"],
  {
    rules: {
      "vue/valid-define-emits": 1,
      "vue/no-unused-components": 1,
      "vue/require-valid-default-prop": 0,
      "vue/no-reserved-component-names": 0,
      "vue/no-mutating-props": 0,
      "vue/multi-word-component-names": 0,
      "vue/no-deprecated-v-bind-sync": 0,
      "vue/no-deprecated-slot-attribute": 0,
      "vue/no-deprecated-slot-scope-attribute": 0,
      "vue/no-deprecated-v-on-native-modifier": 0,
      "vue/no-deprecated-destroyed-lifecycle": 1,
      "vue/valid-attribute-name": 1,
      "vue/no-ref-as-operand": 1,
      "vue/no-unused-vars": 1,
      "vue/no-parsing-error": 1,
      "vue/multi-word-component-names": 0,
      "vue/no-useless-template-attributes": 0,
    },
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      "src/views/dashboard/humanResources/",
      "src/views/dashboard/humanResources/components/",
    ]
  }
]);