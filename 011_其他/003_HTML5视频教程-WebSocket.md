# HTML5视频教程-WebSocket


WebSocket需要类似TCP的顾客端和服务器端通过握手连接，连接成功之后才能相互通信，客户端和服务端
都能主动的向对方发送或接受数据


WebSocket对象提供了一组API，用于创建和管理WebSocket连接，以及通过连接发送和接受数据


### 创建WebSocket对象

var ws = new WebSocket(url,[protocols]);


### 方法

close([code][,reason]) 关闭Websocket连接或暂停


send(data)  通过WebSocket连接向服务器发送数据



### 属性

onclose 监听连接关闭事件监听器

onerror  监听错误信息

onmessage  监听消息事件

onopen  监听打开连接

readyState  

0 连接没开启
1 连接已开启并准备好进行通讯
2 连接正在关闭中
3 连接已关闭





