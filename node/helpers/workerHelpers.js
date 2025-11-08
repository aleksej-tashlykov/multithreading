import { splitMatrixIntoChunks } from './matrixHelpers.js';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const fileName = fileURLToPath(import.meta.url);
const directoryName = dirname(fileName);

function multiThreadWorkers(matrixA, matrixB, threadCount) {
	if (threadCount <= 0) {
		throw new Error('Количество частей должно быть положительным числом');
	}

	return new Promise((resolve) => {
		const chunkA = splitMatrixIntoChunks(matrixA, threadCount);
		const chunkB = splitMatrixIntoChunks(matrixB, threadCount);

		const workers = [];

		for (let i = 0; i < threadCount; i++) {
			const worker = new Worker(join(directoryName, '../worker.js'));
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
