import TabStorageLocationEnum from './enums/TabStorageLocationEnum';

// Named Class expression
class TabStorage {
  /**
   * Invoked when the object is instantiated
   */
  constructor(isWindowNameOverridden = false) {
    // Set name of Parent tab if not already defined
    if (!isWindowNameOverridden) {
      this.storageLocation = TabStorageLocationEnum.WINDOW_NAME;
    } else {
      this.storageLocation = TabStorageLocationEnum.SESSION_STORAGE;
    }
  }
  /**
   * Get item from storage
   * @param  {String} item - item to be fetched
   * @return {Object} storage item
   */
  get(item) {
    let result = null;
    switch (this.storageLocation) {
      case TabStorageLocationEnum.WINDOW_NAME:
        if (window.name) {
          result = JSON.parse(window.name)[item];
        }
        break;
      case TabStorageLocationEnum.SESSION_STORAGE:
        result = window.sessionStorage.getItem(item);
        break;
    }
    return result;
  }
  /**
   * Set item to storage
   * @param  {String} item - item to be fetched
   * @return {Object} storage item
   */
  set(key, value) {
    switch (this.storageLocation) {
      case TabStorageLocationEnum.WINDOW_NAME:
        let name = {};
        if (window.name) {
          name = JSON.parse(window.name);
        }
        name[key] = value;
        window.name = JSON.stringify(name);
        break;
      case TabStorageLocationEnum.SESSION_STORAGE:
        window.sessionStorage.setItem(key, value);
        break;
    }
  }
}

export default TabStorage;
