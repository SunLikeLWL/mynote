let activeEffect;


export function effect(fn) {
    // 默认effect需要执行一次
    activeEffect = fn;
    // 储存fn方法 数据变化 需要再次调用这个方法
    fn();
    activeEffect = null;
}


export function reactive(target) {
    return new Proxy(target, { // proxy不需要重写每一个属性
        set(target, key, value, receiver) { // 拦截器，性能更高，兼容性差
            // proxy中的set需要返回值
            // target[key] = value;
            const res = Reflect.set(target, key, value, receiver)
            activeEffect();
            return res
        },
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver)
            track(target, key);//依赖收集
            return res;
        }
    })
    //  p.a.b
    // 调用了两次get方法，第一次是访问p.a,第二次是访问p.a.b
}


const targetMap = new WeakMap();

function track(target, key) {
    // target key 多个effect
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    if (activeEffect && !deps.has(activeEffect)) {
        deps.add(activeEffect)
    }
}


function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return
    }
    const effects = depsMap.get(key);
    effects && effects.forEach(effect => effect())
}