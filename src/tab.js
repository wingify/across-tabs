import tabUtils from './utils/tabUtils';
import UUID from './vendor/uuid';
import domUtils from './utils/dom';

// Named Class expression
let Tab = class Tab {
  constructor() {
    window.name = 'PARENT_TAB';
    this.init();
  };
  create(config) {
    this.url = config.url;
    this.id = UUID.generate() || (tabUtils.tabs.length + 1);
    this.name = config.windowName;
    this.status = 'open';
    this.ref = window.open(this.url, config.windowName || '_blank', config.windowFeatures);

    domUtils.disable('data-tab-opener');

    window.newlyTabOpened = {
      id: this.id,
      name: this.name,
      ref: this.ref
    };

    tabUtils.addNew(this);

    return this; // for chaining
  };
  init() {};
};

module.exports = Tab;
