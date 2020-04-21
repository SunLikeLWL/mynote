const isFunction = variable => typeof variable === 'function';


// 定义Promise的三个状态

const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECT";

class Promise {
    constructor(handle) {
        this._status = PENDING;// 当前状态
        this._value = undefined;// 当前值
        this._fulfilledQueues = [];// 添加成功回调函数队列
        this._rejectedQueues = [];// 添加失败回调函数队列

        try {
            handle(this._resolve.bind(this), this._reject.bind(this));
        }
        catch (err) {
            this._reject(err)
        }
    }

    _resolve(val) {
        const run = () => {
            if (this._status !== PENDING) {
                // 依次执行成功队列中的函数，并清空队列
                const runFulfilled = (value) => {
                    let cb;
                    while (cb = this._fulfilledQueues.shift()) {
                        cb(value)
                    }
                }
                // 依次执行失败队列中的函数，并清空队列
                const runRejected = (error) => {
                    let cb;
                    while (cb = this._rejectedQueues.shift()) {
                        cb(error);
                    }
                }
                // 如果resolve的参数为Promise对象，则必须等待该Promise对象状态改变后，
                // 当前Promise的状态才会改变，且状态取决于参数Promise对象的状态
                if (val instanceof Promise) {
                    val.then(value => {
                        this._value = value;
                        this._status = FULFILLED;
                        runFulfilled(value)
                    }, err => {
                        this._value = err;
                        this._status = REJECTED;
                        runRejected(err)
                    })
                }
                else {
                    this._value = val;
                    this._status = FULFILLED;
                    runFulfilled(val)
                }
            }
        }
        setTimeout(run, 0)
    }
    _reject(err) {
        if (this._status !== PENDING) return;
        // 依次执行失败队列中的函数，并清空队列
        const run = () => {
            this._status = REJECTED;
            this._value = err;
            let cb;
            while (cb = this._rejectedQueues.shift()) {
                cb(err);
            }
        }
        // 为了支持同步的Promise，这里采用异步调用
        serTimeout(run, 0)
    }


    then(onFulfilled, onRejected) {
        const {
            _value,
            _status
        } = this;
        // 返回一个新的Promise
        return new Promise((onFulfilled, onRejected) => {
            //    封装一个成功时执行的函数
            let fulfilled = value => {
                try {
                    if (!isFunction(onFulfilled)) {
                        onFulfilledNext(value);
                    }
                    else {
                        let res = onFulfilled(value);
                        if (res instanceof Promise) {
                            // 如果当前回调函数返回Promise对象，必须等待其状态改变后再执行下一个回调
                            res.then(onFulfilledNext, onRejectedNext)
                        } else {
                            //  否则会将返回结果直接作为参数，传入下一个then的回调函数
                            onFulfilledNext(res);
                        }
                    }
                }
                catch (err) {
                    // 如果函数执行出错，新的Promise对象的状态为失败
                    onRejectedNext(err);
                }
            }
            let rejected = error => {
                try {
                    if (!isFunction(onRejected)) {
                        onRejectedNext(error);
                    }
                    else {
                        let res = onRejected(error);
                        if (res instanceof Promise) {
                            //    如果当前回调函数返回Promise对象，必须等待其状态改变后再执行下一个回调
                            re.then(onFulfilledNext, onRejectedNext)
                        }
                        else {
                            // 否则会将返回结果作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                            onFulfilledNext(res);
                        }
                    }



                } catch (error) {
                    // 如果函数执行出错，新的Promise对象的状态为失败
                    onRejectedNext(err);
                }
            }

            switch (_status) {
                // 当状态为pending时，将then方法回调函数加入执行队列等待执行
                case PENDING:
                    this._fulfilledQueues.push(fulfilled);
                    this._rejectedQueues.push(rejected);
                    break;
                // 当状态已经改变时，立即执行对应的回调函数
                case FULFILLED:
                    fulfilled(_value);
                    break;
                case REJECTED:
                    rejected(_value);
                    break;
            }

        })

    }


    catch(onRejected) {
        return this.then(null, onRejected);
    }

    static resolve(value) {
        // 如果参数是Promise实例，直接返回这个实例
        if (value instanceof Promise) return value;
        return new Promise(resolve => resolve(value));
    }

    static reject(value) {
        return new Promise((resolve, reject) => {
            reject(value);
        })
    }


    static all(list) {
        return new Promise((resolve, reject) => {
            let values = [];
            let count = 0;
            for (let [i, p] of list.entries()) {
                // 数组参数如果不是Promise实例，先调用Promise.resolve
                this.resolve(p).then(res => {
                    values[i] = res;
                    count++;
                    // 所有状态都变成fulfilled时返回的Promise状态就变成fulfilled
                    if (count === list.length) {
                        resolve(values);
                    }
                }, err => {
                    // 有一个被rejected时返回的Promise状态就变成rejected
                    rejected(err);

                })
            }
        })
    }

    static race(list) {
        return new Promise((resolve, reject) => {
            for (let p of list) {
                // 只要有一个实例率先改变状态，新的Promise的状态就跟着改变
                this.resolve(p).then(res => {
                    resolve(res)
                }, err => {
                    rejected(err)
                })
            }
        })
    }
}


