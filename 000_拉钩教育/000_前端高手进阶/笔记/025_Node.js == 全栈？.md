# Node.js == 全栈？



### Node.js 源码结构

acorn：前面的课程中已经提过，用 JavaScript 编写的轻量级 JavaScript 解析器。

acorn-plugins：acorn 的扩展模块，让 acorn 支持 ES6 特性解析，比如类声明。

brotli：C 语言编写的 Brotli 压缩算法。

cares：应该写为“c-ares”，C 语言编写的用来处理异步 DNS 请求。

histogram：C 语言编写，实现柱状图生成功能。

icu-small：C 语言编写，为 Node.js 定制的 ICU（International Components for Unicode）库，包括一些用来操作 Unicode 的函数。

llhttp：C 语言编写，轻量级的 http 解析器。

nghttp2/nghttp3/ngtcp2：处理 HTTP/2、HTTP/3、TCP/2 协议。

node-inspect：让 Node.js 程序支持 CLI debug 调试模式。

npm：JavaScript 编写的 Node.js 模块管理器。

openssl：C 语言编写，加密相关的模块，在 tls 和 crypto 模块中都有使用。

uv：C 语言编写，采用非阻塞型的 I/O 操作，为 Node.js 提供了访问系统资源的能力。

uvwasi：C 语编写，实现 WASI 系统调用 API。

v8：C 语言编写，JavaScript 引擎。

zlib：用于快速压缩，Node.js 使用 zlib 创建同步、异步和数据流压缩、解压接口。




### 什么是 libuv


libuv 是一个用 C 编写的支持多平台的异步 I/O 库，主要解决 I/O 操作容易引起阻塞的问题。
最开始是专门为 Node.js 使用而开发的，但后来也被 Luvit、Julia、pyuv 等其他模块使用。下图是 libuv 的结构图。



### libuv 中的事件轮询




#### uv__update_time

为了减少与时间相关的系统调用次数，同构这个函数来缓存当前系统时间，精度很高，可以达到纳秒级别，但单位还是毫秒。


#### uv__run_timers

执行 setTimeout() 和 setInterval() 中到达时间阈值的回调函数。
这个执行过程是通过 for 循环遍历实现的，从下面的代码中也可以看到，
定时器回调是存储于一个最小堆结构的数据中的，当这个最小堆为空或者还未到达时间阈值时退出循环。




