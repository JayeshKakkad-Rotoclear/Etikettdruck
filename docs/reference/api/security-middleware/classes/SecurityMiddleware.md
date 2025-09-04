[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [security-middleware](../README.md) / SecurityMiddleware

# Class: SecurityMiddleware

Defined in: [security-middleware.ts:21](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security-middleware.ts#L21)

Enhanced authentication middleware with comprehensive security checks

## Constructors

### Constructor

> **new SecurityMiddleware**(): `SecurityMiddleware`

#### Returns

`SecurityMiddleware`

## Methods

### requireAuth()

> `static` **requireAuth**(`event`): `Promise`\<[`SecurityContext`](../interfaces/SecurityContext.md)\>

Defined in: [security-middleware.ts:25](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security-middleware.ts#L25)

Require authentication for API routes

#### Parameters

##### event

`RequestEvent`

#### Returns

`Promise`\<[`SecurityContext`](../interfaces/SecurityContext.md)\>

***

### requireRole()

> `static` **requireRole**(`event`, `requiredRole`): `Promise`\<[`SecurityContext`](../interfaces/SecurityContext.md)\>

Defined in: [security-middleware.ts:167](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security-middleware.ts#L167)

Require specific role for API access

#### Parameters

##### event

`RequestEvent`

##### requiredRole

`UserRole`

#### Returns

`Promise`\<[`SecurityContext`](../interfaces/SecurityContext.md)\>

***

### validateCSRF()

> `static` **validateCSRF**(`event`, `context`): `void`

Defined in: [security-middleware.ts:213](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security-middleware.ts#L213)

Validate CSRF token for state-changing operations

#### Parameters

##### event

`RequestEvent`

##### context

[`SecurityContext`](../interfaces/SecurityContext.md)

#### Returns

`void`

***

### validateRequest()

> `static` **validateRequest**(`event`): `Promise`\<`any`\>

Defined in: [security-middleware.ts:254](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security-middleware.ts#L254)

Validate request content and structure

#### Parameters

##### event

`RequestEvent`

#### Returns

`Promise`\<`any`\>

***

### addSecurityHeaders()

> `static` **addSecurityHeaders**(`response`): `Response`

Defined in: [security-middleware.ts:333](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security-middleware.ts#L333)

Add security headers to response

#### Parameters

##### response

`Response`

#### Returns

`Response`

***

### secureEndpoint()

> `static` **secureEndpoint**(`event`, `options`): `Promise`\<\{ `context?`: [`SecurityContext`](../interfaces/SecurityContext.md); `body?`: `any`; \}\>

Defined in: [security-middleware.ts:366](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security-middleware.ts#L366)

Complete security check for API endpoints

#### Parameters

##### event

`RequestEvent`

##### options

###### requireAuth?

`boolean`

###### requiredRole?

`UserRole`

###### validateCSRF?

`boolean`

###### validateInput?

`boolean`

#### Returns

`Promise`\<\{ `context?`: [`SecurityContext`](../interfaces/SecurityContext.md); `body?`: `any`; \}\>
