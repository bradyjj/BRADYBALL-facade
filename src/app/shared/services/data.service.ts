// services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Project } from '../../common/models/project.model';
import { NewsItem } from '../../common/models/news-item.model';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private apiUrl = 'assets/data'; // Path to your JSON data files

    constructor(private http: HttpClient) { }

    getNewsItems(): Observable<NewsItem[]> {
        return this.http.get<NewsItem[]>(`${this.apiUrl}/news.json`)
            .pipe(
                catchError(this.handleError<NewsItem[]>('getNewsItems', []))
            );

        // If you prefer to use hardcoded data to start with:
        // return of(this.getMockNewsItems());
    }

    getProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${this.apiUrl}/projects.json`)
            .pipe(
                catchError(this.handleError<Project[]>('getProjects', []))
            );

        // If you prefer to use hardcoded data to start with:
        // return of(this.getMockProjects());
    }

    getProjectById(id: string): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl}/projects/${id}.json`)
            .pipe(
                catchError(this.handleError<Project>(`getProject id=${id}`))
            );
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed: ${error.message}`);
            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    // Mock data for initial development
    private getMockNewsItems(): NewsItem[] {
        return [
            {
                title: 'test pattern [n°15]',
                type: 'group exhibition',
                image: '/assets/images/news/tp15.jpg',
                link: 'https://www.ryojiikeda.com/project/testpattern/',
                dates: [
                    {
                        dateRange: 'OCT 27, 2024 – MAY 7, 2025',
                        venue: 'Ennova Art Biennale, ENNOVA Art Museum, Langfang, CN',
                        link: 'https://ennovaartmuseum.com.cn/en/news/activity/114.html',
                        curator: 'Fumio Nanjo'
                    }
                ]
            },
            {
                title: 'scan.tron.flux.',
                type: 'solo exhibition',
                image: '/assets/images/news/Ryoji_Ikeda_180_Strand_8.jpg',
                dates: [
                    {
                        dateRange: 'JAN 26 – APR 13, 2025',
                        venue: 'Urban Forest Cipete, Jakarta, ID',
                        link: 'https://www.instagram.com/ryojiinid/?hl=en'
                    }
                ]
            },
            {
                title: 'data-verse',
                type: 'solo exhibition',
                image: '/assets/images/news/YET_IT_MOVES_Copenhagen_Contemporary_010_Photo_by_David_Stjernholm.jpg',
                link: 'https://high.org/exhibition/ryoji-ikeda/',
                dates: [
                    {
                        dateRange: 'MAR 7–AUG 10, 2025',
                        venue: 'The High Museum of Art, Atlanta, US',
                        link: 'https://high.org/exhibition/ryoji-ikeda/'
                    }
                ]
            }
        ];
    }

    private getMockProjects(): Project[] {
        return [
            {
                id: 'x_verse',
                title: 'X-verse',
                year: '2018',
                types: ['installation']
            },
            {
                id: 'exp',
                title: 'exp',
                year: '2020',
                types: ['installation']
            },
            {
                id: 'micro_macro',
                title: 'micro | macro',
                year: '2015',
                types: ['installation']
            },
            {
                id: 'supersymmetry',
                title: 'supersymmetry',
                year: '2014',
                types: ['installation']
            },
            {
                id: 'superposition',
                title: 'superposition',
                year: '2012',
                types: ['concert', 'performance', 'installation', 'cd']
            },
            {
                id: 'testpattern',
                title: 'test pattern',
                year: '2008',
                types: ['concert', 'installation', 'cd']
            }
        ];
    }
}