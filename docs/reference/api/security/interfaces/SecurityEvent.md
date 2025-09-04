[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [security](../README.md) / SecurityEvent

# Interface: SecurityEvent

Defined in: [security.ts:7](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L7)

## Properties

### id

> **id**: `string`

Defined in: [security.ts:8](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L8)

***

### type

> **type**: `"LOGIN_ATTEMPT"` \| `"LOGIN_SUCCESS"` \| `"LOGIN_FAILURE"` \| `"LOGOUT"` \| `"PASSWORD_CHANGE"` \| `"UNAUTHORIZED_ACCESS"` \| `"SUSPICIOUS_ACTIVITY"` \| `"RATE_LIMIT_EXCEEDED"` \| `"ACCOUNT_LOCKED"` \| `"USER_CREATED"` \| `"USER_CREATION_FAILED"` \| `"PASSWORD_CHANGED"` \| `"USER_UPDATED"` \| `"USER_DELETED"`

Defined in: [security.ts:9](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L9)

***

### userId?

> `optional` **userId**: `number`

Defined in: [security.ts:12](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L12)

***

### username?

> `optional` **username**: `string`

Defined in: [security.ts:13](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L13)

***

### ipAddress

> **ipAddress**: `string`

Defined in: [security.ts:14](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L14)

***

### userAgent

> **userAgent**: `string`

Defined in: [security.ts:15](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L15)

***

### timestamp

> **timestamp**: `Date`

Defined in: [security.ts:16](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L16)

***

### details?

> `optional` **details**: `Record`\<`string`, `any`\>

Defined in: [security.ts:17](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L17)

***

### risk

> **risk**: `"LOW"` \| `"MEDIUM"` \| `"HIGH"` \| `"CRITICAL"`

Defined in: [security.ts:18](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L18)
