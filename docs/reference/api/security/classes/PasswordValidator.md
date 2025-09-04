[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [security](../README.md) / PasswordValidator

# Class: PasswordValidator

Defined in: [security.ts:75](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L75)

Enhanced password validation with comprehensive security checks

## Constructors

### Constructor

> **new PasswordValidator**(): `PasswordValidator`

#### Returns

`PasswordValidator`

## Methods

### validatePassword()

> `static` **validatePassword**(`password`, `username?`): `object`

Defined in: [security.ts:83](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L83)

#### Parameters

##### password

`string`

##### username?

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### errors

> **errors**: `string`[]

##### strength

> **strength**: `"WEAK"` \| `"FAIR"` \| `"GOOD"` \| `"STRONG"` \| `"VERY_STRONG"`

***

### generateSecurePassword()

> `static` **generateSecurePassword**(`length`): `string`

Defined in: [security.ts:204](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L204)

Generate a secure password meeting all requirements

#### Parameters

##### length

`number` = `16`

#### Returns

`string`
