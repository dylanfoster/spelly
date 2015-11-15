"use strict";

import { ok as Assert } from "assert";

class Spelly {
  constructor(dictionary) {
    Assert(dictionary, "Missing required dictionary");
  }
}

export default Spelly;
