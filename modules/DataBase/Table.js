export default class Table {
	#db = null;
	#name = null;

	constructor(db, name) {
		this.#db = db;
		this.#name = name;
	}

	get db() { return this.#db; }
	get name() { return this.#name; }

	add(data) { return this.#set("add", data); }
	put(data) { return this.#set("put", data); }

	get(key) {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(this.name);
			const store = transaction.objectStore(this.name);
			const exist = store.get(key);
			exist.onerror = event => reject(event.target.error);
			exist.onsuccess = event => resolve(event.target.result);
		});
	}

	getAllData(oncomplete) {
		return new Promise(async (resolve, reject) => {
			const store = this.objectStore("readonly", oncomplete);
			const e = store.getAllKeys();
			e.onerror = event => reject(event.target.error);
			e.onsuccess = async event => {
				const result = [];
				for (const key of event.target.result)
					result.push(await new Promise((resolve, reject) => {
						const osr = store.get(key);
						osr.onerror = event => reject(event.target.error);
						osr.onsuccess = event => resolve(event.target.result);
					}));
				resolve(result);
			}
		});
	}

	objectStore(mode, oncomplete) {
		const transaction = this.db.transaction(this.name, mode);
		const store = transaction.objectStore(this.name);
		if (oncomplete !== undefined)
			transaction.oncomplete = oncomplete;
		return store;
	}

	#set(method, data) {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(this.name, "readwrite");
			const store = transaction.objectStore(this.name);

			if (data instanceof Array)
				for (const item of data) {
					const osr = store[method](item);
					osr.onerror = event => reject(event.target.error);
					osr.onsuccess = event => console.info(event);
				}
			else {
				const osr = store[method](data);
				osr.onerror = event => reject(event.target.error);
				osr.onsuccess = event => console.info(event);
			}

			transaction.oncomplete = event => resolve(event.target.result);
		});
	}
}
