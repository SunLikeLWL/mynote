# ES6规范详解&ESNext规范及编译工具简介

http://caibaojian.com/es6/


2020年5月11日12:22:28

# babel

### babel是什么

1、babel是一个工具链，主要用于将ECMAScript 2015+版本转换为向后兼容的
javascript语法，以便能够运行在当前和旧版本的浏览器或其他浏览器中

2、插件化，使用现有的或自己编写的插件可以组成一个转换管道

### babel包含哪些功能

babel/preset
babel/plugin
bebel/parser
babel/traverse
babel/generator
babel-polyfill(被runtime取代)

### 运行方式和插件

1、babel总共分为三个阶段：解析、转换、生成

2、babel本身不具有任何转换功能，他把转换的功能都分解到一个个plugin里面。
因此我们不配置任何插件时，经过babel的代码和输入是相同的

3、插件的顺序从前往后排列



### preset

1、官方内容，目前包括env，react，flow，minify等

2、stage-x，这里面包含的都是当年最新规范的草案，每年更新

3、从babel7开始强推env，stage-x即将废除，只维护一个



### 插件和预设的区别

1、如果没有预设，babel转化是需要指定用什么插件的，粒度小，效率高，
但是插件需要逐个安装

2、在部分小型库设计时可以单独引入需要的插件，例如只用个promise

3、插件在presets前运行



### 1、parse

1、将源码转换成更加抽象的表示方法（例如抽象语法树）

2、依赖acorn/acorn-jsx，用于将源码（如ES2015代码）编译成AST（抽象语法树）


### 2、traverse

通过AST节点遍历，方便使用方对AST节点进行逻辑重组

### 3、generator

用于将AST换换为最终代码，根据不同的参数option，实现代码功能（比如sourceMap的实现）


### 为什么要用ES6+

1、应对面试

2、更轻量的语法糖大大降低代码量

3、新的浏览器解析器会对新的语法有优化

4、学习新的游戏规则，拥抱变化



# ES6 详细解析



### let/const

### 解构赋值

### 字符串扩展

### 数值的扩展

### 函数的扩展

### 数组扩展

### 对象扩展

super关键字

扩展运算符

Object.is()

Object.assign()



### Proxy


var obj = new Proxy({}, {
    get: function (target, propKey, receiver) {
        return Reflect.get(target, propKey, receiver)
    },
    set: function (target, propKey, value, receiver) {
        return Reflect.set(target, propKey, value, receiver)
    }

})


### promise



### async/await


### class

