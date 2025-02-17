function BytesToBase64(bytes) {
	const binStr = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join(
		""
	);
	return btoa(binStr);
}
function Base64ToBytes(value) {
	const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
	return bytes;
}

function Decode64(value) {
	const bytes = Base64ToBytes(value);
	return new TextDecoder().decode(bytes);
}
function Encode64(value) {
	const bytes = new TextEncoder().encode(value);
	const res = BytesToBase64(bytes);
	return res;
}
function DecodeObj64(obj) {
	for (const [key, value] of Object.entries(obj)) {
		obj[key] = Decode64(value);
	}
}
function EncodeObj64(obj) {
	for (const [key, value] of Object.entries(obj)) {
		obj[key] = Encode64(value);
	}
}

function GetURLParams() {
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	const str = JSON.stringify(params);
	return str;
}

async function FetchSendJSON(url, body) {
	const res = await fetch(url, {
		method: "POST",
		body: body,
		headers: {
			"Content-Type": "application/json",
		},
	});
	return res;
}
async function FetchJSON(url, body) {
	const res = await FetchSendJSON(url, body);
	const text = await res.text();
	const pars = JSON.parse(text);
	return pars;
}
export default {
	BytesToBase64,
	Base64ToBytes,
	Decode64,
	Encode64,
	DecodeObj64,
	EncodeObj64,
	FetchSendJSON,
	FetchJSON,
	GetURLParams,
};
