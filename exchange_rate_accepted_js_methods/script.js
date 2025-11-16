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
		let count = 0;

		fetchData(exchangeRates)
			.then((rates) => {
				data.exchangeRates = rates;
				count++;

				if (count === 2) {
					resolve(data);
				}
			})
			.catch((error) => reject(error));

		fetchData(currencyNames)
			.then((names) => {
				data.currencyNames = names;
				count++;

				if (count === 2) {
					resolve(data);
				}
			})
			.catch((error) => reject(error));
	});
}

function createCurrencyRateObject(data) {
	const { exchangeRates, currencyNames } = data;
	const { date, base: currencyCode, rates } = exchangeRates;

	const currencyRateObject = {
		date,
		base: '',
		rates: [],
	};

	currencyRateObject.base = currencyNames[currencyCode]?.name ?? currencyCode;

	currencyRateObject.rates = Object.entries(rates).map(
		([exchangeCode, rateValue]) => ({
			name: currencyNames[exchangeCode]?.name ?? exchangeCode,
			value: rateValue,
		})
	);

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
