/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {utils: Cu} = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "ErrorLogging", "resource://shield-study-js-errors/ErrorLogging.jsm");
XPCOMUtils.defineLazyModuleGetter(
  this, "ErrorReporting", "resource://shield-study-js-errors/ErrorReporting.jsm");

this.install = function() {};

this.startup = function() {
  ErrorReporting.startup();
  ErrorLogging.startup();
  ErrorLogging.addListener(ErrorReporting.reportError.bind(ErrorReporting));
};

this.shutdown = function() {
  ErrorLogging.shutdown();
  ErrorReporting.shutdown();

  Cu.unload("resource://shield-study-js-errors/ErrorLogging.jsm");
  Cu.unload("resource://shield-study-js-errors/ErrorReporting.jsm");
};

this.uninstall = function() {};
