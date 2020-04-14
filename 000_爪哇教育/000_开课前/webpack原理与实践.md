# 爪哇-webpack原理与实践----视频教程


JS中的模块化，在ES6之前只有CommonJS、AMD等主流模块化规范


## CommonJS

Node.js就是一个基于V8引擎，事件驱动，异步IO

moduleA:
module.exports = 'Hello World!';

moduleB:
const str = require('./moduleB');
console.log(str);// Hello World!


所有代码都运行在模块作用域，不会污染全局作用域。
每个模块都是单例的，多次引用只会打包一次。
模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，
以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。




## AMD： 异步模块定义

Asynchronous module definition

moduleA:
define(function(){
  return "hello World!'
})

moduleB:
define(function(require){
    const str = require("./moduleB.js");
    console.log(str);// Hello World!
})



特点：

1、异步加载的
2、define定义模块，require加模块，



## CMD







## ESmodule

ES模块也是单例的

CommonJS和AMD的特点：

1、语言上层的环境中实现模块化规范，模块化范围由环境定义
2、相互之间不能共用模块。例如不能再Nodejs运行AMD模块，不能直接在
流量器运行Commonjs模块


ES Module 是在语言层次上实现的，而Commonjs、AMD是运行环境规范。


moduleA:
export default function(){
    return "Hello World!";
}


moduleB:
const str  = require("./moduleA");
console.log(str);//Hello World;

依赖打包工具进行打包

babel-loader

@babel/preset-env

@babel/core


const path = require("path")
module.exports = {
    mode:"none",
    entry:"./index",
    output:{
      file:'[name].js',
      path:path.resolve(__dirname,'dist')
    }
}


全局对象：
Nodejs：  global process

浏览器：document window

小程序: wx swan


JS Core



问题：
必须通过编译来实现可识别代码

ES Module 的export和require最后都是编译为CommonJS的语法



打包目的：消除不同规范差异



# 模块化打包




index.bundle.js

(function(){
   var moduleList = [
    function(require,module,export){
        // ModuleA
        module.exports = 'ModuleA';
    },
    function(require,module,export){
       // ModuleB
       var moduleA = require("./moduleA")
       module.exports = 'ModuleB';
    }
   ]
   
   var moduleDepIdList = [
       {}, {'./moduleA':1}
   ]


   function require(id,parentId){
       var currentModuleId = parentId!==undefined?moduleList[parentId][id]:id;
       var module = {export:{}};
       var moduleFunc = moduleList[currentModuleId];
       moduleFunc((id)=>{
        require(id,currentModuleId)
       },module,module.exports)
       return module.exports;
   }

   var module = {export:{}};
   moduleList[0](null,module);

require(0);//找第一个Id
})()





index.bundle.boilerplate.js




bundle.js

const path = require("path")
const fs = require("fs")
const boiler = fs.readFileSync(path.resolve(__dirname,'index.bundle.boilerplate.js'),'utf-8');
const target = fs.readFileSync(path.resolve(__dirname,'index.js'),'utf-8');
const content = boiler.replace("/* template*/,target);
fs.writeFileSync(path.resolve(__dirname,'dist/index.bundle.js'),content,'utf-8');



<h1 style='font-size:40px;position:fixed;bottom:100px;right:100px;color:white; z-index:9999999'>全屏就好了</h1>