(function (self, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        // 当前环境是CommonJS规范环境
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        // 当前环境是AMD规范环境
        define(factory)
    }
    else {
        self.umdModule = factory();
    }
}(this, function () {
    // 真正要定义的模块代码
    return function () {
        return Math.random();
    }
}))