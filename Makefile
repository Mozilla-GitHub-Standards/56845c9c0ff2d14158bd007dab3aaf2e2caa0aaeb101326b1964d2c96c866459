# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

EXTENSION_FILES = $(wildcard extension/*)

.PHONY: all clean build

all: build

build: shield-study-js-errors.xpi

clean:
	rm -f shield-study-js-errors.xpi

shield-study-js-errors.xpi: $(EXTENSION_FILES)
	pushd extension; \
	zip -r shield-study-js-errors.xpi ./*; \
	mv -f shield-study-js-errors.xpi ../; \
	popd
