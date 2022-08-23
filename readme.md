# graceful-hook

This module is somewhat a merge of [Exit-Hook](https://www.npmjs.com/package/exit-hook) and [Signal-Exit](https://www.npmjs.com/package/signal-exit).

This is because **exit-hook** does not cover all exit signals although with a little editing, I found that it better handles multiple hooks and waiting for asynchronous processes to end, something that **signal-exit** wasn't very good at. 

Moreover, **exit-hook** wonderfully handles pm2 exits.

This module is thus *the best of both worlds*. 

Here are some of the things it does differently:
- Returns the signal to callback function unlike **exit-hook**
- Tries to handle async callbacks, including waiting for them to resolve
- Includes all the signals that are handled by **signal-exit** and not **exit-hook**
- Handles pm2 shutdown messages as handled by **exit-hook** and not **signal-exit**
- Adds an ```ignore``` option to ensure certain signals can be ignored. This fine grained signal handling is important to ensure the hook plays well with tools like **Nodemon**. 


## Install

```
$ npm install graceful-hook
```

## Usage

```js

const gracefulHook = require('graceful-hook');

// Hook with option to ignore some signals
gracefulHook(async (signal, signalNum) => {
	console.log(`${signal} received`);
	console.log('Exiting with after some async process...');

    await longAsyncProcess();

}, {ignore:['SIGUSR2']});

// You can add multiple hooks, even across files
gracefulHook(() => {
	console.log('Exiting 2');
});

throw new Error('🦄');

```

## API
**```gracefulHook(callbackFn, [options]);```**


### Options
- **```ignore```** : Array of signals to ignore.

	This is important when using tools like [Nodemon](https://www.npmjs.com/package/nodemon) that will restart the process on change, not because the process is actually exiting. Nodemon for example will exit with the signal *'SIGUSR2'* so you can ignore that.
