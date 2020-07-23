# node.js 初探


### nodejs


### npm

nodejs包管理工具

### nvm

nodejs版本管理工具


### npx



### nodejs底层依赖

1、V8引擎
主要是JS语法的解析，有了他才能识别JS语法


2、libuv
C语言实现的一个高性能异步非阻塞IO库，用来实现nodejs事件循环



3、http-parser/llhttp
底层处理http请求，处理报文，解析请求包等内容


4、openssl

处理加密算法，各种框架运用广泛

5、zlib

处理压缩等内容





### 内置模块


1、fs
文件系统，能够读取写入当前安装系统环境中硬盘的数据

2、path
路径系统，能够处理路径之间的问题

3、crypto
加密相关模块，能够以标准的加密方式对我们的内容进行加解密

4、dns
处理dns相关内容，例如我们可以设置dns服务器等等


5、http

设置一个http服务器，发送http请求，监听响应等等


6、readline

读取stdin的一行内容，可以读取、增添、删除我们命令中的内容

7、os

操作系统层面的一些api，例如告诉你当前系统类型及一些参数


8、vm
一个专门处理沙箱的虚拟模块，底层主要来调用v8相关的api进行代码解析




### path

path.resolve()
拼接路径（绝对路径）

path.join()
拼接路径（相对路径）



### __dirname
当前文件路径



### __filename
当前文件名





### fs


```js

function promisify(func){
    return function(...args){
        return new Promise((resolve,reject)=>{
            args.push(function(err,result)=>{
                if(err) return reject(err);
                return resolve(result)
            });
            return func.apply(func,args);
        })
    }
}




```


### Commonjs


