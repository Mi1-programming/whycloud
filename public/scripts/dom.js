class DomFile {
	constructor(props) {
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
		container.appendChild(down);
		const del = document.createElement("button");
		del.innerText = "Delete";
		container.appendChild(del);

		controls.appendChild(container);
		newRow.appendChild(controls);
	}
}
