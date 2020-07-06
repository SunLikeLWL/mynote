# react核心源码解析




### ReactElement


通过React.createElement创建出ReactElement


### Component

class Component

function Component


host Component




### 渲染器render


协调器 reconciler

调度器 scheduler

事件系统 events




### 协调器reconciler

react在不同和宿主环境下，需要调用不同的渲染器，



### 调度器 scheduler





### 事件系统 events


react内部实现了一套事件系统，相比原生的dom节约内存消耗。
当事件触发时，内部创建合成事件进行处理，合成事件队原生事件进行封装



react有一个事件池




### Fiber

1、能够让任务进行切片

2、支持任务的可中断

3、支持任务优先级

4、FiberRootNode

5、FiberNode









