# Javascript 设计模式系统讲解与应用


# 导学
### 论工程师的设计能力
1、3年工作经验，面试必考设计能力
2、成为项目技术负责人，设计能力是必要基础
3、从写好代码，到做好设计，设计模式是必经之路

### 前端学习设计模式的困惑
1、网上资料都是针对Java等后端语言
2、看懂概念，但是知道怎么用，看完就忘
3、现在的JS框架，到底用了哪些设计模式

### 课程概述
1、做什么？--讲解JS设计模式
2、哪些部分？--面向对象，设计原则，设计模式
3、技术？--面向对象，UML类图，ES6

### 知识点介绍
1、面向对象
   ES6 class语法
   三要素
   UML类图

2、设计原则
   为何设计？
   5大设计原则
   从设计到模式

3、设计模式
   分优先级讲解
   结合核心技术
   结合框架应用

4、综合示例
   设计方案
   代码演示
   设计模式对应


 ### 课程安排

1、面向对象
   使用webpack和babel搭建ES6编译环境
   ES6 class面向对象语法
   面向对象三要素：继承、封装、多态

2、设计原则
   通过《Linux/Unix设计哲学》理解何为设计
   5大设计原则分析与理解，以代码演示
   设计模式 ->从设计到模式

3、设计模式
   概述：创建型、结构型、行为型
   常用设计模式，详细讲解，结合经典实用场景
   非常用设计模式，理解概念吗，示例演示
   有主有次，有重点

4、综合示例
   用jQuery实现一个简单的购物车
   设计分析，画UML类图
   代码演示
   总结实用的7种设计模式


### 讲授方式
    1、先基础后实践，先设计后模式
    2、重点、常用的设计模式。配合经典实用场景
    3、综合示例，演示设计模式如何使用
    4、用JS的方式间接面向对象和设计模式

### 课程收获
    1、面向对象思想，UML类图
    2、5大设计原则，23中设计模式
    3、能应对前端中相关的面试题
    4、提升个人设计能力

### 学习前提

1、了解面向对象，能熟练使用jQuery或类似工具库
2、有ES6语法基础，用过nodejs和npm环境
3、了解vue和React



# 面向对象

### 1、搭建开发环境
 
 安装nodejs

 安装webpack webpack-cli

 初始化项目
 npm init 

 修改package.json文件script脚本执行内容
  "scripts": {
    "dev": "webpack --config webpack.dev.config.js --mode development"
  },

 配置webpack.dev.config.js

 安装 webpack-dev-server / html-webpack-plugin
 npm install -D webpack-dev-server / html-webpack-plugin
 
 安装ES6转码环境

 npm install -D babel-core babel-loader babel-polyfill babel-preset-es2015 babel-preset-latest



 ###  面向对象

 1、概念
   类
   实例


 2、三要素
 继承，子类继承父类
 封装，数据的权限和保密
 多态，同一接口不同实现

 三要素-继承
 People是父类，公共的，不仅仅服务于Student
 继承可以将公共方法抽离，提高复用，减少冗余
 三要素-封装
 Public 完全开放
 Protected 对子类开放
 private对自己开发
 ES6尚不支持，可以用typescript来演示

 减少耦合，不该暴露的不外露
 利于数据、接口的权限管理
 ES目前不支持，一般认为_开头的属性是private


 三要素-多态
 保持子类的开放性和灵活性
 面向接口编程
 （JS引用极少，了解即可）

 
 ### 为什么使用面向对象
 1、程序执行：顺序、判断、循环----结构化

 2、面向对象---- 数据结构化
  
 3、对于计算机，结构化的才是最简单的

 4、编程应该 简单&抽象


 ### UML类图



 # 设计原则

 ### 1、何为设计

 1、即按照哪种思路或者标准来实现功能
 2、功能相同，可以有不同设计方案来实现
 3、伴随着需求增加，设计的作用才能体现出来

 
 ### 《UNIX/LINUX设计哲学》

   大准则
   1、小即美
   2、让每个程序只做好一件事
   3、快速搭建原型
   4、舍弃高效率而取可移植性
   5、采用纯文本存储数据
   6、充分利用软件的杠杆效应（软件复用）
   7、使用shell脚本来提高杠杆效应和可移植性
   8、避免强制性的用户界面
   9、让每个程序都称为过滤器


  小准则
  1、允许用户定制环境
  2、尽量使操作系统内核小而轻量
  3、使用小写字母并尽量简短
  4、沉默是金
  5、各部分之和大于整体
  6、寻求90%的解决方案



