// https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa

function Decode64(value) {
	const binStr = atob(value);
	const bytes = Uint8Array.from(binStr, (m) => m.codePointAt(0));
	return new TextDecoder().decode(bytes)
}
function Encode64(value) {
	const bytes = new TextEncoder().encode(value)
	const binStr = Array.from(bytes, (byte) =>
		String.fromCodePoint(byte),
	).join("");
	return btoa(binStr);
}
function DecodeObj64(obj) {
	for (const [key, value] of Object.entries(obj)) {
		obj[key] = Decode64(value)
	}
}
function EncodeObj64(obj) {
	for (const [key, value] of Object.entries(obj)) {
		obj[key] = Encode64(value)
	}
}

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function GetURLParams() {
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	const str = JSON.stringify(params)
	return str
}

async function FetchSendJSON(url, body) {
	const res = await fetch(url, { method: "POST", body: body, headers: {
		"Content-Type": "application/json"
	}});
	return res
}
async function FetchJSON(url, body) {
	const res = await FetchSendJSON(url, body)
	const text = await res.text()
	const pars = JSON.parse(text)
	return pars
}
function Read(file, callback) {
	const reader = new FileReader();
	reader.onload = (e) => {
		callback(e.target.result);
	};
	reader.readAsText(file);
}
export default {
	Decode64,
	Encode64,
	DecodeObj64,
	EncodeObj64,
	FetchSendJSON,
	FetchJSON,
	GetURLParams,
	Read
};
