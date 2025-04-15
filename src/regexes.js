/**
 * HTTP Test Server regexes.
 * @module http-test-server-regexes
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

const regexes = {};

regexes.IPV4_ADDRESS = /^(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$/;
regexes.HOST_NAME = /^(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])$/;
regexes.FQDN = /^(?:(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+[a-zA-Z]+$/;
regexes.UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

Object.freeze(regexes);

export { regexes };
