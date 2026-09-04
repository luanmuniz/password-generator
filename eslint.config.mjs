import { fileURLToPath } from 'node:url';

import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import luanExtensions from 'eslint-config-luanmuniz';

const npmignorePath = fileURLToPath(new URL('.npmignore', import.meta.url));

export default defineConfig([
	includeIgnoreFile(npmignorePath, 'Imported from .npmignore'),
	{
		extends: [ luanExtensions ],

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module'
		},

		rules: {
			'require-jsdoc': 'off',
			'multiline-comment-style': 'off',
			'no-warning-comments': 'off',
			'no-param-reassign': 'off',
			'require-await': 'off',

			'no-magic-numbers': [ 'error', {
				ignore: [ -1, 0, 1, 2, 3, 4, 5, 7, 10, 24, 60, 100, 200, 365, 400, 401, 403, 404, 409, 500, 1000, 1024, 300000 ]
			}],

			'id-length': [ 'error', {
				exceptions: [ 'data', 'result', 'a', 'b', 'i' ]
			}],

			'id-blacklist': 'off',
			'operator-linebreak': [ 'error', 'before', {}]
		}
	}
]);
