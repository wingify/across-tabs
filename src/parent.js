import Tab from './tab';

import tabUtils from './utils/tab';
import domUtils from './utils/dom';

import TabStatusEnum from './enums/TabStatusEnum';
import WarningTextEnum from './enums/WarningTextEnum';
import PostMessageEventNamesEnum from './enums/PostMessageEventNamesEnum';

import PostMessageListener from './event-listeners/postmessage';

let heartBeat, tab;

// Named Class expression
class Parent {
  /**
   * Involed when object is instantiated
   * Set flags/variables and calls init method to attach event listeners
   * @param  {Object} config - Refer API/docs for config keys
   */
  constructor(config) {
    config = config || {};
    if (typeof config.heartBeatInterval === 'undefined') {
      config.heartBeatInterval = 500;
    }
    if (typeof config.shouldInitImmediately === 'undefined') {
      config.shouldInitImmediately = true;
    }
    if (typeof config.parse !== 'function') {
      config.parse = JSON.parse;
    }
    if (typeof config.stringify !== 'function') {
      config.stringify = JSON.stringify;
    }

    // reset tabs with every new Object
    tabUtils.tabs = [];

    this.Tab = Tab;
    Object.assign(this, config);

    tabUtils.config = config;

    if (this.shouldInitImmediately) {
      this.init();
    }
  }

  addInterval() {
    let i,
      tabs = tabUtils.getAll(),
      openedTabs = tabUtils.getOpened();

    // don't poll if all tabs are in CLOSED states
    if (!openedTabs || !openedTabs.length) {
      window.clearInterval(heartBeat); // stop the interval
      heartBeat = null;
      return false;
    }

    for (i = 0; i < tabs.length; i++) {
      if (this.removeClosedTabs) {
        this.watchStatus(tabs[i]);
      }
      /**
       * The check is required since tab would be removed when closed(in case of `removeClosedTabs` flag),
       * irrespective of heatbeat controller
       */
      if (tabs[i] && tabs[i].ref) {
        tabs[i].status = tabs[i].ref.closed ? TabStatusEnum.CLOSE : TabStatusEnum.OPEN;
      }
    }

    // Call the user-defined callback after every polling operation is operted in a single run
    if (this.onPollingCallback) {
      this.onPollingCallback();
    }
  }

  /**
   * Poll all tabs for their status - OPENED / CLOSED
   * An interval is created which checks for last and current status.
   * There's a property on window i.e. `closed` which returns true for the closed window.
   * And one can see `true` only in another tab when the tab was opened by the same `another` tab.
   */
  startPollingTabs() {
    heartBeat = window.setInterval(() => this.addInterval(), this.heartBeatInterval);
  }

  /**
   * Compare tab status - OPEN vs CLOSE
   * @param  {Object} tab
   */
  watchStatus(tab) {
    if (!tab || !tab.ref) {
      return false;
    }
    let newStatus = tab.ref.closed ? TabStatusEnum.CLOSE : TabStatusEnum.OPEN,
      oldStatus = tab.status;

    // If last and current status(inside a polling interval) are same, don't do anything
    if (!newStatus || newStatus === oldStatus) {
      return false;
    }

    // OPEN to CLOSE state
    if (oldStatus === TabStatusEnum.OPEN && newStatus === TabStatusEnum.CLOSE) {
      // remove tab from tabUtils
      tabUtils._remove(tab);
    }
    // Change from CLOSE to OPEN state is never gonna happen ;)
  }

  /**
   * Called when a child is refreshed/closed
   * @param  {Object} ev - Event
   */
  onChildUnload(ev) {
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
  }

  /**
   * Attach postmessage, native and custom listeners to the window
   */
  addEventListeners() {
    window.removeEventListener('message', PostMessageListener.onNewTab);
    window.addEventListener('message', PostMessageListener.onNewTab);

    window.removeEventListener('onCustomChildMessage', this.customEventUnListener);
    window.addEventListener('onCustomChildMessage', ev => this.customEventUnListener(ev));

    window.removeEventListener('onChildUnload', this.onChildUnload);
    window.addEventListener('onChildUnload', ev => this.onChildUnload(ev));

    // Let children tabs know when Parent is closed / refereshed.
    window.onbeforeunload = () => {
      tabUtils.broadCastAll(PostMessageEventNamesEnum.PARENT_DISCONNECTED);
    };
  }

  /**
   * API methods exposed for Public
   *
   * Re-enable the link/btn which got disabled on clicking
   */
  enableElements() {
    domUtils.enable('data-tab-opener');
  }

  /**
   * Return list of all tabs
   * @return {Array}
   */
  getAllTabs() {
    return tabUtils.getAll();
  }

  /**
   * Return list of all OPENED tabs
   * @return {Array}
   */
  getOpenedTabs() {
    return tabUtils.getOpened();
  }

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
  }

  /**
   * Close a specific tab
   * @return {Object}
   */
  closeTab(id) {
    return tabUtils.closeTab(id);
  }

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

    // If polling is already there, don't set it again
    if (!heartBeat) {
      this.startPollingTabs();
    }

    return tab;
  }

  /**
   * API methods exposed for Public ends here
   **/

  /**
   * Invoked on object instantiation unless user pass a key to call it explicitly
   */
  init() {
    this.addEventListeners();
  }
}

export default Parent;
