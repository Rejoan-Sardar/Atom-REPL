'use babel';

import atomReplView from './atom-repl-view';
import { CompositeDisposable } from 'atom';

export default {

  atomReplView: null,
  rightPanel: null,
  subscriptions: null,

  activate(state) {
    // get repl view
    this.atomReplView = new atomReplView(state.atomReplViewState);

    this.rightPanel = atom.workspace.addRightPanel({
      item: this.atomReplView.getElement(),
      visible: false
    });

    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-repl:toggle': () => this.toggle(),
      'atom-repl:run': () => this.run(),
      'atom-repl:clear': () => this.clear()
    }));
  },

  deactivate() {
    this.rightPanel.destroy();
    this.subscriptions.dispose();
    this.atomReplView.destroy();
  },

  serialize() {
    return {
      atomReplViewState: this.atomReplView.serialize()
    };
  },

  run() {
    this.atomReplView.run();
  },

  clear() {
    this.atomReplView.clear();
  },

  toggle() {
    return (
      this.rightPanel.isVisible() ?
      this.rightPanel.hide() :
      this.rightPanel.show()
    );
  }

};
