import PostMessageEventNamesEnum from './enums/PostMessageEventNamesEnum';
import WarningTextEnum from './enums/WarningTextEnum';
import TabDataTypesEnum from './enums/TabDataEnum';
import TabStorage from './tabStorage';

// Named Class expression
class Child {
  /**
   * Involed when object is instantiated
   * Set flags/variables and calls init method to attach event listeners
   * @param  {Object} config - Refer API/docs for config keys
   */
  constructor(config) {
    if (!config) {
      config = {};
    }
    if (typeof config.handshakeExpiryLimit === 'undefined') {
      config.handshakeExpiryLimit = 5000;
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

    this.tabName = window.name;
    this.tabId = null;
    this.tabParentName = null;
    this.storage = new TabStorage();

    Object.assign(this, config);
    this.config = config;

    if (this.shouldInitImmediately) {
      this.init();
    }
  }

  /**
   * Check if window.name is overridden
   */
  _isWindowNameOverridden() {
    return window.name.indexOf(TabDataTypesEnum.NEW_TAB_DATA) < 0;
  }

  /**
   * Parse data fetched from windowName
   * @param {String} dataReceived
   */
  _parseData(dataReceived) {
    let actualData;

    // Expecting JSON data
    try {
      actualData = this.config.parse(dataReceived);
      this.tabId = actualData && actualData.id;
      this.tabName = actualData && actualData.name;
      this.tabParentName = actualData && actualData.parentName;
      this.tabStorage = new TabStorage(this._isWindowNameOverridden());
      this.tabStorage.set(TabDataTypesEnum.NEW_TAB_DATA, dataReceived);
    } catch (e) {
      throw new Error(WarningTextEnum.INVALID_DATA);
    }
  }

  /**
   * The core of this file
   * This method receives the postmessage from Parent
   * after establishing a proper communication channel between Parent tab and Child tab.
   * It removes the handshake timeout.
   * Based on the type of postmessage event, it sets/parses or calls user defined callbacks
   *
   * @param  {String} message
   */
  onCommunication(message) {
    let dataReceived,
      data = message.data;

    if (!data || typeof data !== 'string') {
      return;
    }

    // `origin` check for secureity point of view
    if (this.config.origin && this.config.origin !== message.origin) {
      return;
    }

    // cancel timeout
    window.clearTimeout(this.timeout);

    // When Parent tab gets closed or refereshed
    if (data.indexOf(PostMessageEventNamesEnum.PARENT_DISCONNECTED) > -1) {
      // Call user-defined `onParentDisconnect` callback when Parent tab gets closed or refereshed.
      if (this.config.onParentDisconnect) {
        this.config.onParentDisconnect();
      }

      // remove postMessage listener since no Parent is there to communicate with
      window.removeEventListener('message', evt => this.onCommunication(evt));
    }

    /**
     * When Parent sends an Acknowledgement to the Child's request of setting up a communication channel
     * along with the tab's identity i.e. id, name and it's parent(itself) to the child tab.
     */
    if (data.indexOf(PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT) > -1) {
      let msg;

      dataReceived = data.split(PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT)[1];
      this._parseData(dataReceived);

      msg = {
        id: this.tabId,
        isSiteInsideFrame: this.config.isSiteInsideFrame
      };
      this.sendMessageToParent(msg, PostMessageEventNamesEnum.HANDSHAKE);

      if (this.config.onInitialize) {
        this.config.onInitialize();
      }
    }

    // Whenever Parent tab communicates once the communication channel is established
    if (data.indexOf(PostMessageEventNamesEnum.PARENT_COMMUNICATED) > -1) {
      dataReceived = data.split(PostMessageEventNamesEnum.PARENT_COMMUNICATED)[1];

      try {
        dataReceived = this.config.parse(dataReceived);
      } catch (e) {
        throw new Error(WarningTextEnum.INVALID_JSON);
      }
      // Call user-defined `onParentCommunication` callback when Parent sends a message to Parent tab
      if (this.config.onParentCommunication) {
        this.config.onParentCommunication(dataReceived);
      }
    }

    // Whenever Parent tab asks to store data at child once communication channel is established
    if (data.indexOf(PostMessageEventNamesEnum.PARENT_COMMUNCATED_STORAGE_DATA) > -1) {
      dataReceived = data.split(PostMessageEventNamesEnum.PARENT_COMMUNCATED_STORAGE_DATA)[1];

      try {
        dataReceived = this.config.parse(dataReceived);
        // Update connected tab data at tabStorage as communicated by Parent
        Object.entries(dataReceived).map(obj => {
          this.tabStorage.set(obj[0], obj[1]);
        });
      } catch (e) {
        throw new Error(WarningTextEnum.INVALID_JSON);
      }
    }
  }

  /**
   * Attach postmessage and onbeforeunload event listeners
   */
  addListeners() {
    window.onbeforeunload = evt => {
      let msg = {
        id: this.tabId,
        isSiteInsideFrame: this.config.isSiteInsideFrame
      };

      this.sendMessageToParent(msg, PostMessageEventNamesEnum.ON_BEFORE_UNLOAD);
    };

    window.removeEventListener('message', evt => this.onCommunication(evt));
    window.addEventListener('message', evt => this.onCommunication(evt));
  }

  /**
   * Call a user-defined method `onHandShakeExpiry`
   * if the Parent doesn't recieve a first handshake message within the configurable `handshakeExpiryLimit`
   * @return {Function}
   */
  setHandshakeExpiry() {
    return window.setTimeout(() => {
      if (this.config.onHandShakeExpiry) {
        this.config.onHandShakeExpiry();
      }
    }, this.handshakeExpiryLimit);
  }

  /**
   * API starts here ->
   *
   * Send a postmessage to the corresponding Parent tab
   * @param  {String} msg
=   */
  sendMessageToParent(msg, _prefixType) {
    let origin;

    let type = _prefixType || PostMessageEventNamesEnum.CUSTOM;

    msg = type + this.config.stringify(msg);

    if (window.top.opener) {
      origin = this.config.origin || '*';
      window.top.opener.postMessage(msg, origin);
    }
  }

  /**
   * Get current Tab info i.e. id, name and parentName
   * @return {Object} tab-info
   */
  getTabInfo() {
    return {
      id: this.tabId,
      name: window.name,
      parentName: this.tabParentName,
      isSiteInsideFrame: this.config.isSiteInsideFrame
    };
  }
  /**
   * API ends here ->
   */

  /**
   * Invoked on object instantiation unless user pass a key to call it explicitly
   */
  init() {
    this.addListeners();
    this.sendMessageToParent(this.getTabInfo(), PostMessageEventNamesEnum.LOADED);
    this.timeout = this.setHandshakeExpiry();

    if (this.config.onReady) {
      this.config.onReady();
    }
  }
}

export default Child;
