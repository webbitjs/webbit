import Store, { Source, SourceProvider } from '@webbitjs/store';

type PropertyTypeNames = 'String' | 'Boolean' | 'Number' | 'Array' | 'Object' | 'SourceProvider' | 'Store';
type PropertyTypes = (
  string
  | boolean
  | number
  | Array<unknown>
  | Record<string, unknown>
  | undefined
);

type TypeWithDefault =
  { type: 'String', defaultValue?: string }
  | { type: 'Boolean', defaultValue?: boolean }
  | { type: 'Number', defaultValue?: number }
  | { type: 'Array', defaultValue?: Array<unknown> }
  | { type: 'Object', defaultValue?: Record<string, unknown> }
  | { type: 'SourceProvider', defaultValue?: SourceProvider }
  | { type: 'Store', defaultValue?: Store }
  | { type: 'Source', defaultValue?: Source };

export type WebbitProperty = TypeWithDefault & {
  property?: string | null | false,
  description?: string,
  attribute?: string | null | false,
  reflect?: boolean,
  primary?: boolean,
  changeEvent?: string,
  input?: {
    type?: string,
    [option: string]: unknown
  }
};

type PropertyMap = {
  [propertyName: string]: WebbitProperty
};

type Slot = {
  name: string,
  description?: string,
  allowedChildren?: Array<string>,
};

export type WebbitConfig = {
  description: string,
  group: string,
  defaultSourceKey?: string,
  defaultSourceProvider?: string,
  dashboard: {
    topLevel?: boolean,
    displayName?: string | ((element?: HTMLElement) => string),
    defaultHtml?: string,
    onInit?: (element: HTMLElement) => void,
    layout?: {
      type?: string,
      resizable?: {
        vertical: boolean,
        horizontal: boolean,
      },
      movable?: boolean,
      size?: {
        minHeight?: number,
        minWidth?: number,
        maxHeight?: number,
        maxWidth?: number,
      }
    }
  },
  properties: PropertyMap,
  events: Array<Record<string, unknown>>,
  slots: Array<Slot>,
  cssProperties: Array<Record<string, unknown>>,
  cssParts: Array<Record<string, unknown>>,
};

function getDefaultValue(type: string): PropertyTypes {
  switch (type) {
    case 'String': return '';
    case 'Boolean': return false;
    case 'Number': return 0;
    case 'Array': return [];
    case 'SourceProvider': return undefined;
    case 'Store': return undefined;
    case 'Object':
    default:
      return {};
  }
}

const normalizeProperty = (name: string, {
  property = name,
  description = '',
  type = 'String',
  defaultValue,
  attribute = name.toLowerCase(),
  reflect = false,
  primary = false,
  changeEvent,
  ...args
}: Partial<WebbitProperty> = {}): WebbitProperty => {
  const typeString: string = typeof type === 'function' ? (type as () => unknown).name : type;
  const normalizedDefaultType = defaultValue ?? getDefaultValue(typeString) as any;
  return {
    property,
    description,
    type: typeString as PropertyTypeNames,
    defaultValue: normalizedDefaultType,
    attribute,
    reflect: !!reflect,
    primary: !!primary,
    changeEvent,
    ...args,
  };
};

export const normalizeConfig = ({
  description = '',
  group = 'default',
  defaultSourceKey,
  defaultSourceProvider,
  dashboard,
  properties = {},
  events = [],
  slots = [],
  cssProperties = [],
  cssParts = [],
  ...args
}: Partial<WebbitConfig> = {}): WebbitConfig => ({
  description,
  group,
  defaultSourceKey,
  defaultSourceProvider,
  dashboard: {
    topLevel: true,
    ...dashboard,
  },
  properties: Object.fromEntries(
    Object.entries(properties)
      .map(([name, property]) => [name, normalizeProperty(name, property)]),
  ),
  events,
  slots,
  cssProperties,
  cssParts,
  ...args,
});
