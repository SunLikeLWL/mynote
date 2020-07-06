# 加餐2：手写 Promise、async/await



### Promise/A+ 规范


Promise 是一个对象或者函数，对外提供了一个 then 函数，内部拥有 3 个状态。



### then 函数

then 函数接收两个函数作为可选参数：
promise.then(onFulfilled, onRejected)


同时遵循下面几个规则：

1、如果可选参数不为函数时应该被忽略；

2、两个函数都应该是异步执行的，即放入事件队列等待下一轮 tick，而非立即执行；

3、当调用 onFulfilled 函数时，会将当前 Promise 的值作为参数传入；

4、当调用 onRejected 函数时，会将当前 Promise 的失败原因作为参数传入；

5、then 函数的返回值为 Promise。



### Promise 状态


1、pending：“等待”状态，可以转移到 fulfilled 或者 rejected 状态

2、fulfilled：“执行”（或“履行”）状态，是 Promise 的最终态，表示执行成功，该状态下不可再改变。

3、rejected：“拒绝”状态，是 Promise 的最终态，表示执行失败，该状态不可再改变。


### Promise 实现





### async/await


async 是 ES2017 标准推出的用于处理异步操作的关键字，从本质上来说，它就是 Generator 函数的语法糖。


### 什么是 Generator 函数？


Generator 函数是 ES6 提出的除 Promise 之外的另一种异步解决方案，不同于常见的异步回调，它的用法有些“奇怪”。
这里我们只简单介绍一下它的主要用法。


当调用 Generator 函数后，函数并不会立即执行，而是返回一个迭代器对象。


1、函数体内部使用 yield 表达式，定义不同的内部状态。

2、当函数体外部调用迭代器的 next() 函数时，函数会执行到下一个 yield 表达式的位置，并返回一个对象，该对象包含属性 value 和 done，value 是调用 next() 函数时传入的参数，done 为布尔值表示是否执行完成。


### async/await 原理

虽然说 Generator 函数号称是解决异步回调问题，但却带来了一些麻烦，比如函数外部无法捕获异常，
比如多个 yield 会导致调试困难。所以相较之下 Promise 是更优秀的异步解决方案。


async/await 做的事情就是将 Generator 函数转换成 Promise。


```js


function generator2promise(generatorFn) {
  return function () {
    var gen = generatorFn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }
      return step("next");
    });
  };
}

```


它将 Generator 函数包装成了一个新的匿名函数，调用这个匿名函数时返回一个 Promise。
在这个 Promise 内部会创建一个 step() 函数，该函数负责递归调用 Generator 函数对应的迭代器，
当迭代器执行完成时执行当前的 Promise，失败时则拒绝 Promise。