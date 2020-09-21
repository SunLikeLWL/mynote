# Props：Props 的初始化和更新流程是怎样的？


 Vue.js 的核心思想之一是组件化，页面可以由一个个组件构建而成，
 组件是一种抽象的概念，它是对页面的部分布局和逻辑的封装。




 ### Props 的初始化


在执行 setupComponent 函数的时候，会初始化 Props：



```js

function setupComponent (instance, isSSR = false) {
  const { props, children, shapeFlag } = instance.vnode
  // 判断是否是一个有状态的组件
  const isStateful = shapeFlag & 4
  // 初始化 props
  initProps(instance, props, isStateful, isSSR)
  // 初始化插槽
  initSlots(instance, children)
  // 设置有状态的组件实例
  const setupResult = isStateful
    ? setupStatefulComponent(instance, isSSR)
    : undefined
  return setupResult
}

```



所以 Props 初始化，就是通过 initProps 方法来完成的，我们来看一下它的实现：


```js


function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {}
  const attrs = {}
  def(attrs, InternalObjectKey, 1)
  // 设置 props 的值
  setFullProps(instance, rawProps, props, attrs)
  // 验证 props 合法
  if ((process.env.NODE_ENV !== 'production')) {
    validateProps(props, instance.type)
  }
  if (isStateful) {
    // 有状态组件，响应式处理
    instance.props = isSSR ? props : shallowReactive(props)
  }
  else {
    // 函数式组件处理
    if (!instance.type.props) {
      instance.props = attrs
    }
    else {
      instance.props = props
    }
  }
  // 普通属性赋值
  instance.attrs = attrs
}

```


这里，初始化 Props 主要做了以下几件事情：

设置 props 的值，
验证 props 是否合法，
把 props 变成响应式，
以及添加到实例 instance.props 上。



### 设置 Props

```js

function setFullProps(instance, rawProps, props, attrs) {
  // 标准化 props 的配置
  const [options, needCastKeys] = normalizePropsOptions(instance.type)
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key]
      // 一些保留的 prop 比如 ref、key 是不会传递的
      if (isReservedProp(key)) {
        continue
      }
      // 连字符形式的 props 也转成驼峰形式
      let camelKey
      if (options && hasOwn(options, (camelKey = camelize(key)))) {
        props[camelKey] = value
      }
      else if (!isEmitListener(instance.type, key)) {
        // 非事件派发相关的，且不在 props 中定义的普通属性用 attrs 保留
        attrs[key] = value
      }
    }
  }
  if (needCastKeys) {
    // 需要做转换的 props
    const rawCurrentProps = toRaw(props)
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i]
      props[key] = resolvePropValue(options, rawCurrentProps, key, rawCurrentProps[key])
    }
  }
}

```

instance 表示组件实例；
rawProps 表示原始的 props 值，也就是创建 vnode 过程中传入的 props 数据；
props 用于存储解析后的 props 数据；
attrs 用于存储解析后的普通属性数据。


接下来，我们来看标准化 props 配置的过程，先看一下 normalizePropsOptions 函数的实现：


