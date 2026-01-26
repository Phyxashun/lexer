// ./src/utils/InspectOptions.ts

import { inspect } from 'node:util';
import type { InspectOptions } from 'node:util';

const inspectOptions: InspectOptions = {
    showHidden: false,
    depth: null,
    colors: true,
    customInspect: true,
    showProxy: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 80,
    compact: true,
    sorted: false,
    getters: false,
    numericSeparator: true,
};

export { inspect, inspectOptions };
