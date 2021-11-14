import Store from '@webbitjs/store';
import { normalizeConfig, WebbitConfig } from './element-config';
import Webbit from './webbit';
import { getWebbitIterator, filterNode } from './filter';

class WebbitConnector {
  readonly #store: Store;
  readonly #elementConfigs = new Map<string, WebbitConfig>();
  readonly #elements = new Map<HTMLElement, Webbit>();
  readonly #rootElement: HTMLElement;

  constructor(
    rootElement: HTMLElement,
    store: Store,
    elementConfigs: Partial<WebbitConfig>[] = [],
  ) {
    this.#store = store;
    Object.entries(elementConfigs).forEach(([selector, config]) => {
      this.#elementConfigs.set(selector, normalizeConfig(config));
    });
    this.#store.defaultSourceProviderSet((sourceProvider: string) => {
      this.#elements.forEach((elementObject, element) => {
        if (elementObject.sourceProvider === null) {
          this.setSourceProvider(element, sourceProvider);
        }
      });
    });
    this.#rootElement = rootElement;
    this.#connectChildren();
  }

  #connect(element: HTMLElement): void {
    const elementConfig = this.getMatchingElementConfig(element);
    if (this.hasElement(element) || !elementConfig) {
      return;
    }
    const webbit = new Webbit(element, this.#store, elementConfig);
    this.#elements.set(element, webbit);
  }

  #disconnect(element: HTMLElement): void {
    const elementWebbit = this.getElementWebbit(element);
    if (elementWebbit) {
      elementWebbit.disconnect();
      this.#elements.delete(element);
    }
  }

  #connectIterator(element: HTMLElement): void {
    const iterator = this.#getWebbitIterator(element);
    while (iterator.nextNode()) {
      this.#connect(iterator.referenceNode as HTMLElement);
    }
  }

  #connectChildren(): void {
    this.#connectIterator(this.#rootElement);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          const addedNodes = mutation.addedNodes || [];
          const removedNodes = mutation.removedNodes || [];
          addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              if (this.#isWebbit(node)) {
                this.#connect(node);
              }
              this.#connectIterator(node as HTMLElement);
            }
          });
          removedNodes.forEach(node => {
            this.#disconnect(node as HTMLElement);
            [...this.#elements.keys()].forEach(element => {
              if (node.contains(element)) {
                this.#disconnect(element);
              }
            });
          });
        } else if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          if (this.#isWebbit(mutation.target)) {
            this.#connect(mutation.target);
          }
        }
      });
    });

    observer.observe(this.#rootElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['source-key', 'source-provider'],
    });
  }

  #getWebbitIterator(element: HTMLElement): NodeIterator {
    return getWebbitIterator(
      element,
      this.getStore().getDefaultSourceProvider(),
      this.#elementConfigs,
    );
  }

  #isWebbit(element: HTMLElement): boolean {
    const filterValue = filterNode(
      element,
      this.#store.getDefaultSourceProvider(),
      this.#elementConfigs,
    );
    return filterValue === NodeFilter.FILTER_ACCEPT;
  }

  getMatchingElementConfig(element: HTMLElement): WebbitConfig | undefined {
    const entry = [...this.#elementConfigs.entries()]
      .find(([selector]) => element.matches(selector));
    return entry?.[1] ?? undefined;
  }

  getElementConfig(selector: string): WebbitConfig | undefined {
    return this.#elementConfigs.get(selector);
  }

  hasElementConfig(selector: string): boolean {
    return this.#elementConfigs.has(selector);
  }

  setDefaultPropertyValue(element: HTMLElement, property: string, value: unknown): void {
    const webbit = this.getElementWebbit(element);

    if (webbit) {
      webbit.defaultPropertyValues[property] = value;
    }
  }

  setSourceProvider(element: HTMLElement, sourceProvider: string): void {
    const webbit = this.getElementWebbit(element);

    if (webbit) {
      webbit.sourceProvider = sourceProvider;
    }
  }

  setSourceKey(element: HTMLElement, sourceKey: string): void {
    const webbit = this.getElementWebbit(element);

    if (webbit) {
      webbit.sourceKey = sourceKey;
    }
  }

  getDefaultPropertyValue(element: HTMLElement, property: string): unknown {
    const webbit = this.getElementWebbit(element);
    return webbit
      ? webbit.defaultPropertyValues[property]
      : undefined;
  }

  getDefaultPropertyValues(element: HTMLElement): Record<string, unknown> {
    const webbit = this.getElementWebbit(element);
    return webbit ? webbit.defaultPropertyValues : {};
  }

  getSourceProvider(element: HTMLElement): string | undefined {
    const webbit = this.getElementWebbit(element);
    return webbit ? webbit.sourceProvider : this.#store.getDefaultSourceProvider();
  }

  getSourceKey(element: HTMLElement): string | undefined {
    const webbit = this.getElementWebbit(element);
    return webbit ? webbit.sourceKey : undefined;
  }

  getElementWebbit(element: HTMLElement): Webbit | undefined {
    return this.#elements.get(element);
  }

  hasElement(element: HTMLElement): boolean {
    return this.#elements.has(element);
  }

  getStore(): Store {
    return this.#store;
  }
}

export default WebbitConnector;