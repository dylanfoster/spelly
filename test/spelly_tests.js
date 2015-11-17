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
  this.timeout(3000);
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
        expect(cached[0].word).to.eql("wired");
      });

      it("reorders suggestions if item exists", function () {
        configstore.set("wierd", doubleItemFixture);

        spelly.cache("wierd", { word: "wired", score: 2 });

        expect(configstore.get("wierd")[0].word).to.eql("wired");
      });
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
      spelly.clearCache();
    });

    it("uses a cached suggestion if found", function () {
      configstore.set("wierd", doubleItemFixture);

      let suggestions = spelly.check("wierd").suggestions;

      expect(suggestions).to.eql([
          { word: "wired", score: 1 },
          { word: "weird", score: 2 }
      ]);

    });

    it("returns suggestions for a misspelled word", function () {
      let suggestions = spelly.check("wierd").suggestions;

      expect(suggestions[0].word).to.eql("wired");
    });

    it("returns suggestions for a misspelled word with length < 3", function () {
      let suggestions = spelly.check("teh").suggestions;


      let the = suggestions.filter(suggestion => suggestion.word === "the")[0];

      expect(the.word).to.eql("the");
    });

    it("offers multiple suggestions", function () {
      let suggestions = spelly.check("wierd").suggestions;

      expect(suggestions.length).to.be.above(1);
    });

    it("caches suggestion results", function () {
      let suggestions = spelly.check("wierd").suggestions;

      expect(configstore.get("wierd")).to.eql(suggestions);
    });

    it("uses a provided dictionary array", function () {
      spelly = new Spelly(["wired"], {
        cache: {
          type: "configstore",
          store: configstore
        }
      });

      let suggestions = spelly.check("wierd").suggestions;

      expect(suggestions).to.eql([
          { word: "wired", score: 5 }
      ]);
    });
  });

  describe("#first", function () {
    beforeEach(function () {
      configstore.set("wierd", [
          { word: "wired", score: 1 },
          { word: "weird", score: 2 }
      ]);
    });

    it("returns the first suggestion from a list", function () {
      let suggestion = spelly.first("wierd");

      expect(suggestion.word).to.eql("wired");
    });
  });
});
