export const ACCESS_TOKEN_KEY =
    'video-study:access-token';


export function getAccessToken() {

    return sessionStorage
        .getItem(
            ACCESS_TOKEN_KEY
        );

}


export function saveAccessToken(
    token:
        string
) {

    sessionStorage
        .setItem(
            ACCESS_TOKEN_KEY,
            token
        );

}


export function clearAccessToken() {

    sessionStorage
        .removeItem(
            ACCESS_TOKEN_KEY
        );

}