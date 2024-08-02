import isHotkey from "is-hotkey";
import {
  Settings
} from "./lib/settings";
import {
  DomUtils
} from "./lib/dom_utils";
import {
  HintCoordinator
} from "./content_scripts/link_hints";
import './static/vimium.css'

import {
  frameId
} from "./content_scripts/vimium_frontend";

DomUtils.documentReady(function () {
  window.documentReadyListenerCalled = true;
});

Settings.isLoaded = true;

HintCoordinator.sendMessage = (name, request) => {
  if (request == null) request = {};
  if (HintCoordinator[name]) HintCoordinator[name](request);
  return request;
};

function activateLinkHints({
  modeIndex = 0
} = {}) {
  HintCoordinator.getHintDescriptors({
    modeIndex
  });
  return HintCoordinator.activateMode({
    hintDescriptors: {},
    modeIndex,
    originatingFrameId: frameId
  });
}


function isInputFocused() {
  var activeElement = document.activeElement
  var inputs = ['input', 'textarea']

  if (
    activeElement &&
    (activeElement.isContentEditable ||
      inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1)
  ) {
    return true
  }
}




class LinkHints {

  /**
   * 
   * @typedef {Object} Modifier
   * @property {String} key
   * @property {Function} callback
   * @property {Boolean} activeOnInput
   * @property {Number} modeIndex
   * 
   * @param {Modifier[]} modifiers
   */
  constructor(modifiers = []) {
    this.modifiers = modifiers;
    this._handler = this.handleKeydown.bind(this);
    this.activate();
  }

  handleKeydown(event) {
    this.modifiers.forEach((modifier) => {

      if (modifier) {
        const key = modifier.key;
        const activeOnInput = modifier.activeOnInput;
        const modeIndex = modifier.modeIndex || 0;
        const callback = modifier.callback;

        if (!key) {
          throw new Error("Key is not present")
        }

        if (!activeOnInput && isInputFocused()) {
          return
        }
        
        if (isHotkey(key, event)) {
          this.toggleHints({modeIndex});
          if(callback) callback()
        }
      }else{
        throw new Error("passed modifier must be an object")
      }
    })
  }

  deactivate() {
    window.removeEventListener("keydown", this._handler, true);
  }

  activate() {
    window.addEventListener("keydown", this._handler, true);
  }

  toggleHints({modeIndex = 0} = {}) {
    HintCoordinator.getHintDescriptors({
      modeIndex
    });
    return HintCoordinator.activateMode({
      hintDescriptors: {},
      modeIndex,
      originatingFrameId: frameId
    });
  }
}
export {
  activateLinkHints,
  LinkHints
};