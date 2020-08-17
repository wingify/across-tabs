import PostMessageEventNamesEnum from '../../src/enums/PostMessageEventNamesEnum';

describe('PostMessageEventNamesEnum', () => {
  it('should verify the messages', () => {
    expect(PostMessageEventNamesEnum.LOADED).toEqual('__TAB__LOADED_EVENT__');
    expect(PostMessageEventNamesEnum.CUSTOM).toEqual('__TAB__CUSTOM_EVENT__');
    expect(PostMessageEventNamesEnum.ON_BEFORE_UNLOAD).toEqual('__TAB__ON_BEFORE_UNLOAD__');
    expect(PostMessageEventNamesEnum.PARENT_DISCONNECTED).toEqual('__PARENT_DISCONNECTED__');
    expect(PostMessageEventNamesEnum.HANDSHAKE_WITH_PARENT).toEqual('__HANDSHAKE_WITH_PARENT__');
    expect(PostMessageEventNamesEnum.PARENT_COMMUNICATED).toEqual('__PARENT_COMMUNICATED__');
  });
});
