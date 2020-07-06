const util = {
    model(node, value, vm, detail) {
        // 完成数据获取与绑定
        // console.log("model", node, value, "vm", detail)
        const oldVal = this.getValue(value, vm);
        new Watcher(value, vm, (newVal) => {
            this.updater.modelUpdate(node, newVal);
        })
        node.addEventListener("input", (e) => {
            this.setVal(value, vm, e.target.value)
        })
        this.updater.modelUpdate(node, oldVal);
    },
    on(node, value, vm, detail) {
        // console.log("on", node, value, "vm", detail)
        const fn = vm.$options.methods[value];
        if (fn) {
            // console.log(fn)
            node.addEventListener(detail, fn.bind(vm));
        }
    },
    text(node, content, vm) {
        let value;
        if (content.includes("{{")) {
            value = content.replace(/\{\{(.+)\}\}/g, (...args) => {
                new Watcher(args[1], vm, (newVal) => {
                    this.updater.textUpdate(node, newVal)
                    // this.updater.textUpdate(node, this.getContent(content, vm));
                })
                return this.getValue(args[1], vm)
            })
            console.log("---text value", value);
        }
        else {
            value = this.getValue(content, vm);
        }
        this.updater.textUpdate(node, value);
    },
    updater: {
        textUpdate(node, value) {
            node.textContent = value
        },
        modelUpdate(node, value) {
            node.value = value
        }
    },
    getValue(expr, vm) {
        return vm.$data[expr]
    },
    setVal(expr, vm, newVal) {
        vm.$data[expr] = newVal
    },
    getContent(content, vm) {
        return content.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getValue(args[1], vm)
        })
    }


}

class Dep {
    constructor() {
        this.dep = [];
    }
    addWatcher(watcher) {
        this.dep.push(watcher);
    }
    notify() {
        this.dep.forEach(watcher => {
            watcher.update()
        })
    }

}

class Watcher {
    constructor(expr, vm, cb) {
        this.expr = expr;
        this.vm = vm;
        this.cb = cb;
        this.oldVal = this.getOldVal()
    }
    getOldVal() {
        Dep.target = this;
        const oldVal = util.getValue(this.expr, this.vm);
        Dep.target = null;
        return oldVal;
    }
    update() {
        const newVal = util.getValue(this.expr, this.vm);
        if (newVal !== this.oldVal) {
            this.cb(newVal)
        }
    }

}


class Observer {
    constructor(data) {
        this.observe(data)
    }

    observe(data) {
        if (data && typeof data === "object") {
            Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key])
            })
        }
    }

    defineReactive(obj, key, value) {
        this.observe(value);
        const dep = new Dep();
        const self = this;
        Object.defineProperty(obj, key, {
            get() {
                if (Dep.target) {
                    dep.addWatcher(Dep.target);
                }
                return value;
            },
            set(newVal) {
                if (newVal === value) return;
                self.observe(newVal);
                value = newVal;
                dep.notify()
            }
        })
    }

}

class Compiler {
    constructor(el, vm) {
        this.el = this.isElement(el) ? el : document.querySelector(el);
        this.vm = vm;
        // 创建文档碎片，优化整体更新性能
        const fragment = this.createFragment(this.el);
        // 处理文档碎片中，node节点模板语法
        this.compile(fragment)
        this.el.appendChild(fragment)

    }
    isElement(el) {
        return el.nodeType === 1;
    }
    createFragment(el) {
        // console.dir(el)
        // 创建文档碎片，把el内容挪到文档碎片中去，
        // 后继如果继续使用DOM更新，不会触发真正的UI更新，提升性能
        const f = document.createDocumentFragment();
        let firstChild;

        while (firstChild = el.firstChild) {
            f.appendChild(firstChild)
        }
        return f;
    }
    compile(fragment) {
        const childNodes = Array.from(fragment.childNodes);
        childNodes.forEach(child => {
            // console.log(child)
            if (this.isElement(child)) {
                //    元素标签节点，要处理标签的属性
                this.compileElement(child)
            }
            else {
                //  文本节点，处理{{}}语法
                this.compileText(child)
            }
            // 当前面节点有子元素
            if (child.childNodes && child.childNodes.length) {
                this.compile(child)
            }
        })

    }
    compileElement(node) {
        const attributes = Array.from(node.attributes);
        // console.log(attributes)
        attributes.forEach(attribute => {
            const { name, value } = attribute;

            if (this.isDirector(name)) {
                //    指令v-
                const [, directive] = name.split('-');
                const [key, detail] = directive.split(':');
                // console.log("指令", key, detail, value)
                util[key](node, value, this.vm, detail);

                node.removeAttribute(`v-${directive}`)
            }
        })
    }
    compileText(node) {
        // 文本节点处理 {{}}
        const content = node.textContent;
        if (/\{\{(.+)\}\}/.test(content)) {
            console.log(content);
            util['text'](node, content, this.vm)
        }
    }
    isDirector(name) {
        return name.startsWith("v-");
    }
    isEventName(name) {
        return name.startsWith("@")
    }
}

class Vue {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        this.$options = options;
        if (this.$el) {
            //    1、模板编译
            //    2、数据劫持

            new Observer(this.$data)
            new Compiler(this.$el, this)
            this.proxyData(this.$data);
        }
    }

    proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set(newValue) {
                    data[key] = newValue
                }
            })
        })

    }
}