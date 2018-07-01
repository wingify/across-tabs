import Tab from './tab';

import tabUtils from './utils/tab';
import domUtils from './utils/dom';

import WarningTextEnum from './enums/WarningTextEnum';
import PostMessageEventNamesEnum from './enums/PostMessageEventNamesEnum';

import PostMessageListener from './event-listeners/postmessage';

let tab;

// Named Class expression
class Parent {
  /**
   * Involed when object is instantiated
   * Set flags/variables and calls init method to attach event listeners
   * @param  {Object} config - Refer API/docs for config keys
   */
  constructor(config) {
    config = config || {};
    if (typeof config.shouldInitImmediately === 'undefined') {
      config.shouldInitImmediately = true;
    }

    // reset tabs with every new Object
    tabUtils.tabs = [];

    // Bind event listener callbacks
    this.customEventUnListenerCallback = this.customEventUnListener.bind(this);
    this.onChildUnloadCallback = this.onChildUnload.bind(this);

    this.Tab = Tab;
    Object.assign(this, config);

    tabUtils.config = config;

    if (this.shouldInitImmediately) {
      this.init();
    }
  };

  /**
   * Called when a child is refreshed/closed
   * @param  {Object} ev - Event
   */
  onChildUnload(ev) {
    tabUtils._onChildClose(ev.detail.id);

    if (this.onChildDisconnect) {
      this.onChildDisconnect(ev.detail);
    }
  }

  /**
   * Enable link/btn, which got disabled on clicking.
   * Note: works only when `data-tab-opener="child"` is used on the respective element
   * @param  {Object} ev - Event
   */
  customEventUnListener(ev) {
    this.enableElements();

    if (ev.detail && ev.detail.type === PostMessageEventNamesEnum.HANDSHAKE && this.onHandshakeCallback) {
      this.onHandshakeCallback(ev.detail.tabInfo);
    } else if (ev.detail && ev.detail.type === PostMessageEventNamesEnum.CUSTOM && this.onChildCommunication) {
      this.onChildCommunication(ev.detail.tabInfo);
    }
  };

  /**
   * Attach postmessage, native and custom listeners to the window
   */
  addEventListeners() {
    window.removeEventListener('message', PostMessageListener.onNewTab);
    window.addEventListener('message', PostMessageListener.onNewTab);

    window.removeEventListener('onCustomChildMessage', this.customEventUnListenerCallback);
    window.addEventListener('onCustomChildMessage', this.customEventUnListenerCallback);

    window.removeEventListener('onChildUnload', this.onChildUnloadCallback);
    window.addEventListener('onChildUnload', this.onChildUnloadCallback);

    // Let children tabs know when Parent is closed / refereshed.
    window.onbeforeunload = () => {
      tabUtils.broadCastAll(PostMessageEventNamesEnum.PARENT_DISCONNECTED);
    };
  };

  /**
   * API methods exposed for Public
   *
   * Re-enable the link/btn which got disabled on clicking
   */
  enableElements() {
    domUtils.enable('data-tab-opener');
  };

  /**
   * Return list of all tabs
   * @return {Array}
   */
  getAllTabs() {
    return tabUtils.getAll();
  };

  /**
   * Return list of all OPENED tabs
   * @return {Array}
   */
  getOpenedTabs() {
    return tabUtils.getOpened();
  };

  /**
   * Return list of all CLOSED tabs
   * @return {Array}
   */
  getClosedTabs() {
    return tabUtils.getClosed();
  }

  /**
   * Close all tabs at once
   * @return {Object}
   */
  closeAllTabs() {
    return tabUtils.closeAll();
  };

  /**
   * Close a specific tab
   * @return {Object}
   */
  closeTab(id) {
    return tabUtils.closeTab(id);
  };

  /**
   * Send a postmessage to all OPENED tabs
   * @return {Object}
   */
  broadCastAll(msg) {
    return tabUtils.broadCastAll(msg);
  }

  /**
   * Send a postmessage to a specific tab
   * @return {Object}
   */
  broadCastTo(id, msg) {
    return tabUtils.broadCastTo(id, msg);
  }

  /**
   * Open a new tab. Config has to be passed with some required keys
   * @return {Object} tab
   */
  openNewTab(config) {
    if (!config) {
      throw new Error(WarningTextEnum.CONFIG_REQUIRED);
    }

    let url = config.url;

    if (!url) {
      throw new Error(WarningTextEnum.URL_REQUIRED);
    }

    tab = new this.Tab();
    tab.create(config);

    if (this.onChildStatusChange) {
      this.onChildStatusChange(tab);
    }

    return tab;
  };

  /**
   * API methods exposed for Public ends here
   **/

  /**
   * Invoked on object instantiation unless user pass a key to call it explicitly
   */
  init() {
    this.addEventListeners();
  };
};

export default Parent;
