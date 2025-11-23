import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const sharedBuffer = new SharedArrayBuffer(8);
const fileName = fileURLToPath(import.meta.url);
const directoryName = dirname(fileName);

const workerA = new Worker(join(directoryName, './worker.js'), {
	workerData: {
		sharedBuffer,
		workerId: 1,
	},
});

const workerB = new Worker(join(directoryName, './worker.js'), {
	workerData: {
		sharedBuffer,
		workerId: 2,
	},
});

console.log('Старт главного потока.');
