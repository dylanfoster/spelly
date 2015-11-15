"use strict";

import path from "path";

import Configstore from "configstore";

const configstore = new Configstore("spelly-test");
const dictionary = path.join(__dirname, "words");
const doubleItemFixture= require("./double_item");
const fileStore = path.join(__dirname, "store/config.json");

export {
  configstore,
  dictionary,
  doubleItemFixture,
  fileStore
}
