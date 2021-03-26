const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

const cognitoIssuer = `https://cognito-idp.us-east-1.amazonaws.com/us-east-2_5GvAzSWkt`;

const jwks = {
    "keys": [
        {
            "alg": "RS256",
            "e": "AQAB",
            "kid": "g8jUkoagxFIU+MsPsVIYdqUUeyuWxJZQDpM94mZjWDo=",
            "kty": "RSA",
            "n": "nmZx5Hfl1pR8a6vT4C7LGFKIkI9FrANXa2XtGTskxgmnVfSCev7jVyAOiXK6eYeka-wrZL_xPI1pbRVmM2fFI0kiGASag9Fi6n-sLGjz8gJ_hCxDyf2alXCmj-_usSPpp4-kGDIgiec2aaxVIauwH-RAmDKxq2UQ15VznoJ2HxZSZzsjuEw1SU3q0dUwK71WSbMYFOz1tsZFuM-rnuxM1vkafOAJzfepROpunbxjydilK9Y5nhhY1HYi6L-VWccbaQqDZlAwPGbSSnwPtiDkGaxffK3-nbvD9aGOnLJNWV354GT7mhf_n2-qlV7ib9mo0q13K42xblRYkAZeJnLN6w",
            "use": "sig"
        },
        {
            "alg": "RS256",
            "e": "AQAB",
            "kid": "kKlkP3IfwHR2rDTK1nOsm6UCCsFSf9E0Lvo/P7KgWQo=",
            "kty": "RSA",
            "n": "ypSxuRpSP3FrAOrodowyiMncg6K46v339ylmgkfGO9CZEvIeBoW-yJhzYXqj79x9AikXjvtUTfQhlHaqJyP2CAmH0ZnIU54yivjXcp4XBAsvprgXWvGmC3XjBlmvWMHuilnNuLASa9_kE974qtanQl3NWYk9JZ5RbPYUp0R3uk5X3dBFDdEUMZTGzNAod-51powgRv8N0SO1kqEmbrx6YRfasWBvek8RX_wx0HbnJpFeJWjKQdGYZGS9QUVuPSltUthzzPES4hU9uMxHv49l11SVBXoU-G0vP8fT5eIcKq4klyWgvSlwXALxerWhOYOvCWAM2xPsM5Upuqb3DvjKWw",
            "use": "sig"
        }
    ]
};

const decode = (token) => {
    const tokenSections = (token || '').split('.');
    if (tokenSections.length < 2) {
        throw new Error('requested token is invalid');
    }
    const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJSON);
    const jwk = jwks[header.kid];
    if (jwk === undefined) {
        throw new Error('claim made for unknown kid');
    }
    const pem = jwkToPem(jwk);

    const decoded = jwt.verify(token, pem, {algorithms: ['RS256']})

    // const currentSeconds = Math.floor((new Date()).valueOf() / 1000);
    // if (currentSeconds > decoded.exp || currentSeconds < decoded.auth_time) {
    //     throw new Error('claim is expired or invalid');
    // }
    // if (decoded.iss !== cognitoIssuer) {
    //     throw new Error('claim issuer is invalid');
    // }

    return decoded;
};

module.exports = {
    decode
};