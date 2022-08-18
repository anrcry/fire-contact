
const { PUBLIC_VERIFY_ENDPOINT = "http://localhost:3000/verify" } = import.meta.env

const URL_COMPARE_REGEX = new RegExp(/^(((ht|f)tps?):\/\/)+[\w-]+([localhost]|(\.[\w-]+))+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/);

const verifyToken = async ( token ) => {
    
    if( ! ( PUBLIC_VERIFY_ENDPOINT.length !==0 && PUBLIC_VERIFY_ENDPOINT.match(URL_COMPARE_REGEX) ) ){
        throw Error("Specify a valid endpoint to verify the token");
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
    
    const response = await fetch( PUBLIC_VERIFY_ENDPOINT , {
        redirect: 'follow',
        ...fetchOpts,
    });

    return response.json();
}

export {
    verifyToken
}