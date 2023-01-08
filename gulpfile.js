
/**
 * gulpを読み込む
 */
const { src, dest, watch, series, parallel} = require("gulp");

// 共通の設定
const rename = require("gulp-rename"); //拡張子の変更

/**
 * ファイルへのパス
 */
// 読み込み先のリポジトリ（階層が間違えていると動かないので注意）
const srcPath = {
    css: "src/scss/**/*.scss",
    img: "src/img/**/*",
    js: "src/js/**/*.js",
    ejs: ["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"],
}

// 出力先のリポジトリ
const destPath = {
    css: "dist/assets/css/",
    img: "dist/assets/img/",
    js: "dist/assets/js/",
    html: "dist/",
}

// ブラウザーシンク（リアルタイムでブラウザに反映させる処理）
const browserSync = require("browser-sync"); //ブラウザ反映
const browserSyncOption = {
    server: "./dist"
}
const browserSyncFunc = () => {
    browserSync.init(browserSyncOption);
}
const browserSyncReload = (done) => {
    browserSync.reload();
    done();
}

/**
 * Sassファイルのコンパイル処理（DartSass対応）
 */
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob-use-forward");
const cssDeclarationSorter = require("css-declaration-sorter"); //CSSのソースをソートする
const plumber = require("gulp-plumber"); //エラー時の強制終了を防止
const notify = require("gulp-notify"); //エラー発生時にデスクトップ通知する
const postcss = require("gulp-postcss");
const cssnext = require("postcss-cssnext")
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const browsers = [
    "last 2 versions",
    "> 5%",
    "ie = 11",
    "not ie <= 10",
    "ios >= 8",
    "and_chr >= 5",
    "Android >= 5",
]

/**
 * jsファイルのビルド処理
 */
const uglify = require("gulp-uglify");
const concat = require('gulp-concat');


/**
 * ejsを読み込む
 */
const ejs = require("gulp-ejs");
const replace = require("gulp-replace");
const htmlhint = require("gulp-htmlhint");
const data = require("./src/data/data.json");

// const fs = require("fs");



// sassファイルのコンパイル
const cssSass = () => {
    return src(srcPath.css)
        .pipe(sourcemaps.init())
        .pipe(
            plumber({
                errorHandler: notify.onError("Error:<%= error.message %>")
            }))
        .pipe(sassGlob())
        .pipe(sass.sync({
            includePaths: ["src/scss"],
            outputStyle: "expanded"
        }))
        .pipe(postcss([cssnext(browsers)]))
        .pipe(postcss([cssDeclarationSorter({
            order: "smacss"
        })]))
        .pipe(sourcemaps.write("./"))
        .pipe(dest(destPath.css))
        .pipe(notify({
            message: "Sassのコンパイルが完了しました。",
            onLast: true
        }))
}


// ejsファイルのコンパイル
const ejsCompile = () => {
    // const data = JSON.parse(fs.readFileSync("src/data/data.json")); //JSONデータを使用する場合はコメントを外す
    return src(srcPath.ejs) //読み込み元
        .pipe(ejs({
            data: data
        }))
        .pipe(
            plumber({
                errorHandler: notify.onError("<%= error.message %>"),
            }))
        .pipe(rename({
            extname: ".html"
        }))
        .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
        .pipe(dest(destPath.html))
        .pipe(notify({
            "message": "ejsのコンパイルが完了しました。",
            "onLast": true
        }));
};


// jsのバンドル
const jsBundle = () => {
    return src(srcPath.js)
    .pipe(
        plumber({
            errorHandler: notify.onError("<%= error.message %>"),
        }))
    .pipe(concat('main.js'))//main.jsに他のjsファイルをconcat
    // .pipe(uglify()) //jsファイルを圧縮する
    .pipe(dest(destPath.js))
    .pipe(notify({
        message: "jsのバンドルが完了しました。",
        onLast: true
    }));
};

// const webpack = require("webpack");
// const webpackStream = require("webpack-stream");

// // webpackでjsファイルのバインドを実行
// const jsBundleWebpack = () => {
//     // webpack.config.js 読込
//     const webpackConfigPath = "./webpack.config.js";
//     delete require.cache[webpackConfigPath];
//     const webpackConfig = require(webpackConfigPath);

//     // webpack 実行
//     return webpackStream(webpackConfig, webpack).on("error", function (e) {
//             this.emit("end");
//         })
//         .pipe(dest(destPath.js))
//         .pipe(notify({
//             message: "jsのビルドが完了しました。",
//             onLast: true
//         }));
// };


// 画像圧縮
const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
// const imageminSvgo = require("imagemin-svgo");
const imgImagemin = () => {
    return src(srcPath.img)
        .pipe(imagemin([
            imageminMozjpeg({
                quality: 80
            }),
            imageminPngquant(),
            // imageminSvgo({
            //     plugins: [{
            //         removeViewbox: false
            //     }]
            // })
        ], {
            verbose: true
        }))
        .pipe(dest(destPath.img))
}

// ファイルの変更を検知
const watchFiles = () => {
    watch(srcPath.ejs, series(ejsCompile, browserSyncReload)); //ejsを使用する場合
    watch(srcPath.css, series(cssSass, browserSyncReload))
    watch(srcPath.js, series(jsBundle, browserSyncReload))
    watch(srcPath.img, series(imgImagemin, browserSyncReload))
}

// 画像だけ削除
const del = require("del");
const delPath = {
    // css: "../dist/css/",
    // js: "../dist/js/script.js",
    // jsMin: "../dist/js/script.min.js",
    img: "./img/",
    // html: "../dist/*.html",
    // wpcss: `../${themeName}/assets/css/`,
    // wpjs: `../${themeName}/assets/js/script.js`,
    // wpjsMin: `../${themeName}/assets/js/script.min.js`,
    // wpImg: `../${themeName}/assets/images/`
}
const clean = (done) => {
    del(delPath.img, {
        force: true,
    });
    // del(delPath.css, { force: true, });
    // del(delPath.js, { force: true, });
    // del(delPath.jsMin, { force: true, });
    // del(delPath.html, { force: true, });
    // del(delPath.wpcss, { force: true, });
    // del(delPath.wpjs, { force: true, });
    // del(delPath.wpjsMin, { force: true, });
    // del(delPath.wpImg, { force: true, });
    done();
};


// npx gulpで出力する内容
exports.default = series(series(clean, cssSass, ejsCompile,  jsBundle, imgImagemin), parallel(watchFiles, browserSyncFunc));

// npx gulp del → 画像最適化（重複を削除）
// exports.del = series(series(clean, cssSass, imgImagemin), parallel(watchFiles, browserSyncFunc));