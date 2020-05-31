class HistoryRouter {
    constructor() {
        this.routes = {};
        this.init = this.init.bind(this)
        this.init(location.pathname)
    }
    init(path) {
        window.history.replaceState({ path }, null, path)
        const cb = this.routes[path]
        if (cb) {
            cb();
        }
    }
    route(path, callback) {
        this.routes[path] = callback || function () { }
    }
    go(path) {
        //  页面跳转
        window.location.pushState({
            path
        }, null, path)
        const cb = this.routes[path]
        if (cb) {
            cb()
        }
    }
    _bindPopState() {
        // 演示一下popstate事件触发后，会发生什么
        window.addEventListener('popstate', (e) => {
            const path = e.state && e.state.path;
            this.routes[path] && this.routes[path]()
        })
    }
}


const Router = new HashRouter()


Router.route("/", function () {

})