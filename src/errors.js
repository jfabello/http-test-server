/**
 * @module http-test-server-errors
 * @description HTTP Test Server error classes.
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

class ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP Test Server host argument type is not valid, it should be a string.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_TEST_SERVER_HOST_INVALID extends RangeError {
	constructor() {
		super("The HTTP Test Server host argument is not valid, it should be an IPv4 address, a hostname or a fully qualified domain name (FQDN).");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP Test Server port argument is not valid, it should be an integer.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_TEST_SERVER_PORT_OUT_OF_BOUNDS extends RangeError {
	constructor() {
		super("The HTTP Test Server port argument is out of bounds, it should be between 0 and 65535.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_TEST_SERVER_NOT_IN_STARTABLE_STATE extends Error {
	constructor() {
		super("The HTTP Test Server is not in a state where it is possible to start it up.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_TEST_SERVER_NOT_IN_STOPPABLE_STATE extends Error {
	constructor() {
		super("The HTTP Test Server is not in a state where it is possible to stop it.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

const errors = {
	ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID,
	ERROR_HTTP_TEST_SERVER_HOST_INVALID,
	ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID,
	ERROR_HTTP_TEST_SERVER_PORT_OUT_OF_BOUNDS,
	ERROR_HTTP_TEST_SERVER_NOT_IN_STARTABLE_STATE,
	ERROR_HTTP_TEST_SERVER_NOT_IN_STOPPABLE_STATE
};

Object.freeze(errors);

module.exports = errors;
