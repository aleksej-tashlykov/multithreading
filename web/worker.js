import { addMatrices } from './helpers/matrixHelpers.js';

self.onmessage = function (event) {
	const { chunkA, chunkB, chunkIndex } = event.data;
	const result = addMatrices(chunkA, chunkB);
	self.postMessage({ result, chunkIndex });
};
