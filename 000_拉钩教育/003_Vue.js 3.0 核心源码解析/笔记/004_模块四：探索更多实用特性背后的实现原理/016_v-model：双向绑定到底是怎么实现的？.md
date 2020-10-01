# v-model：双向绑定到底是怎么实现的？


v-model 也不是可以作用到任意标签，它只能在一些特定的表单标签如 input、select、textarea 和自定义组件中使用。




### 在普通表单元素上作用 v-model


首先，我们来看在普通表单元素上作用 v-model，还是先举一个基本的示例：<input v-model="searchText"/>。

我们先看这个模板编译后生成的 render 函数：

```js

import { vModelText as _vModelText, createVNode as _createVNode, withDirectives as _withDirectives, openBlock as _openBlock, createBlock as _createBlock } from "vue"
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _withDirectives((_openBlock(), _createBlock("input", {
    "onUpdate:modelValue": $event => (_ctx.searchText = $event)
  }, null, 8 /* PROPS */, ["onUpdate:modelValue"])), [
    [_vModelText, _ctx.searchText]
  ])
}

```

可以看到，作用在 input 标签的 v-model 指令在编译后，
除了使用 withDirectives 给这个 vnode 添加了 vModelText 指令对象外，
还额外传递了一个名为 onUpdate:modelValue 的 prop，
它的值是一个函数，这个函数就是用来更新变量 searchText。


我们来看 vModelText 的实现：


```js

const vModelText = {
  created(el, { value, modifiers: { lazy, trim, number } }, vnode) {
    el.value = value == null ? '' : value
    el._assign = getModelAssigner(vnode)
    const castToNumber = number || el.type === 'number'
    addEventListener(el, lazy ? 'change' : 'input', e => {
      if (e.target.composing)
        return
      let domValue = el.value
      if (trim) {
        domValue = domValue.trim()
      }
      else if (castToNumber) {
        domValue = toNumber(domValue)
      }
      el._assign(domValue)
    })
    if (trim) {
      addEventListener(el, 'change', () => {
        el.value = el.value.trim()
      })
    }
    if (!lazy) {
      addEventListener(el, 'compositionstart', onCompositionStart)
      addEventListener(el, 'compositionend', onCompositionEnd)
    }
  },
  beforeUpdate(el, { value, modifiers: { trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode)
    if (document.activeElement === el) {
      if (trim && el.value.trim() === value) {
        return
      }
      if ((number || el.type === 'number') && toNumber(el.value) === value) {
        return
      }
    }
    const newValue = value == null ? '' : value
    if (el.value !== newValue) {
      el.value = newValue
    }
  }
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props['onUpdate:modelValue']
  return isArray(fn) ? value => invokeArrayFns(fn, value) : fn
}
function onCompositionStart(e) {
  e.target.composing = true
}
function onCompositionEnd(e) {
  const target = e.target
  if (target.composing) {
    target.composing = false
    trigger(target, 'input')
  }
}


```


那么接下来，我们就来拆解这个指令的实现。
首先，这个指令实现了两个钩子函数，created 和 beforeUpdate。


### lazy 修饰符


如果配置了 lazy 修饰符，那么监听的是 input 的 change 事件，
它不会在input输入框实时输入的时候触发，而会在 input 元素值改变且失去焦点的时候触发。




如果不配置 lazy，监听的是 input 的 input 事件，它会在用户实时输入的时候触发。此
外，还会多监听 compositionstart 和 compositionend 事件。


当用户在使用一些中文输入法的时候，会触发 compositionstart 事件，
这个时候设置 e.target.composing 为 true，这样虽然 input 事件触发了，
但是 input 事件的回调函数里判断了 e.target.composing 的值，
如果为 true 则直接返回，不会把 DOM 值赋值给数据。





### trim 修饰符


如果配置了 trim 修饰符，那么会在 input 或者 change 事件的回调函数中，
在获取 DOM 的值后，手动调用 trim 方法去除首尾空格。

另外，还会额外监听 change 事件执行 el.value.trim() 把 DOM 的值的首尾空格去除。


### number 修饰符


如果配置了 number 修饰符，或者 input 的 type 是 number，
就会把 DOM 的值转成 number 类型后再赋值给数据。


### 在自定义组件上作用 v-model


接下来，我们来分析自定义组件上作用 v-model，看看它与表单的 v-model 有哪些不同。还是通过一个示例说明：


```js

app.component('custom-input', {
  props: ['modelValue'],
  template: `
    <input v-model="value">
  `,
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
})

```

本质就是语法糖：通过 prop 向组件传递数据，并监听自定义事件接受组件反传的数据并更新。



### 自定义事件派发


从前面的示例我们知道，子组件会执行this.$emit('update:modelValue',value)方法派发自定义事件，
$emit 内部执行了 emit 方法，我们来看一下它的实现：


```js

function emit(instance, event, ...args) {
  const props = instance.vnode.props || EMPTY_OBJ
  let handlerName = `on${capitalize(event)}`
  let handler = props[handlerName]
  
  if (!handler && event.startsWith('update:')) {
    handlerName = `on${capitalize(hyphenate(event))}`
    handler = props[handlerName]
  }
  if (handler) {
    callWithAsyncErrorHandling(handler, instance, 6 /* COMPONENT_EVENT_HANDLER */, args)
  }
}

```
