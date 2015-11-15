# Spelly

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
    store: new Configstore("foo") // optional, defaults to internal Configstore instance under "spelly"
  }
};
const spelly = new Spelly("/usr/share/dict/words", options);

spelly.check("wierd").then(suggestions => {
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
});

// event emitter

spelly.check("wierd");

spelly.on("suggestion", function (suggestion) {

});

spelly.on("error", function (err) { ... });

spelly.on("done", function () { ... });
```

Results will be cached in the chosen store, making Spelly smarter and faster each time it is used.

### Managing your own cache

You can manage your own cache of words by adding/removing them to/from the store. When adding a word, all suggestions beneath its score will be shifted down 1. (e.g. a score of `1` goes to `2`). If the suggestion already exists, it will be moved appropriately according to the score given.

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

Spelly uses [configstore]() by default for the suggestion cache, helping make it both fast and smart. Each time a misspelled word is given to Spelly, it finds it in the store, or generates a suggestion, then adds it to the store.

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

Lastly, you can use an in-memory store. This is not suggested however. As Spelly continues to store more and more suggestions, eventually you WILL run out of memory

```javascript
let options = {
  cache: {
    type: "memory"
  }
};

const spelly = new Spelly(dict, options);
```

## License

See [LICENSE](LICENSE.md)
