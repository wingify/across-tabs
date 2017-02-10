## AcrossTabs - Easily communicate among browser tabs(supports cross-origin).

[![npm version](https://badge.fury.io/js/across-tabs.svg)](https://www.npmjs.com/package/across-tabs) [![npm](https://img.shields.io/npm/dt/across-tabs.svg)](https://www.npmjs.com/package/across-tabs) [![Build Status](http://img.shields.io/travis/softvar/across-tabs/master.svg?style=flat)](http://travis-ci.org/softvar/across-tabs)

[![NPM](https://nodei.co/npm/across-tabs.png?downloads=true)](https://nodei.co/npm/across-tabs/)

**[LIVE DEMO](http://engineering.wingify.com/across-tabs#live-demo)**

* [Features](#features)
* [Installation](#installation)
* [Flow diagram](#flow-diagram)
* [Usage](#usage)
* [API](#api)
* [Browser support](#browser-support)
* [Development Stack](#development-stack)
* [Process](#process)
* [Scripts](#scripts)
* [Contributing](#contributing)
* [Roadmap](#roadmap)
* [Authors](#authors)
* [Copyright and license](#copyright-and-license)

### Features

1. Safely enables [cross-origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) communication among different browser tabs. Uses `PostMessage` API for communicating with each other.
2. Easy to hook custom callback at various levels. Eg: executing a custom method in Child's tab on receiving a message from Parent tab.
3. Provide `data-tab-opener="name"` on the target link/btn to disable/enable the element, based on the communication-setup status.
4. Fully fledged API to get information regarding the tabs(Parent and Child tabs) and other communication related methods.
5. Exports in a umd format i.e. library works everywhere.

### Installation

Via [npm](https://www.npmjs.com/)

```
$ npm install across-tabs
```

Via [bower](https://bower.io/)

```
$ bower install across-tabs
```

### Flow Diagram


### Usage

##### Create an instance / reference before using.

**Opener(Parent) tab***

```
var config = {
  onHandshakeCallback: function () { ... },
  onPollingCallback: function () { ... }
}
var parent = new AcrossTabs.Parent(config);
```

`Constructor` accepts a configurable `Object` with the following keys.

* `heartBeatInterval`: The time interval for polling tabs statuses
* `removeClosedTabs`: Pass it as `true` to have only opened tabs in the list
* `shouldInitImmediately`: Pass it as `false` to create an instance but initialize it later
* `onHandshakeCallback`: Callback to be called when a successful connection has been established
* `onPollingCallback`: Callback to be called every time a tab is polled for its status

| Config Keys               |     default    |      accepts                              |
| ---------------------     | -------------- | ----------------------------------------- |
| **heartBeatInterval**     |     500 msec   |  A number representing milliseconds       |
| **removeClosedTabs**      |     false      |            Boolean                        |
| **shouldInitImmediately** |     true       |            Boolean                        |
| **onHandshakeCallback**   |     Undefined  |        Function as callback               |
| **onPollingCallback**     |     Undefined  |        Function as callback               |


**New(Child tab)**

```
var config = {
  onReady: onReady,
  onInitialize: onInitialize,
  handshakeExpiryLimit: 4000, // msec
  onParentDisconnect: onParentDisconnect,
  onParentCommunication: onParentCommunication
};
var child =  new AcrossTabs.Child();
```

`Constructor` accepts a configurable `Object` with the following keys.

* `handshakeExpiryLimit`: Time to wait for getting an acknowledgement from Parent window for child's request
* `onReady`: Callback to be invoked once child instance is ready
* `onInitialize`: Callback when a child instance is actually initiated
* `onParentDisconnect`: Callback to be invoked when Parent gets disconnected
* `onParentCommunication`: Callback to be invoked whenevr Parent communicates with the child tab

| Config Keys               |     default    |      accepts                              |
| ------------------------- | -------------- | ----------------------------------------- |
| **handshakeExpiryLimit**  |    5000 msec   |    A number representing milliseconds     |
| **onReady**               |    Undefined   |        Function as callback               |
| **onInitialize**          |    Undefined   |        Function as callback               |
| **onParentDisconnect**    |    Undefined   |        Function as callback               |
| **onParentCommunication** |    Undefined   |        Function as callback               |


### API

Refer [above section](#create-an-instance--reference-before-using) on how to create an instance before hitting API methods.

##### Opener Tab(Parent) Methods

* **`openNewTab`**

  Saves `data` in specifed `key` in localStorage. If the key is not provided, the library will warn. Following types of JavaScript objects are supported:

  |   Parameter   |        Description                                   |
  | ------------- | ---------------------------------------------------- |
  |     config    |     For opening a new tab i.e. url and windowName    |

  ```
    parent.openNewTab({url: 'http://example.com', windowName: 'AcrossTab'});
  ```

* **`enableElements`**

  Links / buttons can be given a data attribute: `data-tab-opener="name"`. On clicking, the library finds elements with that attribute and adds `disabled="disabled"` attribute to that element. The `disabled` attribute is removed once the Child tab communicates back to the opener i.e. Parent. Though, this method is called internally but can also be invoked(may be within a timer) to be on a safer side.

  ```
    parent.enableElements();
  ```

* **`getAllTabs`**

  Returns the list of all the tabs.
  If `removeClosedTabs: true` is provided while instantiating, it will return only the opened tabs as closed tabs would be removed.
  ```
    parent.getAllTabs()
  ```

* **`getOpenedTabs`**

  Returns the list of all `opened` tabs.

  ```
    parent.getOpenedTabs();
  ```

* **`getClosedTabs`**

  Returns the list of all `closed` tabs.
  If `removeClosedTabs: true` is provided while instantiating, it will return empty list as closed tabs would be removed.

  ```
    parent.getClosedTabs();
  ```

* **`closeAllTabs`**

  Closes all the opened tabs.

  ```
    parent.closeAllTabs()
  ```

* **`closeTab`**

  Closes a particular tab whose id is provided.

  |   Parameter   |        Description                |
  | ------------- | --------------------------------- |
  |     id        |     id of the tab to be closed    |

  ```
    parent.closeTab('57cd47da-d98e-4a2d-814c-9b07cb51059c');
  ```

* **`broadCastAll`**

  Sends a same `message` to all the opened tabs.

  |   Parameter   |        Description          |
  | ------------- | --------------------------- |
  |     msg       |        msg to be ent        |

  ```
    parent.broadCastAll('Hello my dear Child! A greeting from Parent.'});
  ```

* **`broadCastTo`**

  Sends a `message` to a particular opened tab.

  |   Parameter   |        Description            |
  | ------------- | ----------------------------- |
  |     id        |  id of the tab to send a msg  |
  |     msg       |        msg to be ent          |

  ```
    parent.broadCastTo('57cd47da-d98e-4a2d-814c-9b07cb51059c', 'Hey! Can you run the script: worker.js? Thanks!');
  ```

#####  New Tab(Child) Methods

* **`getTabInfo`**

  Return id, name and parentName of the child tab.

  ```
    child.getTabInfo();
  ```

* **`sendMessageToParent`**

  Sends a `message` to the `Parent` tab.

  |   Parameter   |        Description            |
  | ------------- | ----------------------------- |
  |     msg       |        msg to be ent          |

  ```
    parent.sendMessageToParent('Hey Parent! I\'m done with my work.');
  ```

### Browser Support

Tested in Chrome and Firefox.

### Development Stack

* Webpack based `src` compilation & bundling and `dist` generation.
* ES6 as a source of writing code.
* Exports in a [umd](https://github.com/umdjs/umd) format so the library works everywhere.
* Linting with [ESLint](http://eslint.org/).
* ES6 test setup with [Karma](https://karma-runner.github.io/1.0/index.html), [Jasmine](https://jasmine.github.io/2.0/introduction.html) and [isparta](https://github.com/deepsweet/isparta-loader).
* Test covergae with [Istanbul]() and [Coveralls](https://coveralls.io/).

### Process

```
ES6 source files
       |
       |
    webpack
       |
       +--- babel, eslint
       |
       o--- tests and covergae
       |
  ready to use
     library
  in umd format
```

### Scripts

* `npm run build` - produces production version of the library under the `dist` folder
* `npm run dev` - produces development version of the library and runs a watcher
* `npm run test` - well ... it runs the tests :)

### Contributing

1. Fork the repo on GitHub.
2. Clone the repo on machine.
3. Execute `npm install` and `npm run dev`.
3. Create a new branch `<fix-typo>` and do your work.
4. Run `npm run build` to build dist files and `npm run test` to ensure all test cases are passing.
5. Commit your changes to the branch.
6. Submit a Pull request.

### Roadmap

* Have a queuing mechanism to deal with loads of async events.
* E2E testing so that the behavior can be tested automatically.
* Add support for providing `origin` for postMessage communication for security concerns.
* Maintaining and adding more enhancements as and when required. Open to everyone's suggestions.

### Authors
**[Varun Malhotra](http://varunmalhotra.xyz)** [@softvar](https://github.com/softvar)

### Copyright and license

>The [MIT license](https://opensource.org/licenses/MIT) (MIT)
>
>Copyright (c) 2017-2018 Wingify Software Pvt. Ltd.
>
>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
