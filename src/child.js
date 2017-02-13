import PostMessageEventNamesEnum from './enums/PostMessageEventNamesEnum';
import WarningTextEnum from './enums/WarningTextEnum';

// Named Class expression
let Child = class Child {
  /**
   * Involed when object is instantiated
   * Set flags/variables and calls init method to attach event listeners
   * @param  {Object} config - Refer API/docs for config keys
   */
  constructor(config) {
    this.sessionStorageKey = '__vwo_new_tab_info__';

    if (!config) {
      config = {};
    }
    if (typeof config.handshakeExpiryLimit === 'undefined') {
      config.handshakeExpiryLimit = 5000;
    }
    if (typeof config.shouldInitImmediately === 'undefined') {
      config.shouldInitImmediately = true;
    }

    this.tabName = window.name;
    this.tabId = null;
    this.tabParentName = null;

    Object.assign(this, config);
    this.config = config;

    if (this.shouldInitImmediately) {
      this.init();
    }
  };

  /**
   * Check is sessionStorage is present on window
   * @return {Boolean} [description]
   */
  _isSessionStorage() {
    if ('sessionStorage' in window && window.sessionStorage) {
      return true;
    }
    return false;
  };

  /**
   * Get stored data from sessionStorage
   * @return {Object} data
   */
  _getData() {
    if (!this.isSessionStorageSupported) {
      return false;
    }

    return window.sessionStorage.getItem(this.sessionStorageKey);
  };

  /**
   * Set stored data from sessionStorage
   * @return {Object} data
   */
  _setData(dataReceived) {
    if (!this.isSessionStorageSupported) {
      return false;
    }

    window.sessionStorage.setItem(this.sessionStorageKey, dataReceived);
    return dataReceived;
  };

  /**
   * Get stored data from sessionStorage and parse it
   * @return {Object} data
   */
  _restoreData() {
    if (!this.isSessionStorageSupported) {
      return false;
    }

    if (this.isSessionStorageSupported) {
      let storedData = this._getData();

      this.parseData(storedData);
    }
  };

  /**
   * Parse data fetched from sessionStorage
   * @param  {String} dataReceived
   */
  parseData(dataReceived) {
    let actualData;

    // Expecting JSON data
    try {
      actualData = JSON.parse(dataReceived);
      this.tabId = actualData && actualData.id;
      this.tabParentName = actualData && actualData.parentName;
    } catch (e) {
      throw new Error(WarningTextEnum.INVALID_DATA);
    };
  };

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

    // cancel timeout
    window.clearTimeout(this.timeout);

    // When Parent tab gets closed or refereshed
    if (data.indexOf(PostMessageEventNamesEnum.PARENT_DISCONNECTED) > -1) {
      // Call user-defined `onParentDisconnect` callback when Parent tab gets closed or refereshed.
      if (this.config.onParentDisconnect) {
        this.config.onParentDisconnect();
      }

      // remove postMessage listener since no Parent is there to communicate with
      window.removeEventListener('message', evt => this.onHandShake(evt));
    }

    /**
     * When Parent sends an Acknowledgement to the Child's request of setting up a communication channel
     * along with the tab's identity i.e. id, name and it's parent(itself) to the child tab.
    */
    if (data.indexOf(PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT) > -1) {
      let msg = PostMessageEventNamesEnum.CUSTOM + JSON.stringify({
        id: this.tabId
      });

      dataReceived = data.split(PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT)[1];

      // Set data to sessionStorage so that when page reloads it can directly read the past info till the session lives
      this._setData(dataReceived);
      this.parseData(dataReceived);

      this.sendMessageToParent(msg);

      if (this.config.onInitialize) {
        this.config.onInitialize();
      }
    }

    // Whenever Parent tab communicates once the communication channel is established
    if (data.indexOf(PostMessageEventNamesEnum.PARENT_COMMUNICATED) > -1) {
      dataReceived = data.split(PostMessageEventNamesEnum.PARENT_COMMUNICATED)[1];

      try {
        dataReceived = JSON.parse(dataReceived);
      } catch (e) {
        throw new Error(WarningTextEnum.INVALID_JSON);
      }
      // Call user-defined `onParentCommunication` callback when Parent sends a message to Parent tab
      if (this.config.onParentCommunication) {
        this.config.onParentCommunication(dataReceived);
      }
    }
  };

  /**
   * Attach postmessage and onbeforeunload event listeners
   */
  addListeners() {
    window.onbeforeunload = (evt) => {
      let msg = PostMessageEventNamesEnum.ON_BEFORE_UNLOAD + JSON.stringify({
        id: this.tabId
      });

      this.sendMessageToParent(msg);
    };

    window.removeEventListener('message', evt => this.onCommunication(evt));
    window.addEventListener('message', evt => this.onCommunication(evt));
  };

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
  sendMessageToParent(msg) {
    if (window.top.opener) {
      window.top.opener.postMessage(msg, '*');
    }
  };

  /**
   * Get current Tab info i.e. id, name and parentName
   * @return {Object} tab-info
   */
  getTabInfo() {
    return {
      id: this.tabId,
      name: this.tabName,
      parentName: this.tabParentName
    };
  };
  /**
   * API ends here ->
   */

  /**
   * Invoked on object instantiation unless user pass a key to call it explicitly
   */
  init() {
    if (this.config.onReady) {
      this.config.onReady();
    }
    this.isSessionStorageSupported = this._isSessionStorage();
    this.sendMessageToParent(PostMessageEventNamesEnum.LOADED);
    this.addListeners();
    this._restoreData();
    this.timeout = this.setHandshakeExpiry();
  }
};

module.exports = Child;
