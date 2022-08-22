const process = require('node:process');


const callbacks = new Set();
let isCalled = false;
let isRegistered = false;

async function exit(shouldManuallyExit, signal) {
	if (isCalled) {
		return;
	}

	isCalled = true;

	for (const callback of callbacks) {
		await callback();
	}

	if (shouldManuallyExit === true) {
		process.exit(128 + signal); // eslint-disable-line unicorn/no-process-exit
	}
}

module.exports =  function exitHook(onExit) {
	callbacks.add(onExit);

	if (!isRegistered) {
		isRegistered = true;

		process.once('exit', exit);

        for(let signal of require("./signals")){
            process.once(signal, exit.bind(undefined, true));
        }
		

		// PM2 Cluster shutdown message. Caught to support async handlers with pm2, needed because
		// explicitly calling process.exit() doesn't trigger the beforeExit event, and the exit
		// event cannot support async handlers, since the event loop is never called after it.
		process.on('message', (message) => {
			if (message === 'shutdown') {
				exit(true, -128);
			}
		});
	}

	return () => {
		callbacks.delete(onExit);
	};
}
