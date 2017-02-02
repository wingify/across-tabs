import Tab from './tab';

import tabUtils from './utils/tabUtils';
import domUtils from './utils/dom';

import TabStatusEnum from './enums/TabStatusEnum';
import WarningTextEnum from './enums/WarningTextEnum';
import PostMessageEventNamesEnum from './enums/PostMessageEventNamesEnum';

import PostMessageListener from './event-listeners/postmessage';

let heartBeat, tab;

// Named Class expression
var Parent = class Parent {
  constructor(config) {
    this.heartBeatInterval = config.heartBeatInterval || 500;
    // reset tabs with every new Object
    tabUtils.closeAll();
    this.Tab = Tab;
    this.onHandshakeCallback = config.onHandshakeCallback;
    this.onPollingCallback = config.onPollingCallback;
    this.init();
  };
  startPollingTabs() {
    // don't poll if all tabs are in closed states
    heartBeat = setInterval(() => {
      let i, tabs = tabUtils.getAll();

      for (i = 0; i < tabs.length; i++) {
        // this.watchStatus(tabs[i]);
        // check as tab(s) get removed when closed irrespective of heatbeat controller
        if (tabs[i]) {
          tabs[i].status = tabs[i].ref.closed ? TabStatusEnum.CLOSE : TabStatusEnum.OPEN;
        }
      }
      if (this.onPollingCallback) {
        this.onPollingCallback();
      }
    }, this.heartBeatInterval);
  };

  watchStatus(tab) {
    if (!tab) { return; }
    let newStatus = tab.ref.closed ? TabStatusEnum.CLOSE : TabStatusEnum.OPEN,
      oldStatus = tab.status;

    if (!newStatus || newStatus === oldStatus) { return; }

    if (oldStatus === TabStatusEnum.OPEN && newStatus === TabStatusEnum.CLOSE) {
      // remove tab from tabUtils
      tabUtils._remove(tab);
    }
    // Change from CLOSE to OPEN is never gonna happen :)
  };

  customEventUnListener(ev) {
    this.enableElements();
    if (this.onHandshakeCallback) {
      this.onHandshakeCallback(ev.detail);
    }
  };

  addEventListeners() {
    window.removeEventListener('message', PostMessageListener.onNewTab);
    window.addEventListener('message', PostMessageListener.onNewTab);

    window.removeEventListener('show', this.customEventUnListener);
    window.addEventListener('show', ev => this.customEventUnListener(ev));

    window.onbeforeunload = () => {
      tabUtils.broadCastAll(PostMessageEventNamesEnum.PARENT_DISCONNECTED);
    };
  };

  /*
    API goes here ->
   */
  enableElements() {
    domUtils.enable('data-tab-opener');
  };

  getAllTabs() {
    return tabUtils.getAll();
  };

  getOpenedTabs() {
    return tabUtils.getOpened();
  };

  getClosedTabs() {
    return tabUtils.getClosed();
  }

  closeAllTabs() {
    return tabUtils.closeAll();
  };

  closeTab(tab) {
    return tabUtils.closeTab(tab);
  };

  broadCastAll(msg) {
    return tabUtils.broadCastAll(msg);
  }

  broadCastTo(tab, msg) {
    return tabUtils.broadCastTo(tab, msg);
  }

  openNewTab(config) {
    let url = config.url;

    if (!url) {
      throw new Error(WarningTextEnum.URL_REQUIRED);
    }

    tab = new this.Tab();
    tab.create(config);

    // If polling is already there, don't set it again
    if (!heartBeat) {
      this.startPollingTabs();
    }

    return tab;
  };

  // API ends here

  init() {
    this.addEventListeners();
  };
};

module.exports = Parent;
