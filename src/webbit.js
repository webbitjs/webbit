import { LitElement } from 'lit-element';
import isPlainObject from './isplainobject';
import ResizeObserver from 'resize-observer-polyfill';

import { 
  hasSourceProvider,
  getSourceProvider,
  sourceProviderAdded,
  getDefaultSourceProvider,
  defaultSourceProviderSet
} from '@webbitjs/store';

function isSourceObject(value) {
  return (
    value instanceof Object
    && value !== null
    && value.constructor.__WEBBIT_CLASSNAME__ === 'Source'
  );
}

export default class Webbit extends LitElement {

  static get __WEBBIT_CLASSNAME__() {
    return 'Webbit';
  }

  constructor() {
    super();

    for (let name in this.constructor.properties) {
      const property = this.constructor.properties[name];
      if (['sourceProvider', 'sourceKey', 'webbitId'].includes(name)) {
        continue;
      }

      const { type, attribute, reflect, structure } = property;

      if (attribute === false || !reflect) {
        continue;
      }

      Object.defineProperty(this, name, {
        get() {
          const getter = this.constructor.properties[name].get;
          if (typeof getter === 'function') {
            return getter.bind(this)();
          }
          return this[`_${name}`];
        },
        set(value) {
          const setter = this.constructor.properties[name].set;
          const sourceProvider = getSourceProvider(this.sourceProvider);

          if (isPlainObject(value) && value.__fromSource__) {
            const oldValue = this[`_${name}`];
            this[`_${name}`] = typeof setter === 'function' 
              ? setter.bind(this)(value.__value__)
              : value.__value__;
            this.requestUpdate(name, oldValue);
            this._dispatchPropertyChange(name, oldValue, value.__value__);
            return;
          } else if (typeof this.sourceKey === 'string' && sourceProvider) {
            const source = sourceProvider.getRawSource(this.sourceKey);
            if (source) {
              const propSource = source.__sources__[name];

              if (typeof propSource === 'undefined') {
                if (this.constructor.properties[name].primary && source.__fromProvider__) {
                  sourceProvider.userUpdate(this.sourceKey, value);
                  return;
                }
              } else if (propSource.__fromProvider__) {
                sourceProvider.userUpdate(propSource.__key__, value);
                return;
              }
            }
          }

          const oldValue = this[`_${name}`];
          this[`_${name}`] = typeof setter === 'function' 
            ? setter.bind(this)(value)
            : value;
          this.requestUpdate(name, oldValue);
          this._dispatchPropertyChange(name, oldValue, value);
        }
      });
    }

    Object.defineProperty(this, 'sourceProvider', {
      get() {
        return this._sourceProvider || getDefaultSourceProvider();
      },      
      set(value) {
        const oldValue = this._sourceProvider;
        this._sourceProvider = value;
        this.requestUpdate('sourceProvider', oldValue);
        this._dispatchSourceProviderChange();

        if (hasSourceProvider(value)) { 
          this._subscribeToSource();
        }
      }
    });

    Object.defineProperty(this, 'sourceKey', {
      get() {
        return this._sourceKey;
      },
      set(value) {
        const oldValue = this._sourceKey;
        this._sourceKey = value;
        this.requestUpdate('sourceKey', oldValue);
        this._dispatchSourceKeyChange();
        this._subscribeToSource();
      }
    });

    Object.defineProperty(this, 'webbitId', {
      get() {
        return this._webbitId;
      },
      set(value) {
        const oldValue = this._webbitId;

        if (value === oldValue) {
          return;
        }

        const webbitId = window.webbitRegistry._generateWebbitId(this, value);

        if (!window.webbitRegistry.hasWebbit(oldValue)) {
          window.webbitRegistry._created(webbitId, this);
        } else {
          window.webbitRegistry._changedWebbitId(oldValue, webbitId, this);
        }

        this._webbitId = webbitId;
        this.requestUpdate('webbitId', oldValue);

        if (this.getAttribute('webbit-id') !== webbitId) {
          this.setAttribute('webbit-id', webbitId);
        }

        this._dispatchWebbitIdChange();
      }
    });

    this.sourceProvider = null;
    this.sourceKey = null;
    this._source = null;
    this._unsubscribeSource = null;
    this.webbitId = null;

    const resizeObserver = new ResizeObserver(() => {
      this.resized();
    });
    resizeObserver.observe(this);

    sourceProviderAdded(providerName => {
      if (providerName === this.sourceProvider) {
        this._subscribeToSource();
      }
    });

    defaultSourceProviderSet(defaultSourceProvider => {
      if (!this._sourceProvider) {
        this.sourceProvider = defaultSourceProvider;
      }
      this._subscribeToSource();
    });
  }

  _subscribeToSource() {

    if (this._unsubscribeSource) {
      this._unsubscribeSource();
    }

    const sourceProvider = getSourceProvider(this.sourceProvider);

    if (this.sourceKey && sourceProvider) {
      this._unsubscribeSource = sourceProvider.subscribe(this.sourceKey, source => {
        if (typeof source !== 'undefined') {
          this._setPropsFromSource(source);
        }
      }, true);
    }
  }

  _dispatchSourceKeyChange() {
    const event = new CustomEvent('source-key-change', {
      detail: {
        sourceKey: this.sourceKey
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _dispatchPropertyChange(property, oldValue, newValue) {
    const event = new CustomEvent('property-change', {
      detail: {
        property,
        oldValue,
        newValue
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _dispatchSourceProviderChange() {
    const event = new CustomEvent('source-provider-change', {
      detail: {
        sourceProvider: this.sourceProvider
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _dispatchWebbitIdChange() {
    const event = new CustomEvent('source-add', {
      detail: {
        webbitId: this.webbitId
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _setPropsFromSource(source) {

    this._source = source;

    for (let name in this.constructor.properties) {
      const property = this.constructor.properties[name];
      if (['sourceProvider', 'sourceKey', 'webbitId'].includes(name)) {
        continue;
      }

      const { type, attribute, reflect, structure, primary } = property;

      if (attribute === false || !reflect) {
        continue;
      }

      const propSource = source[name];

      if (typeof propSource === 'undefined') {
        if (primary && !isSourceObject(source)) {
          this[name] = {
            __fromSource__: true,
            __value__: source
          }
        }
      } else {
        this[name] = {
          __fromSource__: true,
          __value__: propSource
        }
      }
    };
  }

  
  hasSource() {
    return this.sourceKey !== null && typeof this.sourceKey !== 'undefined';
  }

  getSource() {
    return this.hasSource() ? this._source : undefined;
  }

  resized() {}
}
