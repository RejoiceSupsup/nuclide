'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TERMINAL_DEFAULT_ICON = exports.TERMINAL_DEFAULT_LOCATION = exports.URI_PREFIX = undefined;
exports.terminalSupportsCwd = terminalSupportsCwd;
exports.uriFromCwd = uriFromCwd;
exports.uriFromInfo = uriFromInfo;
exports.infoFromUri = infoFromUri;

var _os = _interopRequireDefault(require('os'));

var _url = _interopRequireDefault(require('url'));

var _uuid;

function _load_uuid() {
  return _uuid = _interopRequireDefault(require('uuid'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const URI_PREFIX = exports.URI_PREFIX = 'atom://nuclide-terminal-view'; /**
                                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                                         * All rights reserved.
                                                                         *
                                                                         * This source code is licensed under the license found in the LICENSE file in
                                                                         * the root directory of this source tree.
                                                                         *
                                                                         * 
                                                                         * @format
                                                                         */

const TERMINAL_DEFAULT_LOCATION = exports.TERMINAL_DEFAULT_LOCATION = 'pane';
const TERMINAL_DEFAULT_ICON = exports.TERMINAL_DEFAULT_ICON = 'terminal';

function terminalSupportsCwd(cwd) {
  // The terminal does not currently support Windows. Since remote projects are only
  // supported on *nix environments, offer the terminal for remote URIs and for
  // local URIs if the current platform is not Windows.
  return _os.default.platform() !== 'win32' || cwd != null && (_nuclideUri || _load_nuclideUri()).default.isRemote(cwd);
}

function uriFromCwd(cwd) {
  const cwdOptions = cwd == null ? {} : { cwd };
  return uriFromInfo(Object.assign({}, cwdOptions, {
    remainOnCleanExit: false,
    defaultLocation: TERMINAL_DEFAULT_LOCATION,
    icon: TERMINAL_DEFAULT_ICON
  }));
}

function uriFromInfo(info) {
  const uri = _url.default.format({
    protocol: 'atom',
    host: 'nuclide-terminal-view',
    slashes: true,
    query: {
      cwd: info.cwd == null ? '' : info.cwd,
      command: info.command == null ? '' : JSON.stringify(info.command),
      title: info.title == null ? '' : info.title,
      key: info.key != null && info.key !== '' ? info.key : (_uuid || _load_uuid()).default.v4(),
      remainOnCleanExit: info.remainOnCleanExit,
      defaultLocation: info.defaultLocation,
      icon: info.icon,
      environmentVariables: info.environmentVariables != null ? JSON.stringify([...info.environmentVariables]) : '',
      preservedCommands: JSON.stringify(info.preservedCommands || [])
    }
  });

  if (!uri.startsWith(URI_PREFIX)) {
    throw new Error('Invariant violation: "uri.startsWith(URI_PREFIX)"');
  }

  return uri;
}

function infoFromUri(paneUri) {
  const { query } = _url.default.parse(paneUri, true);
  if (query == null) {
    return {
      remainOnCleanExit: false,
      defaultLocation: TERMINAL_DEFAULT_LOCATION,
      icon: TERMINAL_DEFAULT_ICON
    };
  } else {
    const cwd = query.cwd === '' ? {} : { cwd: query.cwd };
    const command = query.command === '' ? {} : { command: JSON.parse(query.command) };
    const title = query.title === '' ? {} : { title: query.title };
    const remainOnCleanExit = query.remainOnCleanExit === 'true';
    const key = query.key;
    const defaultLocation = query.defaultLocation != null && query.defaultLocation !== '' ? query.defaultLocation : TERMINAL_DEFAULT_LOCATION;
    const icon = query.icon != null && query.icon !== '' ? query.icon : TERMINAL_DEFAULT_ICON;
    const environmentVariables = query.environmentVariables != null && query.environmentVariables !== '' ? new Map(JSON.parse(query.environmentVariables)) : new Map();
    const preservedCommands = JSON.parse(query.preservedCommands || '[]');
    return Object.assign({}, cwd, command, title, {
      remainOnCleanExit,
      defaultLocation,
      icon,
      key,
      environmentVariables,
      preservedCommands
    });
  }
}