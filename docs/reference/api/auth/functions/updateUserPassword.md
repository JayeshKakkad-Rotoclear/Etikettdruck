[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [auth](../README.md) / updateUserPassword

# Function: updateUserPassword()

> **updateUserPassword**(`userId`, `newPassword`, `updatedBy`, `ipAddress?`, `userAgent?`): `Promise`\<\{ `success`: `boolean`; `errors?`: `string`[]; \}\>

Defined in: [auth.ts:602](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/auth.ts#L602)

Update user password with security validation

## Parameters

### userId

`number`

### newPassword

`string`

### updatedBy

`string`

### ipAddress?

`string`

### userAgent?

`string`

## Returns

`Promise`\<\{ `success`: `boolean`; `errors?`: `string`[]; \}\>
