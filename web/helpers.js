function createMatrix(rows, cols) {
	if (rows <= 0 || cols <= 0) {
		throw new Error(
			'Количество строк и столбцов должно быть положительным числом'
		);
	}

	const matrix = [];

	for (let i = 0; i < rows; i++) {
		const row = [];
		for (let j = 0; j < cols; j++) {
			row[j] = 0;
		}
		matrix[i] = row;
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

	const result = [];

	for (let i = 0; i < matrixA.length; i++) {
		result[i] = [];
		for (let j = 0; j < matrixB[0].length; j++) {
			result[i][j] = matrixA[i][j] + matrixB[i][j];
		}
	}

	return result;
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

function mergeMatrixChunk(chunks) {
	let totalRows = 0;
	for (let i = 0; i < chunks.length; i++) {
		totalRows += chunks[i].length;
	}

	const cols = chunks[0][0].length;
	const result = createMatrix(totalRows, cols);

	let rowIndex = 0;
	for (let i = 0; i < chunks.length; i++) {
		for (let j = 0; j < chunks[i].length; j++) {
			for (let k = 0; k < cols.length; k++) {
				result[rowIndex][k] = chunks[i][j][k];
			}
			rowIndex++;
		}
	}

	return result;
}

function multiThreadWorkers(matrixA, matrixB, threadCount) {
	return new Promise((resolve) => {
		const startTime = performance.now();

		const chunkA = splitMatrixIntoChunks(matrixA, threadCount);
		const chunkB = splitMatrixIntoChunks(matrixB, threadCount);

		const workers = [];
		let completed = 0;
		const workerResults = [];

		for (let i = 0; i < threadCount; i++) {
			const worker = new Worker(new URL('./worker.js', import.meta.url), {
				type: 'module',
			});
			workers[i] = worker;

			worker.onmessage = function (event) {
				workerResults[event.data.chunkIndex] = event.data.result;
				completed++;

				if (completed === threadCount) {
					const endTime = performance.now();
					const duration = endTime - startTime;

					for (let j = 0; j < workers.length; j++) {
						workers[j].terminate();
					}
					const finalResult = mergeMatrixChunk(workerResults);
					resolve({ duration: duration, result: finalResult });
				}
			};
			worker.postMessage({
				chunkA: chunkA[i],
				chunkB: chunkB[i],
				chunkIndex: i,
			});
		}
	});
}

export {
	createMatrix,
	fillMatrixRandomNumbers,
	addMatrices,
	splitMatrixIntoChunks,
	mergeMatrixChunk,
	multiThreadWorkers,
};
