# 玩转 Webpack 高级特性应对项目优化需求

### Tree Shaking


通过 Tree-shaking “摇掉”的是代码中那些没有用到的部分，
这部分没有用的代码更专业的说法应该叫作未引用代码（dead-code）。



通过 Tree-shaking 就可以极大地减少最终打包后 bundle 的体积。


Tree-shaking 并不是指 Webpack 中的某一个配置选项，
而是一组功能搭配使用过后实现的效果，这组功能在生产模式下都会自动启用，
所以使用生产模式打包就会有 Tree-shaking 的效果。


### 开启 Tree Shaking


```js

// ./webpack.config.js
module.exports = {
  // ... 其他配置项
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,// 模块只导出使用的成员
    minimize: true,// 压缩代码
  }
}

```



### 合并模块（扩展）


普通打包只是将一个模块最终放入一个单独的函数中，如果我们的模块很多，就意味着在输出结果中会有很多的模块函数。


concatenateModules 配置的作用就是尽可能将所有模块合并到一起输出到一个函数中，这样既提升了运行效率，又减少了代码的体积。



```js

// ./webpack.config.js
module.exports = {
  // ... 其他配置项
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,
    // 尽可能合并每一个模块到一个函数中
    concatenateModules: true,
    // 压缩输出结果
    minimize: false
  }
}

```



### 结合 babel-loader 的问题

为 JS 模块配置 babel-loader，会导致 Tree-shaking 失效

Tree-shaking 实现的前提是 ES Modules，也就是说：最终交给 Webpack 打包的代码，
必须是使用 ES Modules 的方式来组织的模块化。



这个模块中，根据环境标识自动禁用了对 ES Modules 的转换插件，
所以经过 babel-loader 处理后的代码默认仍然是 ES Modules，
那 Webpack 最终打包得到的还是 ES Modules 代码，Tree-shaking 自然也就可以正常工作了。



### sideEffects

通过配置标识我们的代码是否有副作用，从而提供更大的压缩空间。


模块的副作用指的就是模块执行的时候除了导出成员，是否还做了其他的事情。


Tree-shaking 只能移除没有用到的代码成员，而想要完整移除没有用到的模块，那就需要开启 sideEffects 特性


```js

// ./webpack.config.js
module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js'
  },
  optimization: {
    sideEffects: true,//有副作用
  }
}


```

webpack.config.js 中的 sideEffects 用来开启这个功能；
package.json 中的 sideEffects 用来标识我们的代码没有副作用。


