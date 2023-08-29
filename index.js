#!/usr/bin/env node
// Run with `node index.js <file path>`
const espree = require("espree");
const fs = require('fs');
const chalk = require('chalk');

function printMochaStatementsFromFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  printMochaStatements(code);
}

function isMochaStatement(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    ['describe', 'context', 'it'].includes(node.callee.name)
  );
}

function isDescribeOrContext(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    ['describe', 'context'].includes(node.callee.name)
  );
}

function printStatement(mochaFunctionName, statement, indent) {
  const padding = '  '.repeat(indent);
  let line = '';
  if (mochaFunctionName === 'describe') {
    line += chalk.bold(statement);
  } else if (mochaFunctionName === 'context') {
    line += '- ';
    line += chalk.italic(statement);
  } else if (mochaFunctionName === 'it') {
    line += chalk.green(`  it ${statement}`);
  }
  console.log(`${padding}${line}`);
}

function printMochaStatements(code) {
  const ast = espree.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });

  let indentLevel = 0;

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
    if (isDescribeOrContext(node)) {
      indentLevel--;
    }
  }

  walkNode(ast, (node) => {
    if (isMochaStatement(node) && node.arguments.length > 0) {
      const arg = node.arguments[0];
      if (arg.type === 'Literal') {
        printStatement(node.callee.name, arg.value, indentLevel);
      }
      if (isDescribeOrContext(node)) {
        indentLevel++;
      }
    }
  });
}

function getFilePathArgument() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    throw new Error('Please provide a file path as an argument.');
  }
  return args[0];
}

const filePath = getFilePathArgument();
printMochaStatementsFromFile(filePath);
