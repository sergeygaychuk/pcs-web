#!/usr/bin/make -f

REPORTER = spec

test:
	@./node_modules/.bin/mocha --reporter $(REPORTER)

.PHONY: test
