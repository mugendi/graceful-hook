# graceful-hook
 This module is somewhat a merge of [Exit-Hook](https://www.npmjs.com/package/exit-hook) and [Signal-Exit](https://www.npmjs.com/package/signal-exit).

 This is because **exit-hook** does not cover all exit signals although with a little editing, I found that it better handles multiple hooks and waiting for asynchronous processes to end, something that **signal-exit** wasn't very good at. 

 Moreover, **exit-hook** wonderfully handles pm2 exits.

This module is thus *the best of both worlds*.

The API aligns exactly with **exit-hook** so do have a look at the [readme](https://github.com/sindresorhus/exit-hook/blob/main/readme.md) in case you have any questions.

## Install

```
$ npm install graceful-hook
```

## Usage

```js

const gracefulHook = require('graceful-hook');

gracefulHook(async () => {
	console.log('Exiting after some async process...');
    await longAsyncProcess()
});

// You can add multiple hooks, even across files
gracefulHook(() => {
	console.log('Exiting 2');
});

throw new Error('🦄');

//=> 'Exiting'
//=> 'Exiting 2'
```
