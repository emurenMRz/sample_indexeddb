import DataBase from "./modules/DataBase/index.js";

function createDataBase(createTable) {
	// Create table: The primary key is unnamed and automatically increments the sequence number.
	createTable("user", { autoIncrement: true }, ["name", "age"]);

	// Create table: The primary key name is "id" and the sequence number is specified manually.
	createTable("data", { keyPath: "id" }, ["releaseDate", "price"]);
}

try {
	const db = await DataBase.connect("sample_database", 1, createDataBase);
	const tableUser = db.user;
	const tableData = db.data;

	// Added with each reload.
	tableUser.add([
		{ name: "Alice", age: 11 },
		{ name: "Bob", age: 10 },
		{ name: "Charlie", age: 15 },
	]);

	// Error after the second time.
	tableData.add([
		{ id: 5, releaseDate: "1999/03/24", price: 1000 },
		{ id: 20, releaseDate: "2010/10/01", price: 1500 },
		{ id: 100, releaseDate: "2025/11/19", price: 3000 },
	]);

	// Items with the same ID will be overwritten.
	tableData.put([
		{ id: 100, releaseDate: "2015/01/01", price: 200 },
		{ id: 666, releaseDate: "2666/66/66", price: 3000 },
	]);

	// Show items.
	const result = await tableUser.getAllData(event => document.body.innerHTML += `<li>getAllUsers ${event.type}.</li>`);
	document.body.innerHTML += `<li>Added with each reload.</li>`
	document.body.appendChild(createTable(result, ["name", "age"]));

	const result2 = await tableData.getAllData(event => document.body.innerHTML += `<li>getAllData ${event.type}.</li>`);
	document.body.appendChild(createTable(result2, ["id", "releaseDate", "price"]));
} catch (e) {
	console.error(e);
}

///////////////////////////////////////////////////////////////////////////////

function ce(tag, ...children) {
	const e = document.createElement(tag);

	const apply = child => {
		if (!child) return;
		if (typeof child === "string" || typeof child === "number")
			e.insertAdjacentHTML("beforeend", child);
		else if (child instanceof HTMLElement)
			e.appendChild(child);
		else if (child instanceof Array)
			for (const c of child)
				apply(c);
	};

	for (const child of children)
		apply(child);

	return e;
}


function createTable(data, header) {
	return ce("table", ce("tr", header.map(w => ce("th", w))), data.map(v => ce("tr", header.map(w => ce("td", v[w])))));
}