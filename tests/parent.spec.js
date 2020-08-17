import tabUtils from '../src/utils/tab';
import domUtils from '../src/utils/dom';

import WarningTextEnum from '../src/enums/WarningTextEnum';
import PostMessageEventNamesEnum from '../src/enums/PostMessageEventNamesEnum';

import Parent from '../src/parent';

let parent,
  mockedTab = {
    url: 'http://localhost:3000/example/child.html',
    id: '57cd47da-d98e-4a2d-814c-9b07cb51059c',
    name: 'heatmap1',
    status: 'open',
    ref: window
  };

let tab1, tab2, tab3;

function addTabs() {
  (tab1 = Object.create(mockedTab)), (tab2 = Object.create(mockedTab)), (tab3 = Object.create(mockedTab));

  tabUtils.tabs.push(tab1);
  tabUtils.tabs.push(tab2);
  tabUtils.tabs.push(tab3);
}

describe('Parent', () => {
  beforeEach(() => {
    tabUtils.tabs = [];
    parent = new Parent();
  });
  afterEach(() => {
    tab1 = null;
    tab2 = null;
    tab3 = null;
  });

  describe('Basic tests', () => {
    it('verify it is defined and its methods', () => {
      expect(Parent).toBeDefined();

      let parent = new Parent();
      expect(parent.startPollingTabs).toBeDefined();
      expect(parent.watchStatus).toBeDefined();
      expect(parent.customEventUnListener).toBeDefined();
      expect(parent.addEventListeners).toBeDefined();

      expect(parent.enableElements).toBeDefined();
      expect(parent.getAllTabs).toBeDefined();
      expect(parent.getOpenedTabs).toBeDefined();
      expect(parent.getClosedTabs).toBeDefined();
      expect(parent.closeAllTabs).toBeDefined();
      expect(parent.closeTab).toBeDefined();
      expect(parent.broadCastAll).toBeDefined();
      expect(parent.broadCastTo).toBeDefined();
      expect(parent.openNewTab).toBeDefined();
      expect(parent.init).toBeDefined();
    });
  });

  describe('constructor', () => {
    it('should be called on object instantiation with NO config passed', () => {
      expect(parent.heartBeatInterval).toBeDefined();
      expect(parent.Tab).toBeDefined();
      expect(parent.shouldInitImmediately).toBeDefined();
      expect(parent.heartBeatInterval).toBeDefined();

      expect(parent.heartBeatInterval).toBe(500);
      expect(parent.shouldInitImmediately).toBe(true);
    });

    it('should be called on object instantiation with config', () => {
      let parent = new Parent({
        heartBeatInterval: 1000,
        shouldInitImmediately: false,
        removeClosedTabs: true,
        onHandshakeCallback: function() {},
        onPollingCallback: function() {}
      });

      expect(parent.heartBeatInterval).toBeDefined();
      expect(parent.Tab).toBeDefined();
      expect(parent.shouldInitImmediately).toBeDefined();
      expect(parent.heartBeatInterval).toBeDefined();
      expect(parent.onHandshakeCallback).toBeDefined();
      expect(parent.onPollingCallback).toBeDefined();

      expect(parent.heartBeatInterval).toBe(1000);
      expect(parent.shouldInitImmediately).toBe(false);
      expect(parent.removeClosedTabs).toBe(true);
    });
  });

  describe('method: addInterval', () => {
    it('should return if no opened tabs', () => {
      spyOn(window, 'clearInterval');

      expect(parent.addInterval()).toBe(false);
      expect(window.clearInterval).toHaveBeenCalled();
    });
    it('should return if no opened tabs', () => {
      addTabs();

      tab1.status = 'close';
      tab2.status = 'close';
      tab3.status = 'close';

      spyOn(window, 'clearInterval');

      expect(parent.addInterval()).toBe(false);
      expect(window.clearInterval).toHaveBeenCalled();
    });
    it('should watch status if at least one opened tab and remove the closed tabs', () => {
      addTabs();

      tab1.status = 'close';
      tab2.status = 'open';
      tab3.status = 'close';

      parent.removeClosedTabs = true;

      spyOn(parent, 'watchStatus');
      parent.addInterval();
      expect(parent.watchStatus).toHaveBeenCalled();
    });
    it('should call user-defined: onPollingCallback, if defined', () => {
      let parent = new Parent({
        onPollingCallback: function() {}
      });

      addTabs();

      tab1.status = 'close';
      tab2.status = 'open';
      tab3.status = 'open';

      spyOn(parent, 'onPollingCallback');
      parent.addInterval();
      expect(parent.onPollingCallback).toHaveBeenCalled();
    });
  });

  describe('method: watchStatus', () => {
    it('should return if no tab is passed as argument', () => {
      expect(parent.watchStatus()).toBe(false);
    });
    it('should return if current and last state is same', () => {
      let tab1 = Object.create(mockedTab);

      tab1.status = 'close';
      tab1.ref = { closed: true };

      expect(parent.watchStatus(tab1)).toBe(false);
    });
    it('should return if current and last state is same', () => {
      let tab1 = Object.create(mockedTab);

      tab1.status = 'open';
      tab1.ref.closed = false;

      expect(parent.watchStatus(tab1)).toBe(false);
    });
    it('should remove closed tab from array on child tab closing', () => {
      let tab1 = Object.create(mockedTab);

      tab1.status = 'open';
      tab1.ref = { closed: true }; // tab closed
      expect(parent.watchStatus(tab1)).toBeUndefined();
    });
  });

  describe('method: customEventUnListener', () => {
    it('should enable elements', () => {
      spyOn(parent, 'enableElements');

      parent.customEventUnListener({
        detail: {
          type: PostMessageEventNamesEnum.HANDSHAKE
        }
      });

      expect(parent.enableElements).toHaveBeenCalled();
    });
    it('should call handshake callback, if defined', () => {
      let parent = new Parent({
        onHandshakeCallback: function() {}
      });

      spyOn(parent, 'onHandshakeCallback');

      parent.customEventUnListener({
        detail: {
          type: PostMessageEventNamesEnum.HANDSHAKE
        }
      });

      expect(parent.onHandshakeCallback).toHaveBeenCalled();
    });
    it('should call user-defined callback, if defined', () => {
      let parent = new Parent({
        onChildCommunication: function() {}
      });

      spyOn(parent, 'onChildCommunication');

      parent.customEventUnListener({
        detail: {
          type: PostMessageEventNamesEnum.CUSTOM
        }
      });

      expect(parent.onChildCommunication).toHaveBeenCalled();
    });
  });

  describe('method: addEventListeners', () => {
    it('should attach listeners to window', () => {
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

      parent.addEventListeners();

      expect(window.removeEventListener).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalled();
    });
  });

  // API tests
  describe('method: enableElements', () => {
    it('should enable elements which were disabled on clicking', () => {
      let elem = '<div id="elem">' + '<a data-tab-opener="parent" href="/about">Open Link</a>' + '/div>';

      document.body.insertAdjacentHTML('afterbegin', elem);

      // first add disabled attributes to all such elements
      domUtils.disable('data-tab-opener');

      let selectors = document.querySelectorAll('[' + 'data-tab-opener' + ']');

      for (var i = 0; i < selectors.length; i++) {
        expect(selectors[i].getAttribute('disabled')).toBe('disabled');
        domUtils.enable('data-tab-opener');
        expect(selectors[i].getAttribute('disabled')).toBe(null);
      }

      document.body.removeChild(document.getElementById('elem'));
    });
  });

  describe('method: getAllTabs', () => {
    it('should return all tabs', () => {
      let result;

      addTabs();
      result = parent.getAllTabs();

      expect(result.length).toBe(3);

      for (var i = 0; i < result.length; i++) {
        expect(result[i].id).toBeDefined();
      }
    });
  });
  describe('method: getOpenedTabs', () => {
    it('should return only the opened tabs', () => {
      let result;

      addTabs();
      tab1.status = 'open';
      tab2.status = 'open';
      tab3.status = 'close';

      result = parent.getOpenedTabs();

      expect(result.length).toBe(2);

      for (var i = 0; i < result.length; i++) {
        expect(result[i].status).toEqual('open');
      }
    });
  });
  describe('method: getClosedTabs', () => {
    it('should return only the closed tabs', () => {
      let result;

      addTabs();
      tab1.status = 'open';
      tab2.status = 'open';
      tab3.status = 'close';

      result = parent.getClosedTabs();

      expect(result.length).toBe(1);

      for (var i = 0; i < result.length; i++) {
        expect(result[i].status).toEqual('close');
      }
    });
  });

  describe('method: closeAllTabs', () => {
    it('should close all tabs', () => {
      addTabs();
      tab1.status = 'open';
      tab2.status = 'open';
      tab3.status = 'close';

      parent.closeAllTabs();

      for (var i = 0; i < tabUtils.tabs.length; i++) {
        expect(tabUtils.tabs[i].status).toEqual('close');
      }
    });
  });

  describe('method: closeTab', () => {
    it('should close a specific tab', () => {
      addTabs();
      tab1.status = 'open';
      tab2.status = 'open';
      tab3.status = 'close';

      parent.closeTab(tab1.id);

      expect(tab1.status).toEqual('close');
    });
  });

  describe('method: broadCastAll', () => {
    it('should broadcast a msg to all tabs', () => {
      addTabs();
      tab1.status = 'open';
      tab2.status = 'open';
      tab3.status = 'close';

      spyOn(tabUtils, 'broadCastAll');
      parent.broadCastAll('custom_message');

      expect(tabUtils.broadCastAll).toHaveBeenCalledWith('custom_message');
    });
  });

  describe('method: broadCastTo', () => {
    it('should broadcast a msg to all tabs', () => {
      addTabs();
      tab1.status = 'open';
      tab2.status = 'open';
      tab3.status = 'close';

      spyOn(tabUtils, 'broadCastTo');
      parent.broadCastTo(tab1, 'custom_message');

      expect(tabUtils.broadCastTo).toHaveBeenCalledWith(tab1, 'custom_message');
    });
  });

  describe('method: openNewTab', () => {
    it('should throw error if config is not passed', () => {
      expect(parent.openNewTab).toThrow(new Error(WarningTextEnum.CONFIG_REQUIRED));
    });
    it('should throw error if config url is not passed', () => {
      expect(parent.openNewTab, {}).toThrow(new Error(WarningTextEnum.CONFIG_REQUIRED));
    });
  });

  describe('method: init', () => {
    it('should attach event listeners to window', () => {
      spyOn(parent, 'addEventListeners');
      parent.init();
      expect(parent.addEventListeners).toHaveBeenCalled();
    });
  });
});
