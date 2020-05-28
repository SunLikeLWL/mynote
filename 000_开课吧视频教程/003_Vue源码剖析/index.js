var Factory = function () {
    this.a = 'a';
    this.b = 'b';
    this.c = {
        a: "a+",
        b: () => this.a
    }
}
console.log(new Factory().c.b())