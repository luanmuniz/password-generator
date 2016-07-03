Password Generator
=========
[![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![NPM Version][node-image]][node-url]

[![Node Build][nodei-image]][nodei-url]

A small library to generate random strings

## Installation

`npm install @luanmuniz/password-generator`

## How it works
```javascript
const passwordGenerator = require('@luanmuniz/password-generator');

let passwordString = passwordGenerator.generate({
	size: 10,
	numbers: 5,
	symbols: 3,
	allowUppercase: true
	allowRepetintion: true
});

console.log(passwordString);
```

## Tests
`npm test`

## Contributing
Please, check the [Contributing](CONTRIBUTING.md) documentation, there're just a few steps.

## Support or Contact

Having trouble? Or new ideas? Post a new issue! We will be glad to help you!

## License

[MIT License](http://luanmuniz.mit-license.org) © Luan Muniz

[travis-url]: https://travis-ci.org/luanmuniz/password-generator
[travis-image]: https://travis-ci.org/luanmuniz/password-generator.png?branch=master
[depstat-url]: https://david-dm.org/luanmuniz/password-generator#info=devDependencies
[depstat-image]: https://david-dm.org/luanmuniz/password-generator/dev-status.png
[nodei-image]: https://nodei.co/npm/password-generator.png
[nodei-url]: https://nodei.co/npm/password-generator
[node-image]: https://badge.fury.io/js/password-generator.svg
[node-url]: http://badge.fury.io/js/password-generator
