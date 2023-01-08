module.exports = {
  mode: 'development', //development　開発 or production 本番
  entry: './src/js/',
  output: {
    path: __dirname + '/dist/assets/js',
    filename: 'common.js'
  },
  optimization:{
    minimize: false //ビルド時にminify化しない
  }
};