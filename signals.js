// This is not the set of all possible signals.
//
// It IS, however, the set of all signals that trigger
// an exit on either Linux or BSD systems.  Linux is a
// superset of the signal names supported on BSD, and
// the unknown signals just fail to register, so we can
// catch that easily enough.
//
// Don't bother with SIGKILL.  It's uncatchable, which
// means that we can't fire any callbacks anyway.
//
// If a user does happen to register a handler on a non-
// fatal signal like SIGWINCH or something, and then
// exit, it'll end up firing `process.emit('exit')`, so
// the handler will be fired anyway.
//
// SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
// artificially, inherently leave the process in a
// state from which it is not safe to try and enter JS
// listeners.

// source: https://chromium.googlesource.com/chromiumos/docs/+/master/constants/signals.md
let signalNumbers = {
	SIGABRT: 6,
	SIGALRM: 14,
	SIGHUP: 1,
	SIGINT: 2,
	SIGTERM: 15,
	SIGVTALRM: 26,
	SIGXCPU: 24,
	SIGXFSZ: 25,
	SIGUSR2: 12,
	SIGTRAP: 5,
	SIGSYS: 31,
	SIGQUIT: 3,
	SIGIOT: 6,
	SIGIO: 29,
	SIGPOLL: 29,
	SIGPWR: 30,
	SIGSTKFLT: 16,
	SIGUNUSED: 31, //see: http://dictionary.sensagent.com/SIGUNUSED/en-en/
};

let signals = ['SIGABRT', 'SIGALRM', 'SIGHUP', 'SIGINT', 'SIGTERM'];

if (process.platform !== 'win32') {
	signals.push(
		'SIGVTALRM',
		'SIGXCPU',
		'SIGXFSZ',
		'SIGUSR2',
		'SIGTRAP',
		'SIGSYS',
		'SIGQUIT',
		'SIGIOT'
		// should detect profiler and enable/disable accordingly.
		// see #21
		// 'SIGPROF'
	);
}

if (process.platform === 'linux') {
	signals.push('SIGIO', 'SIGPOLL', 'SIGPWR', 'SIGSTKFLT', 'SIGUNUSED');
}

module.exports = { signals, signalNumbers };
