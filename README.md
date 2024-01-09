# P2P Flashcards

p2p-flashcards is a secure and private flashcard (minimalist) application designed for individuals who seek an effective method to memorize and test their knowledge on sensitive information such as passwords, PIN codes, and other critical data. Built with privacy at its core, the application operates peer-to-peer (P2P), ensuring that your data remains confidential and is accessible only to you.

![Demo](resources/demo.gif)

## Features
- Create and restore users using [`p2p-auth`](https://github.com/MKPLKN/p2p-auth)
- Create and delete flashcards for memorizing important things, such as PIN codes, passwords, Bitcoin seed phrases – you name it.
- Keep track of your correct and wrong answers
- Replicate data with a remote peer of your choice for better availability.

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