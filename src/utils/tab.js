/**
 * A Tab utility file to deal with tab operations
 */

import PostMessageEventNamesEnum from '../enums/PostMessageEventNamesEnum';
import arrayUtils from './array';
import TabStatusEnum from '../enums/TabStatusEnum';
import WarningTextEnum from '../enums/WarningTextEnum';

let tabUtils = {
  tabs: [],
  config: {}
};

/**
 * Remove a tab from a list of all tabs.
 * This is required when users opts for removing the closed tabs from the list of tabs.
 * This can be done explictly by passing `removeClosedTabs` key while instantiating Parent.
 * @param  {Object} tab
 */
tabUtils._remove = tab => {
  let index;

  index = arrayUtils.searchByKeyName(tabUtils.tabs, 'id', tab.id, 'index');
  tabUtils.tabs.splice(index, 1);
};

/**
 * As explained in `event-listeners/postmessage.js` file,
 * the data received from postmessage API is further processed based on our convention
 * @param  {String} msg
 * @return {String} modified msg
 */
tabUtils._preProcessMessage = msg => {
  // make msg always an object to support JSON support
  try {
    msg = tabUtils.config.stringify(msg);
  } catch (e) {
    throw new Error(WarningTextEnum.INVALID_JSON);
  }

  if (msg && msg.indexOf(PostMessageEventNamesEnum.PARENT_COMMUNICATED) === -1) {
    msg = PostMessageEventNamesEnum.PARENT_COMMUNICATED + msg;
  }

  return msg;
};
/**
 * Add a new tab to the Array of tabs
 * @param  {Object} tab
 * @return {Object} - this
 */
tabUtils.addNew = tab => {
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
tabUtils.closeTab = id => {
  let tab = arrayUtils.searchByKeyName(tabUtils.tabs, 'id', id);

  if (tab && tab.ref) {
    tab.ref.close();
    tab.status = TabStatusEnum.CLOSE;
  }

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
    if (tabUtils.tabs[i] && tabUtils.tabs[i].ref) {
      tabUtils.tabs[i].ref.close();
      tabUtils.tabs[i].status = TabStatusEnum.CLOSE;
    }
  }

  return tabUtils;
};
/**
 * Send a postmessage to every opened Child tab(excluding itself i.e Parent Tab)
 * @param  {String} msg
 * @param  {Boolean} isSiteInsideFrame
 */
tabUtils.broadCastAll = (msg, isSiteInsideFrame) => {
  let i,
    tabs = tabUtils.getOpened();

  msg = tabUtils._preProcessMessage(msg);

  for (i = 0; i < tabs.length; i++) {
    tabUtils.sendMessage(tabs[i], msg, isSiteInsideFrame);
  }

  return tabUtils;
};
/**
 * Send a postmessage to a specific Child tab
 * @param  {String} id
 * @param  {String} msg
 * @param  {Boolean} isSiteInsideFrame
 */
tabUtils.broadCastTo = (id, msg, isSiteInsideFrame) => {
  let targetedTab,
    tabs = tabUtils.getAll();

  msg = tabUtils._preProcessMessage(msg);

  targetedTab = arrayUtils.searchByKeyName(tabs, 'id', id); // TODO: tab.id
  tabUtils.sendMessage(targetedTab, msg, isSiteInsideFrame);

  return tabUtils;
};

/**
 * Send a postMessage to the desired window/frame
 * @param  {Object}  target
 * @param  {String}  msg
 * @param  {Boolean} isSiteInsideFrame
 */
tabUtils.sendMessage = (target, msg, isSiteInsideFrame) => {
  let origin = tabUtils.config.origin || '*';
  if (isSiteInsideFrame && target.ref[0]) {
    for (let i = 0; i < target.ref.length; i++) {
      target.ref[i].postMessage(msg, origin);
    }
  } else if (target.ref && target.ref.top) {
    target.ref.top.postMessage(msg, origin);
  }
};

export default tabUtils;
