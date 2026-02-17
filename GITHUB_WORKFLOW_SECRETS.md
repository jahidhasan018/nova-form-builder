# GitHub Secrets Setup for Hostinger Deployment

This guide explains how to configure the required GitHub Actions secrets used by:

- `.github/workflows/deploy-hostinger.yml`

After these are set, pushes to `main` (or manual workflow dispatch) can deploy the plugin to your Hostinger WordPress site.

---

## 1) Open repository secrets

In your GitHub repository:

1. Go to **Settings**.
2. Go to **Secrets and variables** → **Actions**.
3. Click **New repository secret**.

Add each secret listed below.

---

## 2) Required secrets

### `HOSTINGER_HOST`
- SSH host/IP of your Hostinger server.
- Example: `srv123.hostinger.com` or `203.0.113.10`.

### `HOSTINGER_USER`
- SSH username used to log in.
- Example: `u123456789`.

### `HOSTINGER_SSH_KEY`
- Private SSH key contents (full text, including header/footer).
- Must match a public key installed on the Hostinger account.
- Format:
  - `-----BEGIN OPENSSH PRIVATE KEY-----`
  - `...`
  - `-----END OPENSSH PRIVATE KEY-----`

### `HOSTINGER_PORT`
- SSH port.
- Usually `22` unless you use a custom SSH port.


### `DEPLOY_GITHUB_TOKEN` (optional, recommended)
- GitHub Personal Access Token used for Composer/git fallback when dependencies are downloaded from GitHub and anonymous access is blocked/rate-limited.
- Use a fine-grained token with read access to required repositories/packages.

### `HOSTINGER_PLUGIN_PATH`
- Final plugin target directory under WordPress plugins.
- Example:
  - `/home/username/public_html/wp-content/plugins/nova-form-builder`

> This path should point to the plugin folder *inside* `wp-content/plugins`.

> `HOSTINGER_TEMP_PATH` is no longer required. Deployment now uploads directly to your plugin folder after clearing existing files in that folder.

---

## 3) SSH key pairing on Hostinger

1. Generate key locally (if you do not already have one):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy"
   ```
2. Add the **public key** (`.pub`) to Hostinger SSH authorized keys.
3. Copy the **private key** into GitHub secret `HOSTINGER_SSH_KEY`.

---

## 4) Recommended verification checklist

Before first deploy, verify:

- SSH login works with the same key/user/host/port.
- `HOSTINGER_PLUGIN_PATH` exists or can be created by SSH user.
- SSH user has write permissions for the plugin directory.
- WordPress plugin folder name matches your expected deployment target.

---

## 5) Trigger deployment

You can deploy by:

- Pushing to `main`, or
- Running **Actions → Build and Deploy Plugin (Hostinger) → Run workflow**.

---

## 6) Notes on package install skipping

The workflow checks these files for changes:

- `package.json`
- `package-lock.json`
- `yarn.lock`
- `pnpm-lock.yaml`

If none changed, `npm ci` is skipped.

Composer install still runs (`composer install --no-dev --optimize-autoloader`) so PHP dependencies are always prepared for deployment.

## 7) Troubleshooting common workflow errors

### Error: `Dependencies lock file is not found ...`
- Cause: `actions/setup-node` cache mode was enabled without a lock file.
- Fix in this repo: workflow now auto-detects lock files and disables cache when none exist.

### Error: `could not read Username for https://github.com`
- Cause: a dependency fetch attempted GitHub auth in a non-interactive runner.
- Fix: add optional `DEPLOY_GITHUB_TOKEN` secret and workflow will configure Composer GitHub OAuth automatically.

### Error: `expected flush after ref listing`
- Usually appears during failed remote git fetch/auth handshake.
- Most often resolved by ensuring valid auth token/SSH permissions and stable dependency source URLs.

