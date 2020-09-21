class Eager {
    static instance = new Eager("eager");
    constructor(name) {
        console.log(name);
        this.name = name;
    }
}

module.exports = { Eager }