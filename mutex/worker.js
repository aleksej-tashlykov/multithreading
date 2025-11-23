import { workerData, parentPort } from 'node:worker_threads';
import { Mutex } from './mutex.js';

const { sharedBuffer, workerId } = workerData;
const mutex = new Mutex(sharedBuffer);

async function criticalSection() {
	console.log(`Воркер ${workerId} ждет осовбождения потока.`);

	try {
		mutex.acquire();
		console.log(`Воркер ${workerId} пытается захватить поток.`);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log(`Воркер ${workerId} закончил работу.`);
	} finally {
		mutex.release();
		console.log(`Воркер ${workerId} осовбодил поток.`);
	}
}

criticalSection();
parentPort.postMessage('Воркер начал работу.');
