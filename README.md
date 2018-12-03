# debug-it
[![Build Status](https://travis-ci.org/lsentkiewicz/debug-it.svg?branch=master)](https://travis-ci.org/lsentkiewicz/debug-it)
[![codecov](https://codecov.io/gh/lsentkiewicz/debug-it/branch/master/graph/badge.svg)](https://codecov.io/gh/lsentkiewicz/debug-it) [![Greenkeeper badge](https://badges.greenkeeper.io/BetterCallSky/debug-it.svg)](https://greenkeeper.io/)

Debug-it is a simple library for logging input and output parameters of a decorated class.
It depends on [debug](https://www.npmjs.com/package/debug).  
This library is very similar to [decorate-it](https://github.com/lsentkiewicz/decorate-it) but doesn't perform any validation and it can be used in the browser.
## Installation

```
npm i --save debug-it
```


## Sample usage
file `services/CalcService.js`
```js
import decorate from 'debug-it';

function add(a, b) {
  return a + b;
}

// create your service
const CalcService = {
  add,
};

// decorate it, it will mutate CalcService
decorate(CalcService, 'app:CalcService');

export default CalcService;

```

use service
```js
import CalcService from './services/CalcService';


CalcService.add(1, 3); // returns 4
```

See example under `example/example1.js`. Run it using `npm run example1`.


## Async sample usage
file `services/UserService.js`
```js
import decorate from '../src/decorator';

async function getUser(id) {
  return await new Promise((resolve) => {
    setTimeout(() => resolve({ id, username: 'john' }), 100);
  });
}

getUser.params = ['id'];


// create your service
const UserService = {
  getUser,
};

// decorate it, it will mutate UserService
decorate(UserService, 'app:UserService');

export default UserService;

```

use service
```js
import UserService from './services/UserService';


await UserService.getUser(1); // returns { id: 1, username: 'john' }
await UserService.getUser(222); // returns { id: 222, username: 'john' }
```

See example under `example/example2.js`. Run it using `npm run example2`.  
**NOTE** parameter names cannot be automatically retrieved from `async` methods.  
You must define them explicitly in `params` property like this `getUser.params = ['id'];`


MIT License

Copyright (c) 2017 Łukasz Sentkiewicz