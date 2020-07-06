# react 基础

https://live.vhall.com/room/watch/763247167


### 生命周期

1、首次渲染：
componentWilMount

render

componentDidMount


2、state更新：
componentWillUpdate

render

componentDidUpdated


3、props更新：
componentWillReceiveProps

componentWillUpdate

render

componentDidUpdated



### Event

react代理了事件，对事件做了优化，为了实现跨端，react内部共享了事件，


好处：
1、实现跨端，有些平台不一定有事件机制，需要模拟实现，提高兼容性

2、做优化



### this

this绑定到子组件的时候，尽量不要在传递给子组件的时候使用bind，因为函数会创建一个新的函数，
传给子组件的函数引用会发生改变，导致子组件重新渲染，从而造成性能问题，可以在constructor中使用
bind或者使用箭头函数声明函数。





### immutable.js



### 性能优化方式




### immer.js

