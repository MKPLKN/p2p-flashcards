### Todo

- [ ] Add a simple settings page for logged-in users.
- [ ] Join a hyperswarm topic based on the related setting.
- [ ] Replicate the master DB
- [ ] Add an indicator of the connection status.

# P2P Flashcards

p2p-flashcards is a secure and private flashcard (minimalist) application designed for individuals who seek an effective method to memorize and test their knowledge on sensitive information such as passwords, PIN codes, and other critical data. Built with privacy at its core, the application operates peer-to-peer (P2P), ensuring that your data remains confidential and is accessible only to you.

![Demo](resources/demo.gif)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### Launch
After building the app for your operating system (e.g., using `npm run build:mac`), the executable will be located in the `dist` folder at the project root. For instance, on a Mac, your executable would be `dist/p2p-flashcards-1.0.0.dmg`.