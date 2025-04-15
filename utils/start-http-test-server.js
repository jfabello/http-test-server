/**
 * HTTP Test Server start-up facility.
 * @module start-http-test-server
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
import { HTTPTestServer } from "../src/http-test-server.js";

main();

async function main() {
	let httpServerInstance = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8080 });
	await httpServerInstance.start();
}
