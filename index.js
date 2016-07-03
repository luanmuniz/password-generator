'use strict';

var PasswordGenerator = {

	numbersChars: '0123456789',
	alphabetChars: 'abcdefghijklmnopqrstuvwxyz',
	symbolsChars: '!@#$%&*()_+-={}[]:;<>?,./|',

	/**
	 * Generate a random password given the params
	 * @param {Number} options.size - the total length of the password
	 * @param {Number|Boolean} options.numbers - The total numbers that the password should have
	 * @param {Number} options.symbols - The total symbols that the password should have
	 * @param {Boolean} options.allowUppercase - is uppercase chars allowed?
	 * @param {Boolean} options.allowRepetintion - is repetited chars allowed?
	 * @return {String} The generated password
	 */

	generate({ size = 16, numbers = 5, symbols = 5, allowUppercase = true, allowRepetintion = true } = {}) { // eslint-disable-line no-magic-numbers
		var finalPassword = '',
			numberPassword = '',
			symbolsPassword = '',
			possibleChars = PasswordGenerator.alphabetChars;

		if(allowUppercase) {
			possibleChars += PasswordGenerator.alphabetChars.toUpperCase();
		}

		for(let i = 0; i < size; i++) {
			finalPassword += PasswordGenerator.generateNextChar(possibleChars, finalPassword, allowRepetintion);
		}

		if(numbers > 0) {
			finalPassword = finalPassword.substring(0, (finalPassword.length - numbers));

			for(let i = 0; i < numbers; i++) {
				numberPassword += PasswordGenerator.generateNextChar(PasswordGenerator.numbersChars, numberPassword, allowRepetintion);
			}
		}

		if(symbols > 0) {
			finalPassword = finalPassword.substring(0, (finalPassword.length - symbols));

			for(let i = 0; i < symbols; i++) {
				symbolsPassword += PasswordGenerator.generateNextChar(PasswordGenerator.symbolsChars, symbolsPassword, allowRepetintion);
			}
		}

		finalPassword = finalPassword + numberPassword + symbolsPassword;
		finalPassword = PasswordGenerator.shuffleString(finalPassword);

		return finalPassword;
	},

	/**
	 * Generate the next char for the password string
	 * @param {String} possibleChars - A string containing all the chars allowed in the password
	 * @param {String} hash - The actual password
	 * @param {Boolean} allowRepetintion - Boolean indicating if we can have repetite chars in the password
	 * @return {String} The next char for the password
	*/
	generateNextChar(possibleChars, hash, allowRepetintion) {
		let nextChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

		if(!allowRepetintion && PasswordGenerator.checkForRepetintion(hash, nextChar)) {
			nextChar = PasswordGenerator.generateNextChar(possibleChars, hash, allowRepetintion);
		}

		return nextChar;
	},

	/**
	 * Check if chars exist at given string
	 * @param {String} hash - The string to check
	 * @param {String} nextChar - the char that can't be in the string
	 * @return {Boolean} true if exist and false if doesn't
	*/
	checkForRepetintion(hash, nextChar) {
		return (hash.indexOf(nextChar) !== -1);
	},

	/**
	 * Shuffle the String with all the chars for the password, that way we have the exact amount of each type of chars in the password
	 * @param  {String} allStrings - the string to be suffled
	 * @return {String} shuffled string
	 */
	shuffleString(allStrings) {
		return allStrings
			.split('')
			.sort(() => 0.5 - Math.random()) // eslint-disable-line no-magic-numbers
			.join('')
			;
	}

};

module.exports = Object.create(PasswordGenerator);
