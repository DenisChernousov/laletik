const { src, dest, parallel, series, watch } = require('gulp')
const del = require('del')
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('gulp-autoprefixer')
const gcssmq = require('gulp-group-css-media-queries')
const includeFiles = require('gulp-include')
const imagemin = require('gulp-imagemin')
// const пгдзша = require('gulp-imagemin')
const htmlmin = require('gulp-htmlmin')
const gulpGroupCssMediaQueries = require('gulp-group-css-media-queries')
const browserSync = require('browser-sync').create()

// const isProduction = process.env.NODE_ENV === 'production';
const outputDir = 'public';
const srcHTML = 'src/**/*.html';
const srcSCSS = 'src/**/*.scss';
const srcJS = 'src/**/*.js';
const srcImages = ['src/**/*.svg', 'src/**/*.jpg', 'src/**/*.gif', 'src/**/*.png' ];

function browsersync() {
  browserSync.init({
    server: {
      baseDir: './public/',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
    port: 8080,
    ui: { port: 8081 },
    open: true,
  })
}

function styles() {
  return src('./src/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ grid: true }))
    .pipe(gcssmq())
    .pipe(dest('./public/css/'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src('./src/js/script.js')
    .pipe(
      includeFiles({
        includePaths: './src/**/',
      })
    )
    .pipe(dest('./public/js/'))
    .pipe(browserSync.stream())
}

function pages() {
  return src('./src/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('./public/'))
    .pipe(browserSync.reload({ stream: true, }))
}

function copyFonts() {
  return src('./src/fonts/**/*')
    .pipe(dest('./public/fonts/'))
}

function copyImages() {
  return src('./src/img/**/*')
  // .pipe(gulpif(isProduction, imagemin()))
    .pipe(imagemin())
    .pipe(dest('./public/img/'))
}

async function copyResources() {
  copyFonts()
  copyImages()
}

async function clean() {
  return del.sync('./public/', { force: true })
}

function watch_dev() {
  watch(['./src/js/script.js', './src/components/**/*.js'], scripts)
  watch(('./src/**/*.scss'), styles).on(
    'change',
    browserSync.reload
  )
  watch(('./src/**/*.html'), pages).on(
    'change',
    browserSync.reload
  )
}

exports.browsersync = browsersync
exports.clean = clean
exports.scripts = scripts
exports.styles = styles
exports.pages = pages
exports.copyResources = copyResources

exports.default = parallel(
  clean,
  styles,
  scripts,
  copyResources,
  pages,
  browsersync,
  watch_dev
)

exports.build = series(
  clean,
  styles,
  scripts,
  copyResources,
  pages
)
