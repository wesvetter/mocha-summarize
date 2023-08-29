# mocha-summarize

Prints an outline of a Mocha test suite by printing `describe`, `context`, and `it` blocks.

It does not print `before`, `beforeEach`, `after`, or `afterEach` blocks.

## Installation

```
git clone <repo>
cd <repo>
npm install -g
```

## Usage

```
npx mocha-summarize <path-to-file>
```


## Example

Given the following suite:

```javascript
describe('Array', function() {
  describe('#indexOf()', function() {
    context('when the target is present', function() {
      it('returns the index where the target is located', function() {});
    });

    context('when the target is not present', function() {
      it('returns -1', function() {});
    });
  });

  describe('isArray()', function() {
    context('when the target is an array', function() {
      it('returns true', function() {});
    });

    context('when the target is not an array', function() {
      it('returns false', function() {});
    });
  });
});
```

It outputs the following:

```
Array
  #indexOf()
    - when the target is present
        it returns the index where the target is located
    - when the target is not present
        it returns -1
  isArray()
    - when the target is an array
        it returns true
    - when the target is not an array
        it returns false
```
