function Parent(name, actions) {
    this.name = name;
    this.actions = actions;
}

function Child(id, name, actions) {
    Parent.apply(this, Array.from(arguments).slice(1))
    this.id = id;
}

const child1 = new Child(1, "c1", ["eat"]);
const child2 = new Child(2, "c2", ["sing", "jump", "rap"]);
console.log(child1.name); // c1
console.log(child2.name); // c2


