import { addMatrices } from './helpers.js';
import { parentPort } from 'worker_threads';

parentPort.on('message', (data) => {
	const { chunkA, chunkB } = data;
	addMatrices(chunkA, chunkB);
	parentPort.postMessage({ done: true });
});
