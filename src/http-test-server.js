/**
 * @module jfabello/http-test-server
 * @description HTTP Test Server.
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
const http = require("node:http");
const crypto = require("node:crypto");
const chalk = require("chalk");

// Defaults
const defaults = require("./defaults.js");

// Errors
const commonErrors = require("@jfabello/common-errors");
const systemErrors = require("@jfabello/system-errors");
const httpTestServerErrors = require("./errors.js");
const errors = Object.assign({}, httpTestServerErrors, systemErrors, commonErrors);
delete errors.createErrorFromSystemErrorCode;
Object.freeze(errors);

// Regexes
const regexes = require("./regexes.js");

/**
 * @description HTTP Test Server for the promise-based HTTP and HTTPS client for Node.js.
 */
class HTTPTestServer {
	// Private class constants
	static #CREATED = Symbol("CREATED");
	static #STARTING = Symbol("STARTING");
	static #LISTENING = Symbol("LISTENING");
	static #STOPPING = Symbol("STOPPING");
	static #STOPPED = Symbol("STOPPED");

	// Private instance variables
	#serverInstance = null;
	#serverHost = null;
	#serverPort = null;
	#serverState = null;
	#serverStartPromise = null;
	#serverStopPromise = null;

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the CREATED server state.
	 */
	static get CREATED() {
		return HTTPTestServer.#CREATED;
	}

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the STARTING server state.
	 */
	static get STARTING() {
		return HTTPTestServer.#STARTING;
	}

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the LISTENING server state.
	 */
	static get LISTENING() {
		return HTTPTestServer.#LISTENING;
	}

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the STOPPING server state.
	 */
	static get STOPPING() {
		return HTTPTestServer.#STOPPING;
	}

	/**
	 * @static
	 * @type {Symbol}
	 * @description Read-only property representing the STOPPED server state.
	 */
	static get STOPPED() {
		return HTTPTestServer.#STOPPED;
	}

	/**
	 * @static
	 * @type {object}
	 * @description Read-only property that contains the HTTP Test Server error classes as properties.
	 */
	static get errors() {
		return errors;
	}

	/**
	 * @type {Symbol}
	 * @description The state of the HTTP Test Server instance.
	 */
	get state() {
		return this.#serverState;
	}

	/**
	 * @type {number}
	 * @description The port of the HTTP Test Server instance.
	 */
	get serverPort() {
		return this.#serverPort;
	}

	/**
	 * @deprecated
	 * @type {number}
	 * @description The port of the HTTP Test Server instance (alias of the serverPort property).
	 */
	get port() {
		return this.#serverPort;
	}

