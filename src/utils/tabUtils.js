/**
 * A Tab utility file to deal with tab operations
 */

import PostMessageEventNamesEnum from '../enums/PostMessageEventNamesEnum';
import arrayUtils from './array';
import TabStatusEnum from '../enums/TabStatusEnum';
import WarningTextEnum from '../enums/WarningTextEnum';

let tabUtils = {
  tabs: []
};

/**
 * Remove a tab from a list of all tabs.
 * This is required when users opts for removing the closed tabs from the list of tabs.
 * This can be done explictly by passing `removeClosedTabs` key while instantiating Parent.
 * @param  {Object} tab
 */
tabUtils._remove = (tab) => {
  let index;

  index = arrayUtils.searchByKeyName(tabUtils.tabs, 'id', tab.id, 'index');
  tabUtils.tabs.splice(index, 1);
};

/**
 * As explained in `event-listeners/postmessage.js` file,
 * the data received from postmessage API is further processed based on our convention
 * @param  {String} msg
 * @return {String} msg
 */
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
/**
 * Add a new tab to the Array of tabs
 * @param  {Object} tab
 * @return {Object} - this
 */
tabUtils.addNew = (tab) => {
  tabUtils.tabs.push(tab);
  return this;
};
/**
 * Filter out all the opened tabs
 * @return {Array} - only the opened tabs
 */
tabUtils.getOpened = () => {
  return tabUtils.tabs.filter(tab => tab.status === TabStatusEnum.OPEN);
};
/**
 * Filter out all the closed tabs
 * @return {Array} - only the closed tabs
 */
tabUtils.getClosed = () => {
  return tabUtils.tabs.filter(tab => tab.status === TabStatusEnum.CLOSE);
};
/**
 * To get list of all tabs(closed/opened).
 * Note: Closed tabs will not be returned if `removeClosedTabs` key is paased while instantiaiting Parent.
 * @return {Array} - list of all tabs
 */
tabUtils.getAll = () => {
  return tabUtils.tabs;
};

/**
 * Close a specific tab
 * @param  {String} id
 * @return {Object} this
 */
tabUtils.closeTab = (id) => {
  let tab = arrayUtils.searchByKeyName(tabUtils.tabs, 'id', id);

  tab && tab.ref.close();
  return tabUtils;
  // --tabUtils.tabs.length;
};
/**
 * Close all opened tabs using a native method `close` available on window.open reference.
 * @return {tabUtils} this
 */
tabUtils.closeAll = () => {
  let i;

  for (i = 0; i < tabUtils.tabs.length; i++) {
    // --tabUtils.tabs.length;
    tabUtils.tabs[i].ref.close();
  }
  return tabUtils;
};
/**
 * Send a postmessage to every opened Child tab(excluding itself i.e Parent Tab)
 * @param  {String} msg
 */
tabUtils.broadCastAll = (msg) => {
  let i, tabs = tabUtils.getAll();

  msg = tabUtils._preProcessMesage(msg);

  for (i = 0; i < tabs.length; i++) {
    tabs[i].ref.postMessage(msg, '*');
  }
};
/**
 * Send a postmessage to a specific Child tab
 * @param  {String} id
 * * @param  {String} msg
 */
tabUtils.broadCastTo = (id, msg) => {
  let targetedTab,
    tabs = tabUtils.getAll();

  msg = tabUtils._preProcessMesage(msg);

  targetedTab = arrayUtils.searchByKeyName(tabs, 'id', id); // TODO: tab.id
  targetedTab.ref.postMessage(msg, '*');
};

module.exports = tabUtils;
