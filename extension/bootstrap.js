/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {utils: Cu, interfaces: Ci, classes: Cc} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.importGlobalProperties(["TextEncoder"]);

XPCOMUtils.defineLazyModuleGetter(
  this, "TelemetryController", "resource://gre/modules/TelemetryController.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Log", "resource://gre/modules/Log.jsm");
XPCOMUtils.defineLazyModuleGetter(
  this, "ErrorReporting", "resource://shield-study-js-errors/ErrorReporting.jsm");

let logger;

function generateFingerprint(error) {
  const dataToHash = new TextEncoder().encode(
    [error.name, error.message, error.stack].join(":"),
  );
  const hasher = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
  hasher.init(hasher.SHA384);
  hasher.update(dataToHash, dataToHash.length);
  return hasher.finish(true).replace(/\+/g, "-").replace(/\//g, "_");
}

this.install = function() {};

this.startup = function() {
  logger = Log.repository.getLogger("shield-study-js-errors");
  logger.addAppender(new Log.ConsoleAppender(new Log.BasicFormatter()));
  logger.level = Services.prefs.getIntPref(
    "extensions.shield-study-js-errors@shield.mozilla.org.logLevel",
    Log.Level.Warn,
  );

  ErrorReporting.startup();

  ErrorReporting.addListener(error => {
    const payload = {
      version: 3,
      study_name: "shield-study-js-errors",
      branch: "default",
      addon_version: "0.1.0",
      shield_version: "unset",
      type: "shield-study-addon",
      data: {
        fingerprint: generateFingerprint(error),
      },
      testing: Services.prefs.getBoolPref(
        "extensions.shield-study-js-errors@shield.mozilla.org.testing",
        false,
      ),
    };

    TelemetryController.submitExternalPing("shield-study-addon", payload, {
      addClientId: true,
      addEnvironment: true,
    });
  });
};

this.shutdown = function() {
  ErrorReporting.shutdown();

  Cu.unload("resource://shield-study-js-errors/ErrorReporting.jsm");
};

this.uninstall = function() {};
