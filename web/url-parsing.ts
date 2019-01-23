// ┌──────────┬──┬──────────┬──────────┬──────────────┬──────┬──────────┬─┬──────────────┬───────┐
// "  https:   //    user   :   pass   @ sub.host.com : 8080   /p/a/t/h  ?  query=string   #hash "
// ├──────────┼──┼──────────┼──────────┼──────────────┼──────┼──────────┼─┼──────────────┼───────┤
// │          │  │ username │ password │   hostname   │ port │          │ │    query     │       │
// │          │  ├──────────┴──────────┼──────────────┴──────┤          ├─┴──────────────┤       │
// │ protocol │  │        auth         │        host         │ pathname │    search      │       │
// ├──────────┴──┼─────────────────────┼─────────────────────┼──────────┴────────────────┤       │
// │   origin    │                     │       origin        │           path            │ hash  │
// ├─────────────┴─────────────────────┴─────────────────────┴───────────────────────────┴───────┤
// │                                            href                                             │
// └─────────────────────────────────────────────────────────────────────────────────────────────┘

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: URL module ::::::::
// ────────────────────────────────────────────────────────────────────────────
//

import { parse as urlParse, URL } from 'url'

//
// ═════════ Legacy API  ═════════
//
// https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost
console.log('query as String via Legacy API:', urlParse('google.fr/search?q=yolo').query)
console.log('query as Object via Legacy API:', urlParse('google.fr/search?q=yolo', true).query)

//
// ═════════ WHATWG API  ═════════
//
// https://nodejs.org/api/url.html#url_url_search | https://nodejs.org/api/url.html#url_class_urlsearchparams
console.log('search as String via WWHATWG API:', new URL('https://google.fr/search?q=yolo').search)
console.log('query as Map via WWHATWG API:', new URL('https://google.fr/search?q=yolo').searchParams)

//
// ────────────────────────────────────────────────────────────────────────────
//   :::::::: Querystring module ::::::::
// ────────────────────────────────────────────────────────────────────────────
//

import { parse as qsParse, stringify as qsStringify } from 'querystring'

const qObject = { name: 'Yo Lo', age: '78' }
console.log('query from Object to String:', qsStringify(qObject))

const qString = 'name=Yo%20Lo&age=78'
console.log('query from String to Object:', qsParse(qString))
