# eslint-plugin-no-not-accumulator-reassign

To not reassign parameters is great in many cases but there are a few parameters in the JS standard library that are made to be reassigned:

```js
['foo', 'bar', 'qux', 'foo'].reduce((accumulator, value) => {
  accumulator[value] = true;
  return accumulator;
}, {});
```

The alternative would be something like this:
```js
['foo', 'bar', 'qux', 'foo'].reduce((accumulator, value) => {
  return {...accumulator, [value]: true};
}, {});
```
and that is [10 to 100 times slower](https://jsperf.com/object-create-vs-mutation-in-reduce/7).

This plugin aims to forbid the reassignment of parameters _except_ when they should be.

## Installation

```
npm install -D eslint-plugin-no-not-accumulator-reassign
```

## Usage

In your `.eslintrc.yml`:
```
plugins:
  - no-not-accumulator-reassign
rules:
  no-not-accumulator-reassign/no-not-accumulator-reassign:
  - error
  - - reduce
  - props: true
```

See the docs for more information.

## License

MIT
