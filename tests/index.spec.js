import Parent from '../src/parent';
import Child from '../src/child';

import AcrossTabs from '../src/index';

describe('AcrossTabs', () => {
  describe('Basic tests', () => {
    it('verify it is defined and its methods', () => {
      expect(AcrossTabs).toBeDefined();
      expect(AcrossTabs.Parent).toBeDefined();
      expect(AcrossTabs.Child).toBeDefined();
    });
  });
});
