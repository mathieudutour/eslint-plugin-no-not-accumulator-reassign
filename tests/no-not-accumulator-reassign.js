import {RuleTester} from 'eslint'

import rule from '../src/rules/no-not-accumulator-reassign'

const ruleTester = new RuleTester()

ruleTester.run('no-not-accumulator-reassign', rule, {
  valid: [
    'function foo(a) { var b = a; }',
    'function foo(a) { a.prop = \'value\'; }',
    'function foo(a) { (function() { var a = 12; a++; })(); }',
    { code: 'function foo() { global = 13; }', globals: ['global'] },
    'function foo(a) { a.b = 0; }',
    'function foo(a) { delete a.b; }',
    'function foo(a) { ++a.b; }',
    { code: 'function foo(a) { [a.b] = []; }', parserOptions: { ecmaVersion: 6 } },
    { code: 'function foo(a) { bar(a.b).c = 0; }', options: [[], {props: true}] },
    { code: 'function foo(a) { data[a.b] = 0; }', options: [[], {props: true}] },
    { code: 'function foo(a) { +a.b; }', options: [[], {props: true}] },

    { code: '["foo", "bar"].reduce(function(accumulator, value) { accumulator[value] = true; return accumulator; }, {});', options: [['reduce'], {props: true}] }
  ],

  invalid: [
    { code: 'function foo(bar) { bar = 13; }', errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo(bar) { bar += 13; }', errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo(bar) { (function() { bar = 13; })(); }', errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo(bar) { ++bar; }', errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo(bar) { bar++; }', errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo(bar) { --bar; }', errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo(bar) { bar--; }', errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo({bar}) { bar = 13; }', parserOptions: { ecmaVersion: 6 }, errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo([, {bar}]) { bar = 13; }', parserOptions: { ecmaVersion: 6 }, errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo(bar) { ({bar}) = {}; }', parserOptions: { ecmaVersion: 6 }, errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },
    { code: 'function foo(bar) { ({x: [, bar = 0]}) = {}; }', parserOptions: { ecmaVersion: 6 }, errors: [{ message: 'Assignment to function parameter \'bar\'.' }] },

    {
      code: 'function foo(bar) { bar.a = 0; }',
      options: [[], {props: true}],
      errors: [{ message: 'Assignment to property of function parameter \'bar\'.' }]
    },
    {
      code: 'function foo(bar) { bar.get(0).a = 0; }',
      options: [[], {props: true}],
      errors: [{ message: 'Assignment to property of function parameter \'bar\'.' }]
    },
    {
      code: 'function foo(bar) { delete bar.a; }',
      options: [[], {props: true}],
      errors: [{ message: 'Assignment to property of function parameter \'bar\'.' }]
    },
    {
      code: 'function foo(bar) { ++bar.a; }',
      options: [[], {props: true}],
      errors: [{ message: 'Assignment to property of function parameter \'bar\'.' }]
    },
    {
      code: 'function foo(bar) { [bar.a] = []; }',
      parserOptions: { ecmaVersion: 6 },
      options: [[], {props: true}],
      errors: [{ message: 'Assignment to property of function parameter \'bar\'.' }]
    },
    {
      code: '["foo", "bar"].reduce(function(accumulator, value) { accumulator[value] = true; return accumulator; }, {});',
      options: [[], {props: true}],
      errors: [{ message: 'Assignment to property of function parameter \'accumulator\'.' }]
    }
  ]
})