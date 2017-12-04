# Shield Study: JavaScript Errors
A [Shield study][] to test collecting JavaScript errors thrown by Firefox
chrome code (__not__ errors from webpages themselves).

## Overview
This study listens for browser chrome errors being logged to the Browser
Console. It then computes a hash based on the error type, name, and stack
trace, and sends that hash in a `shield-study-addon` Telemetry ping along with
the user's client ID and environment information.

The purpose of the study is to measure the amount and distribution of browser
chrome errors in a privacy-respectful way. The data will be used to create a
prototype for collecting these errors to aid in Firefox development.

## Preferences
`extensions.shield-study-js-errors@shield.mozilla.org.logLevel`
    Log level for extension logging. Defaults to Warnings an above. Set to 0 for
    verbose logging.
`extensions.shield-study-js-errors@shield.mozilla.org.testing`
    If true, mark Telemetry pings sent by the client as test pings.

## License
Shield Study: JavaScript Errors is licensed under the MPLv2. See the `LICENSE`
file for details.
