const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('Basis bindings marshal calls without JavaScript code generation', () => {
  const source = fs.readFileSync('public/basis/basis_transcoder.js', 'utf8');
  const start = source.indexOf('function craftInvokerFunction(');
  const end = source.indexOf('var __embind_register_class_constructor=', start);
  const destroyed = [];
  const context = vm.createContext({
    createNamedFunction: (_, fn) => fn,
    usesDestructorStack: () => false,
    throwBindingError: (message) => { throw new Error(message); },
  }, { codeGeneration: { strings: false, wasm: true } });
  vm.runInContext(source.slice(start, end), context);
  const valueType = {
    toWireType: (_, value) => value * 2,
    destructorFunction: (value) => destroyed.push(value),
  };
  const invoke = context.craftInvokerFunction('sample', [
    { name: 'number', fromWireType: (value) => value + 1 }, null, valueType,
  ], null, (target, value) => target + value, 10, false);
  assert.equal(invoke(3), 17);
  assert.deepEqual(destroyed, [6]);
  assert.throws(() => invoke(), /expected 1/);
  assert.equal(source.includes('newFunc(Function,'), false);
});
