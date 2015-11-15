"use strict";

import fs from "fs";
import { ok as Assert } from "assert";

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
  }

  cache(misspelled, suggestion) {
    let match = this._store.get(misspelled);

    if (match) {
      this._addToCache(misspelled, match, suggestion);
    } else {
      this._createCacheItem(misspelled, suggestion);
    }
  }

  clearCache(key, value) {
    if (key && value) {
      let values = this._store.get(key);

      let newValues = values.filter(item => item.word !== value);

      let decrementer = 1;

      newValues.forEach(item => {
        this._decrement(decrementer, item);
        ++decrementer
      });

      this._store.set(key, newValues);
      return this;
    } else if (key) {
      return this._store.del(key);
    } else {
      return this._store.clear();
    }
  }

  getCache(key) {
    if (key) {
      return this._store.get(key);
    }

    return this._store.all;
  }

  _addToCache(cacheKey, wordCache, suggestion) {
    this._reorderCache(suggestion, wordCache);
    wordCache.push(suggestion);

    this._store.set(cacheKey, this._sort(wordCache));
  }

  _createCacheItem(word, suggestion) {
    this._store.set(word, [suggestion]);
  }

  _decrement(decrement, item) {
    item.score -= decrement;
    return item;
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

  _reorder(increment, item) {
    item.score += increment;
  }

  _reorderCache(newItem, cacheArray) {
    let newItemId = newItem.score;
    let incrementer = 1;

    cacheArray.forEach(item => {
      if (item.score >= newItemId) {
        this._reorder(incrementer, item);
        ++incrementer;
      }
    });

    return cacheArray;
  }

  _sort(arr) {
    return arr.sort((a, b) => {
      return a.score > b.score ? 1 : -1;
    });
  }
}

export default Spelly;