### 2、五大设计原则

SOLID

1、S 单一职责原则
2、O 开放封闭原则
3、L 李氏置换原则
4、I 接口独立原则
5、D 依赖倒置原则


### S 单一职责原则

一个程序只做好一件事
如果功能过于复杂就才分开，每个部分保持独立

### O 开放封闭原则

对扩展开放，对修改封闭

需求增加需求是，扩展新代码，而非修改已有代码

这是软件设计的终极目标


### L 李氏置换原则

子类能覆盖父类

父类能出现的地方子类就能出现

JS中使用较少（弱类型&继承使用较少）


### I 接口独立原则

保持接口的单一独立，避免实现“胖接口”

JS中没有接口（typescript除外），使用较少

类似单一职责原则，这里更关注接口


### D 依赖倒置原则

1、面向接口编程，依赖于抽象而不依赖于具体

2、使用方只关注接口而不关注具体类的实现

3、JS中使用较少（没有接口&泛型）



### promise 讲解 SO

function loadImg(src){
   return new Promise(function(resolve,reject){
      let img = document.createElement('img);
      img.onload = function(){
         resolve(img)
      }
      imd.error = function(){
         reject("图片加载失败")
      }
      img.src=src;
   })
}




### 3、从设计到模式



# 设计模式分类


23种设计模式

### 创建型

1、工厂模式
2、单例模式
3、原型模式

### 结构模式

1、适配器模式
2、装饰器模式
3、代理模式
4、外观模式
5、桥接模式
6、组合模式
7、享元模式


### 行为模式
行为模式1
1、策略模式
2、模板方法模式
3、观察者模式
4、迭代器模式
5、职责模式
6、命令模式

行为模式2
1、备忘录模式
2、状态模式
3、访问者模式
4、终结者模式
5、解释器模式






# 工厂模式

### 设计原则
1、构造函数和创建函数分离
2、符合开放封闭原则

### 1、jQuery

class jQuery{
   constructor(selector){
       let slice = Array.prototype.slice;
       let dom = slice.call(document.querySelectorAll(selector))
       let len = dom?dom.length:0;
       for(let i=0;i<len;i++){
          this[i] = dom[i];
       }
       this.length = len;
       this.selector = selector || '';
   }
   append(node){

   }
   addClass(name){

   }
   html(data){

   }
}

window.$ = function(selector){
   return new jQuery(selector)
}




### 2、React.createElement


class Vnode(tag,attrs,children){

}

React.createElement = function(tag,attrs,children){
   return new Vnode(tag,attrs,children);
}


### 3、vue异步组件

 


# 单例模式

### 介绍
 1、系统中被唯一使用
 2、一个类只有一个实例



### jQuery

// jQuery只有一个$
if(window.jQuery!=null){
   return window.jQuery;
}
else{
   // 初始化
}


### 购物车 登录框



### Vuex和Redux的store




### 设计原则验证

1、符合单一职责原则，只实例化唯一的对象

2、没法具体开放闭合原则，但是绝对不违反开放封闭原则






# 适配器模式

### 介绍
1、旧接口格式和使用不兼容

2、中间加一个适配器转换接口



### 设计原则验证

1、将旧接口和使用者进行分离


2、符合开闭原则




# 装饰器模式

1、为对象添加新功能

2、不改变其原有的结构和功能





### ES7  decorator

npm install -D babel-plugin-transform-decorators-legacy


配置.babelrc文件
{
    "presets": [
        [
            "latest",
            {
                "es2015": false
            }
        ]
    ],
    "plugins": [
        "transform-decorators-legacy"
    ]
}


### 装饰类

@testDec
class Demo{

}

function  testDemo(target){
   target.isDec = true;
}

alert(Demo.isDec)



### 装饰类 mixin示例

function mixins(...list) {
    return function (target) {
        Object.assign(target.prototype, ...list);
    }
}

const Foo = {
    foo() {
        alert("foo");
    }
}

@mixins(Foo)
class MyClass {

}

let obj = new MyClass();

obj.foo();// foo


### 装饰方法 1

function readonly(target, name, descriptor) {
    // descriptor 属性描述（Object.defineProperty中会用到），
    // {
    //     value:  specifiedFunction,
    //     enumerable:false,
    //     configurable:true,
    //     writable: true
    // }
    descriptor.writable = false;
    return descriptor;
}



class Person {
    constructor() {
        this.first = 'A';
        this.last = "B";
    }

    @readonly
    name() {
        return `${this.first} ${this.last}`
    }
}


let p = new Person();

console.log(p.name());// AB

p.name = function () { }; // 这里会报错，因为name设计只读属性


### 装饰方法 2

class Math {
    @log
    add(a, b) {
        return a + b;
    }
}

const math = new Math();

const result = math.add(2, 4);
// 执行add时，会自动打印日志，因为有@log装饰器
console.log("result", result);




### core-decorators

第三方开源lib

提供常用的装饰器




### 设计原则验证


1、将现有对象和装饰器进行分离，两者独立存在

2、符合开放封闭原则



# 代理模式


### 场景

1、网页事件代理

var div = document.getElementById("div");

div.addEventListener("click",function(e){
   var target = e.target;
   if(target.nodeName==='A'){
      alert(target.innerHTML)
   }
})



2、jQuery $.proxy

// 变量赋值
$("#div).click(function(){
   var _this = this;
   setTimeout(()=>{
      _this.addClass("red)
   },1000)
})


// $.proxy
$("#div).click($.proxy(function(){
   setTimeout(()=>{
      this.addClass("red)
   },1000)
},this))



