const esprima = require('esprima');
const fs = require('fs');

function printMochaStatementsFromFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  printMochaStatements(code);
}

function printMochaStatements(code) {
  const ast = esprima.parseScript(code);
  let indentLevel = 0;

  function getIndentation() {
    return '  '.repeat(indentLevel);
  }

  function walkNode(node, callback) {
    callback(node);
    for (const key in node) {
      if (
        node.hasOwnProperty(key) &&
        typeof node[key] === 'object' &&
        node[key] !== null
      ) {
        walkNode(node[key], callback);
      }
    }

    // Decrement indent level after exiting a describe or context block.
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
      const { name } = node.callee;
      if (
        ['describe', 'context'].includes(name)
      ) {
        indentLevel--;
      }
    }
  }

  walkNode(ast, (node) => {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
      const { name } = node.callee;
      if (
        ['describe', 'context', 'it'].includes(name) &&
        node.arguments.length > 0
      ) {
        const arg = node.arguments[0];
        if (arg.type === 'Literal') {
          console.log(`${getIndentation()}${name}: ${arg.value}`);
          if (name === 'describe' || name === 'context') {
            indentLevel++;
          }
        }
      }
    } else if (
      node.type === 'FunctionExpression' &&
      node.parent &&
      node.parent.type === 'CallExpression'
    ) {
      const parentName = node.parent.callee.name;
      if (['describe', 'context'].includes(parentName)) {
        indentLevel--;
      }
    }
  });
}

const filePath = '../api/src/t/j/r/renew-actions.js';
printMochaStatementsFromFile(filePath);
