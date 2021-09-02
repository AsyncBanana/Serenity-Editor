export default function deepCopy(src) {
	const target = Array.isArray(src) ? [] : {};
	for (const prop in src) {
		const value = src[prop];
		if (value && typeof value === "object") {
			target[prop] = deepCopy(value);
		} else {
			target[prop] = value;
		}
	}
	return target;
}
