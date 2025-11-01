import {
	createMatrix,
	fillMatrixRandomNumbers,
	addMatrices,
	multiThreadWorkers,
} from './helpers.js';

const numberMatrixElements = 5000;
const min = 1;
const max = 10;

const matrixA = createMatrix(numberMatrixElements, numberMatrixElements);
const matrixB = createMatrix(numberMatrixElements, numberMatrixElements);

fillMatrixRandomNumbers(matrixA, min, max);
fillMatrixRandomNumbers(matrixB, min, max);

//===============Однопоточная версия==============
const startTimeSingle = performance.now();
addMatrices(matrixA, matrixB);
const endTimeSingle = performance.now();
const timeDurationSingle = endTimeSingle - startTimeSingle;
console.log(
	`Время, затраченное на сложение на странице: ${timeDurationSingle.toFixed(
		2
	)} МС`
);

//===========Один воркер==========================
if (!window.Worker) {
	throw new Error('Браузер не поддерживает Web Workers.');
}

let singleWorkerResultMatrix;
const startTimeWorker = performance.now();
const worker = new Worker(new URL('./worker.js', import.meta.url), {
	type: 'module',
});
worker.onmessage = function (event) {
	const endTimeWorker = performance.now();
	const timeDurationWorker = endTimeWorker - startTimeWorker;
	singleWorkerResultMatrix = event.data.result;

	console.log(
		`Время, затраченное на сложение в одном воркере: ${timeDurationWorker.toFixed(
			2
		)} МС`
	);
	console.log(`Результат получен от воркера`);

	worker.terminate();

	multithreadedAddition();
};

worker.onerror = function (error) {
	console.error('Ошибка воркера:', error);
};

worker.postMessage({ chunkA: matrixA, chunkB: matrixB });

async function multithreadedAddition() {
	console.log('Многопоточное сложение');

	for (let i = 2; i <= 10; i++) {
		const data = await multiThreadWorkers(matrixA, matrixB, i);
		console.log(`${i} потока(ов): ${data.duration.toFixed(2)} МС`);
	}
}
