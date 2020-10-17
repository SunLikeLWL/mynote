# Vuex：如何实现前端的状态管理？


### 路径和路由组件的渲染的映射


```js

const RouterView = defineComponent({

  name: 'RouterView',

  props: {

    name: {

      type: String,

      default: 'default',

    },

    route: Object,

  },

  setup(props, { attrs, slots }) {

    warnDeprecatedUsage()

    const injectedRoute = inject(routeLocationKey)

    const depth = inject(viewDepthKey, 0)

    const matchedRouteRef = computed(() => (props.route || injectedRoute).matched[depth])

    provide(viewDepthKey, depth + 1)

    provide(matchedRouteKey, matchedRouteRef)

    const viewRef = ref()

    watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {

      if (to) {

        to.instances[name] = instance

        if (from && instance === oldInstance) {

          to.leaveGuards = from.leaveGuards

          to.updateGuards = from.updateGuards

        }

      }

      if (instance &&

        to &&

        (!from || !isSameRouteRecord(to, from) || !oldInstance)) {

        (to.enterCallbacks[name] || []).forEach(callback => callback(instance))

      }

    })

    return () => {

      const route = props.route || injectedRoute

      const matchedRoute = matchedRouteRef.value

      const ViewComponent = matchedRoute && matchedRoute.components[props.name]

      const currentName = props.name

      if (!ViewComponent) {

        return slots.default

          ? slots.default({ Component: ViewComponent, route })

          : null

      }

      const routePropsOption = matchedRoute.props[props.name]

      const routeProps = routePropsOption

        ? routePropsOption === true

          ? route.params

          : typeof routePropsOption === 'function'

            ? routePropsOption(route)

            : routePropsOption

        : null

      const onVnodeUnmounted = vnode => {

        if (vnode.component.isUnmounted) {

          matchedRoute.instances[currentName] = null

        }

      }

      const component = h(ViewComponent, assign({}, routeProps, attrs, {

        onVnodeUnmounted,

        ref: viewRef,

      }))

      return (

        slots.default

          ? slots.default({ Component: component, route })

          : component)

    }

  },

})


```


那么接下来，我们就来看路径对象中的 matched 的值是怎么在路径切换的情况下更新的。

```js

import { createApp } from 'vue'

import { createRouter, createWebHashHistory } from 'vue-router'

const Home = { template: '<div>Home</div>' }

const About = {

  template: `<div>About

  <router-link to="/about/user">Go User</router-link>

  <router-view></router-view>

  </div>`

}

const User = {

  template: '<div>User</div>,'

}

const routes = [

  { path: '/', component: Home },

  {

    path: '/about',

    component: About,

    children: [

      {

        path: 'user',

        component: User

      }

    ]

  }

]

const router = createRouter({

  history: createWebHashHistory(),

  routes

})

const app = createApp({})

app.use(router)

app.mount('#app')


```

它和前面示例的区别在于，我们在 About 路由组件中又嵌套了一个 RouterView 组件，
然后对 routes 数组中 path 为 /about 的路径配置扩展了 children 属性，对应的就是 About 组件嵌套路由的配置。


当我们执行 createRouter 函数创建路由的时候，内部会执行如下代码来创建一个 matcher 对象：

```js

const matcher = createRouterMatcher(options.routes, options)
```

执行了createRouterMatcher 函数，并传入 routes 路径配置数组，
它的目的就是根据路径配置对象创建一个路由的匹配对象，再来看它的实现：



