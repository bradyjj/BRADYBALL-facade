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
            'Lead Teaching Assistant: CPSC 1060 - Introduction to Programming in Java',
            'Teaching Assistant: CPSC 1010 - Introduction to Computer Science',
            'Senior Capstone Project Lead: Led 4-person team for American Tire Distributors (ATD) market analysis'
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
                'Earned "Rookie Rockstar" award for exceptional technical performance and rapid integration',
                'Led development of "Available to Commerce" UI system, becoming subject matter expert',
                'Engineered full-stack applications using Java and AngularJS maintaining >90% test coverage',
                'Implemented comprehensive monitoring solutions for cache health and system reliability'
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
            'Architected a comprehensive sports analytics platform, integrating data science, machine learning techniques, and custom data visualization using D3.js',
            'Designed and implemented a scalable microservices architecture with Python, FastAPI, and Redis to support advanced sports performance analysis and visualizations.',
        ]
    };

    skills = {
        'Technical Development': {
            'Programming Languages': ['Java', 'Python', 'C/C++', 'JavaScript'],
            'Web Technologies': ['AngularJS', 'D3.js', 'HTML/CSS', 'REST APIs', 'FastAPI'],
            'Database & Storage': ['MySQL', 'PostgreSQL', 'Redis', 'Snowflake']
        },
        'Data Science & Research': {
            'Machine Learning': ['Statistical Modeling', 'NLP', 'Algorithm Development'],
            'Data Analysis': ['Data Engineering', 'ETL Pipelines', 'Statistical Analysis'],
            'Visualization': ['D3.js', 'PowerBI', 'Tableau']
        },
        'Tools & Infrastructure': {
            'Cloud Platforms': ['AWS', 'Google Cloud Platform'],
            'DevOps': ['Docker', 'Git', 'CI/CD'],
        }
    };

    async downloadPDF() {
        const content = this.resumeContent.nativeElement;
        
        const options = {
            scale: 1,
            useCORS: true,
            backgroundColor: '#f8f5e3',
            width: content.offsetWidth,
            height: content.offsetHeight
        };
        
        try {
            const canvas = await html2canvas(content, options);
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });
    
            pdf.addImage(
                canvas.toDataURL('image/png', 1.0),
                'PNG',
                0,
                0,
                8.5,
                11
            );
    
            pdf.save('Brady_Jacobs_Resume.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }
}