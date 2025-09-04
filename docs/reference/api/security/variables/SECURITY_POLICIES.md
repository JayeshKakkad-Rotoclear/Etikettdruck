[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [security](../README.md) / SECURITY\_POLICIES

# Variable: SECURITY\_POLICIES

> `const` **SECURITY\_POLICIES**: `object`

Defined in: [security.ts:47](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L47)

## Type Declaration

### PASSWORD

> `readonly` **PASSWORD**: `object`

#### PASSWORD.minLength

> `readonly` **minLength**: `12` = `12`

#### PASSWORD.requireUppercase

> `readonly` **requireUppercase**: `true` = `true`

#### PASSWORD.requireLowercase

> `readonly` **requireLowercase**: `true` = `true`

#### PASSWORD.requireNumbers

> `readonly` **requireNumbers**: `true` = `true`

#### PASSWORD.requireSpecialChars

> `readonly` **requireSpecialChars**: `true` = `true`

#### PASSWORD.preventReuse

> `readonly` **preventReuse**: `5` = `5`

#### PASSWORD.maxAge

> `readonly` **maxAge**: `90` = `90`

#### PASSWORD.preventCommonPasswords

> `readonly` **preventCommonPasswords**: `true` = `true`

### SESSION

> `readonly` **SESSION**: `object`

#### SESSION.maxDuration

> `readonly` **maxDuration**: `number`

#### SESSION.renewalThreshold

> `readonly` **renewalThreshold**: `number`

#### SESSION.maxConcurrentSessions

> `readonly` **maxConcurrentSessions**: `3` = `3`

#### SESSION.ipBindingEnabled

> `readonly` **ipBindingEnabled**: `true` = `true`

### ACCOUNT

> `readonly` **ACCOUNT**: `object`

#### ACCOUNT.autoLockAfterDays

> `readonly` **autoLockAfterDays**: `90` = `90`

#### ACCOUNT.requireEmailVerification

> `readonly` **requireEmailVerification**: `true` = `true`

#### ACCOUNT.maxLoginAttempts

> `readonly` **maxLoginAttempts**: `5` = `5`

#### ACCOUNT.lockoutDuration

> `readonly` **lockoutDuration**: `number`
