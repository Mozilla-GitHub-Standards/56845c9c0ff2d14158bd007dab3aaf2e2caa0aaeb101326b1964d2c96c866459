/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {utils: Cu, interfaces: Ci, classes: Cc} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Timer.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.importGlobalProperties(["TextEncoder"]);

XPCOMUtils.defineLazyModuleGetter(
  this, "TelemetryController", "resource://gre/modules/TelemetryController.jsm");

this.EXPORTED_SYMBOLS = ["ErrorReporting"];

let fingerprintsToReport = [];
let interval = null;

this.ErrorReporting = {
  startup() {
    // Submit any collected errors once an hour
    interval = setInterval(
      this.submitErrors.bind(this),
      Services.prefs.getIntPref(
        "extensions.shield-study-js-errors@shield.mozilla.org.submitIntervalMs",
        1000 * 60 * 60, // 1 hour
      ),
    );
  },

  shutdown() {
    if (interval !== null) {
      clearInterval(interval);
    }

    // Submit any unsent intervals when the add-on or browser is shutting down
    this.submitErrors();
  },

  /**
   * Create an anonymized fingerprint of the error using the name, message, and
   * stack trace to create a SHA384 hash.
   * @param {Error} error
   * @return {String}
   */
  generateFingerprint(error) {
    const dataToHash = new TextEncoder().encode(
       [error.name, error.message, error.stack].join(":"),
     );
     const hasher = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
     hasher.init(hasher.SHA384);
     hasher.update(dataToHash, dataToHash.length);
     return hasher.finish(true).replace(/\+/g, "-").replace(/\//g, "_");
  },

  submitErrors() {
    if (fingerprintsToReport.length > 0) {
      const payload = {
        version: 3,
        study_name: "shield-study-js-errors",
        branch: "default",
        addon_version: "0.1.0",
        shield_version: "unset",
        type: "shield-study-addon",
        data: {
          fingerprints: fingerprintsToReport,
          utcTimestampMs: Date.now(),
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

      fingerprintsToReport = [];
    }
  },

  reportError(error) {
    fingerprintsToReport.push({
      fingerprint: this.generateFingerprint(error),
      utcTimestampMs: Date.now(),
    });
  }
};
