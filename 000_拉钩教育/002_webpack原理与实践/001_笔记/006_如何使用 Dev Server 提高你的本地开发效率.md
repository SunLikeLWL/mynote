# 如何使用 Dev Server 提高你的本地开发效率



编写源代码 → Webpack 打包 → 运行应用 → 浏览器查看



1、首先，它必须能够使用 HTTP 服务运行而不是文件形式预览。这样的话，一来更接近生产环境状态，二来我们的项目可能需要使用 AJAX 之类的 API，以文件形式访问会产生诸多问题。

2、其次，在我们修改完代码过后，Webpack 能够自动完成构建，然后浏览器可以即时显示最新的运行结果，这样就大大减少了开发过程中额外的重复操作，同时也会让我们更加专注，效率自然得到提升。

3、最后，它还需要能提供 Source Map 支持。这样一来，运行过程中出现的错误就可以快速定位到源代码中的位置，而不是打包后结果中的位置，更便于我们快速定位错误、调试应用。



### Webpack自动编译




### BrowserSync 

BrowserSync 就可以帮我们实现文件变化过后浏览器自动刷新的功能。


```js
 npm install browser-sync --global

 browser-sync dist --watch

 npx browser-sync dist --watch

```





### Webpack Dev Server




### 配置


```js

// ./webpack.config.js
const path = require('path')

module.exports = {
  // ...
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
    // ...
    // 详细配置文档：https://webpack.js.org/configuration/dev-server/
  }
}



```




### Proxy

```js

// ./webpack.config.js
module.exports = {
  // ...
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.github.com',
           pathRewrite: {
             '^/api': '' // 替换掉代理地址中的 /api
        },
        changeOrigin: true // 确保请求 GitHub 的主机名就是：api.github.com
      }
    }
  }
}


```




 