```js
function normalizePropsOptions(comp) {
  // comp.__props 用于缓存标准化的结果，有缓存，则直接返回
  if (comp.__props) {
    return comp.__props
  }
  const raw = comp.props
  const normalized = {}
  const needCastKeys = []
  // 处理 mixins 和 extends 这些 props
  let hasExtends = false
  if (!shared.isFunction(comp)) {
    const extendProps = (raw) => {
      const [props, keys] = normalizePropsOptions(raw)
      shared.extend(normalized, props)
      if (keys)
        needCastKeys.push(...keys)
    }
    if (comp.extends) {
      hasExtends = true
      extendProps(comp.extends)
    }
    if (comp.mixins) {
      hasExtends = true
      comp.mixins.forEach(extendProps)
    }
  }
  if (!raw && !hasExtends) {
    return (comp.__props = shared.EMPTY_ARR)
  }
  // 数组形式的 props 定义
  if (shared.isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      if (!shared.isString(raw[i])) {
        warn(`props must be strings when using array syntax.`, raw[i])
      }
      const normalizedKey = shared.camelize(raw[i])
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = shared.EMPTY_OBJ
      }
    }
  }
  else if (raw) {
    if (!shared.isObject(raw)) {
      warn(`invalid props options`, raw)
    }
    for (const key in raw) {
      const normalizedKey = shared.camelize(key)
      if (validatePropName(normalizedKey)) {
        const opt = raw[key]
        // 标准化 prop 的定义格式
        const prop = (normalized[normalizedKey] =
          shared.isArray(opt) || shared.isFunction(opt) ? { type: opt } : opt)
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type)
          const stringIndex = getTypeIndex(String, prop.type)
          prop[0 /* shouldCast */] = booleanIndex > -1
          prop[1 /* shouldCastTrue */] =
            stringIndex < 0 || booleanIndex < stringIndex
          // 布尔类型和有默认值的 prop 都需要转换
          if (booleanIndex > -1 || shared.hasOwn(prop, 'default')) {
            needCastKeys.push(normalizedKey)
          }
        }
      }
    }
  }
  const normalizedEntry = [normalized, needCastKeys]
  comp.__props = normalizedEntry
  return normalizedEntry
}

```
normalizePropsOptions 主要目的是标准化 props 的配置，这里需要注意，你要区分 props 的配置和 props 的数据。
所谓 props 的配置，就是你在定义组件时编写的 props 配置，它用来描述一个组件的 props 是什么样的；
而 props 的数据，是父组件在调用子组件的时候，给子组件传递的数据。




所以这个函数首先会处理 mixins 和 extends 这两个特殊的属性，因为它们的作用都是扩展组件的定义，
所以需要对它们定义中的 props 递归执行 normalizePropsOptions。





我们回到 setFullProps 函数，接下来分析遍历 props 数据求值的流程。


```js

function setFullProps(instance, rawProps, props, attrs) {
  // 标准化 props 的配置
  
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key]
      // 一些保留的 prop 比如 ref、key 是不会传递的
      if (isReservedProp(key)) {
        continue
      }
      // 连字符形式的 props 也转成驼峰形式
      let camelKey
      if (options && hasOwn(options, (camelKey = camelize(key)))) {
        props[camelKey] = value
      }
      else if (!isEmitListener(instance.type, key)) {
        // 非事件派发相关的，且不在 props 中定义的普通属性用 attrs 保留
        attrs[key] = value
      }
    }
  }
  
  // 转换需要转换的 props
}

```

接下来我们来看 setFullProps 的最后一个流程：对需要转换的 props 求值。

```js

function setFullProps(instance, rawProps, props, attrs) {
  // 标准化 props 的配置
  
  // 遍历 props 数据求值
  
  if (needCastKeys) {
    // 需要做转换的 props
    const rawCurrentProps = toRaw(props)
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i]
      props[key] = resolvePropValue(options, rawCurrentProps, key, rawCurrentProps[key])
    }
  }
}

```
在 normalizePropsOptions 的时候，我们拿到了需要转换的 props 的 key，
接下来就是遍历 needCastKeys，依次执行 resolvePropValue 方法来求值。我们来看一下它的实现：


```js

function resolvePropValue(options, props, key, value) {
  const opt = options[key]
  if (opt != null) {
    const hasDefault = hasOwn(opt, 'default')
    // 默认值处理
    if (hasDefault && value === undefined) {
      const defaultValue = opt.default
      value =
        opt.type !== Function && isFunction(defaultValue)
          ? defaultValue()
          : defaultValue
    }
    // 布尔类型转换
    if (opt[0 /* shouldCast */]) {
      if (!hasOwn(props, key) && !hasDefault) {
        value = false
      }
      else if (opt[1 /* shouldCastTrue */] &&
        (value === '' || value === hyphenate(key))) {
        value = true
      }
    }
  }
  return value
}

```
resolvePropValue 主要就是针对两种情况的转换，
第一种是默认值的情况，即我们在 prop 配置中定义了默认值，
并且父组件没有传递数据的情况，这里 prop 对应的值就取默认值。

