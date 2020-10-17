# Transition 组件：过渡动画的实现原理是怎样的？（下）



### 钩子函数执行


在 patch 阶段的 mountElement 函数中，在插入元素节点前且存在过
渡的条件下会执行 vnode.transition 中的 beforeEnter 函数


```js

beforeEnter(el) {
  let hook = onBeforeEnter
  if (!state.isMounted) {
    if (appear) {
      hook = onBeforeAppear || onBeforeEnter
    }
    else {
      return
    }
  }
  if (el._leaveCb) {
    el._leaveCb(true /* cancelled */)
  }
  const leavingVNode = leavingVNodesCache[key]
  if (leavingVNode &&
    isSameVNodeType(vnode, leavingVNode) &&
    leavingVNode.el._leaveCb) {
    leavingVNode.el._leaveCb()
  }
  callHook(hook, [el])
}

```

beforeEnter 钩子函数主要做的事情就是根据 appear 的值和 DOM 是否挂载，
来执行 onBeforeEnter 函数或者是 onBeforeAppear 函数，其他的逻辑我们暂时先不看。



appear、onBeforeEnter、onBeforeAppear 这些变量都是从 props 中获取的，
那么这些 props 是怎么初始化的呢？回到 Transition 组件的定义：

```js
const Transition = (props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots)

```

可以看到，传递的 props 经过了 resolveTransitionProps 函数的封装，我们来看它的定义：


```js

function resolveTransitionProps(rawProps) {
  let { name = 'v', type, css = true, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps
  const baseProps = {}
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key]
    }
  }
  if (!css) {
    return baseProps
  }
  const durations = normalizeDuration(duration)
  const enterDuration = durations && durations[0]
  const leaveDuration = durations && durations[1]
  const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps
  const finishEnter = (el, isAppear, done) => {
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass)
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass)
    done && done()
  }
  const finishLeave = (el, done) => {
    removeTransitionClass(el, leaveToClass)
    removeTransitionClass(el, leaveActiveClass)
    done && done()
  }
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter
      const resolve = () => finishEnter(el, isAppear, done)
      hook && hook(el, resolve)
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass)
        addTransitionClass(el, isAppear ? appearToClass : enterToClass)
        if (!(hook && hook.length > 1)) {
          if (enterDuration) {
            setTimeout(resolve, enterDuration)
          }
          else {
            whenTransitionEnds(el, type, resolve)
          }
        }
      })
    }
  }
  return extend(baseProps, {
    onBeforeEnter(el) {
      onBeforeEnter && onBeforeEnter(el)
      addTransitionClass(el, enterActiveClass)
      addTransitionClass(el, enterFromClass)
    },
    onBeforeAppear(el) {
      onBeforeAppear && onBeforeAppear(el)
      addTransitionClass(el, appearActiveClass)
      addTransitionClass(el, appearFromClass)
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      const resolve = () => finishLeave(el, done)
      addTransitionClass(el, leaveActiveClass)
      addTransitionClass(el, leaveFromClass)
      nextFrame(() => {
        removeTransitionClass(el, leaveFromClass)
        addTransitionClass(el, leaveToClass)
        if (!(onLeave && onLeave.length > 1)) {
          if (leaveDuration) {
            setTimeout(resolve, leaveDuration)
          }
          else {
            whenTransitionEnds(el, type, resolve)
          }
        }
      })
      onLeave && onLeave(el, resolve)
    },
    onEnterCancelled(el) {
      finishEnter(el, false)
      onEnterCancelled && onEnterCancelled(el)
    },
    onAppearCancelled(el) {
      finishEnter(el, true)
      onAppearCancelled && onAppearCancelled(el)
    },
    onLeaveCancelled(el) {
      finishLeave(el)
      onLeaveCancelled && onLeaveCancelled(el)
    }
  })
}

```

resolveTransitionProps 函数主要作用是，在我们给 Transition 传递的 Props 基础上做一层封装，
然后返回一个新的 Props 对象，由于它包含了所有的 Props 处理，你不需要一下子了解所有的实现，按需分析即可。




原来这就是在 DOM 元素对象在创建后，插入到页面前做的事情：执行 beforeEnter 钩子函数，以及给元素添加相应的 CSS 样式。


执行完 beforeEnter 钩子函数，接着插入元素到页面，
然后会执行 vnode.transition 中的enter 钩子函数，我们来看它的定义


```js

enter(el) {
  let hook = onEnter
  let afterHook = onAfterEnter
  let cancelHook = onEnterCancelled
  if (!state.isMounted) {
    if (appear) {
      hook = onAppear || onEnter
      afterHook = onAfterAppear || onAfterEnter
      cancelHook = onAppearCancelled || onEnterCancelled
    }
    else {
      return
    }
  }
  let called = false
  const done = (el._enterCb = (cancelled) => {
    if (called)
      return
    called = true
    if (cancelled) {
      callHook(cancelHook, [el])
    }
    else {
      callHook(afterHook, [el])
    }
    if (hooks.delayedLeave) {
      hooks.delayedLeave()
    }
    el._enterCb = undefined
  })
  if (hook) {
    hook(el, done)
    if (hook.length <= 1) {
      done()
    }
  }
  else {
    done()
  }
}

```

