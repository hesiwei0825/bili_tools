'use strict';

const fetch = require("node-fetch");

const getParamString = (queryObj) => {
    let paramArray = [];
    Object.keys(queryObj).map(k =>
        paramArray.push(`${k}=${queryObj[k]}`)
    )
    return paramArray.join('&');
}

exports.main_handler = (event, context, callback) => {

    const web_playurl = 'https://api.bilibili.com/pgc/player/web/playurl';
    const app_playurl = 'https://api.bilibili.com/pgc/player/api/playurl';

    const paramString = getParamString(event.queryString);

    const isApp = event.queryString.platform && event.queryString.platform === 'android'
    const fetchUrl = `${isApp ? app_playurl : web_playurl}?${paramString}`

    let callbackHeaders = {};

    fetch(fetchUrl, {
        body: event.body,
        method: event.httpMethod,
        headers: {
            ...event.headers,
            'host': '',
            'accept-encoding':'', //raw
        }
    })
        .then(res => {
            res.headers.forEach((value, name) => {
                callbackHeaders[name] = value;
            });
            return res.json()
        })
        .then(data => {
            return callback(null, {
                'isBase64Encoded': false,
                'statusCode': 200,
                'headers': callbackHeaders,
                'body': JSON.stringify(data)
            })
        })
        .catch(reason => {
            callback(reason, {
                'statusCode': 502,
                'headers': {
                    'Content-Type': 'text/plain',
                },
                'body': 'No Response'
            })
        })
};