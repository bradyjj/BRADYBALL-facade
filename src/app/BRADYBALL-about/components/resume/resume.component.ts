import { Component, ViewChild, ElementRef } from '@angular/core';

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
                'Recognized with "Rookie Rockstar" award in Q1 2024 for exceptional technical performance and rapid integration into the team',
                'Developed and maintained full-stack applications using Java and AngularJS, ensuring >90% test coverage for high-quality code',
                'Resolved over 20 Jira tickets and CIIs from multiple Fortune 500 clients, demonstrating strong problem-solving skills across various functional areas in Order Management',
                'Implemented comprehensive monitoring solutions using Prometheus and Kibana for Hazelcast cache health and system reliability, enhancing overall system performance and stability'
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
}