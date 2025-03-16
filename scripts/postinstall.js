#!/usr/bin/env node

/**
 * This script runs after npm/pnpm install and handles issues with native dependencies
 * like the usb package that requires Python for node-gyp.
 */

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

console.log('📦 Running post-install script...');

// Check if we're in a production environment (like Railway)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_STATIC_URL;

if (isProduction) {
  console.log('🚂 Detected production environment (Railway)');

  try {
    // Create a mock for the usb module if it exists
    const usbNodeModulePath = path.resolve('./node_modules/usb');

    if (fs.existsSync(usbNodeModulePath)) {
      console.log('🔌 Found usb module, creating mock implementation...');

      // Create a mock index.js file
      const mockContent = `
// Mock implementation of the usb module for environments without Python/node-gyp
console.warn('Using mock USB implementation. Native USB functionality is disabled.');

module.exports = {
  usb: {
    getDeviceList: () => [],
    on: () => {},
    removeAllListeners: () => {}
  },
  findByIds: () => null,
  LIBUSB_CLASS_PER_INTERFACE: 0,
  LIBUSB_CLASS_HID: 3,
  // Add other constants as needed
};
      `;

      fs.writeFileSync(path.join(usbNodeModulePath, 'index.js'), mockContent);
      console.log('✅ Successfully created mock USB implementation');
    } else {
      console.log('⏭️ No usb module found, skipping mock creation');
    }

    console.log('✅ Post-install completed successfully');
  } catch (error) {
    console.error('❌ Error during post-install:', error);
    // Don't exit with error to prevent deployment failure
  }
} else {
  console.log('🧪 Development environment detected, skipping production fixes');
  console.log('✅ Post-install completed successfully');
}
