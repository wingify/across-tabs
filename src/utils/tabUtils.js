import PostMessageEventNamesEnum from '../enums/PostMessageEventNamesEnum';
import arrayUtils from './array';
import TabStatusEnum from '../enums/TabStatusEnum';
import WarningTextEnum from '../enums/WarningTextEnum';

let tabUtils = {
  tabs: []
};

tabUtils._remove = (tab) => {
  let index;

  index = arrayUtils.searchByKeyName(tabUtils.tabs, 'id', tab.id, 'index');
  tabUtils.tabs.splice(index, 1);
};

tabUtils._preProcessMesage = (msg) => {

  // make msg always an object to support JSON support
  try {
    msg = JSON.stringify(msg);
  } catch (e) {
    throw new Error(WarningTextEnum.INVALID_JSON);
  }

  if (msg.indexOf(PostMessageEventNamesEnum.PARENT_COMMUNICATED) === -1) {
    msg = PostMessageEventNamesEnum.PARENT_COMMUNICATED + msg;
  }

  return msg;
};

tabUtils.addNew = (tab) => {
  tabUtils.tabs.push(tab);
  return this;
};

tabUtils.getOpened = () => {
  return tabUtils.tabs.filter(tab => tab.status === TabStatusEnum.OPEN);
};

tabUtils.getClosed = () => {
  return tabUtils.tabs.filter(tab => tab.status === TabStatusEnum.CLOSE);
};

tabUtils.getAll = () => {
  return tabUtils.tabs;
};

// it takes id because of some cross origin restriction when passing tab with ref
tabUtils.closeTab = (id) => {
  let tab = arrayUtils.searchByKeyName(tabUtils.tabs, 'id', id);

  tab && tab.ref.close();
  return tabUtils;
  // --tabUtils.tabs.length;
};

tabUtils.closeAll = () => {
  let i;

  for (i = 0; i < tabUtils.tabs.length; i++) {
    // --tabUtils.tabs.length;
    tabUtils.tabs[i].ref.close();
  }
  return tabUtils;
};

tabUtils.broadCastAll = (msg) => {
  let i, tabs = tabUtils.getAll();

  msg = tabUtils._preProcessMesage(msg);

  for (i = 0; i < tabs.length; i++) {
    tabs[i].ref.postMessage(msg, '*');
  }
};

tabUtils.broadCastTo = (tab, msg) => {
  let targetedTab,
    tabs = tabUtils.getAll();

  msg = tabUtils._preProcessMesage(msg);

  targetedTab = arrayUtils.searchByKeyName(tabs, 'id', tab); // TODO: tab.id
  targetedTab.ref.postMessage(msg, '*');
};

module.exports = tabUtils;
