'use babel';

import repl from 'repl';
import { dirname } from 'path';
import { readdirSync } from 'fs';
import atomReplReadStream from './atom-repl-read-stream';
import atomReplWriteStream from './atom-repl-write-stream';

const WELCOME_MESSAGE = 'Welcome to atom.js ' + process.version;

export default class atomReplView {
  constructor() {
    this.mainElement;
    this.outStream;
    this.outputElement;

    this.resize = this.resize.bind(this);
    this.resizeStart = this.resizeStart.bind(this);
    this.resizeStop = this.resizeStop.bind(this);
    this.clear = this.clear.bind(this);

    this.element = atom.views.addViewProvider(() => {
      const mainElement = getMainElement();
      this.outputElement = getOutputElement();
      this.outputElement.appendChild(getWelcomeElement(WELCOME_MESSAGE));

      mainElement.appendChild(getClearButton(this.clear));
      mainElement.appendChild(this.outputElement);
      mainElement.appendChild(getResizeElement(this.resizeStart));

      this.outStream = new atomReplWriteStream(this.outputElement);

      this.mainElement = mainElement;

      return mainElement;
    });
  }

  resizeStart() {
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.resizeStop);
  }

  resize(evt) {
    const width = this.mainElement.offsetWidth + this.mainElement.getBoundingClientRect().left - evt.pageX;
    this.mainElement.style.width = width + 'px';
  }

  resizeStop() {
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.resizeStop);
  }

  run() {
    const textEditor = atom.workspace.getActiveTextEditor();
    const readStream = new atomReplReadStream(textEditor.getText());
    const filePath = textEditor.getPath();
    const dirPath = filePath ? dirname(filePath) : null;
    const atomModulesPath = dirPath ? `${dirPath}/atom_modules` : null;

    this.appendRunMessage('> Executing ' + readStream.getLines() + ' lines...');
    this.replServer = repl.start({
      input: readStream,
      output: this.outStream,
      ignoreUndefined: true,
      prompt: '',
      terminal: false
    });

    if (dirPath) {
      try {
        readdirSync(dirPath);
        this.replServer.context.module.filename = filePath;
        this.replServer.context.module.paths.unshift(atomModulesPath);
      }
      catch (err) {
        console.warn(`atom-repl is unable to to read the file's (${filePath}) directory tree`);
        console.error('atom-repl error:', err);
      }

    }
  }

  appendRunMessage(message) {
    const row = document.createElement('p');
    row.classList.add('run-header');
    row.textContent = message;
    this.outputElement.appendChild(row);
  }

  clear() {
    this.outputElement.innerHTML = null;
    this.outputElement.appendChild(getWelcomeElement(WELCOME_MESSAGE));
  }

  serialize() {}

  destroy() {
    this.replServer = null;
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}

function getMainElement() {
  const mainElement = document.createElement('main');
  mainElement.classList.add('atom-repl', 'native-key-bindings');
  mainElement.setAttribute('tabindex', -1);
  return mainElement;
}

function getClearButton(clearEvent) {
  const clearButton = document.createElement('button');
  clearButton.classList.add('atom-repl-clear');
  clearButton.innerHTML = 'Clear';
  clearButton.addEventListener('click', clearEvent);
  return clearButton;
}

function getResizeElement(resizeEvent) {
  const resizeElement = document.createElement('div');
  resizeElement.classList.add('atom-repl__resizer');
  resizeElement.addEventListener('mousedown', resizeEvent);
  return resizeElement;
}

function getOutputElement() {
  const outputElement = document.createElement('section');
  outputElement.classList.add('atom-repl__output');
  return outputElement;
}

function getWelcomeElement(message) {
  const welcomeElement = document.createElement('p');
  welcomeElement.innerHTML = message;
  welcomeElement.classList.add('atom-repl-welcome-message');
  return welcomeElement;
}
