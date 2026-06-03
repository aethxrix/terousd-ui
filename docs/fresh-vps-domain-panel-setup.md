# Fresh VPS, Domain, and Panel Setup

This guide installs Terousd UI on a new VPS, connects your own domain, opens
the web panel safely, and creates VPN accounts from the panel.

Use this only on servers, domains, and networks you own or are allowed to
administer. Do not use third-party bank, telecom, government, or company domains
as fake hosts/SNI values.

## What You Need

- A fresh Ubuntu 22.04/24.04 or Debian 12 VPS with root access.
- A domain you control, for example `example.com`.
- Two DNS names:
  - `panel.example.com` for the Terousd UI web panel.
  - `vps.example.com` for VPN/VLESS/Trojan connections.
- Ports `80` and `443` available on the VPS.

Recommended DNS layout:

```text
panel.example.com -> Cloudflare Tunnel or reverse proxy to the panel
vps.example.com   -> A record to your VPS public IP
```

If you use Cloudflare, keep the VPN hostname `vps.example.com` as DNS only, not
proxied, unless you are intentionally using a Cloudflare-compatible WebSocket
setup. The panel hostname can be proxied or tunneled.

## 1. Point DNS to the VPS

In your DNS provider, create:

```text
Type: A
Name: vps
Value: YOUR_VPS_IP
Proxy: DNS only
```

For the panel, choose one of these:

```text
Recommended:
panel.example.com -> Cloudflare Tunnel to http://127.0.0.1:54321

Simple direct mode:
panel.example.com -> A record to YOUR_VPS_IP
```

Direct mode is easier, but it exposes the panel port to the internet. Tunnel or
reverse proxy mode is safer.

## 2. Log in to the VPS

From your computer:

```bash
ssh root@YOUR_VPS_IP
```

Update the server:

```bash
apt update && apt upgrade -y
apt install -y curl wget sudo ufw ca-certificates dnsutils
```

Enable the firewall:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

If you use direct panel access, also open the panel port:

```bash
ufw allow 54321/tcp
```

If you use Cloudflare Tunnel or a local reverse proxy for the panel, do not open
`54321` publicly.

## 3. Install Terousd UI

Run the official Terousd UI installer from this repository:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/aethxrix/terousd-ui/main/install.sh)
```

After installation, open the management menu:

```bash
x-ui
```

Use the menu to view or change:

- Panel username and password.
- Panel port.
- Panel URI path.
- SSL certificate setup.
- Service restart/update options.

The installer also applies Terousd network tuning for better VPN performance on
new installs.

## 4. Issue a TLS Certificate

You need a real certificate before creating a Trojan TLS inbound or any other
TLS-based inbound.

Make sure `vps.example.com` points to your VPS IP and port `80` is open, then
run:

```bash
x-ui
```

Use the SSL certificate option in the menu and issue a certificate for:

```text
vps.example.com
```

The installer stores certificates under:

```text
/root/cert/vps.example.com/fullchain.pem
/root/cert/vps.example.com/privkey.pem
```

Use those paths later in the inbound TLS certificate fields. If certificate
issuance fails, check DNS first:

```bash
dig +short vps.example.com
ufw status
ss -tulpn | grep ':80'
```

The DNS result must be your VPS IP, and no other service should be blocking the
ACME HTTP challenge on port `80`.

## 5. Secure the Panel

Open the panel URL shown by `x-ui`, then go to:

```text
Panel Settings -> Authentication
```

Change:

- Admin username.
- Admin password.
- Enable two-factor authentication if you can.

Then go to:

```text
Panel Settings -> General
```

Recommended settings:

```text
Listen IP: 127.0.0.1   # if using Cloudflare Tunnel or reverse proxy
Listen Port: 54321
URI Path: /your-random-secret-path/
```

If you use direct panel access, leave `Listen IP` blank or set it to your VPS
public IP, but use a strong password and a random URI path.

Also change the default subscription path:

```text
Panel Settings -> Subscription -> Subscription Path
```

Do not leave it as `/sub/`.

Save changes and restart the panel.

## 6. Optional: Open the Panel With Cloudflare Tunnel

This keeps the panel off the public internet while still letting you open it
with `https://panel.example.com`.

