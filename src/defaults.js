/**
 * HTTP Test Server defaults.
 * @module httptestserver-defaults
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

const defaults = {};

defaults.SERVER_PORT = 8080;
defaults.SERVER_HOST = "127.0.0.1";
defaults.REQUEST_TIMEOUT = 1 * 1000; // 1 second
defaults.NOISY_REJECTION_SEND_RESPONSE_INTERVAL = 10; // 10 miliseconds
defaults.NOISY_REJECTION_SEND_RESPONSE_TIMER = 100; // 100 miliseconds
defaults.NOISY_TIMEOUT_SEND_RESPONSE_INTERVAL = 10; // 10 miliseconds
defaults.NOISY_TIMEOUT_SEND_RESPONSE_TIMER = 100; // 100 miliseconds
defaults.BIG_FILE_SIZE = 500 * 1000 * 1000; // 500 MB
defaults.PATTERN_STRING = "This is a pattern!";
defaults.PATTERN_ENCODING = "utf8";
defaults.PATTERN_SIZE = 2 * 1000 * 1000; // 2 MB
defaults.PATTERN_STRING_REPEAT = 100000 // Repeats a hundred thousand times
defaults.JSON_OBJECT = {
	"firstName": "John",
	"lastName": "Doe",
	"age": 25,
	"address": {
		"street": "Somewhere",
		"city": "Anytown",
		"state": "CA",
		"zip": 12345
	},
	"isActive": true
};

Object.freeze(defaults);

module.exports = defaults;
