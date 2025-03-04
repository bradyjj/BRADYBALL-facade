import { Component, ViewChild, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
    selector: 'resume',
    templateUrl: './resume.component.html',
    styleUrls: ['./resume.component.scss']
})
export class ResumeComponent {
    @ViewChild('resumeContent') resumeContent!: ElementRef;

    contact = {
        email: 'bradyjjacobs@gmail.com',
        phone: '(864)-499-6768',
        github: 'github.com/bradyjj',
        linkedin: 'linkedin.com/in/bradyjjacobs'
    };

    education = {
        school: 'Clemson University',
        degree: 'Bachelor of Science in Computer Science',
        minor: 'Minor in Business Administration',
        date: 'May 2023',
        gpa: '3.92',
        honors: 'Magna Cum Laude',
        highlights: [
            'Lead Teaching Assistant for CPSC 1060 (Introduction to Java) and CPSC 1010 (Introduction to Computer Science)',
            'Led 4-person capstone team conducting ATD market analysis by integrating web-scraped external data with customer datasets in a Snowflake data warehouse, identifying market opportunities through Tableau and PowerBI visualizations'
        ],
        coursework: [
            'Advanced Machine Learning',
            'Applied Data Science',
            'Cloud Computing Architecture',
            'Linear Algebra',
        ]
    };

    experience = [
        {
            title: 'Full-stack Software Engineer',
            company: 'Manhattan Associates',
            location: 'Atlanta, GA',
            date: 'June 2023 - Present',
            previousRole: 'Software Engineering Intern (May 2022 - August 2022)',
            points: [
                'Recognized with "Rookie Rockstar" award for exceptional technical performance and rapid integration into the team.',
                'Developed and maintained full-stack applications using Java and AngularJS, ensuring >90% test coverage for high-quality code.',
                'Redesigned and developed superior replacements to two business-critical legacy systems, enhancing overall system performance and stability while ensuring reliablity.',
                'Resolved outage incidents for multiple Fortune 500 clients during peak season, demonstrating strong problem-solving skills across various functional areas in Order Management.'
            ]
        },
        {
            title: 'Machine Learning Research Assistant',
            company: 'Watt AI Research Lab, Clemson University',
            location: 'Clemson, SC',
            date: 'August 2021 - December 2021',
            points: [
                'Developed and implemented linguistic machine learning models and data processing pipelines, leveraging the Clemson Palmetto Cluster Supercomputer for large-scale narrative and disinformation analysis on social media.',
                'Conducted research on narrative pattern analysis and applied advanced statistical methods for detecting disinformation and analyzing extensive datasets.'
            ]
        }
    ];

    projects = {
        title: 'BRADYBALL - Sports Analytics Platform',
        type: 'Independent Research & Development Project',
        date: 'March 2024 - Present',
        points: [
            'Developed a comprehensive sports analytics platform, integrating data science, machine learning techniques, and custom data visualization using D3.js',
            'Designed and implemented a scalable microservices architecture with Python, FastAPI, and Redis to support advanced sports performance analysis and visualizations.',
        ]
    };

    skills = {
        'Technical Development': {
            'Programming Languages': ['Java', 'Python', 'C/C++', 'JavaScript'],
            'Web Technologies': ['AngularJS', 'HTML/CSS', 'REST APIs'],
            'Database & Storage': ['MySQL', 'PostgreSQL', 'Redis', 'Snowflake', 'Prometheus']
        },
        'Data Science & Analytics': {
            'Machine Learning': ['Statistical Modeling', 'NLP', 'Algorithm Development'],
            'Data Analysis': ['Data Engineering', 'ETL Pipelines'],
            'Visualization': ['D3.js', 'PowerBI', 'Tableau']
        },
        'Tools & Infrastructure': {
            'Cloud Platforms': ['AWS', 'Google Cloud Platform'],
            'DevOps': ['Docker', 'Git', 'CI/CD'],
        }
    };

    async printPDF() {
        // Store original styles
        const originalOverflow = document.body.style.overflow;
        const originalBodyHeight = document.body.style.height;
        const originalContentHeight = this.resumeContent.nativeElement.style.height;
        
        try {
            // Set fixed dimensions to force single page
            document.body.style.overflow = 'hidden';
            document.body.style.height = '11in';
            this.resumeContent.nativeElement.style.height = '11in';
            
            // Add print-specific class
            this.resumeContent.nativeElement.classList.add('printing');
            
            // Print
            window.print();
            
        } finally {
            // Restore all original styles
            document.body.style.overflow = originalOverflow;
            document.body.style.height = originalBodyHeight;
            this.resumeContent.nativeElement.style.height = originalContentHeight;
            this.resumeContent.nativeElement.classList.remove('printing');
        }
    }

    async downloadPDF() {
        // Add a loading indicator or spinner here if desired
        const resumeElement = this.resumeContent.nativeElement;
        
        // Store original styles
        const originalWidth = resumeElement.style.width;
        const originalHeight = resumeElement.style.height;
        
        try {
            // Optional: Add print-specific CSS class for better PDF rendering
            resumeElement.classList.add('for-pdf-export');
            
            // Set specific width for better quality (letter size paper)
            resumeElement.style.width = '8.5in';
            
            // Create canvas from the DOM element
            const canvas = await html2canvas(resumeElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            // Calculate the height of the PDF based on the canvas ratio
            const imgWidth = 210; // A4 width in mm (8.27 inches)
            const pageHeight = 297; // A4 height in mm (11.69 inches)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Initialize PDF with A4 dimensions
            const pdf = new jsPDF('p', 'mm', 'a4');
            let position = 0;
            
            // Add image to PDF (with potential multi-page support)
            const imgData = canvas.toDataURL('image/png');
            
            // If resume fits on one page
            if (imgHeight < pageHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                // For multi-page support if needed
                let heightLeft = imgHeight;
                let currentPosition = 0;
                
                // Add first page
                pdf.addImage(imgData, 'PNG', 0, currentPosition, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                // Add subsequent pages if content is longer
                while (heightLeft > 0) {
                    currentPosition = -pageHeight * (position + 1);
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, currentPosition, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    position++;
                }
            }
            
            // Save the PDF
            pdf.save('Brady_Jacobs_Resume.pdf');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Handle error - show user message
        } finally {
            // Restore original styles
            resumeElement.style.width = originalWidth;
            resumeElement.style.height = originalHeight;
            resumeElement.classList.remove('for-pdf-export');
        }
    }
}