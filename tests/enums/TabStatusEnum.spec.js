import TabStatusEnum from '../../src/enums/TabStatusEnum';

describe('TabStatusEnum', () => {
  it('should verify the messages', () => {
    expect(TabStatusEnum.OPEN).toEqual('open');
    expect(TabStatusEnum.CLOSE).toEqual('close');
  });
});
