import { Injectable } from "@angular/core";
import { FontService } from "../../../assets/fonts/font.service";

@Injectable({
    providedIn: 'root'
})
export class BRADYBALLCardUtil {
    constructor(private fontService: FontService) { }

    public getCssVariableValue(variableName: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
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

        // Add class styles
        styleContent += `
            .bb-text-bold { font-weight: 700; }
            .bb-text-semibold { font-weight: 600; }
            .bb-text-medium { font-weight: 500; }
            .bb-text-extra-bold { font-weight: 800; }
            .bb-text-black { font-weight: 900; }
            .bb-text-pinegrove { font-family: 'Pinegrove', sans-serif; }
            .bb-text-special-elite { font-family: 'Special Elite', sans-serif; }
            .bb-text-league-spartan { font-family: 'League Spartan', sans-serif; }
            .bb-text-EB-garamond { font-family: 'EB Garamond', serif; }
            .bb-text-merriweather { font-family: 'Merriweather', serif; }
            .bb-text-courier-prime { font-family: 'Courier Prime', monospace; }
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
        const parts = filename.split('-');
        return parts.slice(0, -1).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    }

    private getFontWeightFromFilename(filename: string): string {
        if (filename.includes('bold')) return '700';
        if (filename.includes('semibold')) return '600';
        if (filename.includes('medium')) return '500';
        if (filename.includes('light')) return '300';
        return '400'; // normal weight
    }

    private getFontStyleFromFilename(filename: string): string {
        return filename.includes('italic') ? 'italic' : 'normal';
    }

    public saveCombinedSVG(svgElements: SVGElement[], filename: string, fonts: { [key: string]: string }): void {
        const combinedSVG = this.combineSVGElements(svgElements);
        const embeddedSVG = this.embedFontsInSVG(combinedSVG, fonts);
        this.saveSVGToFile(embeddedSVG, filename);
    }

    private combineSVGElements(svgElements: SVGElement[]): string {
        const combinedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        svgElements.forEach(element => {
            const clone = element.cloneNode(true) as SVGElement;

            if (this.isElementWithBBox(element)) {
                const bbox = element.getBBox();
                minX = Math.min(minX, bbox.x);
                minY = Math.min(minY, bbox.y);
                maxX = Math.max(maxX, bbox.x + bbox.width);
                maxY = Math.max(maxY, bbox.y + bbox.height);
            } else {
                // Fallback for elements without getBBox
                const rect = element.getBoundingClientRect();
                minX = Math.min(minX, rect.left);
                minY = Math.min(minY, rect.top);
                maxX = Math.max(maxX, rect.right);
                maxY = Math.max(maxY, rect.bottom);
            }

            combinedSvg.appendChild(clone);
        });

        const width = maxX - minX;
        const height = maxY - minY;

        combinedSvg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
        combinedSvg.setAttribute('width', width.toString());
        combinedSvg.setAttribute('height', height.toString());
        combinedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        return new XMLSerializer().serializeToString(combinedSvg);
    }

    private isElementWithBBox(element: SVGElement): element is SVGGraphicsElement {
        return 'getBBox' in element;
    }

    public saveSVGToFile(svgString: string, filename: string): void {
        const embeddedSvg = this.embedFontsInSVG(svgString, this.fontService.loadedFonts);
        const blob = new Blob([embeddedSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}