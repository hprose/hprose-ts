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
| hprose/rpc/node/HttpService.ts                           |
|                                                          |
| hprose HttpService for TypeScript.                       |
|                                                          |
| LastModified: Jan 9, 2019                                |
| Author: Ma Bingyao <andot@hprose.com>                    |
|                                                          |
\*________________________________________________________*/

import { Service } from '../Service';
import * as http from 'http';
import * as fs from 'fs';
import { ServiceContext } from '../ServiceContext';
import { ByteStream } from '../../hprose.io';

const lastModified = (new Date()).toUTCString();
const etag = '"' + Math.floor(Math.random() * 2147483647).toString(16) +
    ':' + Math.floor(Math.random() * 2147483647).toString(16) + '"';
const empty = new Uint8Array(0);

export class HttpServiceContext extends ServiceContext {
    constructor(service: Service, public request: http.IncomingMessage, public response: http.ServerResponse) {
        super(service);
    }
}

export class HttpService extends Service {
    public p3p: boolean = true;
    public get: boolean = true;
    public crossDomain: boolean = true;
    private origins: { [origin: string]: boolean } = Object.create(null);
    private originCount: number = 0;
    private _crossDomainXmlFile: string = '';
    private _crossDomainXmlContent: Buffer = new Buffer(0);
    private _clientAccessPolicyXmlFile: string = '';
    private _clientAccessPolicyXmlContent: Buffer = new Buffer(0);

    protected crossDomainXmlHandler(request: http.IncomingMessage, response: http.ServerResponse): boolean {
        if (request.url && request.url.toLowerCase() === '/crossdomain.xml') {
            if (request.headers['if-modified-since'] === lastModified &&
                request.headers['if-none-match'] === etag) {
                response.statusCode = 304;
            }
            else {
                response.setHeader('Last-Modified', lastModified);
                response.setHeader('Etag', etag);
                response.setHeader('Content-Type', 'text/xml');
                response.setHeader('Content-Length', this._crossDomainXmlContent.length);
                response.write(this._crossDomainXmlContent);
            }
            response.end();
            return true;
        }
        return false;
    }

    protected clientAccessPolicyXmlHandler(request: http.IncomingMessage, response: http.ServerResponse): boolean {
        if (request.url && request.url.toLowerCase() === '/clientaccesspolicy.xml') {
            if (request.headers['if-modified-since'] === lastModified &&
                request.headers['if-none-match'] === etag) {
                response.statusCode = 304;
            }
            else {
                response.setHeader('Last-Modified', lastModified);
                response.setHeader('Etag', etag);
                response.setHeader('Content-Type', 'text/xml');
                response.setHeader('Content-Length', this._clientAccessPolicyXmlContent.length);
                response.write(this._clientAccessPolicyXmlContent);
            }
            response.end();
            return true;
        }
        return false;
    }

    protected sendHeader(request: http.IncomingMessage, response: http.ServerResponse) {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        if (this.p3p) {
            response.setHeader('P3P',
                'CP="CAO DSP COR CUR ADM DEV TAI PSA PSD IVAi IVDi ' +
                'CONi TELo OTPi OUR DELi SAMi OTRi UNRi PUBi IND PHY ONL ' +
                'UNI PUR FIN COM NAV INT DEM CNT STA POL HEA PRE GOV"');
        }
        if (this.crossDomain) {
            const origin = request.headers['origin'];
            if (typeof origin === 'string' && origin !== 'null') {
                if (this.originCount === 0 || this.origins[origin]) {
                    response.setHeader('Access-Control-Allow-Origin', origin);
                    response.setHeader('Access-Control-Allow-Credentials', 'true');
                }
            }
            else {
                response.setHeader('Access-Control-Allow-Origin', '*');
            }
        }
    }

    protected end(data: Uint8Array, response: http.ServerResponse) {
        response.setHeader('Content-Length', data.length);
        response.end(Buffer.from(data.buffer, data.byteOffset, data.length));
    }

    public addAccessControlAllowOrigin(origin: string) {
        if (!this.origins[origin]) {
            this.origins[origin] = true;
            this.originCount++;
        }
    }

    public removeAccessControlAllowOrigin(origin: string) {
        if (this.origins[origin]) {
            delete this.origins[origin];
            this.originCount--;
        }
    }

    public get crossDomainXmlFile(): string {
        return this._crossDomainXmlFile;
    }

    public set crossDomainXmlFile(value: string) {
        this._crossDomainXmlFile = value;
        this._crossDomainXmlContent = fs.readFileSync(this._crossDomainXmlFile);
    }

    public get crossDomainXmlContent(): Buffer {
        return this._crossDomainXmlContent;
    }

    public set crossDomainXmlContent(value: Buffer) {
        this._crossDomainXmlFile = '';
        this._crossDomainXmlContent = value;
    }

    public get clientAccessPolicyXmlFile(): string {
        return this._clientAccessPolicyXmlFile;
    }

    public set clientAccessPolicyXmlFile(value: string) {
        this._clientAccessPolicyXmlFile = value;
        this._clientAccessPolicyXmlContent = fs.readFileSync(this._clientAccessPolicyXmlFile);
    }

    public get clientAccessPolicyXmlContent(): Buffer {
        return this._clientAccessPolicyXmlContent;
    }

    public set clientAccessPolicyXmlContent(value: Buffer) {
        this._clientAccessPolicyXmlFile = '';
        this._clientAccessPolicyXmlContent = value;
    }

    public httpHandler(request: http.IncomingMessage, response: http.ServerResponse): Promise<undefined> {
        const context = new HttpServiceContext(this, request, response);
        request.socket.setTimeout(this.timeout);
        const size = request.headers['content-length'];
        const bytes = size ? new ByteStream(parseInt(size, 10)) : new ByteStream();
        request.on('data', function (chunk: Buffer) {
            bytes.write(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.length));
        });
        return new Promise<any>((resolve, reject) => {
            request.on('end', async () => {
                if (this._clientAccessPolicyXmlContent.length > 0
                    && this.clientAccessPolicyXmlHandler(request, response)) {
                    return resolve();
                }
                if (this._crossDomainXmlContent.length > 0
                    && this.crossDomainXmlHandler(request, response)) {
                    return resolve();
                }
                let result: Uint8Array;
                switch (request.method) {
                    case 'GET':
                        if (!this.get) {
                            response.statusCode = 403;
                            response.statusMessage = 'Forbidden';
                            return resolve();
                        }
                    // tslint:disable-next-line:no-switch-case-fall-through
                    case 'POST':
                        result = await this.handle(bytes.takeBytes(), context);
                        break;
                    default:
                        result = empty;
                }
                try {
                    this.sendHeader(request, response);
                }
                catch (e) {
                    return reject(e);
                }
                this.end(result, response);
                resolve();
            });
        });
    }
}