function Person() {
    this.name = 1;
}
Person.prototype = {
    name: 2, show: function () {
        console.log('name is:', this.name);
    }
};
Person.prototype.show();
(new Person()).show();