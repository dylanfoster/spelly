"use strict";

import { expect } from "chai";

import Spelly from "../";

describe("Spelly", function () {
  it("requires a dictionary");

  describe("#cache", function () {
    it("caches a spelling suggestion");

    it("allows for caching in configstore");

    it("allows for caching in a file");

    it("allows for caching in memory");
  });

  describe("#getCache", function () {
    it("returns cached suggestions");

    it("returns cached suggestions for a single word");

    it("returns cached suggestions for a single  mispelled word");
  });

  describe("#clearCache", function () {
    it("removes cached results");

    it("removes cached results for a single word");

    it("removes a single cached result for a mispelled word");
  });

  describe("#check", function () {
    it("spell corrects a word");

    it("offers multiple suggestions");

    it("caches suggestion results");
  });

});
