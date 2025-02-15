# @messageformat/fluent

This library provides conversion and compatibility tools for using [Fluent] resources
with the [Unicode MessageFormat 2.0] -based [ECMA-402 Intl.MessageFormat proposal].

The Fluent message representation relies on [`@fluent/syntax`],
while the MessageFormat 2 representation uses [`messageformat@next`].

[fluent]: https://projectfluent.org/
[ecma-402 intl.messageformat proposal]: https://github.com/tc39/proposal-intl-messageformat
[unicode messageformat 2.0]: https://github.com/unicode-org/message-format-wg
[`@fluent/syntax`]: https://www.npmjs.com/package/@fluent/syntax
[`messageformat@next`]: https://www.npmjs.com/package/messageformat/v/next

## Usage

```sh
npm install @messageformat/fluent
```

```js
import { fluentToResource } from '@messageformat/fluent';

const locale = 'en-US';
const src = 'msg = Today is {DATETIME($today, dateStyle: "medium")}\n';

const resource = fluentToResource(src, locale);

const msg = resource.get('msg').get('');
const res = msg.resolveMessage({ today: new Date('2022-02-02') });
// ResolvedMessage {
//   type: 'message',
//   value: [
//     MessageLiteral { type: 'literal', value: 'Today is ' },
//     MessageDateTime {
//       type: 'datetime',
//       value: 2022-02-02T00:00:00.000Z,
//       options: { localeMatcher: 'best fit', dateStyle: 'medium' },
//       source: '$today :DATETIME'
//     }
//   ]
// }

res.toString();
// 'Today is Feb 2, 2022'
```

## API

```js
import {
  fluentToMessage,
  fluentToResource,
  fluentToResourceData,
  getFluentRuntime,
  messageToFluent,
  resourceToFluent
} from '@messageformat/fluent';

import type {
  FluentMessageResource,
  FluentMessageResourceData
} from '@messageformat/fluent';
```

For more information, see the [API documentation site](http://messageformat.github.io/messageformat/api/fluent/).
