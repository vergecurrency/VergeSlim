import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const docsDir = path.join(rootDir, 'docs')
const docsAssetsDir = path.join(docsDir, 'assets')
const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
const displayVersion = pkg.version.replace(/\.0$/, '')

const features = [
  {
    title: 'Tor Built In',
    description: 'Tor has been directly integrated into Verge Slim. No worries about your privacy.'
  },
  {
    title: 'Multiple Wallets',
    description: 'Easily create and manage multiple wallets inside just one useful app.'
  },
  {
    title: 'Super Fast',
    description: 'Sending and receiving transactions is super fast and super easy.'
  },
  {
    title: 'Import & Export',
    description: 'Easily import and export your wallets into Verge Slim for some extra comfort.'
  },
  {
    title: 'Multiple Languages',
    description: 'Verge Slim supports many different languages translated by community users.'
  },
  {
    title: 'Familiar World Currencies',
    description: 'Display in familiar world currencies like EUR or CAD while transacting with XVG.'
  },
  {
    title: 'Windows, macOS and Linux',
    description: 'Install Verge Slim on Windows, macOS or Linux with the same privacy-first experience.'
  },
  {
    title: 'Very Small',
    description: 'No blockchain needs to be downloaded, so no syncing, no waiting, only a small app.'
  }
]

const ensureDir = target => {
  mkdirSync(target, { recursive: true })
}

const copyIfExists = (source, destination) => {
  if (!existsSync(source)) {
    return
  }

  ensureDir(path.dirname(destination))
  cpSync(source, destination, { recursive: true })
}

