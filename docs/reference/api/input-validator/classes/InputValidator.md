[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [input-validator](../README.md) / InputValidator

# Class: InputValidator

Defined in: [input-validator.ts:9](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L9)

Enhanced input validation and sanitization utilities

## Constructors

### Constructor

> **new InputValidator**(): `InputValidator`

#### Returns

`InputValidator`

## Methods

### validateEmail()

> `static` **validateEmail**(`email`): `object`

Defined in: [input-validator.ts:55](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L55)

Validate email format

#### Parameters

##### email

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### error?

> `optional` **error**: `string`

***

### validateUsername()

> `static` **validateUsername**(`username`): `object`

Defined in: [input-validator.ts:76](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L76)

Validate username format

#### Parameters

##### username

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### error?

> `optional` **error**: `string`

***

### validateText()

> `static` **validateText**(`text`, `options`): `object`

Defined in: [input-validator.ts:111](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L111)

Validate and sanitize general text input

#### Parameters

##### text

`string`

##### options

###### required?

`boolean`

###### minLength?

`number`

###### maxLength?

`number`

###### allowHtml?

`boolean`

###### skipDangerousPatterns?

`boolean`

###### fieldName?

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### sanitized?

> `optional` **sanitized**: `string`

##### error?

> `optional` **error**: `string`

***

### validateSerialNumber()

> `static` **validateSerialNumber**(`serialNumber`): `object`

Defined in: [input-validator.ts:190](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L190)

Validate serial number format

#### Parameters

##### serialNumber

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### error?

> `optional` **error**: `string`

***

### validateArticleNumber()

> `static` **validateArticleNumber**(`articleNumber`): `object`

Defined in: [input-validator.ts:210](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L210)

Validate article number format

#### Parameters

##### articleNumber

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### error?

> `optional` **error**: `string`

***

### validateIpAddress()

> `static` **validateIpAddress**(`ip`): `object`

Defined in: [input-validator.ts:230](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L230)

Validate IP address format

#### Parameters

##### ip

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### error?

> `optional` **error**: `string`

***

### validateMacAddress()

> `static` **validateMacAddress**(`mac`): `object`

Defined in: [input-validator.ts:245](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L245)

Validate MAC address format

#### Parameters

##### mac

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### error?

> `optional` **error**: `string`

***

### validateNumber()

> `static` **validateNumber**(`value`, `options`): `object`

Defined in: [input-validator.ts:260](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L260)

Validate numeric input

#### Parameters

##### value

`any`

##### options

###### required?

`boolean`

###### min?

`number`

###### max?

`number`

###### integer?

`boolean`

###### fieldName?

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### number?

> `optional` **number**: `number`

##### error?

> `optional` **error**: `string`

***

### validateBoolean()

> `static` **validateBoolean**(`value`, `options`): `object`

Defined in: [input-validator.ts:309](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L309)

Validate boolean input

#### Parameters

##### value

`any`

##### options

###### required?

`boolean`

###### fieldName?

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### boolean?

> `optional` **boolean**: `boolean`

##### error?

> `optional` **error**: `string`

***

### validateDate()

> `static` **validateDate**(`value`, `options`): `object`

Defined in: [input-validator.ts:345](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L345)

Validate date input

#### Parameters

##### value

`any`

##### options

###### required?

`boolean`

###### minDate?

`Date`

###### maxDate?

`Date`

###### fieldName?

`string`

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### date?

> `optional` **date**: `Date`

##### error?

> `optional` **error**: `string`

***

### validateObject()

> `static` **validateObject**(`obj`, `schema`): `object`

Defined in: [input-validator.ts:423](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/input-validator.ts#L423)

Validate an object against a schema

#### Parameters

##### obj

`any`

##### schema

`Record`\<`string`, \{ `type`: `"string"` \| `"number"` \| `"boolean"` \| `"date"` \| `"email"` \| `"username"`; `required?`: `boolean`; `minLength?`: `number`; `maxLength?`: `number`; `min?`: `number`; `max?`: `number`; `pattern?`: `RegExp`; `skipDangerousPatterns?`: `boolean`; `custom?`: (`value`) => `object`; \}\>

#### Returns

`object`

##### isValid

> **isValid**: `boolean`

##### errors

> **errors**: `Record`\<`string`, `string`\>

##### sanitized?

> `optional` **sanitized**: `Record`\<`string`, `any`\>
