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



react有一个事件池，管理事件对象的创建和销毁





### Fiber

1、能够让任务进行切片

2、支持任务的可中断

3、支持任务优先级

4、FiberRootNode

5、FiberNode




### FiberRootNode



rootFiberNode 可以从 root 的 dom 节点上访问到 rootFiberNode 
document.getElementById('root')._reactRootContainer._internalRoot



Fiber

- react element 对应的运⾏实例
- ⾃身的实例类型 type 
- 与其他 fiber 的关系 child，sibling，return 
- 已处理未处理的信息 pendingProps, memoizedProps

调⽤ createFiberFromElement 创建对应的 fiber



### 过期时间 ExpirationTime


react 通过优先级来调度渲染过程，同时通过过期时间来保证低优先级的任务能够
被顺利执⾏。


在并⾏渲染时使⽤，暂时不是⽣产接⼝


## 源码解析