	/**
	 * @description Creates a new instance of the HTTP Test Server.
	 * @param {Object} [options={}] The HTTP Test Server configuration options object.
	 * @param {string} [options.serverHost=defaults.SERVER_HOST] The HTTP Test Server host (default: 127.0.0.1).
	 * @param {number} [options.serverPort=defaults.SERVER_PORT] The HTTP Test Server port (default: 8080).
	 * @throws {ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID} If the HTTP Test Server host argument type is not a string.
	 * @throws {ERROR_HTTP_TEST_SERVER_HOST_INVALID} If the HTTP Test Server host argument not an IPv4 address, a hostname or a fully qualified domain name (FQDN).
	 * @throws {ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID} If the HTTP Test Server port argument is not an integer.
	 * @throws {ERROR_HTTP_TEST_SERVER_PORT_OUT_OF_BOUNDS} If the HTTP Test Server port argument is not between 0 and 65535.
	 */
	constructor({ serverHost = defaults.SERVER_HOST, serverPort = defaults.SERVER_PORT } = {}) {
		if (typeof serverHost !== "string") {
			throw new errors.ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID();
		}

		if (regexes.IPV4_ADDRESS.test(serverHost) === false && regexes.HOST_NAME.test(serverHost) === false && regexes.FQDN.test(serverHost) === false) {
			throw new errors.ERROR_HTTP_TEST_SERVER_HOST_INVALID();
		}

		if (Number.isInteger(serverPort) === false) {
			throw new errors.ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID();
		}

		if (serverPort < 0 || serverPort > 65535) {
			throw new errors.ERROR_HTTP_TEST_SERVER_PORT_OUT_OF_BOUNDS();
		}

		this.#serverInstance = http.createServer();
		this.#serverHost = serverHost;
		this.#serverPort = serverPort;

		this.#serverInstance.on("request", (request, response) => {
			this.#processRequest(request, response);
		});

		this.#serverState = HTTPTestServer.#CREATED;
	}

	/**
	 * @description Starts the HTTP Test Server instance. If the server is in the STARTING or LISTENING states, it returns the existing promise.
	 * @returns {Promise} A promise that resolves to HTTPTestServer.LISTENING if the HTTP Test Server starts succesffully, or rejects to an error if the HTTP Test Server start fails.
	 * @throws {HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_NOT_IN_STARTABLE_STATE} If the HTTP Test Server is not in a state where it is possible to start it up.
	 */
	start() {
		if (this.#serverState === HTTPTestServer.#STARTING || this.#serverState === HTTPTestServer.#LISTENING) {
			return this.#serverStartPromise;
		}

		if (this.#serverState !== HTTPTestServer.#CREATED && this.#serverState !== HTTPTestServer.#STOPPED) {
			throw new HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_NOT_IN_STARTABLE_STATE();
		}

		const previousState = this.#serverState;

		this.#serverState = HTTPTestServer.#STARTING;

		this.#serverStartPromise = new Promise((resolve, reject) => {
			this.#serverInstance.once("listening", () => {
				this.#serverHost = this.#serverInstance.address().address;
				this.#serverPort = this.#serverInstance.address().port;
				console.log(chalk.whiteBright(`HTTP Test Server listening on ${this.#serverHost}:${this.#serverPort}`));
				this.#serverState = HTTPTestServer.#LISTENING;
				resolve(this.#serverState);
			});

			this.#serverInstance.once("error", (error) => {
				this.#serverState = previousState;
				reject(new systemErrors.createErrorFromSystemErrorCode(error.code));
			});

			this.#serverInstance.listen({ port: this.#serverPort, host: this.#serverHost });
		});

		return this.#serverStartPromise;
	}

	/**
	 * @description Stops the HTTP Test Server instance. If the server is already in the STOPPING or STOPPED states, it returns the existing stop promise.
	 * @returns {Promise} A promise that resolves to HTTPTestServer.STOPPED if the HTTP Test Server stops succesfully, or rejects to an error if the HTTP Test Server stop fails.
	 * @throws {HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_NOT_IN_STOPPABLE_STATE} If the HTTP Test Server is not in a state where it is possible to stop it.
	 */
	stop() {
		if (this.#serverState === HTTPTestServer.#STOPPING || this.#serverState === HTTPTestServer.#STOPPED) {
			return this.#serverStopPromise;
		}

		if (this.#serverState !== HTTPTestServer.#LISTENING) {
			throw new HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_NOT_IN_STOPPABLE_STATE();
		}

		const previousState = this.#serverState;

		this.#serverState = HTTPTestServer.#STOPPING;

		this.#serverStopPromise = new Promise((resolve, reject) => {
			this.#serverInstance.once("close", () => {
				console.log(chalk.whiteBright(`HTTP Test Server stopped`));
				this.#serverState = HTTPTestServer.#STOPPED;
				resolve(this.#serverState);
			});

			this.#serverInstance.once("error", (error) => {
				this.#serverState = previousState;
				reject(new systemErrors.createErrorFromSystemErrorCode(error.code));
			});

			this.#serverInstance.close();
		});

		return this.#serverStopPromise;
	}

	/**
	 * @description Processes the HTTP server request
	 * @async
	 * @private
	 * @param {http.IncomingMessage} request The HTTP server request object
	 * @param {http.ServerResponse} response The HTTP server response object
	 */
	async #processRequest(request, response) {
		// Logs the request itself and the timestamp
		console.log(chalk.bgWhiteBright.black.bold(`Request received on ${new Date().toLocaleString()}`));
		console.log(`${request.method} ${request.url} HTTP/${request.httpVersion}`);

		// Logs the request headers
		for (const header in request.headers) {
			console.log(`${header}: ${request.headers[header]}`);
		}

		// Creates a URL object
		const url = new URL(request.url, `http://${request.headers.host}`);

		// HTTP server request state variables
		let silentTimeoutTimer = null;
		let noisyRejectionSendResponseTimer = null;
		let noisyRejectionSendResponseInterval = null;
		let noisyTimeoutSendResponseTimer = null;
		let noisyTimeoutSendResponseInterval = null;
		let noisyTimeoutTimer = null;
		let requestBodyBuffer = null;
		let requestBodyBufferSize = 0;
		let requestBodyArrayOfBuffers = [];

		// Processes the HTTP server request "error" event
		request.on("error", (error) => {
			console.log(`An ${error.code} error occurred while receiving the request.`);

			clearTimersAndIntervals();

			// Destroys the request socket
			request.destroy();
		});

		// Processes the HTTP server response "error" event
		response.on("error", (error) => {
			console.log(`An ${error.code} error occurred while sending the response.`);

			clearTimersAndIntervals();

			// Destroys the response socket
			response.destroy();
		});

		// Executes the silent rejection path
		if (url.pathname === "/silentrejection") {
			console.log("Silent rejection path requested.");
			request.destroy();
			return;
		}

		// Executes the silent timeout path
		if (url.pathname === "/silenttimeout") {
			console.log("Silent timeout path requested.");

			// Sets the silent timeout timer
			silentTimeoutTimer = setTimeout(() => {
				console.log("Silent timeout timer done, destroying the request.");
				request.destroy();
			}, defaults.REQUEST_TIMEOUT);

			return;
		}

		// Processes the HTTP server request "data" event
		request.on("data", (chunk) => {
			requestBodyArrayOfBuffers.push(chunk);
			requestBodyBufferSize = requestBodyBufferSize + chunk.length;
		});

		// Processes the HTTP server request "end" event
		request.on("end", () => {
			if (requestBodyBufferSize > 0) {
				console.log(`Received a request body with a size of ${requestBodyBufferSize} bytes.`);
				requestBodyBuffer = Buffer.concat(requestBodyArrayOfBuffers);
				requestBodyArrayOfBuffers = null; // Reduces memory usage
			} else {
				console.log("No request body.");
			}
		});

		// Processes the HTTP server request "close" event
		request.on("close", () => {
			console.log("The request stream has been closed, sending the response...");

			// Executes the noisy rejection path
			if (url.pathname === "/noisyrejection") {
				console.log("Noisy rejection path requested.");

				// Writes the response status and headers
				response.setHeader("Content-Type", "text/plain; charset=UTF-8");
				response.writeHead(200);

				// Sets the noisy rejection send response interval
				noisyRejectionSendResponseInterval = setInterval(() => {
					response.write("I'll stop sending chunks soon!\n");
				}, defaults.NOISY_REJECTION_SEND_RESPONSE_INTERVAL);

				// Sets the noisy rejection send response timer
				noisyRejectionSendResponseTimer = setTimeout(() => {
					clearInterval(noisyRejectionSendResponseInterval);
					noisyRejectionSendResponseInterval = null;
					response.write("Last chunk!\n", () => {
						response.destroy();
					});
				}, defaults.NOISY_REJECTION_SEND_RESPONSE_TIMER);

				return;
			}

			// Executes the noisy timeout path
			if (url.pathname === "/noisytimeout") {
				console.log("Noisy timeout path requested.");

				// Writes the response status and headers
				response.setHeader("Content-Type", "text/plain; charset=UTF-8");
				response.writeHead(200);

				// Sets the noisy timeout send response interval
				noisyTimeoutSendResponseInterval = setInterval(() => {
					response.write("I'll stop sending chunks soon!\n");
				}, defaults.NOISY_TIMEOUT_SEND_RESPONSE_INTERVAL);

				// Sets the noisy timeout send response timer
				noisyTimeoutSendResponseTimer = setTimeout(() => {
					response.write("Last chunk!\n");
					clearInterval(noisyTimeoutSendResponseInterval);
					noisyTimeoutSendResponseInterval = null;
				}, defaults.NOISY_TIMEOUT_SEND_RESPONSE_TIMER);

				// Sets the noisy timeout timer
				noisyTimeoutTimer = setTimeout(() => {
					console.log("Noisy timeout timer done, destroying the request.");
					response.destroy();
				}, defaults.REQUEST_TIMEOUT);

				return;
			}

			// Executes the big random file path
			if (url.pathname === "/bigrandomfile") {
				console.log("Big random file path requested.");

				// Writes the response status and headers
				response.setHeader("Content-Type", "application/octet-stream");
				response.setHeader("Content-Length", defaults.BIG_FILE_SIZE);
				response.setHeader("Content-Disposition", 'attachment; filename="bigfile.bin"');
				response.writeHead(200);

				// Writes the file contents
				let responseBodyRemainingBytes = defaults.BIG_FILE_SIZE;
				let responseBodyMaxChunkSize = response.writableHighWaterMark;
				let responseBodyChunk = null;
				let writeResponseBody = () => {
					while (responseBodyRemainingBytes > 0) {
						let responseBodyWriteResult = null;
						let responseBodyChunkSize = null;

						// Calculates the HTTP response body chunk size
						if (responseBodyRemainingBytes > responseBodyMaxChunkSize) {
							responseBodyChunkSize = responseBodyMaxChunkSize;
						} else {
							responseBodyChunkSize = responseBodyRemainingBytes;
						}
						// Generates a chunk of the HTTP response body
						responseBodyChunk = crypto.randomBytes(responseBodyChunkSize);

						// Writes a chunk of the HTTP response body
						responseBodyWriteResult = response.write(responseBodyChunk);
						responseBodyRemainingBytes = responseBodyRemainingBytes - responseBodyChunkSize;
						if (responseBodyWriteResult === false) {
							response.once("drain", writeResponseBody);
							return;
						}
					}
					// Finishes writting the response body
					response.end();
				};
				writeResponseBody();

				return;
			}

			// Executes the check pattern path
			if (url.pathname === "/checkpattern") {
				console.log("Check pattern path requested.");

				// Creates a new Buffer object with the pattern
				let patternBuffer = Buffer.alloc(defaults.PATTERN_SIZE, defaults.PATTERN_STRING, defaults.PATTERN_ENCODING);

				// Checks if the request has the correct method, content-type header and body
				if (request.method.toUpperCase() !== "POST" || "content-type" in request.headers === false || request.headers["content-type"].toLowerCase() !== "application/octet-stream" || Buffer.compare(patternBuffer, requestBodyBuffer) !== 0) {
					console.log("The HTTP request pattern does not match.");
					response.writeHead(400);
					response.end();
					return;
				}

				console.log("The HTTP request pattern matches.");

				patternBuffer = null; // Reduces memory usage

				console.log("Sending the HTTP response pattern...");

				response.setHeader("Content-Type", "application/octet-stream");
				response.setHeader("Content-Length", defaults.PATTERN_SIZE);
				response.writeHead(200);

				let responseBodyBufferPointer = 0;
				let responseBodyBufferSize = requestBodyBuffer.length;
				let maxResponseChunkSize = response.writableHighWaterMark;

				let writeResponseBody = () => {
					while (responseBodyBufferPointer < responseBodyBufferSize) {
						let writeResponseBodyResult = null;
						let responseBodyChunkSize = null;
						let responseBodyChunk = null;

						// Calculates the HTTP response body chunk size
						if (responseBodyBufferSize - responseBodyBufferPointer < maxResponseChunkSize) {
							responseBodyChunkSize = responseBodyBufferSize - responseBodyBufferPointer;
						} else {
							responseBodyChunkSize = maxResponseChunkSize;
						}

						// Gets a chunk of the HTTP response body buffer
						responseBodyChunk = requestBodyBuffer.subarray(responseBodyBufferPointer, responseBodyBufferPointer + responseBodyChunkSize);

						// Writes a chunk of the HTTP response body buffer
						writeResponseBodyResult = response.write(responseBodyChunk);
						responseBodyBufferPointer = responseBodyBufferPointer + responseBodyChunkSize;
						if (writeResponseBodyResult === false) {
							response.once("drain", writeResponseBody);
							return;
						}
					}
					// Finishes writing the response body
					console.log("Finished sending the HTTP response pattern.");
					response.end();
				};

				writeResponseBody();

				return;
			}

			// Executes the check string path
			if (url.pathname === "/checkstring") {
				console.log("Check string path requested.");

				// Creates a new Buffer object with the pattern
				let patternBuffer = Buffer.from(defaults.PATTERN_STRING.repeat(defaults.PATTERN_STRING_REPEAT), defaults.PATTERN_ENCODING);

				// Checks if the request has the correct method, content-type header and body
				if (request.method.toUpperCase() !== "POST" || "content-type" in request.headers === false || request.headers["content-type"].toLowerCase() !== "text/plain" || Buffer.compare(patternBuffer, requestBodyBuffer) !== 0) {
					console.log("The HTTP request string does not match.");
					response.writeHead(400);
					response.end();
					return;
				}

				console.log("The HTTP request string matches.");

				patternBuffer = null; // Reduces memory usage

				console.log("Sending the HTTP response string...");

				response.setHeader("Content-Type", "text/plain");
				response.setHeader("Content-Length", requestBodyBuffer.length);
				response.writeHead(200);

				let responseBodyBufferPointer = 0;
				let responseBodyBufferSize = requestBodyBuffer.length;
				let maxResponseChunkSize = response.writableHighWaterMark;

				let writeResponseBody = () => {
					while (responseBodyBufferPointer < responseBodyBufferSize) {
						let writeResponseBodyResult = null;
						let responseBodyChunkSize = null;
						let responseBodyChunk = null;

						// Calculates the HTTP response body chunk size
						if (responseBodyBufferSize - responseBodyBufferPointer < maxResponseChunkSize) {
							responseBodyChunkSize = responseBodyBufferSize - responseBodyBufferPointer;
						} else {
							responseBodyChunkSize = maxResponseChunkSize;
						}

						// Gets a chunk of the HTTP response body buffer
						responseBodyChunk = requestBodyBuffer.subarray(responseBodyBufferPointer, responseBodyBufferPointer + responseBodyChunkSize);

						// Writes a chunk of the HTTP response body buffer
						writeResponseBodyResult = response.write(responseBodyChunk);
						responseBodyBufferPointer = responseBodyBufferPointer + responseBodyChunkSize;
						if (writeResponseBodyResult === false) {
							response.once("drain", writeResponseBody);
							return;
						}
					}
					// Finishes writing the response body
					console.log("Finished sending the HTTP response string.");
					response.end();
				};

				writeResponseBody();

				return;
			}

			// Executes the check string path
			if (url.pathname === "/silentresponse") {
				console.log("Silent response path requested.");

				// Writes the response status and headers
				response.writeHead(204);

				// Finishes the response
				response.end();

				return;
			}

			// Executes the stop path
			if (url.pathname === "/stop") {
				console.log("Close path requested.");

				// Writes the response status and headers
				response.setHeader("Content-Type", "text/html; charset=UTF-8");
				response.writeHead(200);

				// Writes the response stating that the server is closing
				response.write("<html><head><title>HTTP Test Server</title></head><body><h1>Stopping the HTTP Test Server...</h1></body></html>");

				// Finishes the response
				response.end();

				// Stops the server
				this.stop();

				return;
			}

			// Writes the response status and headers
			response.setHeader("Content-Type", "text/html; charset=UTF-8");
			response.writeHead(200);

			// Writes the welcome page
			response.write("<html><head><title>HTTP Test Server</title></head><body><h1>Welcome to the HTTP Test Server!</h1></body></html>");

			// Finishes the response
			response.end();
		});

		// Processes the HTTP server response "finish" event
		response.on("finish", () => {
			// This event is not used
		});

		// Processes the HTTP server response "close" event
		response.on("close", () => {
			console.log("The response stream has been closed.");
			clearTimersAndIntervals();
		});

		// Clears all the timers and intervals
		function clearTimersAndIntervals() {
			// Clears the silent timeout timer
			if (silentTimeoutTimer !== null) {
				clearTimeout(silentTimeoutTimer);
				silentTimeoutTimer = null;
				console.log("Silent timeout timer cleared.");
			}

			// Clears the noisy rejection send response interval
			if (noisyRejectionSendResponseInterval !== null) {
				clearInterval(noisyRejectionSendResponseInterval);
				noisyRejectionSendResponseInterval = null;
				console.log("Noisy rejection send response interval cleared.");
			}

			// Clears the noisy rejection send response timer
			if (noisyRejectionSendResponseTimer !== null) {
				clearTimeout(noisyRejectionSendResponseTimer);
				noisyRejectionSendResponseTimer = null;
				console.log("Noisy rejection send response timer cleared.");
			}

			// Clears the noisy timeout send response interval
			if (noisyTimeoutSendResponseInterval !== null) {
				clearInterval(noisyTimeoutSendResponseInterval);
				noisyTimeoutSendResponseInterval = null;
				console.log("Noisy timeout send response interval cleared.");
			}

			// Clears the noisy timeout send response timer
			if (noisyTimeoutSendResponseTimer !== null) {
				clearTimeout(noisyTimeoutSendResponseTimer);
				noisyTimeoutSendResponseTimer = null;
				console.log("Noisy timeout send response timer cleared.");
			}

			// Clears the noise timeout timer
			if (noisyTimeoutTimer !== null) {
				clearTimeout(noisyTimeoutTimer);
				noisyTimeoutTimer = null;
				console.log("Noisy timeout timer cleared.");
			}
		}
	}
}

module.exports = HTTPTestServer;