3、ES6 Proxy


new Proxy(target,{
   get:function(target,key){

   }
   set:function(target,key,val){

   }
})


### 设计原则验证

1、代理和目标类分离，隔离开目标类和使用者

2、符合开放封闭原则



### 外观模式

1、为子系统中的一组接口提供了一个高层接口

2、使用者使用这个高层接口


function bindEvent(elem,type,selector,fn){
   if(fn===null){
      fn = selector;
      selector = null;
   }
}

bindEvent(elem,'click','#div',fn);
bindEvent(elem,'click',fn);

### 设计原则

1、不符合单一职责原则和开放封闭原则，因此谨慎使用，不可滥用




# 观察者模式

### 介绍

1、发布订阅

2、一对多



### 1、网页事件绑定

var div  = window.getElementById("div");
div.addEventListener("click",function(){
   console.log("click")
})



### 2、Promise


let promise = new Promise(()=>{
   resolve()
})


promise.then((res)=>{
    
})


### 3、jQuery callbacks

let callbacks = $.Callbacks();

callbacks.add(info=>{
   console.log(info)
})

callbacks.fire("执行")



### 4、nodejs自定义事件

const EventEmitter = require("events").EventEmitter;

const emitter1 = new EventEmitter();

emitter1.on("some",(info)=>{
   console.log(info)
})


emitter1.emit("some")


### 5、nodejs自定义事件

var fs = require("fs");

var readStream = fs.createReadStream("./data/file.txt")


var length = 0;

readStream.on("data", function (chunk) {
    length += chunk.toString().length
})

readStream.on("end", function () {
    console.log(length)
})



### 其他场景

1、nodejs中：处理http请求；多进程通信

2、vue和react组件生命周期

3、vue watch



# 迭代器模式

### 介绍
1、顺序访问一个集合

2、使用者无需知道集合的内部结构（封装）



### 示例 jQuery $()

1、数组遍历

var arr = [4,32,432,43];

arr.forEach((item)=>{

})

2、JS DOM 遍历

var nodeList =  document.getElementByTagNames("p");

nodeList.map(item=>{

})

// jQuery 对象遍历

var $p = $("p");

$p.each((key,p)=>{

})


### 自己封装

class Iterator {
    constructor(container) {
        this.container = container;
        this.index = 0;
        console.log(container)
    }
    next() {
        if (this.hasNext()) {
            return this.container.list[this.index++]
        }
        return null;
    }
    hasNext() {
        if (this.index >= this.container.list.length) {
            return false
        }
        return true;
    }
}



class Container {
    constructor(list) {
        this.list = list;
    }
    //生成遍历器
    getIterator() {
        return new Iterator(this)
    }
}


let arr = [432, 432, 42, 34];

let container = new Container(arr);


let iterator = container.getIterator();

