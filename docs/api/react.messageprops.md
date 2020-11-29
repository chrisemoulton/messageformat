---
title: "MessageProps"
parent: "@messageformat/react"
grand_parent: API Reference
---

<!-- Do not edit this file. It is automatically generated by API Documenter. -->



# MessageProps interface


<b>Signature:</b>

```typescript
export interface MessageProps 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [children](./react.messageprops.children.md) | any | If a function, will be called with the found message. In this case, <code>params</code> will be ignored and <code>id</code> is optional. If some other type of non-empty renderable node, it will be used as a fallback value if the message is not found. |
|  [id](./react.messageprops.id.md) | string \| string\[\] | The key or key path of the message. |
|  [locale](./react.messageprops.locale.md) | string \| string\[\] | If set, overrides the <code>locale</code> of the nearest MessageProvider. |
|  [params](./react.messageprops.params.md) | any | Parameters to pass to function messages as their first and only argument. <code>params</code> will override <code>msgParams</code>, to allow for data keys such as <code>key</code> and <code>locale</code>. |
