"use strict";

import fs from "fs";
import path from "path";

import del from "del";
import exists from "exists-sync";
import { expect } from "chai";

import {
  configstore,
  dictionary,
  doubleItemFixture,
  fileStore
} from "./fixtures";

import Spelly from "../";

function readFile(filePath) {
  return JSON.parse(fs.readFile(path.resolve(__dirname, filePath)));
}

describe("Spelly", function () {
  let store, spelly;

  beforeEach(function () {
    let options = {
      cache: {
        type: "configstore",
        store: configstore
      }
    };

    spelly = new Spelly(dictionary, options);
  });

  it("requires a dictionary", function () {
    expect(function () {
      new Spelly();
    }).to.throw("Missing required dictionary");
  });

  describe("#cache", function () {
    describe("with configstore", function () {
      beforeEach(function () {
        configstore.set("wierd", [{ word: "wired", score: 1 }]);
      });

      afterEach(function () {
        configstore.del("wierd");
      });

      it("caches a spelling suggestion", function () {
        spelly.cache("wierd", { word: "weird", score: 1 });

        let cached = configstore.get("wierd");
        expect(cached).to.include({ word: "weird", score: 1 });
      });

      it("reorders suggestions based on new cached item", function () {
        spelly.cache("wierd", { word: "weird", score: 1 });

        let cached = configstore.get("wierd");
        expect(cached[0].word).to.eql("weird");
      });

      it("reorders suggestions if item exists");
    });
  });

  describe("#getCache", function () {
    beforeEach(function () {
      configstore.set("wierd", [{ word: "wired", score: 1 }]);
    });

    afterEach(function () {
      configstore.del("wierd");
    });

    it("returns cached suggestions", function () {
      expect(spelly.getCache()).to.eql({
        "wierd": [{ word: "wired", score: 1 }]
      });
    });

    it("returns cached suggestions for a single word", function () {
      expect(spelly.getCache("wierd")).to.eql([
          { word: "wired", score: 1 }
      ]);
    });
  });

  describe("#clearCache", function () {
    beforeEach(function () {
      configstore.set("wierd", doubleItemFixture);
      configstore.set("somting", [{ word: "something", score: 1 }]);
    });

    afterEach(function () {
      configstore.clear();
    });

    it("removes cached results", function () {
      spelly.clearCache();

      expect(configstore.get("wierd")).to.be.undefined;
      expect(configstore.get("somting")).to.be.undefined;
    });

    it("removes cached results for a single word", function () {
      spelly.clearCache("wierd");

      expect(configstore.get("wierd")).to.be.undefined;
      expect(configstore.get("somting")).to.eql([
          { word: "something", score: 1 }
      ]);
    });

    it("removes a single cached result for a mispelled word", function () {
      spelly.clearCache("wierd", "wired");

      expect(configstore.get("wierd")).to.eql([
          { word: "weird", score: 1 }
      ]);
    });
  });

  describe("#check", function () {
    afterEach(function () {
      configstore.del("wierd");
    });

    it("uses a cached suggestion if found", function () {
      configstore.set("wierd", doubleItemFixture);

      let suggestions = spelly.check("wierd");

      expect(suggestions).to.eql([
          { word: "wired", score: 1 },
          { word: "weird", score: 2 }
      ]);

      configstore.del("wierd");
    });

    it("spell corrects a word", function () {
      let suggestions = spelly.check("wierd").suggestions;

      let weird = suggestions.filter(suggestion => suggestion.word === "weird")[0];

      expect(weird.word).to.eql("weird");
    });

    it("offers multiple suggestions", function () {
      let suggestions = spelly.check("wierd").suggestions;

      expect(suggestions.length).to.be.above(1);
    });

    it("caches suggestion results", function () {
      let suggestions = spelly.check("wierd").suggestions;

      expect(configstore.get("wierd")).to.eql(suggestions);
    });

    it("uses a provided dictionary array");
  });

  describe("streaming", function () {

  });
});
