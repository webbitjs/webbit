import * as PubSub from 'pubsub-js';
import { isEqual, getValueType } from './util';
import {
  attr2PropValue,
  prop2AttrValue,
  prop2PropValue,
} from './value-converters/convert-to-type';
import { WebbitProperty } from './element-config';

class PropertyHandler {
  static UNIQUE_ID = 0;
  readonly #element: HTMLElement;
  readonly #property: WebbitProperty;
  #connected = false;
  #storedValue: unknown;
  readonly #PROPERTY_CHANGE_TOPIC;

  get value(): unknown {
    const {
      reflect, attribute, property, type,
    } = this.#property;

    if (typeof property === 'string' && property in this.#element) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (this.#element as any)[property];
    } if (attribute && reflect) {
      return attr2PropValue(this.#element.getAttribute(attribute), type);
    }
    return attr2PropValue(attribute ? this.#element.getAttribute(attribute) : null, type);
  }

  set value(value: unknown) {
    const { attribute, property, type } = this.#property;
    const newValueType = getValueType(value);
    const currentValue = this.value;

    if (value === null || typeof value === 'undefined') {
      if (value === currentValue) {
        return;
      }
    } else if (isEqual(prop2PropValue(currentValue, newValueType), value)) {
      return;
    }

    if (property) {
      const newPropValue = prop2PropValue(value, type);
      const newPropBackToValue = prop2PropValue(newPropValue, newValueType);
      if (isEqual(value, newPropBackToValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.#element as any)[property] = newPropValue;
      }
    } else if (attribute) {
      const newAttrValue = prop2AttrValue(value, type);
      const newAttrBackToValue = attr2PropValue(newAttrValue, newValueType);

      if (isEqual(value, newAttrBackToValue)) {
        if (newAttrValue === null) {
          this.#element.removeAttribute(attribute);
        } else {
          this.#element.setAttribute(attribute, newAttrValue);
        }
      }
    }
  }

  constructor(element: HTMLElement, property: WebbitProperty) {
    PropertyHandler.UNIQUE_ID += 1;
    this.#PROPERTY_CHANGE_TOPIC = Symbol(`WEBBIT_PROPERTY_CHANGE_${PropertyHandler.UNIQUE_ID}`);
    this.#element = element;
    this.#property = property;
    this.#connected = false;
    this.#storedValue = this.value;
    this.#getPropertyObserver();
  }

  #getPropertyObserver(): void {
    const { changeEvent, attribute } = this.#property;

    if (changeEvent) {
      const listener = () => {
        this.#notifySubscribers();
      };
      this.#element.addEventListener(changeEvent, listener, false);
    } else if (attribute) {
      const observer = new MutationObserver(() => {
        this.#notifySubscribers();
      });
      observer.observe(this.#element, {
        attributes: true,
        attributeFilter: [attribute],
      });
    }
  }

  isAttribute(): boolean {
    return typeof this.#property.attribute === 'string';
  }

  getStoredAttribute(): string | null {
    const { type } = this.#property;
    return prop2AttrValue(this.#storedValue, type);
  }

  connect(): void {
    if (!this.#connected) {
      const currentValue = this.value;
      this.#storedValue = typeof currentValue !== 'undefined'
        ? currentValue
        : this.#property.defaultValue;
      this.#connected = true;
    }
  }

  disconnect(): void {
    if (this.#connected) {
      this.#connected = false;
      this.#setToStored();
    }
  }

  isConnected(): boolean {
    return this.#connected;
  }

  update(value: unknown): void {
    this.connect();
    this.value = value;
  }

  subscribe(callback: (value: unknown) => void, listenWhenDisconnected = false): void {
    PubSub.subscribe(this.#PROPERTY_CHANGE_TOPIC, (msg, value) => {
      if (this.#connected || listenWhenDisconnected) {
        callback(value);
      }
    });
  }

  getProperty(): WebbitProperty {
    return this.#property;
  }

  setStoredValue(value: unknown): void {
    this.#storedValue = value;
    if (!this.isConnected()) {
      this.#setToStored();
    }
  }

  getStoredValue(): unknown {
    return this.#storedValue;
  }

  #notifySubscribers(): void {
    const { value } = this;
    if (!this.isConnected()) {
      this.#storedValue = value;
    }
    PubSub.publish(this.#PROPERTY_CHANGE_TOPIC, value);
  }

  #setToStored(): void {
    this.value = this.#storedValue;
  }
}

export default PropertyHandler;