import tabUtils from './utils/tabUtils';
import UUID from './vendor/uuid';
import domUtils from './utils/dom';

// Named Class expression
let Tab = class Tab {
  /**
   * Invoked when the object is instantiated
   */
  constructor() {
    // Set name of Parent tab if not already defined
    window.name = window.name || 'PARENT_TAB';
  };
  /**
   * Open a new tab
   * @param  {Object} config - Refer API for config keys
   * @return {Object} this
   */
  create(config) {
    this.url = config.url;
    this.id = UUID.generate() || (tabUtils.tabs.length + 1);
    this.name = config.windowName;
    this.status = 'open';
    // Refere https://developer.mozilla.org/en-US/docs/Web/API/Window/open#Window_features for WindowFeatures
    this.ref = window.open(
      this.url,
      config.windowName || '_blank',
      config.windowFeatures);

    domUtils.disable('data-tab-opener');

    window.newlyTabOpened = {
      id: this.id,
      name: this.name,
      ref: this.ref
    };

    // Push it to the list of tabs
    tabUtils.addNew(this);

     // Return reference for chaining purpose
    return this;
  };
};

module.exports = Tab;