Install `cloudflared`:

```bash
mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
  | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" \
  | tee /etc/apt/sources.list.d/cloudflared.list
apt update
apt install -y cloudflared
```

Log in and create the tunnel:

```bash
cloudflared tunnel login
cloudflared tunnel create terousd-panel
```

Create the tunnel config:

```bash
mkdir -p /etc/cloudflared
nano /etc/cloudflared/config.yml
```

Paste this, replacing the placeholders:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /root/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: panel.example.com
    service: http://127.0.0.1:54321
  - service: http_status:404
```

Create the DNS route and start the tunnel:

```bash
cloudflared tunnel route dns terousd-panel panel.example.com
cloudflared service install
systemctl enable --now cloudflared
systemctl status cloudflared --no-pager
```

Now open:

```text
https://panel.example.com/your-random-secret-path/
```

## 7. Create a VLESS WebSocket Account

In the panel, go to:

```text
Inbounds -> Add Inbound
```

Use this safe starting setup:

```text
Protocol: VLESS
Listen IP: blank
Port: 80
Transmission / Network: WebSocket
Path: /terousd
Host: vps.example.com
Security: None
Sniffing: Enabled
```

Add a client:

```text
Email: customer-name
UUID: generate
Traffic limit: set what you want
IP limit: optional
Expiry: optional
```

Save, then use the QR/link button to export the VLESS link.

Client settings should look like:

```text
Address: vps.example.com
Port: 80
Protocol: VLESS
Transport: WebSocket
Path: /terousd
Host: vps.example.com
TLS: off
```

## 8. Create a Trojan TLS Account

For Trojan over TLS:

```text
Inbounds -> Add Inbound
```

Use:

```text
Protocol: Trojan
Listen IP: blank
Port: 443
Security: TLS
SNI / Server Name: vps.example.com
ALPN: h2, http/1.1
uTLS: chrome
Certificate file: /root/cert/vps.example.com/fullchain.pem
Key file: /root/cert/vps.example.com/privkey.pem
```

Add a client:

```text
Email: customer-name
Password: generate
Traffic limit: set what you want
IP limit: optional
Expiry: optional
```

Save and export the Trojan link or QR code.

Client settings should look like:

```text
Address: vps.example.com
Port: 443
Protocol: Trojan
Security: TLS
SNI: vps.example.com
Allow insecure: false
```

## 9. Check That Everything Is Working

On the VPS:

```bash
systemctl status x-ui --no-pager
ss -tulpn | grep -E ':80|:443|:54321'
journalctl -u x-ui -n 100 --no-pager
```

From your computer:

```bash
curl -I http://vps.example.com
```

For the panel:

```text
https://panel.example.com/your-random-secret-path/
```

If a VPN client connects but IP logs are empty, wait a minute and refresh the
client IP log. The panel records recent client IPs when Xray reports active
connections.

## 10. Common Fixes

Panel does not open:

```bash
systemctl status x-ui --no-pager
ufw status
ss -tulpn | grep 54321
```

VPN connects slowly or times out:

```bash
systemctl restart x-ui
journalctl -u x-ui -n 100 --no-pager
```

Check that:

- `vps.example.com` points to the correct VPS IP.
- Port `80` or `443` is open.
- No other service is using the same port.
- Your client link uses your own domain, not an example domain.
- TLS/SNI matches your real VPN hostname.

Reapply Terousd network tuning:

```bash
x-ui
```

Then use the BBR / speed optimization option in the menu.

## 11. Updating Later

To update the panel:

```bash
x-ui
```

Use the update option, or reinstall from the repo:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/aethxrix/terousd-ui/main/install.sh)
```

Always back up first:

```bash
cp -a /etc/x-ui /etc/x-ui.backup.$(date +%Y%m%d-%H%M%S)
```
