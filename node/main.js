import {
	createMatrix,
	fillMatrixRandomNumbers,
	addMatrices,
	singleWorker,
	multiThreadWorkers,
} from './helpers.js';

const size = 2000;
const min = 1;
const max = 10;
const matrixA = createMatrix(size, size);
const matrixB = createMatrix(size, size);

fillMatrixRandomNumbers(matrixA, min, max);
fillMatrixRandomNumbers(matrixB, min, max);

console.log('====== Однопоточное сложение =======');

const startTime = performance.now();
addMatrices(matrixA, matrixB);
const endTime = performance.now();
const duration = endTime - startTime;

console.log(`Время: ${duration.toFixed(2)} мс`);

async function multithreadedAddition() {
	console.log('==========Один воркер============');
	const singleWorkerTime = await singleWorker(matrixA, matrixB);
	console.log(`Время: ${singleWorkerTime.toFixed(2)} МС`);

	console.log('============Многопоточное сложение=============');
	for (let i = 2; i <= 10; i++) {
		const multiThreadWorkersTime = await multiThreadWorkers(
			matrixA,
			matrixB,
			i
		);
		console.log(`${i} потока(ов): ${multiThreadWorkersTime.toFixed(2)} МС`);
	}
}

multithreadedAddition();
