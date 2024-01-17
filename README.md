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
$ npm run start
```

### Build

```bash
$ npm run make
```

### Launch
After building the app for your operating system (using `npm run make`), the executable will be located in the `out` folder at the project root. For instance, on a Mac, your executable would be `out/make/p2p-flashcards-2.0.0-arm64.dmg`.