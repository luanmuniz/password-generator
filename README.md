Password Generator
=========

[![Greenkeeper badge](https://badges.greenkeeper.io/luanmuniz/password-generator.svg)](https://greenkeeper.io/)
[![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![NPM Version][node-image]][node-url] [![Coverage Status][coverrals-image]][coverrals-url]

[![Node Build][nodei-image]][nodei-url]

A small library to generate random strings

## Installation

```shell
$ npm install --save @luanmuniz/password-generator
```

## How it works
```js
const generatePassword = require('@luanmuniz/password-generator').generate;

generatePassword({
	size: 10,
	numbers: 5,
	symbols: 3,
	allowUppercase: true,
	allowRepetintion: true
});
//=> '23393Rz@}_'

generatePassword(20, {
	numbers: 5,
	symbols: 3,
	allowUppercase: true,
	allowRepetintion: true
});
//=> ';64xxy*DC6Zyt<UjZ75B'
```
## API

### generate([size], [options])

#### size
Type: `String`
The total length of your string

#### options

##### size
Type: `String`<br>
Default: `15`

The total length of your string

##### numbers
Type: `Boolean or Integer`<br>
Default: `5`<br>
All Numbers allowed: `0123456789`

`true` or `false` if numbers are allowed<br>
`Integers` for the numbers of numbers that your final password will have

##### symbols
Type: `Boolean or Integer`<br>
Default: `5`<br>
All Symbols allowed: `!@#$%&*()_+-={}[]:;<>?,./|`

`true` or `false` if numbers are allowed<br>
`Integers` for the numbers of symbols that your final password will have

##### allowUppercase
Type: `Boolean`<br>
Default: `true`

`true` or `false` if Uppercase characters are allowed

##### allowRepetintion
Type: `Boolean`<br>
Default: `false`

`true` or `false` if your final password can have repetitive characters

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
[nodei-image]: https://nodei.co/npm/@luanmuniz/password-generator.png
[nodei-url]: https://nodei.co/npm/@luanmuniz/password-generator
[node-image]: https://badge.fury.io/js/%40luanmuniz%2Fpassword-generator.svg
[node-url]: http://badge.fury.io/js/%40luanmuniz%2Fpassword-generator
[coverrals-image]: https://coveralls.io/repos/github/luanmuniz/password-generator/badge.svg?branch=master
[coverrals-url]: https://coveralls.io/github/luanmuniz/password-generator?branch=master
