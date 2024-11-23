/**
 * @module http-test-server-tests
 * @description HTTP Test Server tests.
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
const { expect, test } = require("@jest/globals");
const HTTPTestServer = require("../src/http-test-server.js");

describe("HTTP Test Server tests", () => {
	test("An attempt to create an HTTPTestServer instance should throw an ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID error when the serverHost option is not a string", () => {
		expect.assertions(4);
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: null });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: ["hostname"] });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: { serverHost: "hostname" } });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTPTestServer instance should throw an ERROR_HTTP_TEST_SERVER_HOST_INVALID error when the serverHost option is not a valid host", () => {
		expect.assertions(6);
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: "192.168.0" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: "192.168.0.256" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: "hostname!" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: "host_name" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: "www.host_name.com" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverHost: "www.hostname.123" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_HOST_INVALID);
		}
	});

	test("An attempt to create an HTTPTestServer instance should throw an ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID error when the serverPort option is not an integer", () => {
		expect.assertions(5);
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverPort: null });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverPort: "1234" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverPort: [1234] });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverPort: { serverPort: 1234 } });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverPort: 3.14 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_PORT_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTPTestServer instance should throw an ERROR_HTTP_TEST_SERVER_PORT_OUT_OF_BOUNDS error when the serverPort option is not an integer between 0 and 65535", () => {
		expect.assertions(2);
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverPort: -10 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_PORT_OUT_OF_BOUNDS);
		}
		try {
			let httpTestServerInstance = new HTTPTestServer({ serverPort: 65536 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_PORT_OUT_OF_BOUNDS);
		}
	});

	test("An attempt to create an HTTPTestServer instance should return an HTTPTestServer instance when valid options are passed", () => {
		expect.assertions(2);
		let httpTestServerInstance1 = new HTTPTestServer({});
		expect(httpTestServerInstance1).toBeInstanceOf(HTTPTestServer);
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		expect(httpTestServerInstance2).toBeInstanceOf(HTTPTestServer);
	});

	test("An HTTPTestServer instance should be in the CREATED state after its constructor is called", () => {
		expect.assertions(2);
		let httpTestServerInstance1 = new HTTPTestServer({});
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.CREATED);
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.CREATED);
	});

	test("An HTTPTestServer instance should return a Promise object when its start(...) method is called and it is in the CREATED state", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.CREATED);
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		expect(httpTestServerInstance1StartPromise).toBeInstanceOf(Promise);
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.CREATED);
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		expect(httpTestServerInstance2StartPromise).toBeInstanceOf(Promise);
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("An HTTPTestServer instance should be in the STARTING state after its start(...) method is called", async () => {
		expect.assertions(2);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.STARTING);
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.STARTING);
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("An HTTPTestServer instance in the STARTING state should return the same Promise object that was returned on the first call to its start(...) method after its start(...) method is called again", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.STARTING);
		expect(httpTestServerInstance1.start()).toBe(httpTestServerInstance1StartPromise);
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.STARTING);
		expect(httpTestServerInstance2.start()).toBe(httpTestServerInstance2StartPromise);
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("The Promise object returned by the start(...) method of an HTTPTestServer instance should resolve to HTTPTestServer.LISTENING", async () => {
		expect.assertions(2);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		expect(httpTestServerInstance1StartResult).toBe(HTTPTestServer.LISTENING);
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		expect(httpTestServerInstance2StartResult).toBe(HTTPTestServer.LISTENING);
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("An HTTPTestServer instance should be in the LISTENING state when the Promise object returned by its start(...) method resolves", async () => {
		expect.assertions(2);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.LISTENING);
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.LISTENING);
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("An HTTPTestServer instance in the LISTENING state should return the same Promise object that was returned on the first call to its start(...) method after its start(...) method is called again", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.LISTENING);
		expect(httpTestServerInstance1.start()).toBe(httpTestServerInstance1StartPromise);
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.LISTENING);
		expect(httpTestServerInstance2.start()).toBe(httpTestServerInstance2StartPromise);
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("A call to the start(...) method of an HTTPTestServer instance that is not in the CREATED, STARTING, LISTENING or STOPPED state should return an ERROR_HTTP_TEST_SERVER_NOT_IN_STARTABLE_STATE error", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.STOPPING);
		try {
			httpTestServerInstance1.start();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_NOT_IN_STARTABLE_STATE);
		}
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.STOPPING);
		try {
			httpTestServerInstance2.start();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_NOT_IN_STARTABLE_STATE);
		}
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("The Promise returned by a call to the start(...) method of an HTTPTestServer instance that is using the same port as another HTTPSTestServer instance should reject to an ERROR_ADDRESS_IN_USE error", async () => {
		expect.assertions(1);
		let httpTestServerInstance1 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		try {
			await httpTestServerInstance2StartPromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_ADDRESS_IN_USE);
		}
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
	});

	test("An HTTPTestServer instance that was created with a server port between 1 and 65535 should be listening on the specified port after it is started", async () => {
		expect.assertions(1);
		let httpTestServerInstance1 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		expect(httpTestServerInstance1.port).toBe(8000);
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
	});

	test("An HTTPTestServer instance that was created with a server port of 0 should be listening on a random port between 1 and 65535 after it is started", async () => {
		expect.assertions(2);
		let httpTestServerInstance1 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		expect(httpTestServerInstance1.port).toBeGreaterThan(0);
		expect(httpTestServerInstance1.port).toBeLessThan(65536);
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
	});

	test("An HTTPTestServer instance should return a Promise object when its stop(...) method is called and it is in the LISTENING state", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.LISTENING);
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		expect(httpTestServerInstance1StopPromise).toBeInstanceOf(Promise);
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.LISTENING);
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		expect(httpTestServerInstance2StopPromise).toBeInstanceOf(Promise);
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("An HTTPTestServer instance that is in the LISTENING state should change to the STOPPING state after its stop(...) method is called", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.LISTENING);
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.STOPPING);
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.LISTENING);
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.STOPPING);
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("An HTTPTestServer instance in the STOPPING state should return the same Promise object that was returned on the first call to its stop(...) method after its stop(...) method is called again", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.STOPPING);
		expect(httpTestServerInstance1.stop()).toBe(httpTestServerInstance1StopPromise);
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.STOPPING);
		expect(httpTestServerInstance2.stop()).toBe(httpTestServerInstance2StopPromise);
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
	});

	test("The Promise object returned by the stop(...) method of an HTTPTestServer instance should resolve to HTTPTestServer.STOPPED", async () => {
		expect.assertions(2);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		expect(httpTestServerInstance1StopResult).toBe(HTTPTestServer.STOPPED);
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
		expect(httpTestServerInstance2StopResult).toBe(HTTPTestServer.STOPPED);
	});

	test("An HTTPTestServer instance should be in the STOPPED state when the Promise object returned by its stop(...) method resolves", async () => {
		expect.assertions(2);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.STOPPED);
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.STOPPED);
	});

	test("An HTTPTestServer instance in the STOPPED state should return the same Promise object that was returned on the first call to its stop(...) method after its stop(...) method is called again", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		let httpTestServerInstance1StartPromise = httpTestServerInstance1.start();
		let httpTestServerInstance1StartResult = await httpTestServerInstance1StartPromise;
		let httpTestServerInstance1StopPromise = httpTestServerInstance1.stop();
		let httpTestServerInstance1StopResult = await httpTestServerInstance1StopPromise;
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.STOPPED);
		expect(httpTestServerInstance1.stop()).toBe(httpTestServerInstance1StopPromise);
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		let httpTestServerInstance2StartPromise = httpTestServerInstance2.start();
		let httpTestServerInstance2StartResult = await httpTestServerInstance2StartPromise;
		let httpTestServerInstance2StopPromise = httpTestServerInstance2.stop();
		let httpTestServerInstance2StopResult = await httpTestServerInstance2StopPromise;
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.STOPPED);
		expect(httpTestServerInstance2.stop()).toBe(httpTestServerInstance2StopPromise);
	});

	test("A call to the stop(...) method of an HTTPTestServer instance that is not in the LISTENING, STOPPING or STOPPED states should return an ERROR_HTTP_TEST_SERVER_NOT_IN_STOPPABLE_STATE error", async () => {
		expect.assertions(4);
		let httpTestServerInstance1 = new HTTPTestServer({});
		expect(httpTestServerInstance1.state).toBe(HTTPTestServer.CREATED);
		try {
			httpTestServerInstance1.stop();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_NOT_IN_STOPPABLE_STATE);
		}
		let httpTestServerInstance2 = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 8000 });
		expect(httpTestServerInstance2.state).toBe(HTTPTestServer.CREATED);
		try {
			httpTestServerInstance2.stop();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPTestServer.errors.ERROR_HTTP_TEST_SERVER_NOT_IN_STOPPABLE_STATE);
		}
	});
});
