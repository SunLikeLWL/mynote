# 为什么说函数是 JavaScript 的一等公民？


### 数据类型

储存数据



### 函数

存储代码




### this

1、首先this指向的应该是一个对象，
更具体地说是函数“执行上下文”

2、其次是对象指向的是“调用它”的对象，
如果调用它的不是对象或对象不存在，
则会指向全局对象（严格模式下为undefined）


需要传入this执行的函数有:
every
find
findIndex
map
some




### 箭头函数

1、不能绑定arguments对象，也就是说在箭头函数内访问argumemts对象会报错；
2、不能用作构造器，也就是说不能通过关键字new来创建实例
3、默认不会创建prototype原型属性
4、不能作为Generator函数，不能使用yield关键字



### 函数转换




### 原型

原型就是对象的属性

包括称为隐式原型的__proto__属性和被称为显示原型的prototype属性



### 作用域

指赋值、取值的执行范围；
通过作用于机制可以有效地防止变量、函数的重复定义，
以及控制他们的可访问性