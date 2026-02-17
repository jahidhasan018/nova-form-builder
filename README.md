# NovaForm Builder

Enterprise Gutenberg forms plugin architecture.

## Architecture Decisions

- **Container + DI**: `Core\Container` resolves infrastructure/services lazily to keep hooks thin.
- **Interface-driven repositories**: `SubmissionRepositoryInterface` isolates persistence and enables mock-first tests.
- **Dynamic blocks**: PHP `render_callback` is used for secure server-side output and versioned block assets.
- **REST submissions**: `REST\SubmissionController` centralizes sanitization, nonce checks, validation, persistence, and integrations.
- **Admin dashboard**: `Admin\SettingsPage` registers a first-party plugin dashboard under wp-admin for feature flags and integration settings.
- **Extension points**:
  - New field types: extend `Fields\AbstractField` and update `Services\FormRenderer`/validator mapping.
  - New integrations: create service in `src/Integrations` and inject through `SubmissionHandler`.

## Security Notes

- Nonce validation for REST endpoint.
- Full payload sanitization before validation and persistence.
- Escaping in dynamic rendering output.
- Prepared statement usage in repository.
- Transient-based rate limiter to reduce abuse.
- Admin settings use capability checks and strict sanitization callbacks.
