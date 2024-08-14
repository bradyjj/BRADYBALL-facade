import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { FontService } from "../../../assets/fonts/font.service";

@Injectable({
    providedIn: 'root'
})
export class BRADYBALLCardUtil {
    constructor(private fontService: FontService) { }

    public getCssVariableValue(variableName: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    }

    public saveSVG(svg: SVGElement, filename: string, fonts: string[] = ['courier-prime.woff2']): void {
        this.getEmbeddedFonts(fonts).subscribe(embeddedFonts => {
            const svgNS = "http://www.w3.org/2000/svg";
            const newSvg = document.createElementNS(svgNS, "svg");
            newSvg.setAttribute('width', svg.getAttribute('width') || '');
            newSvg.setAttribute('height', svg.getAttribute('height') || '');
            newSvg.setAttribute('xmlns', "http://www.w3.org/2000/svg");

            // Clone the entire SVG content
            const svgContent = svg.cloneNode(true);
            newSvg.appendChild(svgContent);

            // Add embedded styles
            const style = document.createElementNS(svgNS, "style");
            style.textContent = this.getEmbeddedStyles(embeddedFonts);
            newSvg.insertBefore(style, newSvg.firstChild);

            // Convert the SVG to a string
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(newSvg);

            // Add XML declaration
            svgString = '<?xml version="1.0" standalone="no"?>\n' + svgString;

            // Create a Blob with the SVG string
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

            // Create a download link and trigger the download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(svgBlob);
            link.download = filename;
            link.click();
        });
    }

    private getEmbeddedFonts(fonts: string[]): Observable<{ [key: string]: string }> {
        return new Observable(observer => {
            const embeddedFonts: { [key: string]: string } = {};
            let completedFonts = 0;

            fonts.forEach(font => {
                this.fontService.getBase64Font(`/assets/fonts/${font}`).subscribe(
                    base64Font => {
                        embeddedFonts[font] = base64Font;
                        completedFonts++;
                        if (completedFonts === fonts.length) {
                            observer.next(embeddedFonts);
                            observer.complete();
                        }
                    },
                    error => {
                        console.error(`Error loading font ${font}:`, error);
                        completedFonts++;
                        if (completedFonts === fonts.length) {
                            observer.next(embeddedFonts);
                            observer.complete();
                        }
                    }
                );
            });
        });
    }

    private getEmbeddedStyles(embeddedFonts: { [key: string]: string }): string {
        let fontFaces = '';
        for (const [fontName, base64Font] of Object.entries(embeddedFonts)) {
            const fontFamily = fontName.split('.')[0].replace(/-/g, ' ');
            fontFaces += `
                @font-face {
                    font-family: '${fontFamily}';
                    src: url(data:application/font-woff2;charset=utf-8;base64,${base64Font}) format('woff2');
                    font-weight: normal;
                    font-style: normal;
                }
            `;
        }

        return `
            ${fontFaces}
            
            :root {
                --bb-black-color: #000000;
                --bb-white-color: #ffffff;
                --bb-brown-gold-color: #b07c29;
                --bb-red-color: #972828;
                --bb-dark-red-burgundy-color: #681e1e;
                --bb-orange-color: #ff5b00;
                --bb-blue-color: #405e9b;
                --bb-cream-off-white-color: #f8f5e3;
                --bb-green-color: #59c135;
            }
            text {
                font-family: 'Courier Prime', monospace;
            }
        `;
    }
}