第二种是布尔类型的值，前面我们在 normalizePropsOptions 的时候已经给 prop 的定义添加了两个特殊的 key，
所以 opt[0] 为 true 表示这是一个含有 Boolean 类型的 prop，然后判断是否有传对应的值，
如果不是且没有默认值的话，就直接转成 false，举个例子：


验证过程是在非生产环境下执行的，我们来看一下 validateProps 的实现：


```js

function validateProps(props, comp) {
  const rawValues = toRaw(props)
  const options = normalizePropsOptions(comp)[0]
  for (const key in options) {
    let opt = options[key]
    if (opt == null)
      continue
    validateProp(key, rawValues[key], opt, !hasOwn(rawValues, key))
  }
}
function validateProp(name, value, prop, isAbsent) {
  const { type, required, validator } = prop
  // 检测 required
  if (required && isAbsent) {
    warn('Missing required prop: "' + name + '"')
    return
  }
  // 虽然没有值但也没有配置 required，直接返回
  if (value == null && !prop.required) {
    return
  }
  // 类型检测
  if (type != null && type !== true) {
    let isValid = false
    const types = isArray(type) ? type : [type]
    const expectedTypes = []
    // 只要指定的类型之一匹配，值就有效
    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(value, types[i])
      expectedTypes.push(expectedType || '')
      isValid = valid
    }
    if (!isValid) {
      warn(getInvalidTypeMessage(name, value, expectedTypes))
      return
    }
  }
  // 自定义校验器
  if (validator && !validator(value)) {
    warn('Invalid prop: custom validator check failed for prop "' + name + '".')
  }
}


```


### 响应式处理


 把 props 变成响应式，添加到实例 instance.props 上。


 ```js


function initProps(instance, rawProps, isStateful, isSSR = false) {
  // 设置 props 的值
  // 验证 props 合法
  if (isStateful) {
    // 有状态组件，响应式处理
    instance.props = isSSR ? props : shallowReactive(props)
  }
  else {
    // 函数式组件处理
    if (!instance.type.props) {
      instance.props = attrs
    }
    else {
      instance.props = props
    }
  }
  // 普通属性赋值
  instance.attrs = attrs
}

 ```


 ### Props 的更新

 在组件更新的章节我们说过，组件的重新渲染会触发 patch 过程，然后遍历子节点递归 patch，
 那么遇到组件节点，会执行 updateComponent 方法：


 ```js

const updateComponent = (n1, n2, parentComponent, optimized) => {
  const instance = (n2.component = n1.component)
  // 根据新旧子组件 vnode 判断是否需要更新子组件
  if (shouldUpdateComponent(n1, n2, parentComponent, optimized)) {
    // 新的子组件 vnode 赋值给 instance.next
    instance.next = n2
    // 子组件也可能因为数据变化被添加到更新队列里了，移除它们防止对一个子组件重复更新
    invalidateJob(instance.update)
    // 执行子组件的副作用渲染函数
    instance.update()
  }
  else {
    // 不需要更新，只复制属性
    n2.component = n1.component
    n2.el = n1.el
  }
}

 ```

 在这个过程中，会执行 shouldUpdateComponent 方法判断是否需要更新子组件，
 内部会对比 props，由于我们的 prop 数据 msg 由 Hello world 变成了 Hello Vue，
 值不一样所以 shouldUpdateComponent 会返回 true，这样就把新的子组件 vnode 赋值给 instance.next，
 然后执行 instance.update 触发子组件的重新渲染。





执行 instance.update 函数，实际上是执行 componentEffect 组件副作用渲染函数：


```js

const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
  // 创建响应式的副作用渲染函数
  instance.update = effect(function componentEffect() {
    if (!instance.isMounted) {
      // 渲染组件
    }
    else {
      // 更新组件
      let { next, vnode } = instance
      // next 表示新的组件 vnode
      if (next) {
        // 更新组件 vnode 节点信息
        updateComponentPreRender(instance, next, optimized)
      }
      else {
        next = vnode
      }
      // 渲染新的子树 vnode
      const nextTree = renderComponentRoot(instance)
      // 缓存旧的子树 vnode
      const prevTree = instance.subTree
      // 更新子树 vnode
      instance.subTree = nextTree
      // 组件更新核心逻辑，根据新旧子树 vnode 做 patch
      patch(prevTree, nextTree,
        // 如果在 teleport 组件中父节点可能已经改变，所以容器直接找旧树 DOM 元素的父节点
        hostParentNode(prevTree.el),
        // 参考节点在 fragment 的情况可能改变，所以直接找旧树 DOM 元素的下一个节点
        getNextHostNode(prevTree),
        instance,
        parentSuspense,
        isSVG)
      // 缓存更新后的 DOM 节点
      next.el = nextTree.el
    }
  }, prodEffectOptions)
}

```

