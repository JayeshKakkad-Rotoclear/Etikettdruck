[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [security](../README.md) / RateLimitService

# Class: RateLimitService

Defined in: [security.ts:237](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L237)

Rate limiting service to prevent abuse

## Constructors

### Constructor

> **new RateLimitService**(): `RateLimitService`

#### Returns

`RateLimitService`

## Methods

### isLoginAllowed()

> `static` **isLoginAllowed**(`identifier`, `ipAddress`): `object`

Defined in: [security.ts:244](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L244)

Check if login attempt is allowed

#### Parameters

##### identifier

`string`

##### ipAddress

`string`

#### Returns

`object`

##### allowed

> **allowed**: `boolean`

##### remainingAttempts?

> `optional` **remainingAttempts**: `number`

##### lockedUntil?

> `optional` **lockedUntil**: `Date`

##### reason?

> `optional` **reason**: `string`

***

### recordFailedLogin()

> `static` **recordFailedLogin**(`identifier`, `ipAddress`): `void`

Defined in: [security.ts:297](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L297)

Record a failed login attempt

#### Parameters

##### identifier

`string`

##### ipAddress

`string`

#### Returns

`void`

***

### recordSuccessfulLogin()

> `static` **recordSuccessfulLogin**(`identifier`, `ipAddress`): `void`

Defined in: [security.ts:314](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L314)

Record a successful login (clear failed attempts)

#### Parameters

##### identifier

`string`

##### ipAddress

`string`

#### Returns

`void`

***

### isApiRequestAllowed()

> `static` **isApiRequestAllowed**(`ipAddress`): `object`

Defined in: [security.ts:322](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L322)

Check API rate limit

#### Parameters

##### ipAddress

`string`

#### Returns

`object`

##### allowed

> **allowed**: `boolean`

##### resetTime?

> `optional` **resetTime**: `number`

***

### cleanup()

> `static` **cleanup**(): `void`

Defined in: [security.ts:346](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L346)

Clean up expired entries

#### Returns

`void`
