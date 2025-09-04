[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [security](../README.md) / SecurityAuditLogger

# Class: SecurityAuditLogger

Defined in: [security.ts:371](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L371)

Security audit logging service

## Constructors

### Constructor

> **new SecurityAuditLogger**(): `SecurityAuditLogger`

#### Returns

`SecurityAuditLogger`

## Methods

### logEvent()

> `static` **logEvent**(`event`): `void`

Defined in: [security.ts:374](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L374)

#### Parameters

##### event

`Omit`\<[`SecurityEvent`](../interfaces/SecurityEvent.md), `"id"` \| `"timestamp"`\>

#### Returns

`void`

***

### getEvents()

> `static` **getEvents**(`filter?`): [`SecurityEvent`](../interfaces/SecurityEvent.md)[]

Defined in: [security.ts:399](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L399)

#### Parameters

##### filter?

###### type?

`"LOGIN_ATTEMPT"` \| `"LOGIN_SUCCESS"` \| `"LOGIN_FAILURE"` \| `"LOGOUT"` \| `"PASSWORD_CHANGE"` \| `"UNAUTHORIZED_ACCESS"` \| `"SUSPICIOUS_ACTIVITY"` \| `"RATE_LIMIT_EXCEEDED"` \| `"ACCOUNT_LOCKED"` \| `"USER_CREATED"` \| `"USER_CREATION_FAILED"` \| `"PASSWORD_CHANGED"` \| `"USER_UPDATED"` \| `"USER_DELETED"`

###### userId?

`number`

###### risk?

`"LOW"` \| `"MEDIUM"` \| `"HIGH"` \| `"CRITICAL"`

###### since?

`Date`

#### Returns

[`SecurityEvent`](../interfaces/SecurityEvent.md)[]

***

### getSecuritySummary()

> `static` **getSecuritySummary**(): `object`

Defined in: [security.ts:425](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L425)

#### Returns

`object`

##### totalEvents

> **totalEvents**: `number`

##### criticalEvents

> **criticalEvents**: `number`

##### highRiskEvents

> **highRiskEvents**: `number`

##### recentEvents

> **recentEvents**: `number`

##### suspiciousActivity

> **suspiciousActivity**: `number`
