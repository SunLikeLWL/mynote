# 尚硅谷_axios从入门到源码分析



# 第一章 HTTP


### MutationObserver



请求：
1、请求行
get
post


2、请求头
Host
Cookie
Content-type:"application/json"

3、请求体
查询语句：
username=Tom&password=Tom
JSON：
{"username":"Tom","password":"Tom"}


响应：
1、状态状态行
status
statusText


2、响应头
Content-Type:"text/html"
Set-Cookie:""

响应体




### API分类

1、REST API   restful


1、发送请求进行CRUD哪个操作由请求方式来决定

2、同一个请求路径可以进行多个操作

3、请求方式会用到get/post/put/delete


2、非REST API  restless

1、请求方式不决定请求的CRUD操作

2、一个请求路径只有一个对应的操作

3、一般只有get/post



### json-server包






### axios




# 第二章 XHR

### XMLHttpRequest

使用XMLHttpRequest(XHR)对象可以与服务器交互，
可以从URL获取数据，无需刷新页面




### axios特点

1、基于promise的异步ajax请求库

2、浏览器端/node端都可以用

3、支持请求/响应拦截器

4、支持请求取消

5、求情/响应数据转换

6、批量发送多个请求

