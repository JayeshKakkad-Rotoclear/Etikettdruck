[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [auth](../README.md) / createUser

# Function: createUser()

> **createUser**(`userData`, `creatorIpAddress?`, `creatorUserAgent?`): `Promise`\<\{ `success`: `boolean`; `user?`: [`AuthUser`](../interfaces/AuthUser.md); `errors?`: `string`[]; \}\>

Defined in: [auth.ts:459](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/auth.ts#L459)

Create a new user with enhanced security validation

## Parameters

### userData

#### username

`string`

#### email

`string`

#### password

`string`

#### firstName

`string`

#### lastName

`string`

#### role

`UserRole`

#### createdBy?

`string`

#### mustChangePassword?

`boolean`

### creatorIpAddress?

`string`

### creatorUserAgent?

`string`

## Returns

`Promise`\<\{ `success`: `boolean`; `user?`: [`AuthUser`](../interfaces/AuthUser.md); `errors?`: `string`[]; \}\>
