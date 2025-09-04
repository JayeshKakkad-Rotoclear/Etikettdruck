[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [security](../README.md) / default

# Variable: default

> **default**: `object`

Defined in: [security.ts:457](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L457)

## Type Declaration

### PasswordValidator

> **PasswordValidator**: *typeof* [`PasswordValidator`](../classes/PasswordValidator.md)

### RateLimitService

> **RateLimitService**: *typeof* [`RateLimitService`](../classes/RateLimitService.md)

### SecurityAuditLogger

> **SecurityAuditLogger**: *typeof* [`SecurityAuditLogger`](../classes/SecurityAuditLogger.md)

### RATE\_LIMITS

> **RATE\_LIMITS**: `object`

#### RATE\_LIMITS.LOGIN\_ATTEMPTS

> `readonly` **LOGIN\_ATTEMPTS**: `object`

#### RATE\_LIMITS.LOGIN\_ATTEMPTS.maxAttempts

> `readonly` **maxAttempts**: `5` = `5`

#### RATE\_LIMITS.LOGIN\_ATTEMPTS.windowMinutes

> `readonly` **windowMinutes**: `15` = `15`

#### RATE\_LIMITS.LOGIN\_ATTEMPTS.lockoutMinutes

> `readonly` **lockoutMinutes**: `30` = `30`

#### RATE\_LIMITS.API\_REQUESTS

> `readonly` **API\_REQUESTS**: `object`

#### RATE\_LIMITS.API\_REQUESTS.maxRequests

> `readonly` **maxRequests**: `100` = `100`

#### RATE\_LIMITS.API\_REQUESTS.windowMinutes

> `readonly` **windowMinutes**: `1` = `1`

#### RATE\_LIMITS.PASSWORD\_RESET

> `readonly` **PASSWORD\_RESET**: `object`

#### RATE\_LIMITS.PASSWORD\_RESET.maxAttempts

> `readonly` **maxAttempts**: `3` = `3`

#### RATE\_LIMITS.PASSWORD\_RESET.windowMinutes

> `readonly` **windowMinutes**: `60` = `60`

### SECURITY\_POLICIES

> **SECURITY\_POLICIES**: `object`

#### SECURITY\_POLICIES.PASSWORD

> `readonly` **PASSWORD**: `object`

#### SECURITY\_POLICIES.PASSWORD.minLength

> `readonly` **minLength**: `12` = `12`

#### SECURITY\_POLICIES.PASSWORD.requireUppercase

> `readonly` **requireUppercase**: `true` = `true`

#### SECURITY\_POLICIES.PASSWORD.requireLowercase

> `readonly` **requireLowercase**: `true` = `true`

#### SECURITY\_POLICIES.PASSWORD.requireNumbers

> `readonly` **requireNumbers**: `true` = `true`

#### SECURITY\_POLICIES.PASSWORD.requireSpecialChars

> `readonly` **requireSpecialChars**: `true` = `true`

#### SECURITY\_POLICIES.PASSWORD.preventReuse

> `readonly` **preventReuse**: `5` = `5`

#### SECURITY\_POLICIES.PASSWORD.maxAge

> `readonly` **maxAge**: `90` = `90`

#### SECURITY\_POLICIES.PASSWORD.preventCommonPasswords

> `readonly` **preventCommonPasswords**: `true` = `true`

#### SECURITY\_POLICIES.SESSION

> `readonly` **SESSION**: `object`

#### SECURITY\_POLICIES.SESSION.maxDuration

> `readonly` **maxDuration**: `number`

#### SECURITY\_POLICIES.SESSION.renewalThreshold

> `readonly` **renewalThreshold**: `number`

#### SECURITY\_POLICIES.SESSION.maxConcurrentSessions

> `readonly` **maxConcurrentSessions**: `3` = `3`

#### SECURITY\_POLICIES.SESSION.ipBindingEnabled

> `readonly` **ipBindingEnabled**: `true` = `true`

#### SECURITY\_POLICIES.ACCOUNT

> `readonly` **ACCOUNT**: `object`

#### SECURITY\_POLICIES.ACCOUNT.autoLockAfterDays

> `readonly` **autoLockAfterDays**: `90` = `90`

#### SECURITY\_POLICIES.ACCOUNT.requireEmailVerification

> `readonly` **requireEmailVerification**: `true` = `true`

#### SECURITY\_POLICIES.ACCOUNT.maxLoginAttempts

> `readonly` **maxLoginAttempts**: `5` = `5`

#### SECURITY\_POLICIES.ACCOUNT.lockoutDuration

> `readonly` **lockoutDuration**: `number`
