import WarningTextEnum from '../../src/enums/WarningTextEnum';

describe('WarningTextEnum', () => {
  it('should verify the messages', () => {
    expect(WarningTextEnum.INVALID_JSON).toEqual('Invalid JSON Object!');
    expect(WarningTextEnum.INVALID_DATA).toEqual('Some wrong message is being sent by Parent.');
    expect(WarningTextEnum.CONFIG_REQUIRED).toEqual('Configuration options required. Please read docs.');
    expect(WarningTextEnum.URL_REQUIRED).toEqual(
      'Url is needed for creating and opening a new window/tab. Please read docs.'
    );
  });
});
