import tabUtils from './utils/tab';
import UUID from './vendor/uuid';
import domUtils from './utils/dom';
import TabDataTypesEnum from './enums/TabDataEnum';

// Named Class expression
class Tab {
  /**
   * Invoked when the object is instantiated
   */
  constructor() {
    // Set name of Parent tab if not already defined
    window.name = window.name || 'PARENT_TAB';
  }
  /**
   * Open a new tab
   * @param  {Object} config - Refer API for config keys
   * @param  {Boolean} isWindowNameOverridden - for storage reference
   * @return {Object} this
   */
  create(config, isWindowNameOverridden = false) {
    config = config || {};
    Object.assign(this, config);
    this.id = UUID.generate() || tabUtils.tabs.length + 1;
    this.status = 'open';
    this.wasSuccessfullyLoaded = false;
    // set new tab data to window.name
    let adjustedWindowName = {};
    try {
      let name = JSON.parse(config.windowName);
      adjustedWindowName = name;
      adjustedWindowName[TabDataTypesEnum.NEW_TAB_DATA] = '';
    } catch (e) {
      adjustedWindowName[TabDataTypesEnum.NEW_TAB_DATA] = config.windowName;
    }
    // Refere https://developer.mozilla.org/en-US/docs/Web/API/Window/open#Window_features for WindowFeatures
    if (isWindowNameOverridden) {
      this.url = new URL(this.url);
      this.url.searchParams.append(TabDataTypesEnum.NEW_TAB_DATA, config.windowName);
    }
    this.ref = window.open(this.url, JSON.stringify(adjustedWindowName) || '_blank', config.windowFeatures);

    domUtils.disable('data-tab-opener');

    window.newlyTabOpened = {
      id: this.id,
      name: this.name || this.windowName,
      ref: this.ref
    };

    // Push it to the list of tabs
    tabUtils.addNew(this);

    // Return reference for chaining purpose
    return this;
  }
}

export default Tab;
