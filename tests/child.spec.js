import PostMessageEventNamesEnum from '../src//enums/PostMessageEventNamesEnum';
import WarningTextEnum from '../src/enums/WarningTextEnum';

import Child from '../src/child';

let child,
  mockedTab = {
    url: 'http://localhost:3000/example/child.html',
    id: '57cd47da-d98e-4a2d-814c-9b07cb51059c',
    name: 'heatmap1',
    status: 'open',
    ref: window
  };

describe('Child', () => {
  beforeEach(() => {
    child = new Child();
  });
  afterEach(() => {
    // ...
  });

  describe('Basic tests', () => {
    it('verify it is defined and its methods', () => {
      expect(child).toBeDefined();
      expect(child._isSessionStorage).toBeDefined();
      expect(child._getData).toBeDefined();
      expect(child._setData).toBeDefined();
      expect(child._restoreData).toBeDefined();
      expect(child._parseData).toBeDefined();
      expect(child.onCommunication).toBeDefined();
      expect(child.addListeners).toBeDefined();
      expect(child.setHandshakeExpiry).toBeDefined();
      expect(child.sendMessageToParent).toBeDefined();
      expect(child.getTabInfo).toBeDefined();
      expect(child.init).toBeDefined();
    });
  });

  describe('method: _isSessionStorage', () => {
    it('should check if session storage is defined', () => {
      expect(child._isSessionStorage()).toBe(true);
    });
  });
  describe('method: _getData', () => {
    it('should get data from sessionStorage', () => {
      spyOn(window.sessionStorage, 'getItem');
      child._getData();
      expect(window.sessionStorage.getItem).toHaveBeenCalledWith(child.sessionStorageKey);
    });

    it('should return false if sessionStorage is not supported', () => {
      // mock
      child.isSessionStorageSupported = false;
      expect(child._getData()).toBe(false);
    });
  });
  describe('method: _setData', () => {
    it('should set data in sessionStorage', () => {
      spyOn(window.sessionStorage, 'setItem');
      child._setData('');
      expect(window.sessionStorage.setItem).toHaveBeenCalled();
    });

    it('should return false if sessionStorage is not supported', () => {
      // mock
      child.isSessionStorageSupported = false;
      expect(child._setData('')).toBe(false);
    });
  });
  describe('method: _restoreData', () => {
    it('should get data from sessionStorage adn parse it', () => {
      spyOn(sessionStorage, 'getItem');
      spyOn(child, '_parseData');
      child._restoreData();
      expect(sessionStorage.getItem).toHaveBeenCalled();
      expect(child._parseData).toHaveBeenCalled();
    });

    it('should return false if sessionStorage is not supported', () => {
      // mock
      child.isSessionStorageSupported = false;
      expect(child._restoreData()).toBe(false);
    });
  });
  describe('method: _parseData', () => {
    it('should throw error if data passed is not valid JSON', () => {
      expect(child._parseData).toThrow(new Error(WarningTextEnum.INVALID_DATA));
    });
    it('should parse stringified data', () => {
      spyOn(JSON, 'parse');

      const _child = new Child();

      _child._parseData(JSON.stringify({ a: 1 }));
      expect(JSON.parse).toHaveBeenCalled();
    });
    it('should parse stringified data with a custom parser', () => {
      const custom = {
        parse: msg => JSON.parse(msg, () => '')
      };

      spyOn(custom, 'parse');

      const _child = new Child({
        parse: custom.parse
      });

      _child._parseData(JSON.stringify({ a: 1 }));
      expect(custom.parse).toHaveBeenCalled();
    });
  });
  describe('method: onCommunication', () => {
    it('should clear timeout on getting message from parent', () => {
      spyOn(window, 'clearTimeout');
      child.onCommunication({ data: 'Hello' });
      expect(window.clearTimeout).toHaveBeenCalledWith(child.timeout);
    });
    it('should call user-defined callback when PARENT_DISCONNECTED event', () => {
      let child = new Child({
        onParentDisconnect: function() {}
      });

      spyOn(child.config, 'onParentDisconnect');

      child.onCommunication({ data: PostMessageEventNamesEnum.PARENT_DISCONNECTED });

      expect(child.config.onParentDisconnect).toHaveBeenCalled();
    });
    it('should remove listener when PARENT_DISCONNECTED event', () => {
      let spy = jasmine.createSpy('message');

      spyOn(window, 'removeEventListener');

      // postMessage runs asynchronously, verify after the message has been posted and after the event has been fired off.
      window.removeEventListener('message', e => {
        spy();
      });

      child.onCommunication({ data: PostMessageEventNamesEnum.PARENT_DISCONNECTED });

      expect(window.removeEventListener).toHaveBeenCalled();
    });

    it('should call user-defined method when HANDSHAKE_WITH_PARENT event', () => {
      let child = new Child({
        onInitialize: function() {}
      });

      spyOn(child, '_setData');
      spyOn(child, '_parseData');
      spyOn(child, 'sendMessageToParent');

      spyOn(child.config, 'onInitialize');

      child.onCommunication({
        data: PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT + JSON.stringify({ a: 1 })
      });

      expect(child._setData).toHaveBeenCalled();
      expect(child._parseData).toHaveBeenCalled();
      expect(child.sendMessageToParent).toHaveBeenCalled();
      expect(child.config.onInitialize).toHaveBeenCalled();
    });
    it('should call user-defined method when PARENT_COMMUNICATED event', () => {
      spyOn(JSON, 'parse');

      let child = new Child({
        onParentCommunication: function() {}
      });

      spyOn(child.config, 'onParentCommunication');

      child.onCommunication({
        data: PostMessageEventNamesEnum.PARENT_COMMUNICATED + JSON.stringify({ a: 1 })
      });

      expect(JSON.parse).toHaveBeenCalled();
      expect(child.config.onParentCommunication).toHaveBeenCalled();
    });
    it('should call user-defined method when PARENT_COMMUNICATED event with a custom parser', () => {
      const custom = {
        parse: msg => JSON.parse(msg, () => '')
      };

      spyOn(custom, 'parse');

      let child = new Child({
        onParentCommunication: function() {},
        parse: custom.parse
      });

      spyOn(child.config, 'onParentCommunication');

      child.onCommunication({
        data: PostMessageEventNamesEnum.PARENT_COMMUNICATED + JSON.stringify({ a: 1 })
      });

      expect(custom.parse).toHaveBeenCalled();
      expect(child.config.onParentCommunication).toHaveBeenCalled();
    });
  });
  describe('method: addListeners', () => {
    it('should attach events to window', () => {
      let spy = jasmine.createSpy('message');

      spyOn(window, 'removeEventListener');
      spyOn(window, 'addEventListener');

      // postMessage runs asynchronously, verify after the message has been posted and after the event has been fired off.
      window.removeEventListener('message', e => {
        spy();
      });
      window.addEventListener('message', e => {
        spy();
      });

      child.addListeners();

      expect(window.removeEventListener).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalled();
    });
  });
  describe('method: setHandshakeExpiry', () => {
    it('should set a timeout', () => {
      spyOn(window, 'setTimeout');
      child.setHandshakeExpiry();
      expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), child.handshakeExpiryLimit);
    });
  });
  describe('method: sendMessageToParent', () => {
    it('should send a postmessage to parent', () => {
      window.top.opener = {
        postMessage: function() {
          // ...
        }
      };

      spyOn(window.top.opener, 'postMessage');
      child.sendMessageToParent('Hello Parent');
      expect(window.top.opener.postMessage).toHaveBeenCalled();
    });
  });
  describe('method: getTabInfo', () => {
    it('should return an object', () => {
      expect(child.getTabInfo()).toBeDefined();
      expect(child.getTabInfo().id).toBeDefined();
      expect(child.getTabInfo().name).toBeDefined();
      expect(child.getTabInfo().parentName).toBeDefined();
    });
  });
  describe('method: init', () => {
    it('should be called on init', () => {
      spyOn(child, 'addListeners');
      spyOn(child, '_restoreData');
      spyOn(child, 'setHandshakeExpiry');

      child.init();

      expect(child.isSessionStorageSupported).toBe(true);
      expect(child.addListeners).toHaveBeenCalled();
      expect(child._restoreData).toHaveBeenCalled();
      expect(child.setHandshakeExpiry).toHaveBeenCalled();
    });
  });
});
