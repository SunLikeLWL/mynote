# 如何优化 Webpack 的构建速度和打包结果



### 不同环境下的配置

1、在配置文件中添加相应的判断条件，根据环境不同导出不同配置。
2、为不同环境单独添加一个配置文件，一个环境对应一个配置文件。



Webpack 配置文件还支持导出一个函数，然后在函数中返回所需要的配置对象


```js

// ./webpack.config.js
module.exports = (env, argv) => {
  const config = {
    // ... 不同模式下的公共配置
  }
  return config
}


```

然后通过判断，再为 config 对象添加不同环境下的特殊配置。具体如下：

```js
//
// ./webpack.config.js
module.exports = (env, argv) => {
  const config = {
    // ... 不同模式下的公共配置
  }
  
  if (env === 'development') {
    // 为 config 添加开发模式下的特殊配置
    config.mode = 'development'
    config.devtool = 'cheap-eval-module-source-map'
  } else if (env === 'production') {
    // 为 config 添加生产模式下的特殊配置
    config.mode = 'production'
    config.devtool = 'nosources-source-map'
  }
  
  return config
}

```






### 不同环境的配置文件



```js


// ./webpack.common.js
module.exports = {
  // ... 公共配置
}
// ./webpack.prod.js
const common = require('./webpack.common')
module.exports = Object.assign(common, {
  // 生产模式配置
})
// ./webpack.dev.js
const common = require('./webpack.common')
module.exports = Object.assign(common, {
  // 开发模式配置
})

```


但是像配置中的 plugins 这种数组，我们只是希望在原有公共配置的插件基础上添加一些插件，那 Object.assign 就做不到了。



所以我们需要更合适的方法来合并这里的配置与公共的配置。
你可以使用 Lodash 提供的 merge 函数来实现，不过社区中提供了更为专业的模块 webpack-merge，
它专门用来满足我们这里合并 Webpack 配置的需求。

```js

// ./webpack.common.js
module.exports = {
  // ... 公共配置
}
// ./webpack.prod.js
const merge = require('webpack-merge')
const common = require('./webpack.common')
module.exports = merge(common, {
  // 生产模式配置
})
// ./webpack.dev.jss
const merge = require('webpack-merge')
const common = require('./webpack.common')
module.exports = merge(common, {
  // 开发模式配置
})


```




### 生产模式下的优化插件


### Define Plugin

DefinePlugin 是用来为我们代码中注入全局成员的。


```js


// ./webpack.config.js
const webpack = require('webpack')
module.exports = {
/  // ... 其他配置
  plugins: [
    new webpack.DefinePlugin({
      API_BASE_URL: 'https://api.example.com'
    })
  ]
}

// ./src/main.js
console.log(API_BASE_URL)


```




### Mini CSS Extract Plugin


mini-css-extract-plugin 是一个可以将 CSS 代码从打包结果中提取出来的插件，


```js

// ./webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
  mode: 'none',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 'style-loader', // 将样式通过 style 标签注入
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin()
  ]
}

```

不过这里需要注意的是，如果你的 CSS 体积不是很大的话，提取到单个文件中，
效果可能适得其反，因为单独的文件就需要单独请求一次。
个人经验是如果 CSS 超过 200KB 才需要考虑是否提取出来，作为单独的文件。




### Optimize CSS Assets Webpack Plugin


生产模式下会自动压缩输出的结果，我们可以打开打包生成的 JS 文件



```js

// ./webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
module.exports = {
  mode: 'none',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new OptimizeCssAssetsWebpackPlugin()
  ]
}

```




### terser-webpack-plugin

内置的 JS 压缩插件叫作 terser-webpack-plugin


```js

// ./webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
module.exports = {
  mode: 'none',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: '[name].bundle.js'
  },
  optimization: {
    minimizer: [
      new TerserWebpackPlugin(),
      new OptimizeCssAssetsWebpackPlugin()
    ]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin()
  ]
}

```
