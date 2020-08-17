## <img src="https://raw.githubusercontent.com/wingify/across-tabs/master/across-tabs.png" alt="Across tabs" width="50" height="50"/> AcrossTabs - Easy communication between cross-origin browser tabs.

[![npm version](https://badge.fury.io/js/across-tabs.svg)](https://www.npmjs.com/package/across-tabs) [![npm](https://img.shields.io/npm/dt/across-tabs.svg)](https://www.npmjs.com/package/across-tabs) [![Build Status](http://img.shields.io/travis/wingify/across-tabs/master.svg?style=flat)](http://travis-ci.org/wingify/across-tabs) [![Coverage Status](https://coveralls.io/repos/github/wingify/across-tabs/badge.svg?branch=master)](https://coveralls.io/github/wingify/across-tabs?branch=master) ![](https://img.shields.io/cdnjs/v/across-tabs.svg?colorB=dd4814) ![](http://img.badgesize.io/wingify/across-tabs/master/dist/across-tabs.min.js?compression=gzip&color=blue)

[![NPM](https://nodei.co/npm/across-tabs.png?downloads=true)](https://nodei.co/npm/across-tabs/)

<a href="https://news.ycombinator.com/item?id=14041400"><img src="https://raw.githubusercontent.com/wingify/across-tabs/master/images/hn.png" width="150" height="20"/></a>
<a href="https://www.producthunt.com/posts/across-tabs"><img src="https://raw.githubusercontent.com/wingify/across-tabs/master/images/product_hunt.png" width="100" height="20"/></a>

**[LIVE DEMO](http://engineering.wingify.com/across-tabs#live-demo)**

- [Features](#features)
- [Installation](#installation)
- [Flow diagram](#flow-diagram)
- [Usage](#usage)
- [API](#api)
- [Browser support](#browser-support)
- [Development Stack](#development-stack)
- [Process](#process)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Authors](#authors)
- [Copyright and license](#copyright-and-license)

### Features

1. Safely enables [cross-origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) communication among different browser tabs. Uses `PostMessage` API for communication.
2. Easy to hook custom callback at various levels. Eg: executing a custom method in Child's tab on receiving a message from Parent tab.
3. Option to provide `data-tab-opener="name"` attribute on the target link/button(which opens up a new tab), so that it remains to disable until `Child` tab initiates a handshake and is received by the `Parent` tab
4. Fully fledged API to get information regarding the tabs(Parent and Child tabs) and other communication-related methods.
5. Exports in a UMD format i.e. library works everywhere.
6. Only `~4 KB` gzipped.

### Installation

1. Via [npm](https://www.npmjs.com/)

```
$ npm install across-tabs
```

2. Via [bower](https://bower.io/)

```
$ bower install across-tabs
```

3. Via [cdnjs](https://cdnjs.com), using `<script>` tag

```
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/across-tabs/1.0.0/across-tabs.min.js"></script>
```

**Note**: Use the desired version of the library in place of `1.0.0`. Checkout [cdnjs across-tabs](https://cdnjs.com/libraries/across-tabs).

### Flow Diagram

- Opener/Parent tab(`P`) opens up a new Child tab(`C`).
- `C` initiates a handshake with the `P` tab by sending a `postMessage`.
- `P` acknowledges the request and sends `C` it's identity i.e. `UUID` along with `P` information.
- This sets up a communication channel between Parent and Child tab.
- Now, `P` and `C` can share custom messages with each other.
- Whenever `C` gets closed/refreshed, `P` is notified.
- Whenever `P` is closed/refreshed, all children of `P` tab gets notified.

<img src="https://raw.githubusercontent.com/wingify/across-tabs/master/parent-tab-communication.jpg" />

**Explanation of diagram**

- Parent(`P`) opens Child tab(`C1`) at `t=1`.
- `c1a` - When `C1` initiates a handshake with the Parent.
- `P1` - When `P` receives `C1` message.
- `P2` - `P` acknowledges the request and sends the `C1` its identity.
- `c1b` - When `C1` receives an acknowledgement message along with identity from `P`.

---

Total Tabs Associated: **1** | Opened Tabs: **1** | Closed Tabs: **0**

---

- Parent(`P`) opens CHild tab(`C2`) at `t=10`.
- `c2a` - When `C2` initiates a handshake with the Parent.
- `P3` - When `P` receives `C2` message.
- `P4` - `P` acknowledges the request and sends the `C2` its identity.
- `c2b` - When `C2` receives acknowledgemnet message along with identity from `P`.

---

Total Tabs Associated: **2** | Opened Tabs: **2** | Closed Tabs: **0**

---

- `c1c` - Tab `C1` closes.
- `P5` - `P` is notified about the `C1`. Parent updates the list.

---

Total Tabs Associated: **2** | Opened Tabs: **1** | Closed Tabs: **1**

---

- Parent(`P`) opens CHild tab(`C3`) at `t=25`.
- `c3a` - When `C3` initiates a handshake with the Parent.
- `P6` - When `P` receives `C3` message.
- `c2c` - Tab `C2` sends a `custom` message.
- `P7` - When `P` receives a message from tab `C2`. It processes it.
- `P8` - `P` acknowledges the request and sends the `C3` its identity.
- `c3b` - When `C3` receives acknowledgemnet message along with identity from `P`.

---

Total Tabs Associated: **3** | Opened Tabs: **2** | Closed Tabs: **1**

---

- When Parent Tab `P` is closed, all the opened tabs are notified about it.

### Usage

##### Create an instance / reference before using.

**Opener(Parent) tab**

```
var config = {
  onHandshakeCallback: function () { ... },
  onPollingCallback: function () { ... },
  onChildCommunication: function () { ... }
}
var parent = new AcrossTabs.Parent(config);
```

`Constructor` accepts a configurable `Object` with the following keys.

- `heartBeatInterval`: The time interval for polling tabs statuses
- `removeClosedTabs`: Pass it as `true` to have only opened tabs in the list
- `shouldInitImmediately`: Pass it as `false` to create an instance but initialize it later
- `onHandshakeCallback`: Callback to be called when a successful connection has been established
- `onChildCommunication`: Callback to be called when child sends message
- `onPollingCallback`: Callback to be called every time a tab is polled for its status
- `origin`: whitelist `origin` for securing `postMessage` communication. It will discard the malicious messages trying to trick the behavior. Eg. http://example.com
- `parse`: parser used when parsing messages, defaults to `JSON.parse`
- `stringify`: stringifier used when converting data into messages, defaults to `JSON.stringify`

| Config Keys               | default        | accepts                            |
| ------------------------- | -------------- | ---------------------------------- |
| **heartBeatInterval**     | 500 msec       | A number representing milliseconds |
| **removeClosedTabs**      | false          | Boolean                            |
| **shouldInitImmediately** | true           | Boolean                            |
| **onHandshakeCallback**   | Undefined      | Function as callback               |
| **onChildCommunication**  | Undefined      | Function as callback               |
| **onPollingCallback**     | Undefined      | Function as callback               |
| **origin**                | '\*'           | String(url)                        |
| **parse**                 | JSON.parse     | Function                           |
| **stringify**             | JSON.stringify | Function                           |

**New(Child tab)**

```
var config = {
  onReady: onReady,
  onInitialize: onInitialize,
  isSiteInsideFrame: false, // dont set if not required
  handshakeExpiryLimit: 4000, // msec
  onParentDisconnect: onParentDisconnect,
  onParentCommunication: onParentCommunication
};
var child =  new AcrossTabs.Child(config);
```

`Constructor` accepts a configurable `Object` with the following keys.

- `handshakeExpiryLimit`: Time to wait for getting an acknowledgement from Parent window for child's request
- `onReady`: Callback to be invoked once child instance is ready
- `onInitialize`: Callback when a child instance is actually initiated
- `onParentDisconnect`: Callback to be invoked when Parent gets disconnected
- `onParentCommunication`: Callback to be invoked whenever Parent communicates with the child tab
- `isSiteInsideFrame`: If the library is loaded inside an iframe in the child tab, this needs to be set `true` for maintaining proper window/frame(s) references
- `origin`: whitelist `origin` for securing `postMessage` communication. It will discard the malicious messages trying to trick the behavior. Eg. http://example.com
- `parse`: parser used when parsing messages, defaults to `JSON.parse`
- `stringify`: stringifier used when converting data into messages, defaults to `JSON.stringify`

| Config Keys               | default        | accepts                                |
| ------------------------- | -------------- | -------------------------------------- |
| **handshakeExpiryLimit**  | 5000 msec      | A number representing milliseconds     |
| **isSiteInsideFrame**     | null           | If child tab has actual site in a fram |
| **onReady**               | Undefined      | Function as callback                   |
| **onInitialize**          | Undefined      | Function as callback                   |
| **onParentDisconnect**    | Undefined      | Function as callback                   |
| **onParentCommunication** | Undefined      | Function as callback                   |
| **origin**                | '\*'           | String(url)                            |
| **parse**                 | JSON.parse     | Function                               |
| **stringify**             | JSON.stringify | Function                               |

**Example** is included in the `example` folder. `Vanilla JS` and `Vue js` versions are there to test out.
_Note:_ Run `npm install` if you wish to run `vuejs` example since the example needs the `vue-js` library to work.

### API

Refer [above section](#create-an-instance--reference-before-using) on how to create an instance before hitting API methods.

##### Opener Tab(Parent) Methods

- **`openNewTab`**

  Saves `data` in specific `key` in sessionStorage. If the key is not provided, the library will warn.
  Following types of JavaScript objects are supported:

  | Parameter | Description                                   |
  | --------- | --------------------------------------------- |
  | config    | For opening a new tab i.e. URL and windowName |

  ```
    parent.openNewTab({url: 'http://example.com', windowName: 'AcrossTab'});
  ```

- **`enableElements`**

  Links / buttons can be given a data attribute: `data-tab-opener="name"`. On clicking, the library finds elements with that attribute and adds `disabled="disabled"` attribute to that element. The `disabled` attribute is removed once the Child tab communicates back to the opener i.e. Parent. Though, this method is called internally but can also be invoked(may be within a timer) to be on a safer side.

  ```
    parent.enableElements();
  ```

- **`getAllTabs`**

  Returns the list of all the tabs.
  If `removeClosedTabs: true` is provided while instantiating, it will return only the opened tabs as closed tabs would be removed.

  ```
    parent.getAllTabs()
  ```

- **`getOpenedTabs`**

  Returns the list of all `opened` tabs.

  ```
    parent.getOpenedTabs();
  ```

- **`getClosedTabs`**

  Returns the list of all `closed` tabs.
  If `removeClosedTabs: true` is provided while instantiating, it will return empty list as closed tabs would be removed.

  ```
    parent.getClosedTabs();
  ```

- **`closeAllTabs`**

  Closes all the opened tabs.

  ```
    parent.closeAllTabs()
  ```

- **`closeTab`**

  Closes a particular tab whose id is provided.

  | Parameter | Description                |
  | --------- | -------------------------- |
  | id        | id of the tab to be closed |

  ```
    parent.closeTab('57cd47da-d98e-4a2d-814c-9b07cb51059c');
  ```

- **`broadCastAll`**

  Sends a same `message` to all the opened tabs.

  | Parameter | Description   |
  | --------- | ------------- |
  | msg       | msg to be ent |

  ```
    parent.broadCastAll('Hello my dear Child! A greeting from Parent.');
  ```

- **`broadCastTo`**

  Sends a `message` to a particular opened tab.

  | Parameter | Description                  |
  | --------- | ---------------------------- |
  | id        | id of the tab to send an msg |
  | msg       | msg to be sent               |

  ```
    parent.broadCastTo('57cd47da-d98e-4a2d-814c-9b07cb51059c', 'Hey! Can you run the script: worker.js? Thanks!');
  ```

##### New Tab(Child) Methods

- **`getTabInfo`**

  Return id, name, and parentName of the child tab.

  ```
    child.getTabInfo();
  ```

- **`sendMessageToParent`**

  Sends a `message` to the `Parent` tab.

  | Parameter | Description    |
  | --------- | -------------- |
  | msg       | msg to be sent |

  ```
    child.sendMessageToParent('Hey Parent! I\'m done with my work.');
  ```

### Browser Support

Tested in Chrome, Firefox and IE(versions >= 9).

### Sites using across-tabs

- app.vwo.com
- _[Add your site]_ - See [Contributing](#contributing) section

### Development Stack

- Webpack based `src` compilation & bundling and `dist` generation.
- ES6 as a source of writing code.
- Exports in a [UMD](https://github.com/umdjs/umd) format so the library works everywhere.
- Linting with [ESLint](http://eslint.org/).
- ES6 test setup with [Karma](https://karma-runner.github.io/1.0/index.html), [Jasmine](https://jasmine.github.io/2.0/introduction.html) and [isparta](https://github.com/deepsweet/isparta-loader).
- Test coverage with [Istanbul]() and [Coveralls](https://coveralls.io/).

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
  in UMD format
```

### Scripts

- `npm run build` - produces production version(minified) of the library under the `dist` folder
- `npm run dev` - produces development version(un minified) of the library and runs a watcher to detect file changes.
- `npm run test` - well ... it runs the tests :)

### Contributing

1. Fork the repo on GitHub.
2. Clone the repo on a machine.
3. Execute `npm install` and `npm run dev`.
4. Create a new branch `<fix-typo>` and do your work.
5. Run `npm run build` to build dist files and `npm run test` to ensure all test cases are passing.
6. Commit your changes to the branch.
7. Submit a Pull request.

**Note:** If adding site to the list of _sites using across-tabs_, please mention where to verify this in the PR description.

### Roadmap

- Having a Queue mechanism to deal with loads of async events.
- Promise based `Parent-Child` communication. Will help in sending window-specific data to and fro apart from custom data messages.
- E2E testing so that the behavior can be tested automatically.
- Maintaining and adding more enhancements as and when required. Open to everyone's suggestions.

### Authors

**[Varun Malhotra](http://varunmalhotra.xyz)** [@softvar](https://github.com/softvar)

### Copyright and license

> The [MIT license](https://opensource.org/licenses/MIT) (MIT)
>
> Copyright (c) 2017-2019 Wingify Software Pvt. Ltd.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