while (iterator.hasNext()) {
    console.log(iterator.next())
}


### jQuery each

function each(data){
   var $data = $(data);
   $data.each((key,p)=>{
      console.log(key,p)
   })
}


### ES6 Iterator

1、ES6语法中，有序集合的数据类型已经有很多

2、Array Map String TypeArray arguments NodeList

3、需要一个统一的接口来遍历多有数据类型

4、（Object不是有序集合，可以用Map代替）


5、以上数据类型都有[Symbol.iterator]属性

6、属性值是函数，执行函数返回一个迭代器

7、这个迭代器有的方法就可以顺序迭代子元素

8、可运行Array.prototype[Symbol.iterator]来测试




### for of 
带有Iterator遍历器的可以用



### ES6 与Generator

1、Iterator的价值不限于上述几个类型的遍历

2、还有Generator函数的使用

3、即只要返回的数据符合Iterator接口的要求

4、即可以使用Iterator语法，这就是迭代器模式



# 状态模式

### 介绍

1、一个对象有状态变化

2、每次状态变化都会触发一个逻辑

3、不能总是if else 来控制



### 写一个简单的Promise



# 其他设计模式


### 创建型设计模式

原型模式


### 结构型设计模式

桥接模式
组合模式
享元模式


### 行为型设计模式

策略模式

模板方法模式

职责模式

命令模式

备忘录模式

中介者模式

访问者模式

解析器模式



### 原型模式

基于原型，创建一个新的对象


1、clone自己，生成一个新对象

2、java默认有clone接口，不用自己实现




### Object.create

基于原型对象创建一个新的对象



### 对比JS中的原型prototype

1、prototype可以理解为ES6 class的一种底层原理

2、而class是实现面向对象的基础，并不是服务于某个模块

3、若干年后ES普及，大家可能会忽略掉prototype

4、但是Object.create却会长久保留




### 桥接模式

1、用于把抽象化与实现解耦

2、使得二者可以独立变化



### 组合模式

1、生成树形结构，表示‘整体-部分’关系


2、让整体和部分具有一致的操作方式



### 享元模式

1、共享内存（主要考虑内存，而非效率）

2、相同的数据，共享使用

3、JS中未找到经典应用场景

### 演示

无线下拉列表，将事件代理到高层级节点上

如果都绑定到‘<a>’标签，对内存开销太大

<div id='div'>
 <a>
  <!--无线下拉列表  -->
</div>


<script>
   var div1 = document.getElementById("div")
    div.addEventListener("click",function(e){
      var target = e.target;
      if(e.nodeName === 'A'){
         console.log(target.innerHTML)
      }
    })
</script>


### 设计原则验证

1、将相同的部分抽象出来

2、符合开放封闭原则




### 策略模式

1、不同策略分开处理

2、避免出现大量的if else或者 switch case

3、JS中未找到经典例子



### 模板方法模式



### 职责链模式

1、一个操作可能分为多个职责角色来完成

2、把这些角色都分开，然后用一个链串起来

3、将发起者和各个处理着进行隔离





###  命令模式

1、执行命令时，发布者和执行者分开

2、中间加入命令对象，作为中转站


// 接收者
class Receiver {
    exec() {
        console.log("执行")
    }
}
// 命令者
class Command {
    constructor(receiver) {
        this.receiver = receiver;
    }
    cmd() {
        console.log("执行命令");
        this.receiver.exec();
    }
}

// 触发者
class Invoker {
    constructor(command) {
        this.command = command;
    }
    invoke() {
        console.log("开始");
        this.command.cmd()
    }
}

// 执行者
let receiver = new Receiver();
// 中间命令者
let command = new Command(receiver);
//  发布命令者
let invoker = new Invoker(command);

invoker.invoke()


### 富文本编辑器

各个按钮实现的功能都是通过命令模式来执行



### 备忘录模式

1、随时记录一个对象的状态变化

2、随时可以恢复之前的某个状态（如撤销功能）

3、未找到JS中经典应用，除了一些工具，如编辑器




### 中介中模式

1、将各个关联对象通过中介者隔离

2、符合开放闭合原则



### 访问者模式

1、将数据操作和数据结构进行分离

2、使用场景不多



### 解释器模式

1、描述语言语法如何定义，如何解释和编译

2、用于专业场景




# 综合应用

