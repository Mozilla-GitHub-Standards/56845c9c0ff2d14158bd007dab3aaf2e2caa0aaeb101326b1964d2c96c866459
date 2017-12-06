/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Timer.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "AddonManager", "resource://gre/modules/AddonManager.jsm");
XPCOMUtils.defineLazyModuleGetter(
  this, "ErrorLogging", "resource://shield-study-js-errors/ErrorLogging.jsm");
XPCOMUtils.defineLazyModuleGetter(
  this, "ErrorReporting", "resource://shield-study-js-errors/ErrorReporting.jsm");

let expirationInterval = null;

/**
 * Uninstall the add-on if it is past the built-in expiration date.
 */
async function checkExpiration() {
  const expirationDate = new Date(
    Services.prefs.getCharPref(
      "extensions.shield-study-js-errors@shield.mozilla.org.expirationDate",
      "2018-01-01T00:00:00.000Z",
    ),
  );
  if (new Date() > expirationDate) {
    const addon = await AddonManager.getAddonByID("shield-study-js-errors@shield.mozilla.org");
    if (addon) {
      addon.uninstall();
    }
  }
}

this.install = function() {};

this.startup = function() {
  ErrorReporting.startup();
  ErrorLogging.startup();
  ErrorLogging.addListener(ErrorReporting.reportError.bind(ErrorReporting));

  // Check expiration on startup, and again once per-day if necessary.
  const expirationDelay = Services.prefs.getIntPref(
    "extensions.shield-study-js-errors@shield.mozilla.org.expirationIntervalMs",
    1000 * 60 * 60 * 24, // 1 day
  );
  expirationInterval = setInterval(checkExpiration, expirationDelay);
  checkExpiration();
};

this.shutdown = function() {
  ErrorLogging.shutdown();
  ErrorReporting.shutdown();

  if (expirationInterval) {
    clearInterval(expirationInterval);
  }

  Cu.unload("resource://shield-study-js-errors/ErrorLogging.jsm");
  Cu.unload("resource://shield-study-js-errors/ErrorReporting.jsm");
};

this.uninstall = function() {};
