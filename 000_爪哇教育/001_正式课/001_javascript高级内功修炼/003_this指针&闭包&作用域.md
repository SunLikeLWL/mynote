# 003_this指针&闭包&作用域



# JS内功修炼


### 专业术语

常亮、变量、数据类型
形参、实参
匿名函数、具名函数、自执行函数
函数声明、函数表达式
堆、栈

### 执行上下文

当函数执行时，会创建一个称为执行上下文（execution context）的环境，
分为创建和执行两个阶段

1、创建阶段

创建阶段，指函数被调用但未执行任何代码时，此时创建一个拥有3个属性的对象：

executionContext = {
    scopeChain:{},// 创建作用域链（scope，chain）
    variableObject:{},// 初始化变量、函数、形参
    this:{}// 指定this
}

2、代码执行阶段

代码执行阶段主要工作是：
1、分配变量、函数引用，赋值
2、执行代码



# 执行上下文栈

1、浏览器中的JS解析器是单线程的，相当于浏览器中同一个时间只能做一个事情
2、代码中只有一个全局上下文，和无数个函数执行上下文，这些组成了执行上下文栈（Execution Stack）
3、一个函数的执行上下文，在函数执行完毕后，会被移出执行上下文栈



# 作用域

js中有全局作用域、函数作用域，es6中又增加了块级作用域。作用域的最大用途就是隔离变量或函数，
并控制他们的生命周期。作用域是在函数执行上下文创建时定义好，不是函数执行时定义的。



# 作用域链

当一个块或函数嵌套在另一个块或函数中时，就发生了作用域的嵌套。在当前函数中如果js引擎无法找到某个变量，
就会往上一级嵌套的作用域中去寻找，直到该变量或者抵达全局作用域，这样的链式关系就称为作用域链

# 闭包

高级程序设计三中：闭包是指有权访问另一个函数作用域中的变量的函数，
可以理解为（能够读取其他函数内部变量的函数）


1、封装私有变量

// 普通的定义类的方式
function Person(){
    this._attackVolume = 100;
}
Person.prototype = {
    attack(body){
        body.bloodValue -= this.attackValue - body.defenseVolume;
    }
}
var person = new Person();
console.log(person._attackVolume)


// 工厂方法
function Person(){
    var _attachVolume = 100;
    return {
        attack(){
            body.bloodValue -= this.attackVolume - body.defenseVolume;
        }
    }
}
var person = new Person();
console.log(person._attackVolume);


2、存储变量

function getListDataManager(){
    // 外层scope中定义一个变量
    let localData = null;
    return {
        getData{
            // 里面的函数使用外层的变量，而且是反复使用
            if(localData){
                return Promise.resolve(localData)
            }
            return fetch('xxx')
            .then(data=>localData = data.json());
        }
    }
}

// 用的时候

const listDataManager = getListDataManager();

button.onclick = ()=>{
    // 每次都会获取数据，但是有可能是获取的缓存的数据
    text.innerHTML = listDataManager.getData();
}

window.onscroll = ()=>{
    // 每次都会去获取数据，但是可能是获取的缓存的数据
    text.innerHTML = listDataManager.getData();
}

# this

1、函数直接调用时
默认模式下this指向window，严格下this指向undefined
function myFunc(){
    console.log(this);// this是window
}

var a = 1;
myfunc();


2、函数被别人调用时
this指向调用的对象

function myfunc{
    console.log(this);// this是对象a
}

var  a = {
    myfunc:myfunc
}

a.myfunc();

3、new一个实例时

function Person(name){
    this.name = name;
    console.log(this);// this是指实例p
}

var p = new Person('zhuawa');



4、apply、call、bind时

function getColor(color){
    this.color = color;
    console.log(this);
}

function Car(name,color){
    this.name = name;// this指的是实例car
    getColor.call(this,color);// 这里的this从原本的getColor，编程car
}

var car = new Car("卡车","绿色")


5、箭头函数时

// setTimeout是全局函数，内部this指向window
var a = {
    myfunc:function(){
        setTimeout(function(){
            console.log(this);// this是window
        })
    }
}

a.myfunc();

// 提前保存一下this
var a = {
    myfunc:function(){
        var that  = this;
        setTimeout(function(){
            console.log(that);// this是a
        })
    }
}

a.myfunc();

// 箭头函数



var a = {
    myfunc:function(){
        setTimeout(()=>{
            console.log(this);// this是a
        })
    }
}

a.myfunc();




### 总结

