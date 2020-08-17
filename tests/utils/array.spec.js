import arrayUtils from '../../src/utils/array';

let data = [
  {
    id: 1,
    name: 'A'
  },
  {
    id: 2,
    name: 'B'
  },
  {
    id: 3,
    name: 'C'
  },
  {
    id: 4,
    name: 'D'
  }
];

describe('arrayUtils', () => {
  describe('Basic tests', () => {
    it('verify it is defined and its methods', () => {
      expect(arrayUtils).toBeDefined();
      expect(arrayUtils.searchByKeyName).toBeDefined();
    });
  });

  describe('method: searchByKeyName', () => {
    it('should return if no data is provided', () => {
      expect(arrayUtils.searchByKeyName()).toBe(false);
    });

    it('should return if no key is provided', () => {
      expect(arrayUtils.searchByKeyName([])).toBe(false);
    });
    it('should return object for the MATCHED item', () => {
      let result,
        item = { id: 3 };

      result = arrayUtils.searchByKeyName(data, 'id', item.id);
      expect(result).toEqual(data[2]);
    });
    it('should return index for the MATCHED item', () => {
      let result,
        item = { id: 3 };

      result = arrayUtils.searchByKeyName(data, 'id', item.id, 'index');
      expect(result).toEqual(2);
    });
    it('should return both for the MATCHED item', () => {
      let result,
        item = { id: 3 };

      result = arrayUtils.searchByKeyName(data, 'id', item.id, 'both');
      expect(result).toEqual({ index: 2, obj: data[2] });
    });

    it('should return index -1 for the UNMATCHED item', () => {
      let result,
        item = { id: 100 };

      result = arrayUtils.searchByKeyName(data, 'id', item.id, 'index');
      expect(result).toEqual(-1);
    });
    it('should return empty object for the UNMATCHED item', () => {
      let result,
        item = { id: 100 };

      result = arrayUtils.searchByKeyName(data, 'id', item.id, 'object');
      expect(result).toEqual({});
    });
    it('should return object with empty obj and index -1 for the UNMATCHED item', () => {
      let result,
        item = { id: 100 };

      result = arrayUtils.searchByKeyName(data, 'id', item.id, 'both');
      expect(result).toEqual({ obj: {}, index: -1 });
    });

    it('should return object for the MATCHED-String item', () => {
      let result,
        item = { name: 'B' };

      result = arrayUtils.searchByKeyName(data, 'name', item.name, 'object');
      expect(result).toEqual(data[1]);
    });
    it('should return empty object for the UNMATCHED-String item', () => {
      let result,
        item = { name: '0_0' };

      result = arrayUtils.searchByKeyName(data, 'name', item.name, 'object');
      expect(result).toEqual({});
    });
  });
});
