import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const fileName = fileURLToPath(import.meta.url);
const directoryName = dirname(fileName);

function createMatrix(rows, cols) {
	if (rows <= 0 || cols <= 0) {
		throw new Error(
			'Количество строк и столбцов должно быть положительным числом'
		);
	}

	const matrix = [];

	for (let i = 0; i < rows; i++) {
		matrix[i] = [];
		for (let j = 0; j < cols; j++) {
			matrix[i][j] = 0;
		}
	}

	return matrix;
}

function fillMatrixRandomNumbers(matrix, min, max) {
	if (!Array.isArray(matrix)) {
		throw new Error('Первый аргумент должен быть массивом');
	}

	if (min > max) {
		let temp = min;
		min = max;
		max = temp;
	}

	for (let i = 0; i < matrix.length; i++) {
		for (let j = 0; j < matrix[i].length; j++) {
			const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
			matrix[i][j] = randomValue;
		}
	}
}

function addMatrices(matrixA, matrixB) {
	if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
		throw new Error('Аргументы должны быть массивами');
	}

	if (matrixA.length === 0 || matrixB.length === 0) {
		throw new Error('Матрицы не должны быть пустыми');
	}

	if (!Array.isArray(matrixA[0]) || !Array.isArray(matrixB[0])) {
		throw new Error('Элементы матриц должны быть массивами');
	}

	if (matrixA[0].length === 0 || matrixB[0].length === 0) {
		throw new Error('Элементы матриц не должны быть пустыми');
	}

	if (
		matrixA.length !== matrixB.length ||
		matrixA[0].length !== matrixB[0].length
	) {
		throw new Error('Матрицы должны иметь одинаковые размеры');
	}

	const rows = matrixA.length;
	const cols = matrixA[0].length;

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			matrixA[i][j] + matrixB[i][j];
		}
	}
}

function splitMatrixIntoChunks(matrix, chunk) {
	if (chunk <= 0) {
		throw new Error('Количество частей должно быть положительным числом');
	}
	const parts = [];
	const baseSize = Math.floor(matrix.length / chunk);
	const extraParts = matrix.length % chunk;

	let startIndex = 0;
	let currentPartSize = 0;

	for (let i = 0; i < chunk; i++) {
		currentPartSize = baseSize;
		if (i < extraParts) {
			currentPartSize += 1;
		}

		const part = [];
		for (let j = 0; j < currentPartSize; j++) {
			part[j] = [];
			for (let k = 0; k < matrix[0].length; k++) {
				part[j][k] = matrix[startIndex + j][k];
			}
		}

		parts[i] = part;
		startIndex += currentPartSize;
	}

	return parts;
}

function singleWorker(matrixA, matrixB) {
	return new Promise((resolve) => {
		const startTime = performance.now();

		const worker = new Worker(join(directoryName, 'worker.js'));

		worker.on('message', () => {
			const endTime = performance.now();
			const duration = endTime - startTime;
			worker.terminate();
			resolve(duration);
		});

		worker.postMessage({
			chunkA: matrixA,
			chunkB: matrixB,
		});
	});
}

function multiThreadWorkers(matrixA, matrixB, threadCount) {
	return new Promise((resolve) => {
		const startTime = performance.now();

		const chunkA = splitMatrixIntoChunks(matrixA, threadCount);
		const chunkB = splitMatrixIntoChunks(matrixB, threadCount);

		const workers = [];
		let completed = 0;

		for (let i = 0; i < threadCount; i++) {
			const worker = new Worker(join(directoryName, 'worker.js'));
			workers[i] = worker;

			worker.on('message', () => {
				completed++;

				if (completed === threadCount) {
					const endTime = performance.now();
					const duration = endTime - startTime;

					for (let j = 0; j < workers.length; j++) {
						workers[j].terminate();
					}

					resolve(duration);
				}
			});
			worker.postMessage({
				chunkA: chunkA[i],
				chunkB: chunkB[i],
			});
		}
	});
}

export {
	createMatrix,
	fillMatrixRandomNumbers,
	addMatrices,
	splitMatrixIntoChunks,
	singleWorker,
	multiThreadWorkers,
};