enter 钩子函数主要做的事情就是根据 appear 的值和 DOM 是否挂载，
执行 onEnter 函数或者是 onAppear 函数，并且这个函数的第二个参数是一个 done 函数，
表示过渡动画完成后执行的回调函数，它是异步执行的。


同理，onEnter、onAppear、onAfterEnter 和 onEnterCancelled 函数也是从 Props 传入的，我们重点看 onEnter 的实现，
它是 makeEnterHook(false) 函数执行后的返回值，如下：

```js

const makeEnterHook = (isAppear) => {
  return (el, done) => {
    const hook = isAppear ? onAppear : onEnter
    const resolve = () => finishEnter(el, isAppear, done)
    hook && hook(el, resolve)
    nextFrame(() => {
      removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass)
      addTransitionClass(el, isAppear ? appearToClass : enterToClass)
      if (!(hook && hook.length > 1)) {
        if (enterDuration) {
          setTimeout(resolve, enterDuration)
        }
        else {
          whenTransitionEnds(el, type, resolve)
        }
      }
    })
  }
}

```

在函数内部，首先执行基础 props 传入的 onEnter 钩子函数，
然后在下一帧给 DOM 元素 el 移除了 enterFromClass，同时添加了 enterToClass 样式。




Transition 组件允许我们传入 enterDuration 这个 prop，它会指定进入过渡的动画时长，
当然如果你不指定，Vue.js 内部会监听动画结束事件，然后在动画结束后，执行 finishEnter 函数，来看它的实现：

```js

const finishEnter = (el, isAppear, done) => {
  removeTransitionClass(el, isAppear ? appearToClass : enterToClass)
  removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass)
  done && done()
}

```

其实就是给 DOM 元素移除 enterToClass 以及 enterActiveClass，
同时执行 done 函数，进而执行 onAfterEnter 钩子函数。





当元素被删除的时候，会执行 remove 方法，在真正从 DOM 移除元素前且存在过渡的情况下，
会执行 vnode.transition 中的 leave 钩子函数，并且把移动 DOM 的方法作为第二个参数传入，我们来看它的定义：



```js

leave(el, remove) {
  const key = String(vnode.key)
  if (el._enterCb) {
    el._enterCb(true /* cancelled */)
  }
  if (state.isUnmounting) {
    return remove()
  }
  callHook(onBeforeLeave, [el])
  let called = false
  const done = (el._leaveCb = (cancelled) => {
    if (called)
      return
    called = true
    remove()
    if (cancelled) {
      callHook(onLeaveCancelled, [el])
    }
    else {
      callHook(onAfterLeave, [el])
    }
    el._leaveCb = undefined
    if (leavingVNodesCache[key] === vnode) {
      delete leavingVNodesCache[key]
    }
  })
  leavingVNodesCache[key] = vnode
  if (onLeave) {
    onLeave(el, done)
    if (onLeave.length <= 1) {
      done()
    }
  }
  else {
    done()
  }
}


```

leave 钩子函数主要做的事情就是执行 props 传入的 onBeforeLeave 钩子函数和 onLeave 函数，
onLeave 函数的第二个参数是一个 done 函数，它表示离开过渡动画结束后执行的回调函数。


done 函数内部主要做的事情就是执行 remove 方法移除 DOM，
然后执行 onAfterLeave 钩子函数或者是 onLeaveCancelled 函数，其它的逻辑我们也先不看。



接下来，我们重点看一下 onLeave 函数的实现，看看离开过渡动画是如何执行的。

```js

onLeave(el, done) {
  const resolve = () => finishLeave(el, done)
  addTransitionClass(el, leaveActiveClass)
  addTransitionClass(el, leaveFromClass)
  nextFrame(() => {
    removeTransitionClass(el, leaveFromClass)
    addTransitionClass(el, leaveToClass)
    if (!(onLeave && onLeave.length > 1)) {
      if (leaveDuration) {
        setTimeout(resolve, leaveDuration)
      }
      else {
        whenTransitionEnds(el, type, resolve)
      }
    }
  })
  onLeave && onLeave(el, resolve)
}


```

onLeave 函数首先给 DOM 元素添加 leaveActiveClass 和 leaveFromClass，并
执行基础 props 传入的 onLeave 钩子函数，然后在下一帧移除 leaveFromClass，并添加 leaveToClass。


和进入动画类似，Transition 组件允许我们传入 leaveDuration 这个 prop，指定过渡的动画时长
，当然如果你不指定，Vue.js 内部会监听动画结束事件，然后在动画结束后，执行 resolve 函数，
它是执行 finishLeave 函数的返回值，来看它的实现：


```js

const finishLeave = (el, done) => {
  removeTransitionClass(el, leaveToClass)
  removeTransitionClass(el, leaveActiveClass)
  done && done()
}


```

其实就是给 DOM 元素移除 leaveToClass 以及 leaveActiveClass，
同时执行 done 函数，进而执行 onAfterLeave 钩子函数。


### 模式的应用

在 in-out 模式下，新元素先进行过渡，完成之后当前元素过渡离开。

在 out-in 模式下，当前元素先进行过渡，完成之后新元素过渡进入。



我们来看一下 out-in 模式的实现：


```js

const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance)
setTransitionHooks(oldInnerChild, leavingHooks)
if (mode === 'out-in') {
  state.isLeaving = true
  leavingHooks.afterLeave = () => {
    state.isLeaving = false
    instance.update()
  }
  return emptyPlaceholder(child)
}

```