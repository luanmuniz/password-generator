'use strict';

var PasswordGenerator = {

	numbersChars: '0123456789',
	alphabetChars: 'abcdefghijklmnopqrstuvwxyz',
	symbolsChars: '!@#$%&*()_+-={}[]:;<>?,./|',

	/**
	 * Generate a random password given the params
	 * @param {Number} size - the total length of the password
	 * @param {Object} options - Object with the options of configuration
	 * @return {String} The generated password
	 */

	generate() {
		var finalPassword = '',
			numberPassword = '',
			symbolsPassword = '',
			possibleChars = PasswordGenerator.alphabetChars,
			options = PasswordGenerator.mergeOptions(arguments);

		if(options.allowUppercase) {
			possibleChars += PasswordGenerator.alphabetChars.toUpperCase();
		}

		for(let i = 0; i < options.size; i++) {
			finalPassword += PasswordGenerator.generateNextChar(possibleChars, finalPassword, options);
		}

		if(options.numbers > 0) {
			finalPassword = finalPassword.substring(0, (finalPassword.length - options.numbers));

			for(let i = 0; i < options.numbers; i++) {
				numberPassword += PasswordGenerator.generateNextChar(PasswordGenerator.numbersChars, numberPassword, options);
			}

			finalPassword = finalPassword + numberPassword;
		}

		if(options.symbols > 0) {
			finalPassword = finalPassword.substring(0, (finalPassword.length - options.symbols));

			for(let i = 0; i < options.symbols; i++) {
				symbolsPassword += PasswordGenerator.generateNextChar(PasswordGenerator.symbolsChars, symbolsPassword, options);
			}

			finalPassword = finalPassword + symbolsPassword;
		}

		finalPassword = PasswordGenerator.shuffleString(finalPassword);

		return finalPassword;
	},

	/**
	 * Merge default options with Users options
	 * @param {(Number|Object)} userOptions Arguments passing in the function generate
	 * @return {Object} Object with the final options
	 */
	mergeOptions(userOptions) {
		var userObjOptions = userOptions[0],
			defaultValues = {
				size: 16,
				numbers: 5,
				symbols: 5,
				allowUppercase: true,
				allowRepetintion: false
			};

		if(typeof userObjOptions === 'number') {
			defaultValues.size = userObjOptions;
		}

		if(userOptions[1] && userOptions[1] === Object(userOptions[1])) {
			userObjOptions = userOptions[1];
		}

		if( userObjOptions === Object(userObjOptions) ) {
			defaultValues.size = (userObjOptions.size || defaultValues.size);
			defaultValues.numbers = (userObjOptions.numbers || defaultValues.numbers);
			defaultValues.symbols = (userObjOptions.symbols || defaultValues.symbols);
			defaultValues.allowUppercase = (userObjOptions.allowUppercase || defaultValues.allowUppercase);
			defaultValues.allowRepetintion = (userObjOptions.allowRepetintion || defaultValues.allowRepetintion);
		}

		return defaultValues;
	},

	/**
	 * Generate the next char for the password string
	 * @param {String} possibleChars - A string containing all the chars allowed in the password
	 * @param {String} hash - The actual password
	 * @param {Object} options - Object with the module configuration
	 * @return {String} The next char for the password
	*/
	generateNextChar(possibleChars, hash, options) {
		let nextChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

		if(!options.allowRepetintion && PasswordGenerator.checkForRepetintion(hash, nextChar) && (options.numbers <= PasswordGenerator.numbersChars.length &&	options.symbols <= PasswordGenerator.symbolsChars.length)) {
			nextChar = PasswordGenerator.generateNextChar(possibleChars, hash, options);
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
	 * @param  {String} finalPassword - the string to be suffled
	 * @return {String} shuffled string
	 */
	shuffleString(finalPassword) {
		return finalPassword
			.split('')
			.sort(() => 0.5 - Math.random()) // eslint-disable-line no-magic-numbers
			.join('');
	}

};

module.exports = Object.create(PasswordGenerator);
