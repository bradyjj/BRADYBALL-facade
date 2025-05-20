import { Component, ViewChild, ElementRef } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
            'Led 4-person capstone team conducting market analysis for American Tire Distributors by integrating web-scraped external data with customer datasets in a Snowflake data warehouse, identifying market opportunities through Tableau and PowerBI visualizations'
        ],
        coursework: [
            'Machine Learning',
            'Applied Data Science',
            'Cloud Architecture',
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

    async downloadPDF() {
        const element = this.resumeContent.nativeElement;

        // Set PDF export class 
        element.classList.add('pdf-export');

        try {
            // Use higher scale for better quality
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFFFF',
                // Match exact dimensions
                width: element.offsetWidth,
                height: element.offsetHeight
            });

            // Create PDF with proper A4 dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate the width and height ratios to maintain aspect ratio
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add the image to fill the page width
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Save the PDF
            pdf.save('jacobsBradyResume.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            // Remove temporary class
            element.classList.remove('pdf-export');
        }
    }
}