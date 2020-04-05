import { Course } from './../model/course';
import { Component, OnInit } from '@angular/core';
import { interval, Observable, of, timer, noop } from 'rxjs';
import { catchError, delayWhen, map, retryWhen, shareReplay, tap } from 'rxjs/operators';
import { CreateHttpObservable } from '../common/util';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    // beginnerCourses: Course[];
    // advancedCourses: Course[];
    beginnerCourses$: Observable<Course[]>;
    advancedCourses$: Observable<Course[]>;

    constructor() {

    }

    ngOnInit() {
        //------7.RXJS Operaters---------
        const http$ = CreateHttpObservable('http://localhost:9000/api/courses');
        const courses$: Observable<Course[]> = http$
            .pipe(
                tap(() => console.log('courses$ HTTP request executed')),//to produce sideeffects in our observable chain
                map(res => Object.values(res["payload"])),
                shareReplay()//it is piped here, this operater make sures that this http response is passed to each new subscription instead of executing again for new instance

            );


        /*we can use observable directly as beginnerCourses$ instead of below
        courses$.subscribe(//avoid lot of logic inside subscribe > use reactive design instead
            courses => {
                this.beginnerCourses = courses
                    .filter(course => course.category == 'BEGINNER');//this  is not rxjs filter operator
                this.advancedCourses = courses
                    .filter(course => course.category == 'ADVANCED');
            },
            noop,
            () => console.log('completed')
        )*/


        //--------8.Reactive Design------without sharereply() below makes 2 requests to /api/courses due to new instance of stream instead of 1-------
        this.beginnerCourses$ = courses$
            .pipe(
                map(courses => courses
                    .filter(course => course.category == 'BEGINNER'))
            );
        this.advancedCourses$ = courses$
            .pipe(
                map(courses => courses
                    .filter(course => course.category == 'ADVANCED'))
            );
        //------------------------------------
    }

}
