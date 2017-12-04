# Shield Study: JavaScript Errors
A [Shield study][] to test collecting JavaScript errors thrown by Firefox
chrome code (__not__ errors from webpages themselves).

[Shield study]: https://wiki.mozilla.org/Firefox/SHIELD

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

## Development
To build the add-on, run the `make` command:

```sh
$ make
```

This will create a `shield-study-js-errors.xpi` file in the root of the repo
containing the add-on.

To test this, you will either need to get the add-on signed by the Mozilla
Extension key, or disable the following preferences on a copy of Firefox
Nightly:

- `xpinstall.signatures.required`
- `extensions.allow-non-mpc-extensions`

## License
Shield Study: JavaScript Errors is licensed under the MPLv2. See the `LICENSE`
file for details.
