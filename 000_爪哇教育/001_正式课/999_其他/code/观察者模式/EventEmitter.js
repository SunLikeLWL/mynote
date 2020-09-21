class EventEmitter {
    constructor() {
        this._events = {}
    }
    //查看监听的事件是否存在，不存在就初始化为空数组。存在直接push对应的回调
    on(name, cb) {
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(cb);
    }
    // 将对应事件名的回调数组依次执⾏⼀遍
    emit(name, ...args) {
        if (!this._events[name]) return
        for (const fn of this._events[name]) {
            fn.apply(null, args)
        }
    }
    // 如果监听的事件不存在，直接返回；如果存在则找到数组中的回调并且移除
    off(name, cb) {
        if (!this._events[name]) return
        const index = this._events[name].findIndex(evt => evt === cb)
        if (index >= 0) {
            this._events[name].splice(index, 1)
        }
    }
}


// on 为指定事件注册⼀个监听器，接受⼀个字符串 event 和⼀个回调函数。
// emit 按监听器的顺序执⾏执⾏每个监听器
// off 移除指定事件的某个监听回调