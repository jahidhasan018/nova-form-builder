# NovaForm Builder

NovaForm Builder is an enterprise-oriented WordPress plugin for building Gutenberg-powered forms with secure REST submission handling, repository-based persistence, and extensible service architecture.

## What this plugin does

NovaForm Builder lets you add dynamic form blocks in the WordPress block editor and process submissions through a hardened backend pipeline.

At a high level:

1. You insert a NovaForm block in the Gutenberg editor.
2. The block is rendered dynamically on the frontend by PHP.
3. Submissions are sent to the plugin REST endpoint.
4. Payloads are sanitized, validated, and rate-limited.
5. Valid submissions are stored in a custom database table.
6. Optional email and webhook integrations are executed.

---

## Feature list

### Core plugin capabilities

- Dynamic Gutenberg blocks (server-rendered via `render_callback`).
- PSR-4 architecture with strict namespace-based OOP structure.
- Dependency-injection style service wiring using a container.
- REST endpoint for form submission handling.
- Frontend async submission flow (no page reload).
- Custom submissions table (`wp_nova_form_builder_submissions`).
- Admin dashboard settings page for feature toggles.

### Security-focused features

- Nonce verification for REST submissions.
- Sanitization for all incoming submission data.
- Validation rules for required fields and valid email.
- Escaped output for frontend-rendered block markup.
- Transient-based request rate limiting.
- Capability checks for admin settings access.

### Integrations and extensibility

- Admin email notification integration (configurable on/off).
- Webhook integration (configurable on/off + URL).
- Repository interface abstraction for persistence.
- Field and service extension points for custom features.

### Developer tooling included

- Composer autoloading + PHPUnit config.
- PHPCS ruleset scaffold.
- `@wordpress/scripts` setup for block assets.
- Jest, ESLint, and Prettier configuration.
- GitHub Actions deploy workflow for Hostinger.

---

## Installation

### Option A: Manual plugin install

1. Download or clone this repository.
2. Ensure dependencies are installed:
   - `composer install --no-dev --optimize-autoloader`
   - `npm install` (or `npm ci` if lockfile exists)
   - `npm run build`
3. Copy the plugin folder to:
   - `wp-content/plugins/nova-form-builder`
4. Activate **NovaForm Builder** from WordPress Admin → Plugins.

### Option B: CI/CD deploy (Hostinger)

Use the included GitHub Actions workflow:

- `.github/workflows/deploy-hostinger.yml`

Configure required secrets as documented in:

- [`GITHUB_WORKFLOW_SECRETS.md`](GITHUB_WORKFLOW_SECRETS.md)

---

## How to use the plugin

### 1) Configure plugin settings

After activation:

1. Go to **WordPress Admin → NovaForm Builder**.
2. Configure settings:
   - **Enable Webhook Integration**
   - **Webhook URL**
   - **Enable Email Notifications**
3. Click **Save Settings**.

### 2) Add a form block in Gutenberg

1. Edit a page or post in the block editor.
2. Insert the **Nova Contact Form** block.
3. In block sidebar settings (`InspectorControls`), set:
   - Form title
   - Submit button label
4. Publish/update the page.

### 3) Submit and process forms

On the frontend, users submit the rendered form. The plugin:

- Verifies nonce.
- Sanitizes and validates data.
- Applies rate limiting.
- Stores submission data in custom DB table.
- Sends email/webhook notifications based on settings.

---

## Current built-in blocks

- `nova-form-builder/contact-form` (implemented with REST submit + success/error feedback)
- `nova-form-builder/survey` (placeholder)
- `nova-form-builder/multi-step-form` (placeholder)

---

## REST API

Submission endpoint:

- `POST /wp-json/nova-form/v1/submit`

Response behavior:

- `201` on success with `submission_id` and message.
- `422` for validation errors with field error map.
- `403` for nonce/security failure.
- `429` when rate-limited.

---

## Architecture overview

Key architectural building blocks:

- **Bootstrap**: `nova-form-builder.php`
- **Application/Container**: `src/Core/Application.php`, `src/Core/Container.php`
- **Blocks**: `src/Blocks/*`
- **REST**: `src/REST/SubmissionController.php`
- **Repositories**: `src/Repositories/*`
- **Integrations**: `src/Integrations/*`
- **Admin settings**: `src/Admin/SettingsPage.php`

Design patterns used:

- Dependency injection/container pattern.
- Interface-driven contracts.
- Repository abstraction.
- Separation of concerns across domain/services/infrastructure.

---

## Extending NovaForm Builder

### Add a new field type

1. Create a field class extending `NovaFormBuilder\Fields\AbstractField`.
2. Implement the `type()` method.
3. Update rendering/validation rules where needed.

### Add a new integration

1. Create a new service in `src/Integrations`.
2. Inject it through `SubmissionHandler` (and `Application` service wiring).
3. Add settings UI fields if feature toggles are needed.

### Add a new block

1. Create a class extending `src/Blocks/AbstractBlock.php`.
2. Register assets with `block.json` and block editor scripts.
3. Register service in `Application` and hook its `register()` on `init`.

---

## Development commands

### PHP

- `composer install`
- `composer test`
- `composer cs`

### JS

- `npm install`
- `npm run start`
- `npm run build`
- `npm run test:js`
- `npm run lint:js`

---

## Deployment setup

For GitHub Actions SSH deployment setup, see:

- [`GITHUB_WORKFLOW_SECRETS.md`](GITHUB_WORKFLOW_SECRETS.md)
