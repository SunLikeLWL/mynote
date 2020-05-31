class HashRouter {
    constructor() {
        this.routes = {},
            this.refresh = this.refresh.bind(this);
        window.addEventListener("load", this.refresh)
        window.addEventListener("hashchange", this.refresh)
    }
    route(path, callback) {
        // 存储回调函数
        this.routes[path] = callback || function () { }
    }
    refresh() {
        const path = `/${location.hash.slice(1) || ''}`;
        this.routes[path]();
    }
}


const Router = new HashRouter()


Router.route("/", function () {

})