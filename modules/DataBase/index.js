import Table from "./Table.js";

function connect(dbName, dbVersion, createDataBase) {
	return new Promise((resolve, reject) => {
		const openDBRequest = window.indexedDB.open(dbName, dbVersion);
		openDBRequest.onerror = event => reject(event.target.error);
		openDBRequest.onsuccess = event => {
			const db = event.target.result;
			db.onerror = event => console.error(`Failed to create object store: ${event.target.error}`);

			const objectStores = [];
			for (const name of Array.from(db.objectStoreNames))
				objectStores[name] = new Table(db, name);
			resolve(objectStores);
		};

		// Database creation during initialization and migration.
		openDBRequest.onupgradeneeded = event => {
			const db = event.target.result;
			db.onerror = event => console.error(`Failed to create object store: ${event.target.error}`);

			createDataBase((name, options, schema) => {
				if (name === undefined || schema === undefined || !(schema instanceof Array)) new SyntaxError("Parameter error");
				if (options === undefined) options = { autoIncrement: true };

				const table = db.createObjectStore(name, options);
				for (const column of schema) {
					if (typeof column === "string")
						table.createIndex(column, column, { unique: false });
					else {
						const keyPath = ("keyPath" in column) ? column.keyPath : column.name;
						const options = ("options" in column) ? column.options : { unique: false };
						table.createIndex(column.name, keyPath, options);
					}
				}
			});
		};
	});
}

export default { connect };
