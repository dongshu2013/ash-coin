// This is a stub implementation of the usb package
// It provides empty implementations of the methods used by the Trezor wallet adapter
module.exports = {
  getDeviceList: () => [],
  on: () => {},
  removeAllListeners: () => {},
  setDebugLevel: () => {},
  findByIds: () => null,
  Device: class Device {
    open() {}
    close() {}
    interface() {
      return { claim() {}, release() {} };
    }
  },
};
