const childProcess = require('child_process')
const util = require('util')

const execAsync = util.promisify(childProcess.exec)

module.exports = {
  build: [
    `rimraf dist`,
    `mkdirp dist`,
    {
      js: [
        {
          vue: `file2variable-cli src/vue.template.html -o src/vue-variables.ts --html-minify --base src`,
          angular: `file2variable-cli src/angular.template.html -o src/angular-variables.ts --html-minify --base src`
        },
        `ngc -p src`,
        `tsc -p demo`,
        `webpack --display-modules --config demo/webpack.config.js`
      ],
      css: [
        `lessc src/file-uploader.less > src/file-uploader.css`,
        `postcss src/file-uploader.css -o dist/file-uploader.css`,
        `cleancss -o dist/file-uploader.min.css dist/file-uploader.css`,
        `cleancss -o demo/index.bundle.css dist/file-uploader.min.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css`
      ],
      clean: `rimraf demo/**/index.bundle-*.js demo/index.bundle-*.css demo/demo-*.png demo/**/*.index.bundle-*.js`,
      cpy: `cpy src/lib.d.ts dist`
    },
    `rev-static --config demo/rev-static.config.js`,
    async () => {
      const { createServer } = require('http-server')
      const puppeteer = require('puppeteer')
      const fs = require('fs')
      const beautify = require('js-beautify').html
      const server = createServer()
      server.listen(8000)
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
      for (const type of ['vue', 'react', 'angular']) {
        await page.goto(`http://localhost:8000/demo/${type}`)
        await page.screenshot({ path: `demo/${type}/screenshot.png`, fullPage: true })
        const content = await page.content()
        fs.writeFileSync(`demo/${type}/screenshot-src.html`, beautify(content))
      }
      server.close()
      browser.close()
    }
  ],
  lint: {
    ts: `tslint "src/**/*.ts" "src/**/*.tsx" "spec/**/*.ts" "demo/**/*.ts" "demo/**/*.tsx"`,
    js: `standard "**/*.config.js"`,
    less: `stylelint "src/*.less"`,
    export: `no-unused-export "src/**/*.ts" "src/**/*.tsx" "spec/**/*.ts" "demo/**/*.ts" "demo/**/*.tsx" --exclude "src/compiled/**/*"`
  },
  test: [
    'tsc -p spec',
    'karma start spec/karma.config.js',
    'git checkout "demo/**/screenshot.png"',
    async () => {
      const { stdout } = await execAsync('git status -s')
      if (stdout) {
        console.log(stdout)
        throw new Error(`generated files doesn't match.`)
      }
    }
  ],
  fix: {
    ts: `tslint --fix "src/**/*.tsx" "demo/**/*.tsx" "src/**/*.ts" "demo/**/*.ts" "spec/**/*.ts"`,
    js: `standard --fix "**/*.config.js"`,
    less: `stylelint --fix "src/*.less"`
  },
  release: `clean-release`,
  watch: {
    vue: `file2variable-cli src/vue.template.html -o src/vue-variables.ts --html-minify --base src --watch`,
    angular: `file2variable-cli src/angular.template.html -o src/angular-variables.ts --html-minify --base src --watch`,
    src: `tsc -p src --watch`,
    demo: `tsc -p demo --watch`,
    webpack: `webpack --config demo/webpack.config.js --watch`,
    less: `watch-then-execute "src/file-uploader.less" --script "clean-scripts build[2].css"`,
    rev: `rev-static --config demo/rev-static.config.js --watch`
  }
}
