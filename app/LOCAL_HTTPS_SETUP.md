# Local HTTPS Setup for Development

## Why HTTPS in Development?

For security parity with production, all cookies now have `secure: true`, requiring HTTPS even in local development. This ensures:
- ✅ No security bugs hidden by dev/prod differences
- ✅ OAuth flows work identically to production
- ✅ Service workers and other HTTPS-only APIs work locally

## Setup with mkcert (Recommended)

### 1. Install mkcert

**macOS:**
```bash
brew install mkcert
brew install nss  # For Firefox support
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v*-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/

# Other distros: see https://github.com/FiloSottile/mkcert
```

**Windows:**
```bash
choco install mkcert
```

### 2. Create Local CA

```bash
# Install local CA in system trust store
mkcert -install
```

This creates a local Certificate Authority that your browser will trust.

### 3. Generate Certificate for localhost

```bash
cd app

# Generate cert for localhost and local.reqflow.com
mkcert localhost 127.0.0.1 ::1 local.reqflow.com

# Rename for clarity
mv localhost+3.pem localhost.pem
mv localhost+3-key.pem localhost-key.pem
```

### 4. Update Next.js Dev Server

Create `app/server.js`:

```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname}:${port}`);
  });
});
```

### 5. Update package.json

```json
{
  "scripts": {
    "dev": "node server.js",
    "dev:http": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### 6. Update .env.local

```bash
# Change from http to https
NEXT_PUBLIC_APP_URL=https://localhost:3000
AUTH_URL=https://localhost:3000
```

### 7. Start Development Server

```bash
npm run dev
```

Visit **https://localhost:3000** (note the `https://`)

## Troubleshooting

### "Your connection is not private" Warning

If you see this warning:
1. Verify mkcert CA is installed: `mkcert -install`
2. Restart your browser
3. Check cert is valid: `openssl x509 -in localhost.pem -text -noout`

### Port Already in Use

If port 3000 is in use:
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### OAuth Redirects Fail

Update OAuth redirect URIs in provider dashboards:
- QuickBooks: `https://localhost:3000/api/integrations/quickbooks/callback`
- Xero: `https://localhost:3000/api/integrations/xero/callback`

## Alternative: Local Domain with Hosts File

Edit `/etc/hosts`:
```
127.0.0.1  local.reqflow.com
```

Generate cert:
```bash
mkcert local.reqflow.com
```

Update env:
```bash
NEXT_PUBLIC_APP_URL=https://local.reqflow.com:3000
```

Visit **https://local.reqflow.com:3000**

## Security Note

mkcert certificates are:
- ✅ Trusted by your browser (no warnings)
- ✅ Only valid for localhost/127.0.0.1
- ✅ Not valid on other machines
- ✅ Automatically managed by mkcert

**Never commit localhost.pem or localhost-key.pem to git!**

Add to `.gitignore`:
```
localhost*.pem
*.pem
!.yarn/versions
```

## References

- [mkcert documentation](https://github.com/FiloSottile/mkcert)
- [Next.js custom server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [Chrome HTTPS requirements](https://web.dev/when-to-use-local-https/)
