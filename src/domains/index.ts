/**
 * Public barrel for all bounded contexts.
 * UI code should import from this root (or a specific domain's index),
 * never from a domain's internals.
 */
export * as Shared from './_shared';
export * as Country from './country';
export * as ExitKeys from './exit-keys';
export * as Governance from './governance';
export * as Observability from './observability';
export * as Auth from './auth';
