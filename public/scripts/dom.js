class DomFile {
	constructor(id, props) {
		this.id = id;
		this.props = props;
	}
	MakeDom(parentId) {
		const parent = document.getElementById(parentId);
		const newRow = document.createElement("tr");
		parent.appendChild(newRow);
		this.props.forEach((elem) => {
			const newCol = document.createElement("td");
			newCol.innerText = elem;
			newRow.appendChild(newCol);
		});

		const controls = document.createElement("td");
		const container = document.createElement("div");

		const down = document.createElement("button");
		down.innerText = "Download";
		down.addEventListener("click", () => {
			console.log(`Download of ${this.id} started!`);
		});
		container.appendChild(down);

		const del = document.createElement("button");
		del.innerText = "Delete";
		del.addEventListener("click", () => {
			location.assign(`delete?id=${this.id}`);
		});
		container.appendChild(del);

		controls.appendChild(container);
		newRow.appendChild(controls);
	}
}
