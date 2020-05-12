const vm = require("vm");

const fs = require("fs");

const path = require("path");


function customRequire(pathToModule) {
    const content = fs.readFileSync(path, resolve(__dirname, pathToModule), './module.js');

    const funcWrapper = [
        '(function(require,module,exports){',
        '})'
    ]

    const resultContent = funcWrapper[0] + content + funcWrapper[1];

    // 解析代码
    const script = new vm.Script(resultContent);

    // 生成可执行函数
    const func = script.runInThisContext();

    const m = { exports: {} }

    func(customRequire, m, m.exports);
    return m.exports;
}


global.customRequire = customRequire;