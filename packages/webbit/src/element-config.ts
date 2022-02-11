type PropertyTypeNames = 'String' | 'Boolean' | 'Number' | 'Array' | 'Object';
type PropertyTypes = string | boolean | number | Array<any> | Record<string, unknown>;

type TypeWithDefault =
  { type: 'String', defaultValue: string }
  | { type: 'Boolean', defaultValue: boolean }
  | { type: 'Number', defaultValue: number }
  | { type: 'Array', defaultValue: Array<any> }
  | { type: 'Object', defaultValue: Record<string, unknown> }

export type WebbitProperty = TypeWithDefault & {
  property: string,
  description: string,
  attribute?: string,
  reflect: boolean,
  primary: boolean,
  changeEvent?: string,
};

type PropertyMap = {
  [propertyName: string]: WebbitProperty
};

type Slot = {
  name: string,
  description?: string
};

export type WebbitConfig = {
  description: string,
  defaultSourceKey?: string,
  defaultSourceProvider?: string,
  topLevel: boolean,
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
  defaultSourceKey,
  defaultSourceProvider,
  topLevel = true,
  properties = {},
  events = [],
  slots = [],
  cssProperties = [],
  cssParts = [],
  ...args
}: Partial<WebbitConfig> = {}): WebbitConfig => ({
  description,
  defaultSourceKey,
  defaultSourceProvider,
  topLevel,
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