# 011_vue.js前端路由及异步组件



vue -> hash history
react ->hash history


### 前端路由 router 原理及表现

### 背景

路由全部都是有服务端控制的，前端代码和服务端代码过度融合在一起

顾客端/前端发起http请求 -> 服务端 -> url 路径去匹配不同的路径/返回不同的数据

优点：因为直接返回一个html，渲染了页面结构。seo效果非常好，首屏时间非常快

在浏览器输入url 开始  <-> 页面任意元素加载出来/渲染出来 => 首屏时间

缺点：前端代码和服务端代码过度融合在一起，开发协同非常乱，因为把渲染html的工作放在的服务端



### Ajax

 异步请求，浏览器异步请求获取所有数据


 ### 单页应用

 页 -> html文件

 单页 -> 单个html文件。

 1、页面中的交互不是刷新的页面的，比如点击按钮，比如点击出现一个弹框

 2、多个页面间的交互，不需要刷新页面



 ### hash 特性
 

1、url中带有一个#符号，但是#只是浏览器端/顾客端的状态，不会传递给服务端


2、hash的更改不会导致页面刷新

3、hash值个更改，会在浏览器的访问历史中添加一条记录。所以我们才可以通过浏览器的返回、前进按钮来控制hash的切换


4、hash值的更改，会触发hashchange事件


### 如何更改hash

1、location.hash


2、html标签的方式

<a href='#user'>




### history

hash有￥，不美观，服务端无法接收到hash路径和参数

html5 history


```js

window.history.forward()
window.history.back()
window.history.go()
window.history.pushState()
window.history.replaceState()

```


### pushState/replaceState


1、state是一个对象，是一个指定网址相关的对象，当popstate事件触发的时候，该对象传入回调函数
2、title，新页面的标题，浏览器支持不一，null
3、url 页面的新地址

pushState 页面浏览记录里添加一个历史记录

replaceState 替换当前页面


### history 特点

1、没有#

2、pushState/replaceState并不会触发popState事件，这时我们需要手动触发页面的重新渲染

3、我们可以使用popstate来监听url变化

4、popstate到底什么时候才能触发

4.1点击浏览器后退按钮
4.2点击浏览器前进按钮
4.3js调用back方法
4.4js调用forward方法
4.5js调用go方法



# VueRouter

vue-cli 新建一个vue项目 ts

### 导航守卫执行顺序

1、【组件】前一个组件的beforeRouteLeave

2、【全局】的router.beforeEach
    （3）【组件】如果是路由参数变化，触发beforeRouteUpdate
3、【配置文件】里，下一个的beforeEnter

4、【组件】内部声明的beforeRouteEnter

5、【全局】的router.afterEach




### 面试题

vue-router 里面，怎么记住前一个页面的滚动条位置

滚动到了{top:100}

list ->detail ->list

1、记住滚动位置：手动点击浏览器返回或者前进按钮，基于history，go，back，forward
2、没记住滚动位置：router-link


```js

const router = new VueRouter({
    mode:"history",
    base:precess.env.BASE_URL,
    routes,
    scrollBehavior:(to,from,savedPosition)=>{
        console.log(savedPosition)
        return savePosition
    }
})

```