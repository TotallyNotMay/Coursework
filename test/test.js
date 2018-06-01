'use strict';

const createTree = require("../rbtree.js");

let tree = createTree();

tree = tree.insert(7, "quux");
tree = tree.insert(2, "bar");
tree = tree.insert(1, "foo");
tree = tree.insert(5, "qux");
tree = tree.insert(4, "baz");
tree = tree.insert(11, "grault");
tree = tree.insert(8, "corge");
tree = tree.insert(14, "garply");
tree = tree.insert(15, "waldo");

console.dir(tree.print);

tree = tree.remove(7);

/*
RED   = 0;
BLACK = 1;
*/

console.log();
console.dir(tree.print);
