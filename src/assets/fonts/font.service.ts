import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FontService {
    constructor(private http: HttpClient) { }

    getFonts(fontFiles: string[]): Observable<{ [key: string]: string }> {
        const requests = fontFiles.map(file => this.getFont(file));
        return forkJoin(requests).pipe(
            map(results => {
                const fonts: { [key: string]: string } = {};
                fontFiles.forEach((file, index) => {
                    fonts[file] = results[index];
                });
                return fonts;
            })
        );
    }

    getFont(fontFile: string): Observable<string> {
        return this.http.get(`/assets/fonts/${fontFile}`, { responseType: 'arraybuffer' })
            .pipe(
                map(buffer => this.arrayBufferToBase64(buffer))
            );
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}