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

module.exports = function exitHook(onExit, options) {
	if ('function' !== typeof onExit) {
		throw new Error(
			'A callback function must be passed as the first argument.'
		);
	}

	let ignoreSignals = 'object' == typeof options.ignore ? options.ignore : [];
	ignoreSignals = Array.isArray(ignoreSignals)
		? ignoreSignals
		: [ignoreSignals];
	ignoreSignals = ignoreSignals.map((s) => s.toUpperCase());

	callbacks.add(onExit);

	if (!isRegistered) {
		isRegistered = true;

		process.once('exit', exit.bind(undefined, false, 'exit', 0));

		for (let signal of signals) {
			if (ignoreSignals.indexOf(signal) == -1) {
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
