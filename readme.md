# Elemental Lite

Simple and lightweight remake of Elemental 2

To request new features, elements, or report bugs, do so in [the issues tab](https://github.com/imdaveead/elemental-lite/issues), or even make a [pull request](https://github.com/imdaveead/elemental-lite/pulls)

## To run locally
To get the element loading to work, you can't just open the html file, as the game sends out web requests to get the txt files. To solve this you must run a local http server. Heres some options on how to do that

- Easy way: [this chrome extension](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)
- Recommended Way: Use Node.js Scripts.

## Node.js setup
Install Node.js, then run in a terminal
```
npm i -D
```
then to start a web server, run
```
npm start
```
then navigate to [http://localhost:8080](http://localhost:8080/)

To run tests (spellcheck and style guide)
```
npm run test
```
