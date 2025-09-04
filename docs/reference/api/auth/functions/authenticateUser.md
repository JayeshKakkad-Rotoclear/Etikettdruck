[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [auth](../README.md) / authenticateUser

# Function: authenticateUser()

> **authenticateUser**(`identifier`, `password`, `ipAddress`, `userAgent`): `Promise`\<\{ `user`: `null` \| [`AuthUser`](../interfaces/AuthUser.md); `rateLimitInfo?`: `any`; `securityAlert?`: `string`; \}\>

Defined in: [auth.ts:160](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/auth.ts#L160)

Authenticate user with enhanced security checks

## Parameters

### identifier

`string`

### password

`string`

### ipAddress

`string`

### userAgent

`string`

## Returns

`Promise`\<\{ `user`: `null` \| [`AuthUser`](../interfaces/AuthUser.md); `rateLimitInfo?`: `any`; `securityAlert?`: `string`; \}\>
