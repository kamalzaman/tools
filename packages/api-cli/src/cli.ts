// Copyright 2018-2020 @polkadot/api-cli authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import fs from 'fs';

import { assert } from '@polkadot/util';

interface ArgV {
  [argName: string]: unknown;
  _: string[];
  $0: string;
}

function asJson (param: string): string {
  try {
    return JSON.parse(param);
  } catch (error) {
    return param;
  }
}

export function hexMiddleware (argv: ArgV): ArgV {
  // a parameter whose initial character is @ treated as a path and replaced
  // with the hexadecimal representation of the binary contents of that file
  argv._ = argv._.map((param) => {
    if (param.startsWith('@')) {
      const path = param.substring(1);

      assert(fs.existsSync(path), `Cannot find path ${path}`);

      return `0x${fs.readFileSync(path).toString('hex')}`;
    }

    return param;
  });

  return argv;
}

export function jsonMiddleware (argv: ArgV): ArgV {
  argv._ = argv._.map(asJson);

  return argv;
}

export function parseParams (inline: string[], file?: string): string[] {
  if (file) {
    assert(fs.existsSync(file), 'Cannot find supplied transaction parameters file');

    try {
      return fs.readFileSync(file, 'utf8').split(' ').map(asJson);
    } catch (e) {
      assert(false, 'Error loading supplied transaction parameters file');
    }
  }

  return inline;
}
