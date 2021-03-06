import { camelToKebab } from './util';

const registered = {};
const webbits = {};
const createdListeners = [];
const anyDefinedListeners = [];
let isCloning = false;

function isInstanceOfWebbit(constructor) {
  if (!(constructor instanceof Object)) {
    return false;
  }

  return constructor.__WEBBIT_CLASSNAME__ === 'Webbit';
}

const registry = {
  define: (name, constructor, options) => {
    if (customElements.get(name)) {
      return;
    }

    if (!isInstanceOfWebbit(constructor)) {
      return;
    }

    const webbitProperties = constructor.properties || {};

    for (const propName in webbitProperties) {
      const prop = webbitProperties[propName];
      if (typeof prop.reflect === 'undefined') {
        prop.reflect = true;
      }
      if (typeof prop.attribute === 'undefined') {
        prop.attribute = camelToKebab(propName);
      }

      prop.canConnectToSources = !!(prop.reflect && prop.attribute);

      if (typeof prop.inputType === 'undefined') {
        prop.inputType = prop.type.name;
      }

      if (typeof prop.showInEditor === 'undefined') {
        prop.showInEditor = false;
      }
    }

    Object.defineProperty(constructor, 'properties', {
      get() {
        return {
          name: {
            type: String,
            inputType: 'String',
            attribute: 'name',
            reflect: true,
            showInEditor: true,
            canConnectToSources: true,
          },
          ...webbitProperties,
          sourceProvider: {
            type: String,
            attribute: 'source-provider',
            reflect: true
          },
          sourceKey: {
            type: String,
            attribute: 'source-key',
            reflect: true
          },
          webbitId: {
            type: String,
            attribute: 'webbit-id',
            reflect: true,
          }
        }
      }
    });

    registered[name] = constructor;
    customElements.define(name, constructor, options);
    anyDefinedListeners.forEach(callback => {
      callback(name, constructor);
    });
  },
  addExisting: (name, dashboardConfig) => {

    const properties = dashboardConfig.properties || {};

    for (const propName in properties) {
      const prop = properties[propName];

      if (typeof prop.attribute === 'undefined') {
        prop.attribute = camelToKebab(propName);
      }

      if (typeof prop.inputType === 'undefined') {
        prop.inputType = prop.type.name;
      }

      if (typeof prop.showInEditor === 'undefined') {
        prop.showInEditor = false;
      }

      prop.canConnectToSources = true;
    }

    dashboardConfig.properties = {
      name: {
        type: String,
        inputType: 'String',
        defaultValue: '',
        attribute: 'name',
        showInEditor: true,
        canConnectToSources: true,
      },
      ...properties
    };

    registered[name] = { dashboardConfig };
    anyDefinedListeners.forEach(callback => {
      callback(name, registered[name]);
    });
  },
  whenDefined: (name) => {
    return new Promise((resolve) => {
      customElements.whenDefined(name).then(() => {
        if (name in registered) {
          resolve();
        }
      });
    });
  },
  isInstanceOfWebbit: isInstanceOfWebbit,
  whenAnyDefined: (listener) => {
    if (typeof listener === 'function') {
      anyDefinedListeners.push(listener);
    }
  },
  get: (name) => {
    return registered[name];
  },
  getRegisteredNames: () => {
    return Object.keys(registered);
  },
  getDashboardConfig: (name) => {
    const component = registered[name];
    if (!component) {
      return null;
    }

    const propConfig = { ...component.properties };
    delete propConfig.webbitId;
    delete propConfig.sourceKey;
    delete propConfig.sourceProvider;

    return {
      displayName: name,
      category: 'Uncategorized',
      description: 'Just another web component.',
      documentationLink: null,
      slots: ['default'],
      resizable: { left: true, right: true, bottom: true, top: true },
      minSize: { width: 20, height: 20 },
      movable: true,
      previewable: true,
      layout: 'absolute',
      dashboardHtml: false,
      editorTabs: ['addElements', 'properties', 'sources'],
      properties: propConfig || {},
      ...component.dashboardConfig,
    };
  },
  _generateWebbitId: (webbit, desiredId) => {

    const baseName = desiredId ? desiredId : webbit.nodeName.toLowerCase();

    if (typeof webbits[baseName] === 'undefined') {
      return baseName;
    }
    const webbitCount = Object.keys(webbits).length;
    for (let i = 0; i < webbitCount; i++) {
      const id = `${baseName} #${i + 2}`;
      if (typeof webbits[id] === 'undefined') {
        return id;
      }
    }

    return null;
  },
  _changedWebbitId: (oldWebbitId, newWebbitId, webbit) => {

    if (typeof webbits[oldWebbitId] === 'undefined') {
      throw new Error(`Webbit with ID '${oldWebbitId}' doesn't exist.`)
    }

    if (typeof newWebbitId !== 'string' || newWebbitId.length === 0) {
      throw new Error(`Webbit ID '${newWebbitId}' is not a string of length 1 or more characters`);
    }

    if (newWebbitId in webbits) {
      throw new Error(`Webbit with ID '${newWebbitId}' has already been created.`);
    }

    webbits[newWebbitId] = webbit;
    delete webbits[oldWebbitId];
  },
  _created: (webbitId, webbit) => {

    if (typeof webbitId !== 'string' || webbitId.length === 0) {
      throw new Error(`Webbit ID '${webbitId}' is not a string of length 1 or more characters`);
    }

    if (webbitId in webbits) {
      throw new Error(`Webbit with ID '${webbitId}' has already been created.`);
    }

    webbits[webbitId] = webbit;
    createdListeners.forEach(callback => {
      callback(webbitId, webbit);
    });
  },
  getWebbit: (webbitId) => {
    return webbits[webbitId];
  },
  hasWebbit: (webbitId) => {
    return webbitId in webbits;
  },
  getWebbitIds: () => {
    return Object.keys(webbits);
  },
  whenCreated: (listener) => {
    if (typeof listener === 'function') {
      createdListeners.push(listener);
    }
  },
  setCloning: (cloning) => {
    isCloning = cloning;
  },
  isCloning: () => {
    return isCloning;
  }
};

window.webbitRegistry =
  window.webbitRegistry
  || registry;