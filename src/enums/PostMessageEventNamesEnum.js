/**
 * Enum for different event names used for tab-communication
 * @type {Object}
 */
const PostMessageEventNamesEnum = {
  LOADED: '__TAB__LOADED_EVENT__',
  CUSTOM: '__TAB__CUSTOM_EVENT__',
  HANDSHAKE: '__TAB__HANDSHAKE_EVENT__',
  ON_BEFORE_UNLOAD: '__TAB__ON_BEFORE_UNLOAD__',
  PARENT_DISCONNECTED: '__PARENT_DISCONNECTED__',
  HANDSHAKE_WITH_PARENT: '__HANDSHAKE_WITH_PARENT__',
  PARENT_COMMUNICATED: '__PARENT_COMMUNICATED__'
};

export default PostMessageEventNamesEnum;
