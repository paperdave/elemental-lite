# Elemental Lite

Simple and lightweight remake of Elemental 2

To request new features, elements, or report bugs, do so in [the issues tab](https://github.com/imdaveead/elemental-lite/issues), or even make a [pull request](https://github.com/imdaveead/elemental-lite/pulls)

# To run locally
To get the element loading to work, you can't just open the html file, as the game sends out web requests to get the txt files. To solve this you must run a local http server. Heres some options on how to do that

- If you have [Node.js](https://nodejs.org), you can run [http-server](http://npmjs.com)
- If you dont have that and want a simple gui server, go with [this chrome extension](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)

To add more element files, edit `src/init-data.js`
