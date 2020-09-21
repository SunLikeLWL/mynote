class Lazy {
    static instance = null;
    static getInstance() {
        if (!Lazy.instance) {
            Lazy.instance = new Lazy('lazy');
            return Lazy.instance;
        }
    }
    constructor(name) {
        console.log("lazy constructor");
        this.name = name;
    }
}

module.exports = { Lazy }