import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from 'typescript-eslint';
import globals from 'globals';

export default [
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tsParser.parser
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'vue/comment-directive': 'off',
      'vue/no-side-effects-in-computed-properties': 'off'
    }
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser.parser,
      globals: {
        ...globals.browser,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        MockInstance: 'readonly',
        Mock: 'readonly'
      }
    }
  }
];
