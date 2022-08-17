
const { PUBLIC_VERIFY_ENPOINT = 'http://localhost:3000/verify' } = import.meta.env

const URL_COMPARE_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)

const verifyToken = async ( token ) => {
    if( PUBLIC_VERIFY_ENPOINT.length === 0 || PUBLIC_VERIFY_ENPOINT.match(URL_COMPARE_REGEX) ){
        // This won't work
        throw Error(`Specify a valid endpoint to verify the token`);
    }

    if( typeof token !== 'string' || token.length === 0 ){
        throw Error(`The token ${token} provided is invalid`);
    }

    const fetchOpts = Object.freeze({
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({token}),
    })

    const response = await fetch( PUBLIC_VERIFY_ENPOINT , {
        redirect: 'follow',
        ...fetchOpts,
    });

    return response.json();
}

export {
    verifyToken
}