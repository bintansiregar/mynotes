import React from 'react';

export const initState = {
	isAuthenticated: false,
	accessToken: null,
	userData: null,
	isLoading: true,
	loadingMessage: '',
	notesSynced: false,
	notesSyncing: false,
	notes: null,
	serverAddress: 'https://mynotes-api.vercel.app',
	isReady: false
}

const defaultUpdate = () => initState;
export const Context = React.createContext({
	state: initState,
	update: defaultUpdate,
});

export function Provider(props) {
	const [state, update] = React.useState(initState);

	return <Context.Provider value={{ state, update }} {...props} />;
}
