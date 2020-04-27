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


    const script = new vm.Script(resultContent);

    const func = script.runInThisContext();

    const m = { exports: {} }

    func(customRequire, m, m.exports);
    return m.exports;
}


global.customRequire = customRequire;