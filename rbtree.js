'use strict';

module.exports = createRBTree;

const RED   = 0;
const BLACK = 1;

//Default comparison function
function defaultCompare(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function RBNode(color, key, value, left, right, count) {
  this.color = color;
  this.key = key;
  this.value = value;
  this.left = left;
  this.right = right;
  this.count = count;
}

function cloneNode(node) {
  return new RBNode(node.color, node.key, node.value, node.left, node.right, node.count);
}

function repaint(color, node) {
  return new RBNode(color, node.key, node.value, node.left, node.right, node.count);
}

function recount(node) {
  node.count = 1 + (node.left ? node.left.count : 0) + (node.right ? node.right.count : 0);
}

function RedBlackTree(compare, root) {
  this.compare = compare;
  this.root = root;
}

function RedBlackTreeIterator(tree, stack) {
  this.tree = tree;
  this.stack = stack;
}

const proto = RedBlackTree.prototype;
const iproto = RedBlackTreeIterator.prototype;

//Builds a tree
function createRBTree(compare) {
  return new RedBlackTree(compare || defaultCompare, null);
}

//Inserts a new item into the tree
proto.insert = function(key, value) {
  const compare = this.compare;
  //Find a point to insert new node at
  let element = this.root;
  const elementStack = [];
  const comparisonStack = [];
  while (element) {
    const comparison = compare(key, element.key);
    elementStack.push(element);
    comparisonStack.push(comparison);
    if (comparison <= 0) {
      element = element.left;
    } else {
      element = element.right;
    }
  }
  elementStack.push(new RBNode(RED, key, value, null, null, 1));
  for (let i = elementStack.length - 2; i >= 0; --i) {
    const element = elementStack[i];
    if (comparisonStack[i] <= 0) {
      elementStack[i] = new RBNode(element.color, element.key, element.value, elementStack[i + 1], element.right, element.count + 1);
    } else {
      elementStack[i] = new RBNode(element.color, element.key, element.value, element.left, elementStack[i + 1], element.count + 1);
    }
  }
  //Rebalance the tree
  for (let i = elementStack.length - 1; i > 1; --i) {
    const parent = elementStack[i - 1];
    const element = elementStack[i];
    if (parent.color === BLACK || element.color === BLACK) {
      break;
    }
    const grandParent = elementStack[i - 2];
    if (grandParent.left === parent) {
      if (parent.left === element) {
        const uncle = grandParent.right;
        if (uncle && uncle.color === RED) {
          //LLr
          parent.color = BLACK;
          grandParent.right = repaint(BLACK, uncle);
          grandParent.color = RED;
          i -= 1;
        } else {
          //LLb
          grandParent.color = RED;
          grandParent.left = parent.right;
          parent.color = BLACK;
          parent.right = grandParent;
          elementStack[i - 2] = parent;
          elementStack[i - 1] = element;
          recount(grandParent);
          recount(parent);
          if (i >= 3) {
            const greatGrandParent = elementStack[i - 3];
            if (greatGrandParent.left === grandParent) {
              greatGrandParent.left = parent;
            } else {
              greatGrandParent.right = parent;
            }
          }
          break;
        }
      } else {
        const uncle = grandParent.right;
        if (uncle && uncle.color === RED) {
          //LRr
          parent.color = BLACK;
          grandParent.right = repaint(BLACK, uncle);
          grandParent.color = RED;
          i -= 1;
        } else {
          //LRb
          parent.right = element.left;
          grandParent.color = RED;
          grandParent.left = element.right;
          element.color = BLACK;
          element.left = parent;
          element.right = grandParent;
          elementStack[i - 2] = element;
          elementStack[i - 1] = parent;
          recount(grandParent);
          recount(parent);
          recount(element);
          if (i >= 3) {
            const greatGrandParent = elementStack[i - 3];
            if (greatGrandParent.left === grandParent) {
              greatGrandParent.left = element;
            } else {
              greatGrandParent.right = element;
            }
          }
          break;
        }
      }
    } else if (parent.right === element) {
      const uncle = grandParent.left;
      if (uncle && uncle.color === RED) {
        //RRr
        parent.color = BLACK;
        grandParent.left = repaint(BLACK, uncle);
        grandParent.color = RED;
        i -= 1;
      } else {
        //RRb
        grandParent.color = RED;
        grandParent.right = parent.left;
        parent.color = BLACK;
        parent.left = grandParent;
        elementStack[i - 2] = parent;
        elementStack[i - 1] = element;
        recount(grandParent);
        recount(parent);
        if (i >= 3) {
          const greatGrandParent = elementStack[i - 3];
          if (greatGrandParent.right === grandParent) {
            greatGrandParent.right = parent;
          } else {
            greatGrandParent.left = parent;
          }
        }
        break;
      }
    } else {
      const uncle = grandParent.left;
      if (uncle && uncle.color === RED) {
        //RLr
        parent.color = BLACK;
        grandParent.left = repaint(BLACK, uncle);
        grandParent.color = RED;
        i -= 1;
      } else {
        //RLb
        parent.left = element.right;
        grandParent.color = RED;
        grandParent.right = element.left;
        element.color = BLACK;
        element.right = parent;
        element.left = grandParent;
        elementStack[i - 2] = element;
        elementStack[i - 1] = parent;
        recount(grandParent);
        recount(parent);
        recount(element);
        if (i >= 3) {
          const greatGrandParent = elementStack[i - 3];
          if (greatGrandParent.right === grandParent) {
            greatGrandParent.right = element;
          } else {
            greatGrandParent.left = element;
          }
        }
        break;
      }
    }
  }
  //Return new tree
  elementStack[0].color = BLACK;
  return new RedBlackTree(compare, elementStack[0]);
};

//Returns an iterator pointing to the item with 'key' if it exists
proto.find = function(key) {
  const compare = this.compare;
  let element = this.root;
  const stack = [];
  while (element) {
    const comparison = compare(key, element.key);
    stack.push(element);
    if (comparison === 0) {
      return new RedBlackTreeIterator(this, stack);
    }
    if (comparison <= 0) {
      element = element.left;
    } else {
      element = element.right;
    }
  }
  return new RedBlackTreeIterator(this, []);
};

//Swaps two nodes
function swapNode(firstNode, secondNode) {
  firstNode.key = secondNode.key;
  firstNode.value = secondNode.value;
  firstNode.left = secondNode.left;
  firstNode.right = secondNode.right;
  firstNode.color = secondNode.color;
  firstNode.count = secondNode.count;
}

//Fixes up a double black node in a tree
function fixDoubleBlack(stack) {
  let element, parent, sibling, nephew;
  for (let i = stack.length - 1; i >= 0; --i) {
    element = stack[i];
    if (i === 0) {
      element.color = BLACK;
      return;
    }
    parent = stack[i - 1];
    if (parent.left === element) {
      //Left child
      sibling = parent.right;
      if (sibling.right && sibling.right.color === RED) {
        //Right red nephew
        sibling = parent.right = cloneNode(sibling);
        nephew = sibling.right = cloneNode(sibling.right);
        parent.right = sibling.left;
        sibling.left = parent;
        sibling.right = nephew;
        sibling.color = parent.color;
        element.color = BLACK;
        parent.color = BLACK;
        nephew.color = BLACK;
        recount(parent);
        recount(sibling);
        if (i > 1) {
          const grandParent = stack[i - 2];
          if (grandParent.left === parent) {
            grandParent.left = sibling;
          } else {
            grandParent.right = sibling;
          }
        }
        stack[i - 1] = sibling;
        return;
      } else if (sibling.left && sibling.left.color === RED) {
        //Left red nephew
        sibling = parent.right = cloneNode(sibling);
        nephew = sibling.left = cloneNode(sibling.left);
        parent.right = nephew.left;
        sibling.left = nephew.right;
        nephew.left = parent;
        nephew.right = sibling;
        nephew.color = parent.color;
        parent.color = BLACK;
        sibling.color = BLACK;
        element.color = BLACK;
        recount(parent);
        recount(sibling);
        recount(nephew);
        if (i > 1) {
          const grandParent = stack[i - 2];
          if (grandParent.left === parent) {
            grandParent.left = nephew;
          } else {
            grandParent.right = nephew;
          }
        }
        stack[i - 1] = nephew;
        return;
      }
      if (sibling.color === BLACK) {
        if (parent.color === RED) {
          //Black sibling, red parent
          parent.color = BLACK;
          parent.right = repaint(RED, sibling);
          return;
        } else {
          //Black sibling, black parent
          parent.right = repaint(RED, sibling);
          continue;
        }
      } else {
        //Red sibling
        sibling = cloneNode(sibling);
        parent.right = sibling.left;
        sibling.left = parent;
        sibling.color = parent.color;
        parent.color = RED;
        recount(parent);
        recount(sibling);
        if (i > 1) {
          const grandParent = stack[i - 2];
          if (grandParent.left === parent) {
            grandParent.left = sibling;
          } else {
            grandParent.right = sibling;
          }
        }
        stack[i - 1] = sibling;
        stack[i] = parent;
        if (i + 1 < stack.length) {
          stack[i + 1] = element;
        } else {
          stack.push(element);
        }
        i += 2;
      }
    } else {
      //Right child
      sibling = parent.left;
      if (sibling.left && sibling.left.color === RED) {
        //Left red nephew
        sibling = parent.left = cloneNode(sibling);
        nephew = sibling.left = cloneNode(sibling.left);
        parent.left = sibling.right;
        sibling.right = parent;
        sibling.left = nephew;
        sibling.color = parent.color;
        element.color = BLACK;
        parent.color = BLACK;
        nephew.color = BLACK;
        recount(parent);
        recount(sibling);
        if (i > 1) {
          const grandParent = stack[i - 2];
          if (grandParent.right === parent) {
            grandParent.right = sibling;
          } else {
            grandParent.left = sibling;
          }
        }
        stack[i - 1] = sibling;
        return;
      } else if (sibling.right && sibling.right.color === RED) {
        //Right red nephew
        sibling = parent.left = cloneNode(sibling);
        nephew = sibling.right = cloneNode(sibling.right);
        parent.left = nephew.right;
        sibling.right = nephew.left;
        nephew.right = parent;
        nephew.left = sibling;
        nephew.color = parent.color;
        parent.color = BLACK;
        sibling.color = BLACK;
        element.color = BLACK;
        recount(parent);
        recount(sibling);
        recount(nephew);
        if (i > 1) {
          const grandParent = stack[i - 2];
          if (grandParent.right === parent) {
            grandParent.right = nephew;
          } else {
            grandParent.left = nephew;
          }
        }
        stack[i - 1] = nephew;
        return;
      }
      if (sibling.color === BLACK) {
        if (parent.color === RED) {
          //Black sibling, red parent
          parent.color = BLACK;
          parent.left = repaint(RED, sibling);
          return;
        } else {
          //Black sibling, black parent
          parent.left = repaint(RED, sibling);
          continue;
        }
      } else {
        //Red sibling
        sibling = cloneNode(sibling);
        parent.left = sibling.right;
        sibling.right = parent;
        sibling.color = parent.color;
        parent.color = RED;
        recount(parent);
        recount(sibling);
        if (i > 1) {
          const grandParent = stack[i - 2];
          if (grandParent.right === parent) {
            grandParent.right = sibling;
          } else {
            grandParent.left = sibling;
          }
        }
        stack[i - 1] = sibling;
        stack[i] = parent;
        if (i + 1 < stack.length) {
          stack[i + 1] = element;
        } else {
          stack.push(element);
        }
        i += 2;
      }
    }
  }
}

//Removes item at iterator position from tree
iproto.remove = function() {
  const stack = this.stack;
  if (stack.length === 0) {
    return this.tree;
  }
  //Copy path to node
  const newStack = new Array(stack.length);
  let element = stack[stack.length - 1];
  newStack[newStack.length - 1] = new RBNode(element.color, element.key, element.value, element.left, element.right, element.count);
  for (let i = stack.length - 2; i >= 0; --i) {
    const element = stack[i];
    if (element.left === stack[i + 1]) {
      newStack[i] = new RBNode(element.color, element.key, element.value, newStack[i + 1], element.right, element.count);
    } else {
      newStack[i] = new RBNode(element.color, element.key, element.value, element.left, newStack[i + 1], element.count);
    }
  }
  element = newStack[newStack.length - 1];

  //If node has both children, then swap with previous node
  if (element.left && element.right) {
    const split = newStack.length;
    element = element.left;
    while (element.right) {
      newStack.push(element);
      element = element.right;
    }
    const i = newStack[split - 1];
    newStack.push(new RBNode(element.color, i.key, i.value, element.left, element.right, element.count));
    newStack[split - 1].key = element.key;
    newStack[split - 1].value = element.value;

    //Fix up stack
    for (let i = newStack.length - 2; i >= split; --i) {
      element = newStack[i];
      newStack[i] = new RBNode(element.color, element.key, element.value, element.left, newStack[i + 1], element.count);
    }
    newStack[split - 1].left = newStack[split];
  }

  //Start removing
  element = newStack[newStack.length - 1];
  if (element.color === RED) {
    //Red leaf
    const parent = newStack[newStack.length - 2];
    if (parent.left === element) {
      parent.left = null;
    } else if (parent.right === element) {
      parent.right = null;
    }
    newStack.pop();
    for (let i = 0; i < newStack.length; ++i) {
      newStack[i].count--;
    }
    return new RedBlackTree(this.tree.compare, newStack[0]);
  } else if (element.left || element.right) {
    //Black node, single child
    if (element.left) {
      swapNode(element, element.left);
    } else if (element.right) {
      swapNode(element, element.right);
    }
    element.color = BLACK;
    for (let i = 0; i < newStack.length - 1; ++i) {
      newStack[i].count--;
    }
    return new RedBlackTree(this.tree.compare, newStack[0]);
  } else if (newStack.length === 1) {
    //Root
    return new RedBlackTree(this.tree.compare, null);
  } else {
    //Black leaf
    for (let i = 0; i < newStack.length; ++i) {
      newStack[i].count--;
    }
    const fixParent = newStack[newStack.length - 2];
    fixDoubleBlack(newStack);
    //Fix up links
    if (fixParent.left === element) {
      fixParent.left = null;
    } else {
      fixParent.right = null;
    }
  }
  return new RedBlackTree(this.tree.compare, newStack[0]);
};

//Removes item with 'key' from the tree
proto.remove = function(key) {
  const point = this.find(key);
  if (point) {
    return point.remove();
  }
  return this;
};

//Visit all nodes in-order
function visitEach(visit, node) {
  if (node.left) {
    const visitor = visitEach(visit, node.left);
    if (visitor) {
      return visitor;
    }
  }
  const visitor = visit(node.color, node.key, node.value, node.left, node.right, node.count);
  if (visitor) {
    return visitor;
  }
  if (node.right) {
    return visitEach(visit, node.right);
  }
}

proto.forEach = function(visit) {
  if (!this.root) {
    return;
  } else {
    return visitEach(visit, this.root);
  }
};

//Print the tree
Object.defineProperty(proto, 'print', {
  get() {
    const result = [];
    this.forEach((color, key, value, left, right, count) => {
      result.push({
        color,
        key,
        value,
        left,
        right,
        count
      });
    });
    return result;
  }
});
