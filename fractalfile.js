'use strict';
 
// fractalインスタンスを作成してエクスポート
const fractal = module.exports = require('@frctl/fractal').create();
// プロジェクト関連のメタデータ設定
fractal.set('project.title', 'coding-guide');
fractal.set('project.author', 'coding-guide');
// コンポーネントの設定
fractal.components.set('path', __dirname + '/styleguide/components');
// ドキュメントページの設定
fractal.docs.set('path', __dirname + '/styleguide/docs');
// 静的ファイルの設定
fractal.web.set('static.path', __dirname + '/styleguide/css');
// HTMLの生成
fractal.web.set('builder.dest', __dirname + '/build');
