import arrayUtils from '../utils/array';
import tabUtils from '../utils/tabUtils';
import WarningTextEnum from '../enums/WarningTextEnum';
import PostMessageEventNamesEnum from '../enums/PostMessageEventNamesEnum';

let PostMessageListener = {};

/*
 * Custom PostMessage Convetions Followed - Sending and Receieving data gracefully
 * -------------------------------------------------------------------------------
 *
 * 1. First convetion
      Since data can be sent or receieved via postmessge API in the form of strings,
      the library stores data as stringified JSON object and while reading it, parses the JSON stringified earlier.
      This is easy to maintain and deal with data.

 * 2. Second Convetions
      With every data, there's an associated message identifier.
      A message identifier helps in knowing the intention of what event actually is for.
      For eg: To send data after proper establishment from Child tab,
      Parent tab acknowledges the connection by returning the true identity of the Child tab.
      This is done via prepending the Event name i.e. HANDSHAKE_WTIH_PARENT

      So the postmessage's message would like: `HANDSHAKE_WTIH_PARENT{"id": 123, "name": "Hello World!"}`.
      So, while reading the message, it has to be first checked up with the defined event names
      and then after successful match, the message is split using the Event-name as a delimiter.
      The first entry if the event name and the second one is the actual data.
 *
 */

/**
 * OnLoad Event - it serves as an communication establishment source from Child tab
 */
PostMessageListener._onLoad = function () {
  let data;
  // Setting generic tab info to be sent to Child after establishing connection
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

/**
 * onCustomMessage Event - Any sort of custom message by child is treated here
 * @param  {Object} data
 *
 * The method fires an event to notify Parent regarding Child's behavior
 */
PostMessageListener._onCustomMessage = function (data) {
  // CustomEvent is not supported in IE and so does this library
  let event = new CustomEvent('show', {'detail': data});

  window.dispatchEvent(event);
  window.newlyTabOpened = null;
};

/**
 * onBeforeUnload Event - Tells parent that either Child tab was closed or refreshed.
 * Child uses native `ON_BEFORE_UNLOAD` method to notify Parent.
 *
 * It sets the newlyTabOpened variable accordingly
 *
 * @param  {Object} data
 */
PostMessageListener._onBeforeUnload = function (data) {
  let id = data.split(PostMessageEventNamesEnum.ON_BEFORE_UNLOAD)[1],
    tabs;

  if (tabUtils.tabs.length) {
    tabs = tabUtils.getAll();
    window.newlyTabOpened = arrayUtils.searchByKeyName(tabs, 'id', id) || window.newlyTabOpened;
  }
};

/**
 * onNewTab - It's the entry point for data processing after receiving any postmessage form any Child Tab
 * @param  {Object} message
 */
PostMessageListener.onNewTab = (message) => {
  let data = message.data;

  /**
   * Safe check - This happens when CHild Tab gets closed just after sending a message.
   * No need to go further from this point.
   * Tab status is automatically fetched using our polling mechanism written in `Parent.js` file.
   */
  if (!tabUtils.tabs.length) {
    return;
  }

  if (data.indexOf(PostMessageEventNamesEnum.LOADED) > -1) {
    PostMessageListener._onLoad();
  } else if (data.indexOf(PostMessageEventNamesEnum.CUSTOM) > -1) {
    PostMessageListener._onCustomMessage(data);
  } else if (data.indexOf(PostMessageEventNamesEnum.ON_BEFORE_UNLOAD) > -1) {
    PostMessageListener._onBeforeUnload(data);
  }
};

module.exports = PostMessageListener;
