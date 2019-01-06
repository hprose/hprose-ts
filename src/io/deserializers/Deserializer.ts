/*--------------------------------------------------------*\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: http://www.hprose.com/                 |
|                   http://www.hprose.org/                 |
|                                                          |
\*________________________________________________________*/
/*--------------------------------------------------------*\
|                                                          |
| hprose/io/Deserializer.ts                                |
|                                                          |
| hprose Deserializer interface for TypeScript.            |
|                                                          |
| LastModified: Jan 6, 2019                                |
| Author: Ma Bingyao <andot@hprose.com>                    |
|                                                          |
\*________________________________________________________*/

import { Reader } from './Reader';

export interface Deserializer {
    read(reader: Reader, tag: number): any;
    deserialize(reader: Reader): any;
}