# 你真的熟悉 HTML 标签吗？


# meta标签

### meta 标签：自动刷新/跳转

5s后自动跳转
<meta http-equiv="Refresh" content="5; URL=page2.html">

60秒一刷新
<meta http-equiv="Refresh" content="60">



### title 标签与 Hack 手段：消息提醒

 B/S 架构

 优点：版本更新方便、跨平台、跨终端
 缺点：处理某些场景，比如即时通信场景时，就会变得比较麻烦


因为前后端通信深度依赖 HTTP 协议，而 HTTP 协议采用“请求-响应”模式，这就决定了服务端也只能被动地发送数据。一种低效的解决方案是客户端通过轮询机制获取最新消息（HTML5 下可使用 WebSocket 协议）。

```js

let msgNum = 1 // 消息条数
let cnt = 0 // 计数器
const inerval = setInterval(() => {
  cnt = (cnt + 1) % 2
  if(msgNum===0) {
    // 通过DOM修改title
    document.title += `聊天页面`
    clearInterval(interval)
    return
  }
  const prefix = cnt % 2 ? `新消息(${msgNum})` : ''
  document.title = `${prefix}聊天页面`
}, 1000)

```



# 性能优化

性能问题无外乎两方面原因：渲染速度慢、请求时间长

### 1、script 标签：调整加载顺序提升渲染速度

1、async 属性。立即请求文件，但不阻塞渲染引擎，而是文件加载完毕后阻塞渲染引擎并立即执行文件内容。
2、defer 属性。立即请求文件，但不阻塞渲染引擎，等到解析完 HTML 之后再执行文件内容。
3、HTML5 标准 type 属性，对应值为“module”。让浏览器按照 ECMA Script 6 标准将文件当作模块进行解析，默认阻塞效果同 defer，也可以配合 async 在请求完成后立即执行


### 2、link 标签：通过预处理提升渲染速度

1、dns-prefetch。当 link 标签的 rel 属性值为“dns-prefetch”时，浏览器会对某个域名预先进行 DNS 解析并缓存。这样，当浏览器在请求同域名资源的时候，能省去从域名查询 IP 的过程，从而减少时间损耗。下图是淘宝网设置的 DNS 预解析。

2、preconnect。让浏览器在一个 HTTP 请求正式发给服务器前预先执行一些操作，这包括 DNS 解析、TLS 协商、TCP 握手，通过消除往返延迟来为用户节省时间。

3、prefetch/preload。两个值都是让浏览器预先下载并缓存某个资源，但不同的是，prefetch 可能会在浏览器忙时被忽略，而 preload 则是一定会被预先下载。

4、prerender。浏览器不仅会加载资源，还会解析执行页面，进行预渲染。


### 搜索优化

1、meta 标签：提取关键信息

<meta content="xxx" name="keywords">


2、link 标签：减少重复


3、延伸内容：OGP（开放图表协议）