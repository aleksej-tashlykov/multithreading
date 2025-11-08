function fetchData(url) {
	return new Promise((resolve, reject) => {
		fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Ошибка сети: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				resolve(data);
			})
			.catch((error) => reject(error));
	});
}

const exchangeRates = 'https://www.cbr-xml-daily.ru/latest.js';
const currencyNames =
	'https://gist.githubusercontent.com/ksafranski/2973986/raw/5fda5e87189b066e11c1bf80bbfbecb556cf2cc1/Common-Currency.json';

function uploadingData() {
	return new Promise((resolve, reject) => {
		const data = {};

		fetchData(exchangeRates)
			.then((rates) => {
				data.exchangeRates = rates;

				return fetchData(currencyNames);
			})
			.then((names) => {
				data.currencyNames = names;
				resolve(data);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

function createCurrencyRateObject(data) {
	const exchangeRates = data.exchangeRates;
	const currencyNames = data.currencyNames;

	const currencyRateObject = {
		date: exchangeRates.date,
		base: '',
		rates: [],
	};

	const currencyCode = exchangeRates.base;

	if (currencyNames[currencyCode] !== undefined) {
		currencyRateObject.base = currencyNames[currencyCode].name;
	} else {
		currencyRateObject.base = currencyCode;
	}

	let index = 0;
	for (const exchangeCode in exchangeRates.rates) {
		if (exchangeRates.rates.hasOwnProperty(exchangeCode)) {
			const rateValue = exchangeRates.rates[exchangeCode];
			let exchangeName = exchangeCode;

			if (currencyNames[exchangeCode] !== undefined) {
				exchangeName = currencyNames[exchangeCode].name;
			}

			currencyRateObject.rates[index] = {
				name: exchangeName,
				value: rateValue,
			};

			index++;
		}
	}

	return currencyRateObject;
}

uploadingData()
	.then((data) => {
		const result = createCurrencyRateObject(data);
		console.log(`Созданный объект`);
		console.log(result);
	})
	.catch((error) => {
		console.error('Ошибка:', error);
	});
