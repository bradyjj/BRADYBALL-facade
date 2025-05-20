import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FontService {
    public loadedFonts: { [key: string]: string } = {};

    constructor(private http: HttpClient) { }

    public loadFonts(fontFiles: string[]): Observable<{ [key: string]: string }> {
        const requests = fontFiles.map(file => {
            if (this.loadedFonts[file]) {
                return of(this.loadedFonts[file]);
            }
            return this.getFont(file).pipe(
                tap(fontData => this.loadedFonts[file] = fontData)
            );
        });

        return forkJoin(requests).pipe(
            map(results => {
                const fonts: { [key: string]: string } = {};
                fontFiles.forEach((file, index) => {
                    fonts[file] = results[index];
                });
                return fonts;
            }),
            catchError(error => {
                console.error('Error loading fonts:', error);
                return of({});
            })
        );
    }

    private getFont(fontFile: string): Observable<string> {
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

    public embedFontsInSVG(svgString: string, fonts: { [key: string]: string }): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgElement = doc.documentElement;

        // Create a style element
        const styleElement = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.setAttribute('type', 'text/css');

        // Font face declarations
        let styleContent = Object.entries(fonts).map(([filename, base64]) => {
            const fontFamily = this.getFontFamilyFromFilename(filename);
            const fontWeight = this.getFontWeightFromFilename(filename);
            const fontStyle = this.getFontStyleFromFilename(filename);
            return `
            @font-face {
                font-family: '${fontFamily}';
                font-weight: ${fontWeight};
                font-style: ${fontStyle};
                src: url(data:application/font-woff2;charset=utf-8;base64,${base64}) format('woff2');
            }
            `;
        }).join('\n');

        // Add CSS variables and classes
        styleContent += `
            :root {
                --bb-black-color: #000000;
                --bb-white-color: #ffffff;
                --bb-cream-off-white-color: #f8f5e3;
                --bb-cream-color: #ded2a2;
                --bb-red-card-color: #ad563b;
            }
            .bb-text-bold { font-weight: 700; }
            .bb-text-semibold { font-weight: 600; }
            .bb-text-medium { font-weight: 500; }
            .bb-text-extra-bold { font-weight: 800; }
            .bb-text-black { font-weight: 900; }
            .bb-text-pinegrove { font-family: 'Pinegrove', sans-serif; }
            .bb-text-special-elite { font-family: 'Special Elite', sans-serif; }
            .bb-text-league-spartan { font-family: 'League Spartan', sans-serif; }
            .bb-text-eb-garamond { font-family: 'EB Garamond', serif; }
            .bb-text-merriweather { font-family: 'Merriweather', serif; }
            .bb-text-courier-prime { font-family: 'Courier Prime', monospace; }
            .bb-text-berkeley-mono { font-family: 'TX-02', monospace; }
        `;

        styleElement.textContent = styleContent;

        // Insert the style element as the first child of the SVG
        svgElement.insertBefore(styleElement, svgElement.firstChild);

        // Ensure font properties are set on text elements
        this.ensureFontPropertiesOnTextElements(doc);

        // Serialize back to string
        return new XMLSerializer().serializeToString(doc);
    }

    private ensureFontPropertiesOnTextElements(doc: Document): void {
        doc.querySelectorAll('text, tspan').forEach(element => {
            const textElement = element as SVGTextElement | SVGTSpanElement;
            const computedStyle = window.getComputedStyle(textElement);

            // Set font-family
            const fontFamily = computedStyle.fontFamily || 'inherit';
            textElement.setAttribute('font-family', fontFamily);

            // Set font-weight
            let fontWeight = computedStyle.fontWeight;
            if (textElement.classList.contains('bb-text-bold')) fontWeight = '700';
            else if (textElement.classList.contains('bb-text-semibold')) fontWeight = '600';
            else if (textElement.classList.contains('bb-text-medium')) fontWeight = '500';
            else if (textElement.classList.contains('bb-text-extra-bold')) fontWeight = '800';
            else if (textElement.classList.contains('bb-text-black')) fontWeight = '900';
            textElement.setAttribute('font-weight', fontWeight);

            // Set color
            const color = computedStyle.color || '#000000';
            textElement.setAttribute('fill', color);

            // Explicitly set text-rendering for better font display
            textElement.setAttribute('text-rendering', 'optimizeLegibility');
        });
    }

    private getFontFamilyFromFilename(filename: string): string {
        if (filename.includes('courier-prime')) return 'Courier Prime';
        if (filename.includes('eb-garamond')) return 'EB Garamond';
        if (filename.includes('merriweather')) return 'Merriweather';
        if (filename.includes('pinegrove')) return 'Pinegrove';
        if (filename.includes('special-elite')) return 'Special Elite';
        if (filename.includes('league-spartan')) return 'League Spartan';
        if (filename.includes('TX-02')) return 'TX-02';
        return 'sans-serif';
    }

    private getFontWeightFromFilename(filename: string): string {
        if (filename.includes('bold')) return '700';
        if (filename.includes('semibold')) return '600';
        if (filename.includes('medium')) return '500';
        if (filename.includes('extra-bold')) return '800';
        if (filename.includes('black')) return '900';
        return '400';
    }

    private getFontStyleFromFilename(filename: string): string {
        return filename.includes('italic') ? 'italic' : 'normal';
    }
}