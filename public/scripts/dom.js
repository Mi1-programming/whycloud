import fileJS from "/static/scripts/file.js";

class File {
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

		const edit = document.createElement("button");
		edit.innerText = "Edit";
		edit.addEventListener("click", () => {
			location.assign(`edit?id=${this.id}`);
		});
		container.appendChild(edit);

		const down = document.createElement("button");
		down.innerText = "Download";
		down.addEventListener("click", async () => {
			const data = {
				id: this.id
			}
			const strData = JSON.stringify(data)

			const res = await fileJS.FetchJSON("/download", strData)
			fileJS.DecodeObj64(res)

			const link = document.createElement("a")
			document.body.appendChild(link)
			link.style = "display: none"
			const blob = new Blob([res.data], {type: "octet/stream"})
			const url = window.URL.createObjectURL(blob)
			link.href = url;
			link.download = res.name;
			link.click();
			window.URL.revokeObjectURL(url);
			link.remove()
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
export default {
	File,
};
