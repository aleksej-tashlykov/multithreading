import { splitMatrixIntoChunks } from './matrixHelpers.js';

function multiThreadWorkers(matrixA, matrixB, threadCount) {
	if (threadCount <= 0) {
		throw new Error('Количество частей должно быть положительным числом');
	}

	return new Promise((resolve) => {
		const chunkA = splitMatrixIntoChunks(matrixA, threadCount);
		const chunkB = splitMatrixIntoChunks(matrixB, threadCount);

		const workers = [];

		for (let i = 0; i < threadCount; i++) {
			const worker = new Worker(new URL('../worker.js', import.meta.url), {
				type: 'module',
			});
			workers[i] = worker;

			worker.postMessage({
				chunkA: chunkA[i],
				chunkB: chunkB[i],
				chunkIndex: i,
			});
		}

		resolve(workers);
	});
}

export { multiThreadWorkers };
