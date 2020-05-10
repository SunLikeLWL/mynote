function Parent(name, actions) {
    this.name = name;
    this.actions = actions;
}

Parent.prototype.eat = function () {
    console.log(this.name + "-eat")
}


function Child(id) {
    Parent.apply(this, Array.from(arguments).slice(1))
    this.id = id;
}

Child.prototype = new Parent();
Child.prototype.constructor = Child;

const child1 = new Child(1, "c1", ["eat"]);
const child2 = new Child(2, "c2", ["run"]);
child1.eat(); // c1 - eat
child2.eat(); // c2 - eat
console.log(child1.eat === child2.eat); // true
