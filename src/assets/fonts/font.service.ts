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
        return this.http.get(fontUrl, { responseType: 'arraybuffer' })
            .pipe(
                map(buffer => {
                    const uint8Array = new Uint8Array(buffer);
                    let binary = '';
                    uint8Array.forEach(byte => binary += String.fromCharCode(byte));
                    const base64 = btoa(binary);
                    return base64;
                })
            );
    }
}