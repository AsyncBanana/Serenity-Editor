import createAuth0Client from "@auth0/auth0-spa-js";
import { user, auth0Client } from "./authStore.js";
let userVal = null;
let auth0 = null;
user.subscribe((val) => {
	userVal = val;
});
auth0Client.subscribe((val) => {
	auth0 = val;
});
export async function init() {
	auth0Client.set(
		await createAuth0Client({
			domain: "serenityeditor.us.auth0.com",
			client_id: "zdz9ihp0rEr2tNnbp8ezyuErPq2wXQMx",
			redirect_uri: location.href,
			cacheLocation: "localstorage",
			audience: "https://serenityeditor.com/api",
		})
	);
	if (location.href.split("?").slice(1).length > 0) {
		await auth0.handleRedirectCallback();
		user.set(await auth0.getUser());
		window.history.replaceState(
			{},
			document.title,
			window.location.toString().split("?")[0]
		);
	}
	return auth0;
}
export async function login() {
	if (!auth0) {
		await init();
	}
	if (userVal) {
		return;
	}
	auth0.loginWithRedirect();
}
export async function logout() {
	await auth0.logout();
	user.set(null);
}

export function authorizedFetch(url, settings = {}) {
	return new Promise((resolve, reject) => {
		let promise = null;
		if (!userVal) {
			promise = Promise.all([auth0.getTokenSilently(), login()]);
		} else {
			promise = Promise.all([auth0.getTokenSilently()]);
		}
		promise.then(([token]) => {
			if (!settings.headers) {
				settings.headers = {};
			}
			settings.headers.Authorization = `Bearer ${token}`;
			fetch(url, settings)
				.then((value) => resolve(value))
				.catch((err) => reject(err));
		});
	});
}
