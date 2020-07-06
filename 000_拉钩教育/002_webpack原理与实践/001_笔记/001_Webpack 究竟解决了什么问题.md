# Webpack 究竟解决了什么问题


### 模块化的演进过程

#### 1、stage 1- 文件划分方式

基于文件划分的方式实现模块化，也是web最原始的模块化系统


缺点：

1、模块直接在全局工作，大量模块成员污染全局作用域

2、没有私有空间，所有模块内地成员都可以在模块外部访问或者修改

3、一旦模块增多，容易产生命名冲突

4、无法管理模块与模块之间的依赖关系

5、在维护的过程中很难分辨每个成员所属的模块


#### 2、Stage-2  命名空间方式

约定每个模块只暴露一个全局对象，所有模块成员都挂载到这个全局对象中


缺点：
命名空间的方式只是解决了命名冲突的问题，但是他的问题还是存在

#### 3、Stage-3 IIFE

使用立即函数表达式（IIFE Immediately Invoked Function Expression）为模块提供私有空间。
具体做法是将每个模块成员都放在一个立即执行函数所形成的私有作用域中，对于需要暴露给外部的成员，
通过挂载到全局对象上的方式实现

```js 
// module-a.js
;(function () {
  var name = 'module-a'

  function method1 () {
    console.log(name + '#method1')
  }

  window.moduleA = {
    method1: method1
  }
})()


// module-b.js
;(function () {
  var name = 'module-b'

  function method1 () {
    console.log(name + '#method1')
  }

  window.moduleB = {
    method1: method1
  }
})()


```

这种方式带来了私有成员的概念，私有成员只能在模块成员的内通过闭包的形式访问，
这就解决了全局作用域污染和命名冲突的问题


#### 4、Stage-4 IIFE 依赖参数

```js

// module-a.js
;(function ($) { // 通过参数明显表明这个模块的依赖
  var name = 'module-a'

  function method1 () {
    console.log(name + '#method1')
    $('body').animate({ margin: '200px' })
  }

  window.moduleA = {
    method1: method1
  }
})(jQuery)


```




### 模块加载问题


通过 script 标签的方式直接在页面中引入的这些模块，
这意味着模块的加载并不受代码的控制，时间久了维护起来会十分麻烦



### 模块化规范的出现


Commonjs公共定义规范 ->   Nodejs

AMD异步模块定义规范 -> 浏览器


CMD 



### 模块化标准规范



1、在 Node.js 环境中，我们遵循 CommonJS 规范来组织模块。
2、在浏览器环境中，我们遵循 ES Modules 规范。



### ES Modules

