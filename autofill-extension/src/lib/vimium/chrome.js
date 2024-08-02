//
// Mock the Chrome extension API.
//

let chromeMessages = [];

document.hasFocus = () => true;

let forTrusted = (handler) => handler;

const fakeManifest = {
  version: "1.51"
};

let chrome = {
  runtime: {
    connect() {
      return {
        onMessage: {
          addListener() {}
        },
        onDisconnect: {
          addListener() {}
        },
        postMessage() {}
      };
    },
    onMessage: {
      addListener() {}
    },
    sendMessage(message) {
      return chromeMessages.unshift(message);
    },
    getManifest() {
      return fakeManifest;
    },
    getURL(url) {
      return `../../${url}`;
    }
  },
  storage: {
    local: {
      get() {},
      set() {}
    },
    sync: {
      get(_, callback) {
        return callback ? callback({}) : null;
      },
      set() {}
    },
    onChanged: {
      addListener() {}
    }
  },
  extension: {
    inIncognitoContext: false,
    getURL(url) {
      return chrome.runtime.getURL(url);
    }
  }
};

export { chrome, forTrusted, chromeMessages };
