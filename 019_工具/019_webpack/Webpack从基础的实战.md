


 # Webpack从基础的实战


# 前言

## 课程安排

 第一章 课程介绍

 第二章 初始Webpack

 第三章 Webpack核心概念

 第四章 Webpack 进阶

 第五章 Webpack 实战配置案例
 
 第六章 Webpack 底层原理脚手架工具分析


##  关键字
Loader

HMR

Create React App

Caching

Plugin

SourceMap

Vue Cli 3.0

Shimming

WebpackDevServer

TreeShaking

CodeSplitting

Babel

React

Library

Eslint

PWA

Vue

Mode

性能优化

多页应用

原理

PreLoading

PreFetching

环境变量

Typescript




##  课程收货

1、彻底学会Webpack的配置

2、理解Webpack的作用及原理

3、上手项目的打包过程配置

4、拥有工程化的前端思维

5、不如高级前端工程师的行列





# webpack 初探

## 1、全局安装webpack

安装
npm install webpack webpack-cli -g
卸载
npm uninstall webpack webpack-cli -g


## 2、项目内安装webpack

安装
npm install webpack webpack-cli -D
npm install webpack webpack-cli --save-dev

卸载
npm uninstall webpack webpack-cli -D
npm uninstall webpack webpack-cli --save-dev

全局获取版本
webpack -v

项目内获取版本
npx webpack -v


获取webpack包的信息
npm info webpack


## 1、loader
loader是一种打包规则，他告诉了Webpack在遇到非.js文件时，应该如何处理这些文件

运行规则：
1、使用test正则来匹配相应的文件
2、使用use来添加文件对应的loader
3、对于多个loader而言，从右到左一次调用


## 2、使用loader打包图片

打包图片需要用到file-loader或者url-loader，需要npm install 进行安装




## 3、打包CSS

### 1、使用loader打包css

样式分为几种情况，每种情况都需要不同的loader来处理：

1、普通.css文件，使用style-loader和css-loader来处理

2、.less文件，使用less-loader来处理

3、.sass或者.scss文件需要用sass-loader来处理

4、.styl文件，需要stylus-loader来处理

### 2、安装依赖包

#### 1、css打包

npm install style-loader css-loader -D


#### 2、less打包

npm install less-loader -D



### 3、Sass打包

 npm install sass-loader node-sass -D



### 4、自动添加css厂商前缀

 npm install postcss-loader autoprefixer -D


 ### 5、模块化打包css文件
 css的模块化打包的理解是：除非我们主动引用你的样式，否则你打包的样式不能影响到我
 设置modules:true




# Webpack 核心概念

## 插件
 打包index.html文件插件，安装后引入调用即可
 html-webpack-plugin

 清除dist文件目录

 clean webpack-plugin


## 打包多个js

  entry: {
        main: './src/js/index.js',
        sub: './src/js/index.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },


## sourceMap
  
开发的时候调试的时候，js引进是的打包好的js，js报错的时候
查看报错很不友好


## webpackdevserver
启用一个本地服务器来运行项目代码

npm install -D webpack-dev-server

devServer: {
    contentBase: "./dist",
    open: false,// 是否打开新的页面
    // proxy:{
    //    path:""// 跨域服务器代理
    // },
    hot: true,
    hotOnly: true,
},



## Hot Module Replacement 
模块热加载，修改项目代码并保存，网页并不会刷新，而是局部更新页面

const webpack = require("webpack")

new webpack.HotModuleReplacementPlugin()

安装、引入、使用插件




## babel  处理ES6语法


方法1：
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "chrome": "67"
                },
                "useBuiltIns": "usage"
            }
        ],
        "@babel/preset-react"
    ]
}


方法2：

首先要在使用的js文件引入
import "@babel/polyfill"

{
    test: /\.js$/,
    exclude: "/node_modules/",// 排除依赖包的js文件
    loader: "babel-loader",//只是连接webpack和babel的桥梁，并没有解析ES6语法
    options: {
        presets: [["@babel/preset-env", {
            useBuiltIns: 'usage',
        }
        ]] // 全局引入，可能会污染全局代码
        "plugins":[["@babel/plugin-transform-runtime",{
            "corejs":2,
            "helper":true,
            "regeneratar": true,
            "userESModulers":false
        }]]
    }
},


## Babel对React的框架代码的打包


安装好React、ReactDOM、@babel/preset-react等包

配置独立文件.babelrc

{
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "chrome": "67"
                },
                "useBuiltIns": "usage"
            }
        ],
        "@babel/preset-react"
    ]
}






# Webpack 高级概念

  ## tree shaking
  通常用于描述移除Javascript上下文的未引用代码（dead-code）。
  他依赖ES6模块语法的静态结构特性，例如import和export

  
  1、配置全部处理
 "sideEffects":false,// 正常对所有文件进行处理
  

  2、配置部分不处理
  选择不用使用tree shaking的文件
  "sideEffects":[
      "*css"
  ]

    optimization:{
        usedExports: true,
        // 使用的模块才打包，tree shaking 只适合ES模块打包
        //（import/export：底层实现原理是静态导出和引入）
        // require ：不是静态引入
    },



## development和Production模式的区分打包



   
## WebpackDevServer

请求转发

配置

devServer{
    // devServer 的proxy，不影响上线的配置
    proxy:{
        'react/api':{
            target:'http://www.dell-lee.com',//实际地址
            secure:false,//
            pathRewrite:'demo.json',// 临时使用的数据地址，不需要的时候注释就好
            changeOrigin:true,// 域限制
            header:{
                host:"",
                cookie:""
            }
        }
    }
}
