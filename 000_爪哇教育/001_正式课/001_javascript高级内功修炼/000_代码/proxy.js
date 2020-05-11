var obj = new Proxy({}, {
    get: function (target, propKey, receiver) {
        return Reflect.get(target, propKey, receiver)
    },
    set: function (target, propKey, value, receiver) {
        return Reflect.set(target, propKey, value, receiver)
    }

})