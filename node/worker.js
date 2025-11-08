import { addMatrices } from './helpers/matrixHelpers.js';
import { parentPort } from 'node:worker_threads';

parentPort.on('message', (data) => {
	const { chunkA, chunkB, chunkIndex } = data;
	const result = addMatrices(chunkA, chunkB);
	parentPort.postMessage({ result, chunkIndex });
});
