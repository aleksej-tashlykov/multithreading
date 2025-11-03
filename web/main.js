import {
	createMatrix,
	fillMatrixRandomNumbers,
	addMatrices,
	mergeMatrixChunk,
	multiThreadWorkers,
} from './helpers.js';

const numberMatrixElements = 4_100;
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

const worker = new Worker(new URL('./worker.js', import.meta.url), {
	type: 'module',
});

const startTimeWorker = performance.now();
worker.onmessage = function (event) {
	const endTimeWorker = performance.now();
	const timeDurationWorker = endTimeWorker - startTimeWorker;

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

function multithreadedAddition() {
	console.log('Многопоточное сложение');

	for (let i = 2; i <= 10; i++) {
		multiThreadWorkers(matrixA, matrixB, i).then((workers) => {
			const startTime = performance.now();
			let completed = 0;
			const workerResults = [];
			for (let j = 0; j < workers.length; j++) {
				workers[j].onmessage = function (event) {
					workerResults[event.data.chunkIndex] = event.data.result;
					completed++;

					if (completed === i) {
						const endTime = performance.now();
						const duration = endTime - startTime;

						for (let k = 0; k < workers.length; k++) {
							workers[k].terminate();
						}

						mergeMatrixChunk(workerResults);
						console.log(`${i} потока(ов): ${duration.toFixed(2)} МС`);
					}
				};
			}
		});
	}
}
