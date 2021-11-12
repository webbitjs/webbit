type StringOrFalse = string | false;
type PropertyTypeNames = 'String' | 'Boolean' | 'Number' | 'Array' | 'Object';
type PropertyTypes = string | boolean | number | Array<any> | object;

type TypeWithDefault =
  { type: 'String', defaultValue: string }
  | { type: 'Boolean', defaultValue: boolean }
  | { type: 'Number', defaultValue: number }
  | { type: 'Array', defaultValue: Array<any> }
  | { type: 'Object', defaultValue: object }

type Property = TypeWithDefault & {
  property: string,
  description: string,
  attribute: StringOrFalse,
  reflect: boolean,
  primary: boolean,
  changeEvent: StringOrFalse,
};

type PropertyMap = {
  [propertyName: string]: Partial<Property>
};

type WebbitConfig = {
  description: string,
  defaultSourceKey: StringOrFalse,
  defaultSourceProvider: StringOrFalse,
  properties: PropertyMap,
  events: Array<any>,
  slots: Array<any>,
  cssProperties: Array<any>,
  cssParts: Array<any>,
};

function getDefaultValue(type: PropertyTypeNames): PropertyTypes {
  switch (type) {
    case 'String': return '';
    case 'Boolean': return false;
    case 'Number': return 0;
    case 'Array': return [];
    case 'Object': return {};
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
  changeEvent = false,
}: Partial<Property> = {}): Property => {
  const normalizedDefaultType = defaultValue ?? getDefaultValue(type) as any;
  return {
    property,
    description,
    type,
    defaultValue: normalizedDefaultType,
    attribute,
    reflect: !!reflect,
    primary: !!primary,
    changeEvent,
  };
};


export const normalizeConfig = ({
  description = '',
  defaultSourceKey = false,
  defaultSourceProvider = false,
  properties = {},
  events = [],
  slots = [],
  cssProperties = [],
  cssParts = [],
}: Partial<WebbitConfig> = {}): WebbitConfig => ({
  description,
  defaultSourceKey,
  defaultSourceProvider,
  properties: Object.fromEntries(
    Object.entries(properties)
      .map(([name, property]) => [name, normalizeProperty(name, property)])
  ),
  events,
  slots,
  cssProperties,
  cssParts,
});