const buildHtml = () => {
  const githubUrl = pkg.repository.url.replace(/\.git$/, '')
  const sponsorUrl = pkg.funding.find(item => item.type === 'github')?.url || githubUrl
  const xvgAddress = pkg.funding.find(item => item.type === 'xvg')?.url || ''

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${pkg.name}</title>
    <meta name="description" content="${pkg.description}">
    <link rel="icon" href="./favicon.ico">
    <style>
      @font-face {
        font-family: "Orbitron";
        src: url("./assets/Orbitron-latin-wght-normal.woff2") format("woff2");
        font-display: swap;
      }

      :root {
        color-scheme: dark;
        --bg: #090914;
        --panel: rgba(12, 15, 32, 0.72);
        --panel-border: rgba(145, 122, 255, 0.28);
        --text: #f5f7ff;
        --muted: #b9c1dd;
        --pink: #ff4fd8;
        --cyan: #59f3ff;
        --violet: #7d6bff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top right, rgba(255, 79, 216, 0.28), transparent 34%),
          radial-gradient(circle at bottom left, rgba(89, 243, 255, 0.18), transparent 30%),
          linear-gradient(160deg, #060611 0%, #0f1025 52%, #090914 100%);
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .shell {
        width: min(1180px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 28px 0 56px;
      }

      .nav,
      .hero,
      .features,
      .footer {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--panel-border);
        border-radius: 28px;
        background: var(--panel);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
        backdrop-filter: blur(22px);
      }

      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 24px;
        margin-bottom: 24px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 16px;
        font-family: "Orbitron", sans-serif;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .brand img {
        width: 120px;
      }

      .nav-actions {
        display: flex;
        gap: 12px;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 50px;
        padding: 0 22px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        font-weight: 700;
        letter-spacing: 0.03em;
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
      }

      .button:hover {
        transform: translateY(-1px);
      }

      .button-primary {
        color: #080810;
        background: linear-gradient(90deg, var(--cyan), #8dfff2);
        box-shadow: 0 0 28px rgba(89, 243, 255, 0.28);
      }

      .button-secondary {
        background: rgba(255, 255, 255, 0.05);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
        gap: 28px;
        padding: 40px;
        margin-bottom: 24px;
      }

      .hero-copy {
        align-self: center;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        color: var(--cyan);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0 0 16px;
        font-family: "Orbitron", sans-serif;
        font-size: clamp(2.8rem, 6vw, 4.8rem);
        line-height: 0.94;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        text-shadow: 0 0 24px rgba(125, 107, 255, 0.24);
      }

      .subtitle {
        max-width: 42rem;
        margin: 0 0 24px;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.65;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }

      .hero-note {
        margin-top: 18px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .hero-media {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hero-media::before {
        content: "";
        position: absolute;
        inset: 12% 18%;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255, 79, 216, 0.34), transparent 70%);
        filter: blur(18px);
      }

      .hero-media img {
        position: relative;
        width: min(100%, 560px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.38);
      }

      .features {
        padding: 32px;
        margin-bottom: 24px;
      }

      .section-title {
        margin: 0 0 18px;
        font-family: "Orbitron", sans-serif;
        font-size: 1.45rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .feature-card {
        padding: 18px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.07);
      }

      .feature-card h3 {
        margin: 0 0 8px;
        font-size: 1rem;
      }

      .feature-card p {
        margin: 0;
        color: var(--muted);
        line-height: 1.55;
      }

      .footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 18px;
        padding: 22px 24px;
        color: var(--muted);
      }

      .footer strong {
        color: var(--text);
      }

      @media (max-width: 980px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .feature-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .shell {
          width: min(100vw - 20px, 100%);
          padding: 14px 0 24px;
        }

        .nav,
        .hero,
        .features,
        .footer {
          border-radius: 22px;
        }

        .nav {
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
        }

        .nav-actions,
        .hero-actions {
          width: 100%;
          flex-direction: column;
        }

        .button {
          width: 100%;
        }

        .hero,
        .features {
          padding: 24px 20px;
        }

        .feature-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="nav">
        <div class="brand">
          <img src="./assets/logo@2x.png" alt="${pkg.name}">
          <span>${pkg.name}</span>
        </div>
        <div class="nav-actions">
          <a class="button button-secondary" href="${githubUrl}">GitHub</a>
          <a class="button button-secondary" href="${sponsorUrl}">Sponsor</a>
        </div>
      </section>

      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">Privacy-first desktop wallet</div>
          <h1>${pkg.name}</h1>
          <p class="subtitle">${pkg.description}</p>
          <div class="hero-actions">
            <a id="downloadButton" class="button button-primary" href="${githubUrl}/releases">Browse releases</a>
            <a class="button button-secondary" href="${githubUrl}">Source code</a>
          </div>
          <p class="hero-note">Current desktop version: v${displayVersion}</p>
        </div>
        <div class="hero-media">
          <picture>
            <source srcset="./assets/app-screenshot-dark.png" media="(prefers-color-scheme: dark)">
            <img src="./assets/app-screenshot-light.png" alt="${pkg.name} screenshot">
          </picture>
        </div>
      </section>

      <section class="features">
        <h2 class="section-title">Features</h2>
        <div class="feature-grid">
          ${features.map(feature => `
          <article class="feature-card">
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
          </article>`).join('')}
        </div>
      </section>

      <section class="footer">
        <div>
          <strong>${pkg.name}</strong> by <a href="${pkg.author.url}">${pkg.author.name}</a>
        </div>
        <div>
          XVG address: <strong>${xvgAddress}</strong>
        </div>
      </section>
    </main>
    <script>
      (function () {
        const pkg = ${JSON.stringify(pkg)};
        const githubUrl = pkg.repository.url.replace(/\\.git$/, '');
        const button = document.getElementById('downloadButton');
        const version = pkg.version;
        const displayVersion = version.replace(/\\.0$/, '');
        const platform = navigator.platform || navigator.userAgent || '';
        const isMac = /Mac/.test(platform);
        const isWin = /Win/.test(platform);
        const isLinux = /Linux|X11/.test(platform);

        let href = githubUrl + '/releases';
        let label = 'Browse releases';

        if (isMac) {
          href = githubUrl + '/releases/download/v' + version + '/' + encodeURIComponent('Verge Slim-' + version + '.dmg');
          label = 'Download macOS v' + version;
        } else if (isWin) {
          href = githubUrl + '/releases/download/v' + version + '/' + encodeURIComponent('Verge Slim ' + displayVersion + '.exe');
          label = 'Download Windows v' + displayVersion;
        } else if (isLinux) {
          href = githubUrl + '/releases/download/v' + version + '/' + encodeURIComponent('Verge Slim-' + version + '.AppImage');
          label = 'Download Linux v' + version;
        }

        button.href = href;
        button.textContent = label;
      })();
    </script>
  </body>
</html>`
}

const buildDocs = () => {
  rmSync(docsDir, { recursive: true, force: true })
  ensureDir(docsAssetsDir)

  copyIfExists(path.join(rootDir, 'src', 'docs', 'static', 'favicon.ico'), path.join(docsDir, 'favicon.ico'))
  copyIfExists(path.join(rootDir, 'src', 'docs', 'static', 'appicon.png'), path.join(docsDir, 'appicon.png'))
  copyIfExists(path.join(rootDir, 'src', 'docs', 'static', 'CNAME'), path.join(docsDir, 'CNAME'))
  copyIfExists(path.join(rootDir, 'src', 'assets', 'headers', 'logo@2x.png'), path.join(docsAssetsDir, 'logo@2x.png'))
  copyIfExists(path.join(rootDir, 'src', 'assets', 'app-screenshot-dark.png'), path.join(docsAssetsDir, 'app-screenshot-dark.png'))
  copyIfExists(path.join(rootDir, 'src', 'assets', 'app-screenshot-light.png'), path.join(docsAssetsDir, 'app-screenshot-light.png'))
  copyIfExists(path.join(rootDir, 'src', 'assets', 'fonts', 'Orbitron-latin-wght-normal.woff2'), path.join(docsAssetsDir, 'Orbitron-latin-wght-normal.woff2'))

  writeFileSync(path.join(docsDir, 'index.html'), buildHtml())
}

const serveDocs = () => {
  const port = Number(process.env.PORT || 4173)

  const server = http.createServer((request, response) => {
    const urlPath = request.url === '/' ? '/index.html' : request.url
    const filePath = path.join(docsDir, decodeURIComponent(urlPath))

    if (!filePath.startsWith(docsDir) || !existsSync(filePath)) {
      response.statusCode = 404
      response.end('Not found')
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.ico': 'image/x-icon',
      '.png': 'image/png',
      '.woff2': 'font/woff2'
    }[ext] || 'application/octet-stream'

    response.setHeader('Content-Type', contentType)
    response.end(readFileSync(filePath))
  })

  server.listen(port, '127.0.0.1', () => {
    console.log(`Docs available at http://127.0.0.1:${port}`)
  })
}

buildDocs()

if (process.argv.includes('--serve')) {
  serveDocs()
}
