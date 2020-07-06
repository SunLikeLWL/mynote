# vue 源码解析

https://live.vhall.com/room/watch/772296298


Vue使用Object.defineProperty+观察者模式对数据和模板进行绑定，对数据来说需要进行更新时，
即会触发对应的getter和setter函数，在setter函数中，即可根据对应手机到的依赖，触发赌赢属兔层更新。



