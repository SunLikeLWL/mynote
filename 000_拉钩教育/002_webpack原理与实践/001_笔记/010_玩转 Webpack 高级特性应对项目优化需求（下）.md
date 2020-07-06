# 玩转 Webpack 高级特性应对项目优化需求（下）


### All in One 的弊端


通过 Webpack 实现前端项目整体模块化的优势固然明显，

但是它也会存在一些弊端：它最终会将我们所有的代码打包到一起。


所以这种 All in One 的方式并不合理，更为合理的方案是把打包的结果按照一定的规则分离到多个 bundle 中，
然后根据应用的运行需要按需加载。



### 目前主流的 HTTP 1.1 本身就存在一些缺陷


1、同一个域名下的并行请求是有限制的；
2、每次请求本身都会有一定的延迟；
3、每次请求除了传输内容，还有额外的请求头，大量请求的情况下，这些请求头加在一起也会浪费流量和带宽。


### Code Splitting


为了解决打包结果过大导致的问题，Webpack 设计了一种分包功能：Code Splitting（代码分割）。


Code Splitting 通过把项目中的资源模块按照我们设计的规则打包到不同的 bundle 中，
从而降低应用的启动成本，提高响应速度。


Webpack 实现分包的方式主要有两种：

1、根据业务不同配置多个打包入口，输出多个打包结果；
2、结合 ES Modules 的动态导入（Dynamic Imports）特性，按需加载模块。


### 多入口打包

```js

// ./webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  entry: {
    index: './src/index.js',
    album: './src/album.js'
  },
  output: {
    filename: '[name].bundle.js' // [name] 是入口名称
  },
  // ... 其他配置
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Multi Entry',
      template: './src/index.html',
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      title: 'Multi Entry',
      template: './src/album.html',
      filename: 'album.html'
    })
  ]
}

```



### 提取公共模块

多入口打包本身非常容易理解和使用，但是它也存在一个小问题，
就是不同的入口中一定会存在一些公共使用的模块，
如果按照目前这种多入口打包的方式，
就会出现多个打包结果中有相同的模块的情况。


我们只需要在优化配置中开启 splitChunks 功能就可以了


```js


// ./webpack.config.js
module.exports = {
  entry: {
    index: './src/index.js',
    album: './src/album.js'
  },
  output: {
    filename: '[name].bundle.js' // [name] 是入口名称
  },
  optimization: {
    splitChunks: {
      // 自动提取所有公共模块到单独 bundle
      chunks: 'all'
    }
  }
  // ... 其他配置
}

```



### 动态导入

除了多入口打包的方式，Code Splitting 更常见的实现方式还是结合 ES Modules 的动态导入特性，从而实现按需加载。


按需加载是开发浏览器应用中一个非常常见的需求。
一般我们常说的按需加载指的是加载数据或者加载图片，
但是我们这里所说的按需加载，指的是在应用运行过程中，
需要某个资源模块时，才去加载这个模块。
这种方式极大地降低了应用启动时需要加载的资源体积，
提高了应用的响应速度，同时也节省了带宽和流量。


Webpack 中支持使用动态导入的方式实现模块的按需加载，
而且所有动态导入的模块都会被自动提取到单独的 bundle 中，从而实现分包。

```js

// ./src/index.js
import posts from './posts/posts'
import album from './album/album'
const update = () => {
  const hash = window.location.hash || '#posts'
  const mainElement = document.querySelector('.main')
  mainElement.innerHTML = ''
  if (hash === '#posts') {
    mainElement.appendChild(posts())
  } else if (hash === '#album') {
    mainElement.appendChild(album())
  }
}
window.addEventListener('hashchange', update)
update()

```
在这种情况下，就可能产生资源浪费。
试想一下：如果用户只需要访问其中一个页面，那么加载另外一个页面对应的组件就是浪费。





如果我们采用动态导入的方式


```js


// ./src/index.js
// import posts from './posts/posts'
// import album from './album/album'
const update = () => {
  const hash = window.location.hash || '#posts'
  const mainElement = document.querySelector('.main')
  mainElement.innerHTML = ''
  if (hash === '#posts') {
    // mainElement.appendChild(posts())
    import('./posts/posts').then(({ default: posts }) => {
      mainElement.appendChild(posts())
    })
  } else if (hash === '#album') {
    // mainElement.appendChild(album())
    import('./album/album').then(({ default: album }) => {
      mainElement.appendChild(album())
    })
  }
}
window.addEventListener('hashchange', update)
update()

```


### 魔法注释


默认通过动态导入产生的 bundle 文件，它的 name 就是一个序号，这并没有什么不好，
因为大多数时候，在生产环境中我们根本不用关心资源文件的名称。


```js

// 魔法注释
import(/* webpackChunkName: 'posts' */'./posts/posts')
  .then(({ default: posts }) => {
    mainElement.appendChild(posts())
  })

```


所谓魔法注释，就是在 import 函数的形式参数位置，添加一个行内注释，
这个注释有一个特定的格式：webpackChunkName: ''，这样就可以给分包的 chunk 起名字了。