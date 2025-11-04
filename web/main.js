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

if (!window.Worker) {
	throw new Error('Браузер не поддерживает Web Workers.');
}

//=========Многопоточная версия========
function startWorkers(threadCount) {
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
					console.log(`${threadCount} поток(а/ов): ${duration.toFixed(2)} МС`);
				}
			};
			workers[i].onerror = function (error) {
				console.error(`Ошибка в воркере при ${threadCount} потоках:`, error);
			};
		}
	});
}

startWorkers(1);
startWorkers(2);
startWorkers(3);
startWorkers(4);
startWorkers(5);
startWorkers(6);
startWorkers(7);
startWorkers(8);
startWorkers(9);
startWorkers(10);
