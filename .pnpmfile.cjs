function readPackage(pkg) {
  // Replace usb with an empty package
  if (pkg.name === 'usb') {
    pkg.dependencies = {};
    pkg.optionalDependencies = {};
    pkg.peerDependencies = {};
    pkg.scripts = { install: 'echo "Skipping usb native build"' };
  }

  // Replace node-hid with an empty package
  if (pkg.name === 'node-hid') {
    pkg.dependencies = {};
    pkg.optionalDependencies = {};
    pkg.peerDependencies = {};
    pkg.scripts = { install: 'echo "Skipping node-hid native build"' };
  }

  // Remove usb from any package's dependencies
  if (pkg.dependencies && pkg.dependencies.usb) {
    delete pkg.dependencies.usb;
  }
  if (pkg.optionalDependencies && pkg.optionalDependencies.usb) {
    delete pkg.optionalDependencies.usb;
  }
  if (pkg.peerDependencies && pkg.peerDependencies.usb) {
    delete pkg.peerDependencies.usb;
  }

  // Remove node-hid from any package's dependencies
  if (pkg.dependencies && pkg.dependencies['node-hid']) {
    delete pkg.dependencies['node-hid'];
  }
  if (pkg.optionalDependencies && pkg.optionalDependencies['node-hid']) {
    delete pkg.optionalDependencies['node-hid'];
  }
  if (pkg.peerDependencies && pkg.peerDependencies['node-hid']) {
    delete pkg.peerDependencies['node-hid'];
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
}; 