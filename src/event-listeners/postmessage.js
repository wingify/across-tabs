import arrayUtils from '../utils/array';
import tabUtils from '../utils/tabUtils';
import WarningTextEnum from '../enums/WarningTextEnum';
import PostMessageEventNamesEnum from '../enums/PostMessageEventNamesEnum';

let PostMessageListener = {};

PostMessageListener._onLoad = function () {
  let data;
  let tabInfo = {
    id: window.newlyTabOpened.id,
    name: window.newlyTabOpened.name,
    parentName: window.name
  };

  if (window.newlyTabOpened) {
    try {
      data = PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT;
      data += JSON.stringify(tabInfo);
      window.newlyTabOpened.ref.postMessage(data, '*');
    } catch (e) {
      throw new Error(WarningTextEnum.INVALID_JSON);
    }
  }
};

PostMessageListener._onCustomMessage = function (data) {
  // CustomEvent not supported in IE
  let event = new CustomEvent('show', {'detail': data});

  window.dispatchEvent(event);
  window.newlyTabOpened = null;
};

PostMessageListener._onBeforeUnload = function (data) {
  let id = data.split(PostMessageEventNamesEnum.ON_BEFORE_UNLOAD)[1],
    tabs;

  if (tabUtils.tabs.length) {
    tabs = tabUtils.getAll();
    window.newlyTabOpened = arrayUtils.searchByKeyName(tabs, 'id', id) || window.newlyTabOpened;
  }
};

PostMessageListener.onNewTab = (message) => {
  let data = message.data;

  if (!tabUtils.tabs.length) {
    return;
  }

  if (data === PostMessageEventNamesEnum.LOADED) {
    PostMessageListener._onLoad();
  } else if (data.indexOf(PostMessageEventNamesEnum.CUSTOM) > -1) {
    PostMessageListener._onCustomMessage(data);
  } else if (data.indexOf(PostMessageEventNamesEnum.ON_BEFORE_UNLOAD) > -1) {
    PostMessageListener._onBeforeUnload(data);
  }
};

module.exports = PostMessageListener;
