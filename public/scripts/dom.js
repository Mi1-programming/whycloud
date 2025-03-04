import fileJS from "/static/scripts/file.js";

const selected = {};

class File {
	constructor(id, props) {
		this.id = id;
		this.props = props;
		this.selector = undefined;
	}
	Select() {
		this.selector.classList.add("select");
		selected[this.id] = this;
	}
	Deselect() {
		this.selector.classList.remove("select");
		delete selected[this.id];
	}
	MakeDom(parentId) {
		const parent = document.getElementById(parentId);
		const newRow = document.createElement("tr");

		this.selector = document.createElement("td");

		this.selector.classList = "selector";
		if (selected[this.id] != undefined) {
			newColumn.classList.add("select");
		}
		this.selector.addEventListener("click", () => {
			if (selected[this.id] == undefined) {
				this.Select();
				return;
			}
			this.Deselect();
		});
		newRow.appendChild(this.selector);

		parent.appendChild(newRow);
		this.props.forEach((elem) => {
			const newColumn = document.createElement("td");
			newColumn.innerText = elem;
			newRow.appendChild(newColumn);
		});

		const controls = document.createElement("td");
		const container = document.createElement("div");

		controls.appendChild(container);
		newRow.appendChild(controls);
	}
	async Download() {
		const data = {
			id: this.id,
		};
		const strData = JSON.stringify(data);

		const res = await fileJS.FetchJSON("/download", strData);

		const fileData = fileJS.Base64ToBytes(res.data);
		const name = fileJS.Decode64(res.name);

		const link = document.createElement("a");
		document.body.appendChild(link);
		link.style = "display: none";
		const blob = new Blob([fileData], { type: "octet/stream" });
		const url = window.URL.createObjectURL(blob);
		link.href = url;
		link.download = name;
		link.click();
		window.URL.revokeObjectURL(url);
		link.remove();
	}
}
export default {
	File,
	selected,
};
