/**
 * Enum for showing various warnings to suser when things done wrong
 * @type {Object}
 */
const WarningTextEnum = {
  INVALID_JSON: 'Invalid JSON Object!',
  INVALID_DATA: 'Some wrong message is being sent by Parent.',
  CONFIG_REQUIRED: 'Configuration options required. Please read docs.',
  CUSTOM_EVENT: "CustomEvent(and it's polyfill) is not supported in this browser.",
  URL_REQUIRED: 'Url is needed for creating and opening a new window/tab. Please read docs.'
};

export default WarningTextEnum;