```js

function createRouterMatcher(routes, globalOptions) {

  const matchers = []

  const matcherMap = new Map()

  globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions)

  function addRoute(record, parent, originalRecord) {

    let isRootAdd = !originalRecord

    let mainNormalizedRecord = normalizeRouteRecord(record)

    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record

    const options = mergeOptions(globalOptions, record)

    const normalizedRecords = [

      mainNormalizedRecord,

    ]

    let matcher

    let originalMatcher

    for (const normalizedRecord of normalizedRecords) {

      let { path } = normalizedRecord

      if (parent && path[0] !== '/') {

        let parentPath = parent.record.path

        let connectingSlash = parentPath[parentPath.length - 1] === '/' ? '' : '/'

        normalizedRecord.path =

          parent.record.path + (path && connectingSlash + path)

      }

      matcher = createRouteRecordMatcher(normalizedRecord, parent, options)

      if ( parent && path[0] === '/')

        checkMissingParamsInAbsolutePath(matcher, parent)

      if (originalRecord) {

        originalRecord.alias.push(matcher)

        {

          checkSameParams(originalRecord, matcher)

        }

      }

      else {

        originalMatcher = originalMatcher || matcher

        if (originalMatcher !== matcher)

          originalMatcher.alias.push(matcher)

        if (isRootAdd && record.name && !isAliasRecord(matcher))

          removeRoute(record.name)

      }

      if ('children' in mainNormalizedRecord) {

        let children = mainNormalizedRecord.children

        for (let i = 0; i < children.length; i++) {

          addRoute(children[i], matcher, originalRecord && originalRecord.children[i])

        }

      }

      originalRecord = originalRecord || matcher

      insertMatcher(matcher)

    }

    return originalMatcher

      ? () => {

        removeRoute(originalMatcher)

      }

      : noop

  }

  function insertMatcher(matcher) {

    let i = 0

    while (i < matchers.length &&

    comparePathParserScore(matcher, matchers[i]) >= 0)

      i++

    matchers.splice(i, 0, matcher)

    if (matcher.record.name && !isAliasRecord(matcher))

      matcherMap.set(matcher.record.name, matcher)

  }

  // 定义其它一些辅助函数

  // 添加初始路径

  routes.forEach(route => addRoute(route))

  return { addRoute, resolve, removeRoute, getRoutes, getRecordMatcher }

}


```


在 createRouterMatcher 函数的最后，会遍历 routes 路径数组调用 addRoute 方法添加初始路径。

在 addRoute 函数内部，首先会把 route 对象标准化成一个 record，其实就是给路径对象添加更丰富的属性。


后再执行createRouteRecordMatcher 函数，传入标准化的 record 对象，我们再来看它的实现：


```js

function createRouteRecordMatcher(record, parent, options) {

  const parser = tokensToParser(tokenizePath(record.path), options)

  {

    const existingKeys = new Set()

    for (const key of parser.keys) {

      if (existingKeys.has(key.name))

        warn(`Found duplicated params with name "${key.name}" for path "${record.path}". Only the last one will be available on "$route.params".`)

      existingKeys.add(key.name)

    }

  }

  const matcher = assign(parser, {

    record,

    parent,

    children: [],

    alias: []

  })

  if (parent) {

    if (!matcher.record.aliasOf === !parent.record.aliasOf)

      parent.children.push(matcher)

  }

  return matcher

}


```

其实 createRouteRecordMatcher 创建的 matcher 对象不仅仅拥有 record 属性来存储 record，
还扩展了一些其他属性，需要注意，如果存在 parent matcher，那么会把当前 matcher 添加到 parent.children 中去，
这样就维护了父子关系，构造了树形结构。




