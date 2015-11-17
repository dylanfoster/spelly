"use strict";

import fs from "fs";
import { ok as Assert } from "assert";

import _ from "lodash";
import Configstore from "configstore";
import exists from "exists-sync";

import pkg from "../package.json";

class Spelly {
  constructor(dictionary, options = {}) {
    Assert(dictionary, "Missing required dictionary");

    this._defaultStore = new Configstore(pkg.name);

    options.cache = options.cache || {};
    options.cache.type = options.cache.type || "configstore";

    this._store = this._getStore(options.cache);
    this._dictionary = this._parseDictionary(dictionary);
  }

  cache(misspelled, suggestion) {
    let match = this._store.get(misspelled);

    if (match) {
      this._addToCache(misspelled, match, suggestion);
    } else {
      this._createCacheItem(misspelled, suggestion);
    }
  }

  check(word) {
    if (this.getCache(word)) {
      return {
        original: word,
        suggestions: this.getCache(word)
      }
    }

    let lowerCaseWord = word.toLowerCase();
    let alterations = this._createAlterationsArray(lowerCaseWord);
    let firstLetter = word.toLowerCase().charAt(0);
    let dictionary = this._dictionary[firstLetter];
    let score = 0;

    let result = {
      original: word,
      suggestions: _.compact(dictionary.map(item => {
        let isMatch = alterations.some(alt => {
          let regex = new RegExp(item, "i");
          return alt.replace(/\s/g, "").match(regex);
        });

        if (isMatch) {
          return {
            word: item,
            score: ++score
          }
        }
      }))
    };

    this._store.set(word, result.suggestions);
    return result;
  }

  clearCache(key, value) {
    if (key && value) {
      let values = this._store.get(key);
      let decrementer = 1;
      let newValues = values.filter(item => item.word !== value);
      let oldKey = values.filter(item => item.word === value)[0].score;

      newValues.forEach(item => {
        if (item.score >= oldKey) {
          this._decrement(decrementer, item);
          ++decrementer
        }
      });

      this._store.set(key, newValues);
      return this;
    } else if (key) {
      return this._store.del(key);
    } else {
      return this._store.clear();
    }
  }

  first(word) {
    let { suggestions } = this.check(word);

    return {
      original: word,
      word: suggestions[0].word,
      score: suggestions[0].score
    }
  }

  getCache(key) {
    if (key) {
      return this._store.get(key);
    }

    return this._store.all;
  }

  _addToCache(cacheKey, wordCache, suggestion) {
    let updatedCache = this._reorderCache(suggestion, wordCache);
    this._store.set(cacheKey, this._sort(updatedCache));
  }

  _createAlterationsArray(word) {
    let alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    let alterations = [];

    this._addDeletion(alterations, word);
    this._addTransposition(alterations, word);
    this._addAlteration(alterations, word, alphabet);
    this._addInsertion(alterations, word, alphabet);

    return alterations;
  }

  _addInsertion(arr, word, alphabet) {
    for (let i = 0; i > word.length; i++) {
      for (let j in alphabet) {
        arr.push(`${word.slice(0, i)} ${alphabet[j]} ${word.slice(i)}`);
      }
    }

    return arr;
  }

  _addAlteration(arr, word, alphabet) {
    for (let i = 0; i < word.length; i ++) {
      for (let j in alphabet) {
        arr.push(`${word.slice(0, i)} ${alphabet[j]} ${word.slice(i + 1)}`);
      }
    }

    return arr;
  }

  _addTransposition(arr, word) {
    for (let i = 0; i < word.length; i++) {
      arr.push(`${word.slice(0, i)} ${word.slice(i + 1, i + 2)} ${word.slice(i, i + 1)} ${word.slice(i + 2)}`);
    }

    return arr;
  }

  _addDeletion(arr, word, alphabet) {
    for (let i = 0; i < word.length; i++) {
      arr.push(`${word.slice(0, i)} ${word.slice(i + 1)}`);
    }

    return arr;
  }

  _createCacheItem(word, suggestion) {
    this._store.set(word, [suggestion]);
  }

  _decrement(decrement, item) {
    item.score -= decrement;
    return item;
  }

  _fetchItem(cached, item) {
    return cached.filter(part => {
      return part.word = item.word;
    })[0];
  }

  _getStore(cacheOptions) {
    switch (cacheOptions.type) {
      case "configstore":
        return cacheOptions.store || this._defaultStore;
        break;
      default:
        return cacheOptions.store || this._defaultStore;
    }
  }

  _increment(increment, item) {
    item.score += increment;
    return item;
  }

  _parseDictionary(dictionary) {
    if (typeof dictionary === "string") {
      return this._parseDictionaryFile(dictionary);
    } else if (Array.isArray(dictionary)) {
      return this._group(dictionary);
    }
  }

  _parseDictionaryFile(file) {
    return this._group(this._parseFile(file));
  }

  _group(arr) {
    return _.groupBy(arr, function (word) {
      return word.toLowerCase().charAt(0);
    });
  }

  _parseFile(filePath) {
    return fs.readFileSync(filePath).toString().split("\n")
      .filter(line => line.length)
      .map(line => line.trim());
  }

  _reorderCache(newItem, cacheArray) {
    let cacheArrayCopy = cacheArray.slice();
    let newItemId = newItem.score;
    let incrementer = 1;

    let hasSuggestion = cacheArray.some(item => {
      return item.word === newItem.word;
    });

    cacheArrayCopy.forEach(item => {
      if (hasSuggestion) {
        if (item.word === newItem.word) {
          item.score = newItem.score;
        } else if (item.score === newItem.score) {
          item.score == --item.score;
        } else {
          this._increment(incrementer, item);
          ++incrementer;
        }
      } else {
        this._increment(incrementer, item);
        ++incrementer;
      }
    });

    if (!hasSuggestion) {
      cacheArrayCopy.push(newItem);
    }

    return cacheArrayCopy;
  }

  _sort(arr) {
    return arr.sort((a, b) => {
      return a.score > b.score ? 1 : -1;
    });
  }
}

export default Spelly;
