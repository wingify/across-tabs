import tabUtils from '../src/utils/tab';
import TabDataTypesEnum from '../src/enums/TabDataEnum';
import TabStorageLocationEnum from '../src//enums/TabStorageLocationEnum';
import TabStorage from '../src/tabStorage'

let tabStorage;

describe('Tab', () => {
  beforeEach(() => {
    tabStorage = new TabStorage();
    window.name = '';
  });
  afterEach(() => {
    tabStorage = null;
  });
  describe('Basic Tests', () => {
    it('verify it is defined and its methods', () => {
        expect(tabStorage).toBeDefined();
        expect(tabStorage.get).toBeDefined();
        expect(tabStorage.set).toBeDefined();
        expect(tabStorage.storageLocation).toEqual(TabStorageLocationEnum.WINDOW_NAME)
      });
  });
  describe('method: set', () => {
    it('should set data to window.name', () => {
        tabStorage.set('data', 1);
        expect(window.name).toEqual(JSON.stringify({'data': 1}));
    });
    it('should set data in sessionStorage', () => {
        let isWindowNameOverridden = true;
        let tabStorage1 = new TabStorage(isWindowNameOverridden);
        spyOn(window.sessionStorage, 'setItem');
        tabStorage1.set('data', 1);
        expect(window.sessionStorage.setItem).toHaveBeenCalled();
      });
  })
  describe('method: get', () => {
    it('should get data from window.name', () => {
        tabStorage.set('data', 1);
        let result = tabStorage.get('data');
        expect(result).toEqual(1);
    });
    it('should get data from sessionStorage', () => {
        let isWindowNameOverridden = true;
        let tabStorage1 = new TabStorage(isWindowNameOverridden);
        spyOn(window.sessionStorage, 'getItem');
        tabStorage1.get('data');
        expect(window.sessionStorage.getItem).toHaveBeenCalledWith('data');
      });
  })
});