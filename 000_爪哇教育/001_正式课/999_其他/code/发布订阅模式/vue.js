observe(value) {
    if (!value || typeof value !== 'object') {
        return
    }
    // 遍历该对象
    Object.keys(value).forEach(key => {
        this.defineReactive(value, key, value[key])
        // 代理data的中属性到vue实例上
        this.proxyData(key)
    })
}
defineReactive(obj, key, val){
    this.observe(val); // 解决数据嵌套：递归
    const dep = new Dep();
    Object.defineProperty(obj, key, {
        get: function () {
            return val;
        },
        set: function (newVal) {
            if (val === newVal) {
                return
            }
            val = newVal;
        }
    })
}
proxyData(key) {
    // 执⾏⼀个代理proxy。这样我们就把data上⾯的属性代理到了vm实例上。
    Object.defineProperty(this, key, {
        get() {
            return this.$data[key];
        },
        set(newVal) {
            this.$data[key] = newVal
        }
    })
}

class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        // 在这⾥将观察者本身赋值给全局的target，只有被target标记过的才会进⾏依赖收集
        Dep.target = this;
        // 触发getter,添加依赖
        this.vm[this.key];
        Dep.target = null
    }
    update() {
        // 将回调函数代理到this.vm实例，并传⼊对应属性的value值
        this.cb.call(this.vm, this.vm[this.key]);
    }
}
class Dep {
    constructor() {
        this.deps = [];
    }
    addDep(dep) {
        this.deps.push(dep)
    }
    notify() {
        this.deps.forEach(dep => {
            dep.update()
        });
    }
}
defineReactive(obj, key, val){
    this.observe(val); // 解决数据嵌套：递归
    const dep = new Dep();
    Object.defineProperty(obj, key, {
        get: function () {
            /*Watcher对象存在全局的Dep.target中， 只有被target标记过的才会进⾏依赖
           收集*/
            Dep.target && dep.addDep(Dep.target)
            return val;
        },
        set: function (newVal) {
            if (val === newVal) {
                return
            }
            val = newVal;
            /*只有之前addSub中的函数才会触发*/
            dep.notify();
        }
    })
}