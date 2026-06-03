# Terousd UI

Terousd UI is a full-featured, Terousd-branded Xray-core web panel: web
administration, client creation and deletion, VLESS, VMess, Trojan,
Shadowsocks, WireGuard, Hysteria, tunnels, subscriptions, QR codes, expiry
dates, traffic limits, multi-node management, Telegram automation, backups,
Xray updates, routing, TLS certificate helpers, Docker support, SQLite, and
PostgreSQL.

The internal service command remains `x-ui` for compatibility with existing
installations, service files, databases, and release archives. The public
product name, panel UI, API documentation, Docker images, repository links,
installer, updater, and web-triggered updates are maintained as Terousd UI.

## Install

Publish a tagged GitHub release before installing. The included release
workflow creates the required `x-ui-linux-*.tar.gz` assets.

```bash
bash <(curl -Ls https://raw.githubusercontent.com/aethxrix/terousd-ui/main/install.sh)
```

After installation, run:

```bash
x-ui
```

The menu shows the panel URL and includes SSL certificate setup. Use the web
panel to create, edit, disable, and delete VLESS or Trojan accounts and export
their links or QR codes.

For a complete fresh VPS, domain, panel, VLESS, and Trojan walkthrough, see
[SETUP.md](./SETUP.md).

## Publish Releases

This repository is maintained directly at `aethxrix/terousd-ui`. After changes
are pushed to `main`, publish a version tag to build release assets:

```bash
git tag <version>
git push origin <version>
```

GitHub Actions builds the release assets. Once the release completes, the
installer and the web panel updater fetch only from:

```text
https://github.com/aethxrix/terousd-ui
```

## Database Options

SQLite remains the default at `/etc/x-ui/x-ui.db`. PostgreSQL can be selected
during installation for larger deployments or multi-node setups.

```bash
x-ui migrate-db --dsn "postgres://xui:password@127.0.0.1:5432/xui?sslmode=disable"
systemctl restart x-ui
```

## Docker

```bash
docker compose up -d
```

The release workflow publishes `ghcr.io/aethxrix/terousd-ui`.

## License And Credit

Terousd UI is maintained and branded by Terousd under GNU GPL v3. Required
license and attribution details are kept in [LICENSE](./LICENSE) and
[NOTICE](./NOTICE).

Maintainer: [aethxrix](https://github.com/aethxrix) (`suyebalam@yahoo.com`).

Use this software only where permitted by applicable law and your hosting
provider's terms.
