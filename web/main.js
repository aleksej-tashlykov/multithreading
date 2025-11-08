import {
	createMatrix,
	fillMatrixRandomNumbers,
	addMatrices,
	mergeMatrixChunk,
} from './helpers/matrixHelpers.js';

import { multiThreadWorkers } from './helpers/workerHelpers.js';

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

if (!window.Worker) {
	throw new Error('Браузер не поддерживает Web Workers.');
}

//=========Многопоточная версия========
function startWorkers(threadCount) {
	return new Promise((resolve, reject) => {
		multiThreadWorkers(matrixA, matrixB, threadCount).then((workers) => {
			const startTime = performance.now();
			let completed = 0;
			const workerResults = [];
			for (let i = 0; i < workers.length; i++) {
				workers[i].onmessage = function (event) {
					workerResults[event.data.chunkIndex] = event.data.result;
					completed++;
					if (completed === threadCount) {
						const endTime = performance.now();
						const duration = endTime - startTime;
						for (let j = 0; j < workers.length; j++) {
							workers[j].terminate();
						}
						mergeMatrixChunk(workerResults);
						console.log(
							`${threadCount} поток(а/ов): ${duration.toFixed(2)} МС`
						);
						resolve(duration);
					}
				};
				workers[i].onerror = function (error) {
					console.error(`Ошибка в воркере при ${threadCount} потоках:`, error);
					for (let k = 0; k < workers.length; k++) {
						workers[k].terminate();
					}
					reject(error);
				};
			}
		});
	});
}

startWorkers(1)
	.then(() => startWorkers(2))
	.then(() => startWorkers(3))
	.then(() => startWorkers(4))
	.then(() => startWorkers(5))
	.then(() => startWorkers(6))
	.then(() => startWorkers(7))
	.then(() => startWorkers(8))
	.then(() => startWorkers(9))
	.then(() => startWorkers(10));
