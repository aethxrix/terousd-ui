# Terousd UI

Terousd UI is a full-featured, Terousd-branded Xray-core web panel. It preserves
the complete feature set of the upstream 3x-ui project: web administration,
client creation and deletion, VLESS, VMess, Trojan, Shadowsocks, WireGuard,
Hysteria, tunnels, subscriptions, QR codes, expiry dates, traffic limits,
multi-node management, Telegram automation, backups, Xray updates, routing,
TLS certificate helpers, Docker support, SQLite, and PostgreSQL.

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

## Publish Your Fork

Create a GitHub repository named `terousd-ui` under the `aethxrix` account, push
this source tree, then publish a version tag:

```bash
git remote set-url origin https://github.com/aethxrix/terousd-ui.git
git push -u origin main
git tag v3.2.3
git push origin v3.2.3
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

Terousd UI is maintained and branded by Terousd. It is a derivative work based
on [MHSanaei/3x-ui](https://github.com/MHSanaei/3x-ui) and remains licensed
under GNU GPL v3. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

Maintainer: [aethxrix](https://github.com/aethxrix) (`suyebalam@yahoo.com`).

Use this software only where permitted by applicable law and your hosting
provider's terms.
