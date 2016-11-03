import PostMessageEventNamesEnum from './enums/PostMessageEventNamesEnum';
import WarningTextEnum from './enums/WarningTextEnum';

const sessionStorageKey = '__vwo_tab_id__';

// Named Class expression
let Child = class Child {

  constructor(config) {

    this.config = config || {};

    this.handshakeExpiryLimit = 5000;

    this.tabName = window.name;
    this.tabId = null;
    this.tabParentName = null;

    // this.init();
  };

  _isSessionStorage() {
    if (window.sessionStorage) {
      return true;
    }
    return false;
  };

  _getData() {
    if (!this.isSessionStorageSupported) { return false; }

    return sessionStorage.getItem(sessionStorageKey);
  };

  _setData(dataReceived) {
    if (!this.isSessionStorageSupported) { return false; }

    sessionStorage.setItem(sessionStorageKey, dataReceived);
    return true;
  };

  _restoreData() {
    if (!this.isSessionStorageSupported) { return false; }

    if (this.isSessionStorageSupported) {
      let storedData = this._getData();

      this.parseData(storedData);
      if (this.config.onInitialize) {
        this.config.onInitialize();
      }
    }
  };

  onCommunication(message) {
    let dataReceived,
      data = message.data;

    // cancel timeout
    window.clearTimeout(this.timeout);

    if (data.indexOf(PostMessageEventNamesEnum.PARENT_DISCONNECTED) > -1) {
      // callback
      if (this.config.onParentDisconnect) {
        this.config.onParentDisconnect();
      }
      // remove postMessage listener since no Parent is there to communicate with
      window.removeEventListener('message', evt => this.onHandShake(evt));
      return;
    }

    if (data.indexOf(PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT) > -1) {
      dataReceived = data.split(PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT)[1];

      this._setData(dataReceived);
      this.parseData(dataReceived);

      this.sendMessageToParent(PostMessageEventNamesEnum.CUSTOM + this.tabId);

      if (this.config.onInitialize) {
        this.config.onInitialize();
      }
    }

    if (data.indexOf(PostMessageEventNamesEnum.PARENT_COMMUNICATED) > -1) {
      dataReceived = data.split(PostMessageEventNamesEnum.PARENT_COMMUNICATED)[1];

      if (this.config.onParentCommunication) {
        this.config.onParentCommunication(dataReceived);
      }
    }
  };

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
  }

  addListeners() {
    window.onbeforeunload = (evt) => {
      this.sendMessageToParent(PostMessageEventNamesEnum.ON_BEFORE_UNLOAD + this.tabId);
    };

    window.removeEventListener('message', evt => this.onCommunication(evt));
    window.addEventListener('message', evt => this.onCommunication(evt));
  };

  setHandshakeExpiry() {
    return setTimeout(() => {
      if (this.config.onInitialize) {
        this.config.onInitialize();
      }
    }, this.handshakeExpiryLimit);
  }

  // API starts here ->
  sendMessageToParent(msg) {
    if (window.top.opener) {
      window.top.opener.postMessage(msg, '*');
    }
  };

  getTabInfo() {
    return {
      id: this.tabId,
      name: this.tabName,
      parentName: this.tabParentName
    };
  };
  // API ends here ->

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
