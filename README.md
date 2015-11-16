# Spelly

[![Build Status](https://travis-ci.org/dylanfoster/spelly.svg?branch=master)](https://travis-ci.org/dylanfoster/spelly)

Pure JavaScript spellchecker that learns as you use it <sup>1</sup>

## Installation

```
npm install spelly
```

## Usage

### Get suggestions

```javascript
const Spelly = require("spelly");

let options = {
  cache: {
    type: "configstore", // configstore, file or memory
    store: new Configstore("foo")
    // optional, defaults to internal Configstore instance under "spelly"
  }
};

const spelly = new Spelly("/usr/share/dict/words", options);

let suggestions = spelly.check("wierd");

/**
 * {
 *   original: "wierd",
 *   suggestions: [{
 *     word: "weird",
 *     score: 1
 *   }, {
 *     word: "wired",
 *     score: 2
 *   }]
 * }
 */

// event emitter

spelly.check("wierd");

spelly.on("suggestion", function (suggestion) {

});

spelly.on("error", function (err) { ... });

spelly.on("done", function () { ... });
```

Results will be cached in the chosen store, making Spelly smarter and faster
each time it is used.

### Managing your own cache

You can manage your own cache of words by adding/removing them to/from the store.
When adding a word, all suggestions beneath its score will be shifted down 1.
(e.g. a score of `1` goes to `2`). If the suggestion already exists, it will be
moved appropriately according to the score given.

```javascript

// add 'wired' with score '1' or move it to the top position
spelly.cache("weird", { word: "wired", score: 1 });

// remove a suggestion for a misspelling
spelly.clearCache("somthing", "something");

// remove all suggestions for a misspelling
spelly.clearCache("somthing");

// clear all cache
spelly.clearCache();


// retrieve cached suggestions for a misspelling
spelly.getCache("somthing");

// retrieve all cached suggestions
spelly.getCache();
```

### Feeling lucky?

Grab the first suggestion out of the list

```javascript
  spelly.first("wierd").then(suggestion => {

  });
```

### Learning

Spelly uses [configstore](https://github.com/yeoman/configstore) by default for
the suggestion cache, helping make it both fast and smart. Each time a misspelled
word is given to Spelly, it finds it in the store, or generates a suggestion,
then adds it to the store.

If you want to use a file store, simply pass it to the constructor

```javascript
let options = {
  cache: {
    type: "file",
    store: "/path/to/json/file.json"
  }
};

const spelly = new Spelly(dict, options);
```

Lastly, you can use an in-memory store, although this is not suggested. As Spelly
continues to store more and more suggestions, eventually you WILL run out of memory

```javascript
let options = {
  cache: {
    type: "memory"
  }
};

const spelly = new Spelly(dict, options);
```

### API

#### `Spelly(dictionary, options)`

Spelly constructor.

  - **dictionary** Type: `Array|String` An array of words or path to a file
    containing a newline separated list of words.
  - **options.cache** Type: `Object` Spelly cache options.

    - **cache.type** Type: `String` Cache type. Can be one of `configstore`,
      `file` or `memory`. **Default:** `configstore`.
    - **cache.store** Type: `String|Object` Path to store file for `file` or
      configstore instance (optional) for `configstore`.

#### `check(word)` => Promise

Spellcheck a word. returns a promise with the suggestions Object.

 - **word**: Type: `String` The word to spellcheck.

#### `cache(misspelledWord, suggestion)`

Add a suggestion to a mispelled word.

 - **misspelledWord** Type: `String` The misspelled word to cache.
 - **suggestion** Type: `Object`
   - **suggestion.word** Type: `String` The suggestion to add for the misspelled word.
   - **suggestion.score** Type: `Number` Score the suggestion. If the suggestion
exists for the word, it will be re-scored based on the given score and all others
below will be shifted down (or up depending on how you look at it) by 1.

#### `clearCache([misspelledWord][,suggestion])`

Clear the cache of a single suggestion, multiple suggestions or all suggestions.

 - **missppelledWord** Type: `String`(optional) The misspelled word to clear.
 - **suggestion** Type: `String`(optional) the suggestion to remove from the
   misspelled word.

#### `getCache([misspelledWord])`

Retrieve the cache for a mispelled word or all words.

 - **misspelledWord** Type: `String`(optional) The misspelled word to retrieve
   cache for.


## License

See [LICENSE](LICENSE.md)
