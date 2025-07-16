import { Component, ViewChild, ElementRef } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
	selector: 'about-content',
	templateUrl: './about-content.component.html',
	styleUrls: ['./about-content.component.scss'],
})
export class AboutContentComponent {
	@ViewChild('resumeContent') resumeContent!: ElementRef;

	async downloadResume() {
		// Get the resume element
		const resumeElement = document.querySelector('resume .vintage-resume') as HTMLElement;

		if (resumeElement) {
			// Add PDF export class for styling
			resumeElement.classList.add('pdf-export');

			try {
				// Use higher scale for better quality
				const canvas = await html2canvas(resumeElement, {
					scale: 2,
					useCORS: true,
					logging: false,
					backgroundColor: '#FFFFFF',
					// Match exact dimensions
					width: resumeElement.offsetWidth,
					height: resumeElement.offsetHeight,
				});

				// Create PDF with proper A4 dimensions
				const pdf = new jsPDF({
					orientation: 'portrait',
					unit: 'mm',
					format: 'a4',
				});

				// Calculate the width and height ratios to maintain aspect ratio
				const imgWidth = 210; // A4 width in mm
				const imgHeight = (canvas.height * imgWidth) / canvas.width;

				// Add the image to fill the page width
				const imgData = canvas.toDataURL('image/png');
				pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

				// Save the PDF with the requested filename
				pdf.save('jacobsBradyResume.pdf');
			} catch (error) {
				console.error('Error generating PDF:', error);
			} finally {
				// Remove temporary class
				resumeElement.classList.remove('pdf-export');
			}
		}
	}
}
