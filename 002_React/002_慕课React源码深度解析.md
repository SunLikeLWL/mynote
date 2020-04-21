# 慕课React源码深度解析 高级前端工程师必备技能



1、 最核心API setState
2、 思想超前
3、 Fiber 解决单线程运行导致卡顿的问题




# 第一章 React API

1、createElement

2、Ref

3、createContext

4、Component


5、JSX => JS

6、Suspense

7、ConcurrentMode

8、Hooks


# 第二章 React中的跟新创建

1、ReactDOM.render()

2、FiberRoot

3、Fiber

4、Update

5、UpdateQueue

6、expirationTime




# 第三章 Fiber Scheduler

1、scheduleWork

2、requestWord

3、batchUpdates

4、React scheduler

5、performWork

6、renderRoot

7、performUnitWork



# 第四章 开始更新


1、beginWork以及优化

2、各类组件的更新过程

3、调和子节点的过程




# 第五章  完成各个节点的更新

1、completeUnitOfWork

2、虚拟DOM对比

3、completeWork

4、错误捕获处理

5、unwindWord

6、完成整棵树跟新



# 第六章 提交更新

1、commitRoot整体流程

2、开始时的帮助方法

3、提交快照

4、提交DOM插入

5、提交DOM更新

6、提交DOM删除

7、提交所有生命周期




# 第七章 各种功能的实现过程


1、context的实现过程

2、ref的实现过程

3、hydrate的实现过程

4、React的事件体系



# Suspense

1、更新优先级的概念

2、更新挂起的概念

3、Suspense组件更新

4、timeout处理

5、retry重新尝试渲染

6、lazy组件更新



# Hooks

1、核心原理

2、useState

3、useEffect

4、useContext

5、其他Hooks API



# 你需要


1、足够的耐心

2、思考再思考

3、善于提问和做笔记



# 通读源不是目的

### 外在

1、提高开发能力

2、解决问题能力

3、提升自身价值

### 内在

1、提升学习能力

2、提升思考能力

3、提升设计能力




# 适合人群

1、React开发者

2、想要参加开源项目

3、想要成为高级开发者或者架构师





# 准备工作




# babel 将jsx转换为js React.createElement



# ReactElement
