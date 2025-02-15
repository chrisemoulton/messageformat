---
title: "asMessageValue"
parent: "messageformat"
grand_parent: API Reference
---

<!-- Do not edit this file. It is automatically generated by API Documenter. -->



# asMessageValue() function

> This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.
> 

Convert any value into a [MessageValue](./messageformat.messagevalue.md) or one of its child classes.

**Signature:**

```typescript
export declare function asMessageValue(ctx: Context, value: unknown, format?: {
    meta?: Readonly<Meta>;
    source?: string;
}): MessageValue;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  ctx | Context |  |
|  value | unknown |  |
|  format | { meta?: Readonly&lt;[Meta](./messageformat.meta.md)<!-- -->&gt;; source?: string; } | _(Optional)_ |

**Returns:**

[MessageValue](./messageformat.messagevalue.md)

