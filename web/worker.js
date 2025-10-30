import { addMatrices } from './helpers.js';

self.onmessage = function (event) {
	const { chunkA, chunkB } = event.data;
	addMatrices(chunkA, chunkB);
	self.postMessage({ done: true });
};