```js


function resolve(location, currentLocation) {

  let matcher

  let params = {}

  let path

  let name

  if ('name' in location && location.name) {

    matcher = matcherMap.get(location.name)

    if (!matcher)

      throw createRouterError(1 /* MATCHER_NOT_FOUND */, {

        location,

      })

    name = matcher.record.name

    params = assign(

      paramsFromLocation(currentLocation.params,

        matcher.keys.filter(k => !k.optional).map(k => k.name)), location.params)

    path = matcher.stringify(params)

  }

  else if ('path' in location) {

    path = location.path

    if ( !path.startsWith('/')) {

      warn(`The Matcher cannot resolve relative paths but received "${path}". Unless you directly called \`matcher.resolve("${path}")\`, this is probably a bug in vue-router. Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/vue-router-next.`)

    }

    matcher = matchers.find(m => m.re.test(path))

    if (matcher) {

      params = matcher.parse(path)

      name = matcher.record.name

    }

  }

  else {

    matcher = currentLocation.name

      ? matcherMap.get(currentLocation.name)

      : matchers.find(m => m.re.test(currentLocation.path))

    if (!matcher)

      throw createRouterError(1 /* MATCHER_NOT_FOUND */, {

        location,

        currentLocation,

      })

    name = matcher.record.name

    params = assign({}, currentLocation.params, location.params)

    path = matcher.stringify(params)

  }

  const matched = []

  let parentMatcher = matcher

  while (parentMatcher) {

    matched.unshift(parentMatcher.record)

    parentMatcher = parentMatcher.parent

  }

  return {

    name,

    path,

    params,

    matched,

    meta: mergeMetaFields(matched),

  }

}


```

resolve 函数主要做的事情就是根据 location 的 name 或者 path 从我们前面创建的 matchers 数组中找到对应的 matcher，
然后再顺着 matcher 的 parent 一直找到链路上所有匹配的 matcher，然后获取其中的 record 属性构造成一个 matched 数组，
最终返回包含 matched 属性的新的路径对象。





### 导航守卫的实现


导航守卫主要是让用户在路径切换的生命周期中可以注入钩子函数，
执行一些自己的逻辑，也可以取消和重定向导航，举个应用的例子：

```js

router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' }) else {
    next()
  }
})

```

router.beforeEach 传入的参数是一个函数，我们把这类函数就称为导航守卫。


```js

function navigate(to, from) {

  let guards

  const [leavingRecords, updatingRecords, enteringRecords,] = extractChangingRecords(to, from)

  guards = extractComponentsGuards(leavingRecords.reverse(), 'beforeRouteLeave', to, from)

  for (const record of leavingRecords) {

    for (const guard of record.leaveGuards) {

      guards.push(guardToPromiseFn(guard, to, from))

    }

  }

  const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from)

  guards.push(canceledNavigationCheck)

  return (runGuardQueue(guards)

    .then(() => {

      guards = []

      for (const guard of beforeGuards.list()) {

        guards.push(guardToPromiseFn(guard, to, from))

      }

      guards.push(canceledNavigationCheck)

      return runGuardQueue(guards)

    })

    .then(() => {

      guards = extractComponentsGuards(updatingRecords, 'beforeRouteUpdate', to, from)

      for (const record of updatingRecords) {

        for (const guard of record.updateGuards) {

          guards.push(guardToPromiseFn(guard, to, from))

        }

      }

      guards.push(canceledNavigationCheck)

      return runGuardQueue(guards)

    })

    .then(() => {

      guards = []

      for (const record of to.matched) {

        if (record.beforeEnter && from.matched.indexOf(record) < 0) {

          if (Array.isArray(record.beforeEnter)) {

            for (const beforeEnter of record.beforeEnter)

              guards.push(guardToPromiseFn(beforeEnter, to, from))

          }

          else {

            guards.push(guardToPromiseFn(record.beforeEnter, to, from))

          }

        }

      }

      guards.push(canceledNavigationCheck)

      return runGuardQueue(guards)

    })

    .then(() => {

      to.matched.forEach(record => (record.enterCallbacks = {}))

      guards = extractComponentsGuards(enteringRecords, 'beforeRouteEnter', to, from)

      guards.push(canceledNavigationCheck)

      return runGuardQueue(guards)

    })

    .then(() => {

      guards = []

      for (const guard of beforeResolveGuards.list()) {

        guards.push(guardToPromiseFn(guard, to, from))

      }

      guards.push(canceledNavigationCheck)

      return runGuardQueue(guards)

    })

    .catch(err => isNavigationFailure(err, 8 /* NAVIGATION_CANCELLED */)

      ? err

      : Promise.reject(err)))

}


```

guardToPromiseFn 函数返回一个新的函数，这个函数内部会执行 guard 函数


