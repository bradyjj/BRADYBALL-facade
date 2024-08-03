import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FontService {
    constructor(private http: HttpClient) { }

    getBase64Font(fontUrl: string): Observable<string> {
        console.log('Fetching font:', fontUrl);
        return this.http.get(fontUrl, { responseType: 'arraybuffer' })
            .pipe(
                map(buffer => {
                    console.log('Font data received, length:', buffer.byteLength);
                    const uint8Array = new Uint8Array(buffer);
                    let binary = '';
                    uint8Array.forEach(byte => binary += String.fromCharCode(byte));
                    const base64 = btoa(binary);
                    console.log('Base64 font data length:', base64.length);
                    return base64;
                })
            );
    }
}