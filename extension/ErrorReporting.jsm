/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {utils: Cu, interfaces: Ci, classes: Cc} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Timer.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "UpdateUtils", "resource://gre/modules/UpdateUtils.jsm");

Cu.importGlobalProperties(["fetch", "URL"]);

this.EXPORTED_SYMBOLS = ["ErrorReporting"];

const ERROR_PREFIX_RE = /^[^\W]+:/m;

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIScriptError#Categories
const CATEGORY_WHITELIST = [
  "XPConnect JavaScript",
  "component javascript",
  "chrome javascript",
  "chrome registration",
  "XBL",
  "XBL Prototype Handler",
  "XBL Content Sink",
  "xbl javascript",
  "FrameConstructor",
];

const listeners = new Set();

this.ErrorReporting = {
  startup() {
    Services.console.registerListener(ErrorReporting);
  },

  shutdown() {
    Services.console.unregisterListener(ErrorReporting);
  },

  addListener(listener) {
    listeners.add(listener);
  },

  removeListener(listener) {
    listeners.delete(listener);
  },

  observe(message) {
    try {
      message.QueryInterface(Ci.nsIScriptError);
    } catch (err) {
      // Not an error, which is fine.
      return;
    }

    if (!CATEGORY_WHITELIST.includes(message.category)) {
      return;
    }

    let errorMessage = message.errorMessage;
    let errorName = "Error";
    if (message.errorMessage.match(ERROR_PREFIX_RE)) {
      const parts = message.errorMessage.split(":");
      errorName = parts[0];
      errorMessage = parts.slice(1).join(":");
    }

    const error = new Error(errorMessage, message.sourceName, message.lineNumber);
    error.name = errorName;
    if (message.stack) {
      let stackString = "";
      let s = message.stack;
      while (s !== null) {
        stackString += `${s.functionDisplayName}@${s.source}:${s.line}:${s.column}\n`;
        s = s.parent;
      }
      error.stack = stackString;
    }

    for (const listener of listeners) {
      try {
        listener(error);
      } catch (err) {}
    }
  },
};
