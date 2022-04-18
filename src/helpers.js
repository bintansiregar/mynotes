import EncryptedStorage from "react-native-encrypted-storage";

export const verifyToken = async (state) => {
    let result = {
        success: false,
        message: null,
        data: null
    }

    try {
        
        const serverAddress = await EncryptedStorage.getItem('serverAddress');
        const accessToken = await EncryptedStorage.getItem('accessToken');

        if(!accessToken) return null;

        result.data = await fetch(`${serverAddress}/auth/verify-token/`, {
            method: 'GET',
            headers: {
            'auth-token': accessToken
            }
        })
    
        result.data = await result.data.json();
    
        if(!result.data.success) throw new Error(result.data.message);

        result.success = true;
    } catch(error) {
        console.warn(error)
    
        await EncryptedStorage.removeItem("accessToken");
        await EncryptedStorage.removeItem("userData");
        await EncryptedStorage.removeItem("notes");
        result.message = error;
    }

    return result;
}

export const restoreState = async() => {
    let result = {
        success: false,
        message: null,
        data: {
            notes: null,
            serverAddress: null
        }
    }

    try {
        result.data.notes = await EncryptedStorage.getItem('notes') || "[]";
        result.data.serverAddress = await EncryptedStorage.getItem('serverAddress');

        if(!result.data.serverAddress) {
            await EncryptedStorage.setItem('serverAddress', 'https://mynotes-api.vercel.app');
            result.data.serverAddress = 'https://mynotes-api.vercel.app';
        }
        result.success = true;
    } catch(error) {
        console.warn(error)
        result.message = error;
    }

    return result;
};

export const init = async(state, update) => {
    console.log('Restoring state...')

    const resultRestoreState = await restoreState();
    
    if(resultRestoreState.success) {
        console.log('Restoring state done!')
    } else {
        console.log('Restoring state failed!')
    }

    if (state.isReady) return;

    console.log('Verify token...')

    const resultToken = await verifyToken(state, update);

    if(resultToken === null) {
        console.log('Token not found!');
    } else if(resultToken.success) {
        console.log('Token verified!');
    } else {
        console.log('Token verification failed!');
    }

    console.log('Saving all states...');

    if(resultToken != null && resultToken.success) {console.log(resultToken)
        update((prevState) => ({
            ...prevState,
            serverAddress: resultRestoreState.data.serverAddress,
            accessToken: resultToken.data.accessToken,
            userData: resultToken.data.userData,
            notes: JSON.parse(resultRestoreState.data.notes).reverse(),
            isAuthenticated: resultToken.data.success,
            isLoading: false,
            isReady: true
        }));
    } else {
        update(prevState => ({
            ...prevState,
            serverAddress: resultRestoreState.data.serverAddress,
            isReady: true,
            isLoading: false
        }));
    }
    console.log('All states saved!');
    return;
}