在更新组件的时候，会判断是否有 instance.next,它代表新的组件 vnode，
根据前面的逻辑 next 不为空，所以会执行 updateComponentPreRender 更新组件 vnode 节点信息，
我们来看一下它的实现：


```js

const updateComponentPreRender = (instance, nextVNode, optimized) => {
  nextVNode.component = instance
  const prevProps = instance.vnode.props
  instance.vnode = nextVNode
  instance.next = null
  updateProps(instance, nextVNode.props, prevProps, optimized)
  updateSlots(instance, nextVNode.children)
}

```


其中，会执行 updateProps 更新 props 数据，我们来看它的实现：


```js

function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const { props, attrs, vnode: { patchFlag } } = instance
  const rawCurrentProps = toRaw(props)
  const [options] = normalizePropsOptions(instance.type)
  if ((optimized || patchFlag > 0) && !(patchFlag & 16 /* FULL_PROPS */)) {
    if (patchFlag & 8 /* PROPS */) {
      // 只更新动态 props 节点
      const propsToUpdate = instance.vnode.dynamicProps
      for (let i = 0; i < propsToUpdate.length; i++) {
        const key = propsToUpdate[i]
        const value = rawProps[key]
        if (options) {
          if (hasOwn(attrs, key)) {
            attrs[key] = value
          }
          else {
            const camelizedKey = camelize(key)
            props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value)
          }
        }
        else {
          attrs[key] = value
        }
      }
    }
  }
  else {
    // 全量 props 更新
    setFullProps(instance, rawProps, props, attrs)
    // 因为新的 props 是动态的，把那些不在新的 props 中但存在于旧的 props 中的值设置为 undefined
    let kebabKey
    for (const key in rawCurrentProps) {
      if (!rawProps ||
        (!hasOwn(rawProps, key) &&
          ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey)))) {
        if (options) {
          if (rawPrevProps &&
            (rawPrevProps[key] !== undefined ||
              rawPrevProps[kebabKey] !== undefined)) {
            props[key] = resolvePropValue(options, rawProps || EMPTY_OBJ, key, undefined)
          }
        }
        else {
          delete props[key]
        }
      }
    }
  }
  if ((process.env.NODE_ENV !== 'production') && rawProps) {
    validateProps(props, instance.type)
  }
}

```

updateProps 主要的目标就是把父组件渲染时求得的 props 新值，更新到子组件实例的 instance.props 中。


在编译阶段，我们除了捕获一些动态 vnode，也捕获了动态的 props，所以我们可以只去比对动态的 props 数据更新。


在子组件中可以监听 props 值的变化做一些事情，举个例子：




shallowReactive 和普通的 reactive 函数的主要区别是处理器函数不同，我们来回顾 getter 的处理器函数：



```js

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return !isReadonly;
    }
    else if (key === "__v_isReadonly" /* IS_READONLY */) {
      return isReadonly;
    }
    else if (key === "__v_raw" /* RAW */ &&
      receiver ===
      (isReadonly
        ? target["__v_readonly" /* READONLY */]
        : target["__v_reactive" /* REACTIVE */])) {
      return target;
    }
    const targetIsArray = isArray(target);
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key)
      ? builtInSymbols.has(key)
      : key === `__proto__` || key === `__v_isRef`) {
      return res;
    }
    if (!isReadonly) {
      track(target, "get" /* GET */, key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray ? res : res.value;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
}

```

shallowReactive 创建的 getter 函数，shallow 变量为 true，那么就不会执行后续的递归 reactive 逻辑。
也就是说，shallowReactive 只把对象 target 的最外一层属性的访问和修改处理成响应式。


