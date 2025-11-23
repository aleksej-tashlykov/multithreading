class Mutex {
	constructor(sharedBuffer, offset = 0) {
		this.lock = new Int32Array(sharedBuffer, offset, 1);
		this.queueWaitingMutexes = new Int32Array(sharedBuffer, offset + 4, 1);
		this.isAcquired = false;
	}

	acquire() {
		while (true) {
			const statusMutex = Atomics.compareExchange(this.lock, 0, 0, 1);
			if (statusMutex === 0) {
				this.isAcquired = true;
				return;
			} else {
				Atomics.add(this.queueWaitingMutexes, 0, 1);
				const notify = Atomics.wait(this.lock, 0, 1);
				Atomics.sub(this.queueWaitingMutexes, 0, 1);
				if (notify === 'timed-out') {
					continue;
				}
			}
		}
	}

	release() {
		if (!this.isAcquired) {
			throw new Error('Мьютекс отсутсвует в текущем потоке');
		}

		Atomics.store(this.lock, 0, 0);
		this.isAcquired = false;

		const waitingThreads = Atomics.load(this.queueWaitingMutexes, 0);
		if (waitingThreads > 0) {
			Atomics.notify(this.lock, 0, 1);
		}
	}
}

export { Mutex };
