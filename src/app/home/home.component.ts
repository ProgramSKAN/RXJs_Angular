import { Course } from './../model/course';
import { Component, OnInit } from '@angular/core';
import { interval, Observable, of, timer, noop, throwError } from 'rxjs';
import { catchError, delayWhen, map, retryWhen, shareReplay, tap, finalize, delay } from 'rxjs/operators';
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
                //-----24.move catch&finalize here (before sharereply()) to trigger only once else it will trigger twice due to 2 subscriptions, 1>beginner,2>advanced----------
                /*catchError(err => {
                    console.log('Error Occured ', err);
                    return throwError(err);
                }),
                finalize(() => {
                    console.log('Finalise Executed!')
                }),*/
                //-------------------------------------------
                tap(() => console.log('courses$ HTTP request executed')),//to produce sideeffects in our observable chain
                map(res => Object.values(res["payload"])),
                shareReplay(),//it is piped here, this operater make sures that this http response is passed to each new subscription instead of executing again for new instance

                //---20.catch error-----recovery error handling stategy-------below course array observable will replace original observable due to its failure--------------
                /*catchError(err => of([
                    {
                        id: 0,
                        description: "RxJs In Practice Course",
                        iconUrl: 'https://s3-us-west-1.amazonaws.com/angular-university/course-images/rxjs-in-practice-course.png',
                        courseListIcon: 'https://angular-academy.s3.amazonaws.com/main-logo/main-page-logo-small-hat.png',
                        longDescription: "Understand the RxJs Observable pattern, learn the RxJs Operators via practical examples",
                        category: 'BEGINNER',
                        lessonsCount: 10
                    }
                ]))//it gives an alternative error observable, is the http$ observable errors out
                */


                //-----22.catch and rethrow error handling strategy-------move to top--
                /* catchError(err => {
                     console.log('Error Occured ', err);//here we can call messeges service that display error on top of screen
                     return throwError(err);//returns an observable that throws this error without emmitting any value
                 }),//this will trigger twice , one for beginner,other for advanced.so move this up of the chain


                //-----23.finalize---clean up logic when error out like close network connection,release memory resorce,...
                finalize(() => {  //invokes when http$ onservable completes or errors out
                    console.log('Finalise Executed!')
                })
                */

                //-----26.Retry for every 2seconds--------
                retryWhen(errors =>//it will create a new stream observable and subscribes to it when errors out, it will do it until stream does not error out---
                    //errors            //>>retry immediately after falilure
                    errors.pipe(
                        delayWhen(() => timer(2000))    //retry after 2 sec
                        ////delay(2000)     //delay the whole error stream for total of 2 sec.dont use it because we want after each error wait for 2 sec.so use delaywhen()

                    ))

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
