// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import interfaceToType from 'eslint-plugin-interface-to-type';

export default tseslint.config({ ignores: ['dist', '.vinxi', '.output', 'node_modules'] }, {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
    },
    plugins: {
        'react-hooks': reactHooks,
        react,
        'interface-to-type': interfaceToType,
    },
    settings: {
        react: {
            version: '19.0',
        },
    },
    rules: {
        ...reactHooks.configs.recommended.rules,
        ...react.configs.recommended.rules,
        'react/react-in-jsx-scope': 'off', // React 17+ nevyžaduje import React v každém souboru
        'react/prop-types': 'off', // Používáme TypeScript
        'react-hooks/refs': 'off', // False positive při použití refs pro DOM elementy v props
        'quotes': ['error', 'single', { avoidEscape: true }],
        'jsx-quotes': ['error', 'prefer-single'],
        'react/jsx-max-props-per-line': ['error', { maximum: { single: 2, multi: 1 } }],
        'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
        'react/jsx-curly-brace-presence': ['error', { props: 'always', children: 'never' }],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],
        'interface-to-type/prefer-type-over-interface': 'error',
    },
}, storybook.configs["flat/recommended"]);
