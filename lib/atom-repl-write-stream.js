'use babel';

import { Writable } from 'stream';

const ELLIPSIS = /^\.{3,}$/;

export default class atomReplWriteStream extends Writable {
  constructor(element) {
    super({ decodeStrings: false });
    this.element = element;
  }

  _write(data, enc, next) {
    const _data = data.toString().trim();

    if (_data.length && !ELLIPSIS.test(_data)) {
      const row = document.createElement('p');
      row.textContent = _data;
      this.element.appendChild(row);
    }
    next();
  }
}
