[**Etikettdrucker API Reference v0.0.1**](../../README.md)

***

[Etikettdrucker API Reference](../../modules.md) / [security](../README.md) / RATE\_LIMITS

# Variable: RATE\_LIMITS

> `const` **RATE\_LIMITS**: `object`

Defined in: [security.ts:30](https://github.com/JayeshKakkad-Rotoclear/Etikettdruck/blob/main/src/lib/security.ts#L30)

## Type Declaration

### LOGIN\_ATTEMPTS

> `readonly` **LOGIN\_ATTEMPTS**: `object`

#### LOGIN\_ATTEMPTS.maxAttempts

> `readonly` **maxAttempts**: `5` = `5`

#### LOGIN\_ATTEMPTS.windowMinutes

> `readonly` **windowMinutes**: `15` = `15`

#### LOGIN\_ATTEMPTS.lockoutMinutes

> `readonly` **lockoutMinutes**: `30` = `30`

### API\_REQUESTS

> `readonly` **API\_REQUESTS**: `object`

#### API\_REQUESTS.maxRequests

> `readonly` **maxRequests**: `100` = `100`

#### API\_REQUESTS.windowMinutes

> `readonly` **windowMinutes**: `1` = `1`

### PASSWORD\_RESET

> `readonly` **PASSWORD\_RESET**: `object`

#### PASSWORD\_RESET.maxAttempts

> `readonly` **maxAttempts**: `3` = `3`

#### PASSWORD\_RESET.windowMinutes

> `readonly` **windowMinutes**: `60` = `60`