1、函数直接调用，不管函数被放在了什么地方，默认情况下this都是指向window（严格模式下this为undefined）
2、函数被调用，被哪个对象调用，this就指向哪个对象
3、在构造函数中，类中（函数体中）出现的this.xxx = xxx中this就是当前类的一个实例
4、call、apply时，this是第一个参数。bind要优先于call/apply
5、箭头函数没有实例，也就是没有自己的this，指向外层非箭头函数实例、嵌套的对象、window对象



# 实例


### this

1、
// this指向调用的obj
function show() {
    console.log('this:', this);// show
     console.log('this.name:', this.name);// obj
}
var obj = {
    name:'obj',
    show: show
};
obj.show();


2、
// obj调用丢失，this指向
function show() {
    console.log('this:', this);// window
}
var obj = {
    show: function () {
        show();
    }
};
obj.show();


3、
// 括号表达式的值是最后一个值
// obj调用丢失, this指向window
var obj = {
    name:"obj",
    show: function () {
        console.log('this:', this); // window
        console.log('this.name:', this.name); // undefined
    }
};

(0, obj.show)();  // 等价于 obj.show()



4、
// 多级调用 this还是指向直接调用它的sub
var obj = {
    sub: {
        show: function () {
            console.log('this:', this); // sub
        }
    }
};
obj.sub.show()


5、
// new 的对象，this指向new的实例对象
// 并且new优先级比调用的高
var obj = {
    show: function () {
        console.log('this:', this); // new的obj实例
    }
};
var newobj = new obj.show();



6、
// 调用bind的时候，this指向bind的第一参数
// 但是这里this指向的是show函数实例
// 且优先级new比bind的高
var obj = {
    name : 'obj',
    show: function () {
        this.name = 'show';
        console.log('this:', this); // show
        console.log('this:', this.name); // show
    }
};
var newobj = new (obj.show.bind(obj))();


 
 
7、
var obj = {
    name:"obj",
    show: function () {
        console.log('this:', this);
        console.log('this.name:', this.name);
    }
};
var elem = document.getElementById('book-search-results');
elem.addEventListener('click', obj.show);
elem.addEventListener('click', obj.show.bind(obj));
elem.addEventListener('click', function () {
    obj.show();
});

// 第一个为elem
// 第二个为obj
// 第三个为obj



### 作用域

1、
var person = 1;
function showPerson() {
    var person = 2;
    console.log(person);// 2
}
showPerson();


2、
var person = 1;
function showPerson() {
    console.log(person); // undefined
    var person = 2;
}
showPerson();


3、

var person = 1;
function showPerson() {
    console.log(person); // function person
    var person = 2;
    function person() {

    }
}
showPerson();

4、
var person = 1;
function showPerson() {
    console.log(person); // function person
    function person() {

    }
    var person = 2;
}
showPerson();


5、

for (var i = 0; i < 10; i++) {
    console.log(i);
}
// 输出0-9

for (var i = 0; i < 10; i++) {
    setTimeout(function () { console.log(i); }, 0);
}
// 输出十个10

for (var i = 0; i < 10; i++) {
    (function (i) {
        setTimeout(function () {
            console.log(i);
        }, 0)
    })(i);
}

// 输出0-9

for (let i = 0; i < 10; i++) { console.log(i); }
// 输出0-9


### 面向对象

1、

// 函数return的是{}，所以new的返回值是{}，而不是Person的实例
function Person() {
    this.name = 1;
    return {};
}
var person = new Person();
console.log('name:', person.name); // undefined


2、
function Person() {
    this.name = 1;
}
Person.prototype = {
    show: function () {
        console.log('name is:', this.name);// 1
    }
};
var person = new Person();
person.show();

3、
// 改写了原型链
function Person() {
    this.name = 1;
}
Person.prototype = {
    name: 2,
    show: function () {
        console.log('name is:', this.name);
    }
};
var person = new Person();
Person.prototype.show = function () {
    console.log('new show');
};
person.show();
// 输出是new show

5、
// 给person实例添加了show方法，所以不需要查找原型链的show方法
function Person() {
    this.name = 1;
}
Person.prototype = {
    name: 2, show: function () {
        console.log('name is:', this.name);
    }
};
var person = new Person();
var person2 = new Person();
person.show = function () {
    console.log('new show');
};
person2.show();
person.show();
// 输出是new show

6、
function Person() {
    this.name = 1;
}
Person.prototype = {
    name: 2, 
    show: function () {
        console.log('name is:', this.name);
    }
};
Person.prototype.show();// 2
(new Person()).show(); //1

// 第一个是原型链直接调用，所以this指向prototype
// 第二个是new一个Person实例，所以this指向person实例