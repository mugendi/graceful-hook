const process = require('node:process');
const { signals, signalNumbers } = require('./signals');

const callbacks = new Set();
let isCalled = false;
let isRegistered = false;

async function exit(shouldManuallyExit, signal, signalNum) {
	if (isCalled) {
		return;
	}

	isCalled = true;

	for (const callback of callbacks) {
		await callback(signal, signalNum);
	}

	if (shouldManuallyExit === true) {
		process.exit(128 + signalNum); // eslint-disable-line unicorn/no-process-exit
	}
}

function format_options(options) {
	// must be an object
	options = 'object' == typeof options ? options : {};

	// format ignore
	options.ignore = options.ignore || [];

	// ensure ignore is array
	options.ignore = Array.isArray(options.ignore)
		? options.ignore
		: options.ignore
		? [options.ignore]
		: [];
	// ensure signal names are capitalized
	options.ignore = options.ignore.map((s) => s.toUpperCase());

	return options;
}

module.exports = function exitHook(onExit, options) {
	if ('function' !== typeof onExit) {
		throw new Error(
			'A callback function must be passed as the first argument.'
		);
	}

	//format options
	options = format_options(options);

	callbacks.add(onExit);

	if (!isRegistered) {
		isRegistered = true;

		process.once('exit', exit.bind(undefined, false, 'exit', 0));

		for (let signal of signals) {
			if (options.ignore.indexOf(signal) == -1) {
				// console.info(signal, signalNumbers[signal] || 0);
				process.once(
					signal,
					exit.bind(
						undefined,
						false,
						signal,
						signalNumbers[signal] || 0
					)
				);
			}
		}

		// PM2 Cluster shutdown message. Caught to support async handlers with pm2, needed because
		// explicitly calling process.exit() doesn't trigger the beforeExit event, and the exit
		// event cannot support async handlers, since the event loop is never called after it.
		process.on('message', (message) => {
			if (message === 'shutdown') {
				exit(true, null, -128);
			}
		});
	}

	return () => {
		callbacks.delete(onExit);
	};
};
