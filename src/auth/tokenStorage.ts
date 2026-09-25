const TOKEN_KEY =
    'video-study:access-token';


export function saveAccessToken(
    token: string
) {

    sessionStorage.setItem(
        TOKEN_KEY,
        token
    );
}


export function getAccessToken():
    string | null {

    return sessionStorage.getItem(
        TOKEN_KEY
    );
}


export function clearAccessToken() {

    sessionStorage.removeItem(
        TOKEN_KEY
    );
}