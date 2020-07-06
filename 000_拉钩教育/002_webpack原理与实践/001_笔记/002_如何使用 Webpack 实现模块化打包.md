# 如何使用 Webpack 实现模块化打包


### 需求

1、能够将散落的模块打包到一起
2、能够编译代码中的新特性
3、能够支持不同类型的前端资源模块

### 主流工具
 webpack
 
 Parcel
 Rollup

### Webpack

1、Webpack 作为一个模块打包工具，本身就可以解决模块化代码打包的问题，
  将零散的 JavaScript 代码打包到一个 JS 文件中。
2、对于有环境兼容问题的代码，Webpack 可以在打包过程中通过 Loader 机制对其实现编译转换，然后再进行打包。
3、对于不同类型的前端模块类型，Webpack 支持在 JavaScript 中以模块化的方式载入任意类型的资源文件，
   例如，我们可以通过 Webpack 实现在 JavaScript 中加载 CSS 文件，被加载的 CSS 文件将会通过 style 标签的方式工作。


### Webpack快速上手

