<p align="center"><img src="https://raw.githubusercontent.com/vergecurrency/MyVergies/main/readme-header.png" alt="MyVergies Logo"></p>

<p align="center">
  <a href="https://github.com/vergecurrency/MyVergies/actions" target="_blank"><img src="https://github.com/vergecurrency/MyVergies/actions/workflows/ci.yml/badge.svg"></a>
  <img src="https://img.shields.io/badge/status-beta-orange.svg">
  <img src="https://img.shields.io/badge/macOS-15+-blue.svg">
  <img src="https://img.shields.io/badge/Windows-^10-lightblue.svg">
  <img src="https://img.shields.io/badge/Ubuntu-24.04-orange.svg">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg">
</p>

#  MyVergies

This desktop wallet provides an easy and secure wallet on your personal computer. With **Tor** integrated you can be sure your http communication is private. Sending and receiving XVG in a secure and easy to use wallet will actually change the way you use Verge Currency. 💪

## Features:

* Sending and receiving XVG
* Store addresses in an address book
* Tor integrated
* Price statistics in different fiat currencies
* Private keys are yours
* Possibility to choose your own wallet service

## Local Development

If you want to help with development, use this setup:

1. Fork the project, and clone it to your local machine.

2. Use Node 18 and npm 10 (recommended).
```bash
node -v
npm -v
```

3. Install Linux dependencies (Linux only):

Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y pkg-config libsecret-1-dev
```

Red Hat:
```bash
sudo yum install libsecret-devel
```

Arch Linux:
```bash
sudo pacman -S libsecret
```

4. Install npm dependencies:
```bash
npm ci
```

5. Run a local instance with hot reload:
```bash
npm run electron:serve
```

6. Run tests locally:
```bash
npm test
```

## Packaging / Build

Use these scripts from the project root:

```bash
# Linux AppImage
npm run electron:build:linux

# Windows portable .exe from Linux
npm run electron:build:win
```

Artifacts are written to `dist_electron/`.

Please setup your own local VWS instance to test your changes against. You can checkout [the bitcore repository](https://github.com/vergecurrency/bitcore) and setup an instance [using docker](https://github.com/vergecurrency/bitcore/blob/main/Docker.md).

## Tor Notes

This repository includes platform Tor binaries under `public/bin/Tor`.

Please do not replace Tor with a system binary for normal development. The app is configured to use the repository-provided Tor assets in packaged builds and during runtime install.

### Docs Website

Running the website can be done using NuxtJS:

```bash
npm run nuxt:serve
```

## Build With

* [Vue.js](https://github.com/vuejs/vue) - Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web
* [Electron](https://github.com/github/electron) - Build cross-platform desktop apps with JavaScript, HTML, and CSS
* [Vue CLI Plugin Electron Builder](https://github.com/nklayman/vue-cli-plugin-electron-builder) - A Vue Cli 3/4 plugin for Electron with no required configuration
* [Tor](https://www.torproject.org) - The intergration of Tor makes sure your transactions are private

### Community

* [Telegram](https://t.me/VERGExvg)
* [Discord](https://discord.gg/vergecurrency)
* [Twitter](https://www.twitter.com/vergecurrency)
* [Facebook](https://www.facebook.com/VERGEcurrency/)
* [Reddit](https://www.reddit.com/r/vergecurrency/)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

### BEFORE CONTRIBUTING

This repository is in beta state and so it's not ready for feature pull requests.
