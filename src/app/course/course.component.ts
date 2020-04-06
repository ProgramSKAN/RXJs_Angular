import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import {
    debounceTime,
    distinctUntilChanged,
    startWith,
    tap,
    delay,
    map,
    concatMap,
    switchMap,
    withLatestFrom,
    concatAll, shareReplay, throttle, throttleTime
} from 'rxjs/operators';
import { merge, Observable, concat, interval, fromEvent, forkJoin } from 'rxjs';
import { Lesson } from '../model/lesson';
import { CreateHttpObservable } from '../common/util';
import { debug, RxJsLoggingLevel, setRxJsLoggingLevel } from '../common/debug';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {
    courseId: string;

    course$: Observable<Course>;
    lessons$: Observable<Lesson[]>;


    @ViewChild('searchInput', { static: true }) input: ElementRef;

    constructor(private route: ActivatedRoute) {


    }

    ngOnInit() {

        this.courseId = this.route.snapshot.params['id'];

        //-----16.add data in view course button------------
        this.course$ = CreateHttpObservable(`http://localhost:9000/api/courses/${this.courseId}`)
        //---29.for debugging course$ -----
        /* .pipe(
             //tap(course=>console.log(course))  //manual debug
             debug(RxJsLoggingLevel.INFO, "course level")//custom debug
         );*/

        //---32.in 31, if the logging level is INFO, then it will also display.but we have a option to see one at a time using setRxJsLoggingLevel()
        ////setRxJsLoggingLevel(RxJsLoggingLevel.DEBUG)       //now we see only 'lessons value' debug in console.not search ie:'TRACE'
        //setRxJsLoggingLevel(RxJsLoggingLevel.TRACE)     //If we keep TRACE level then debug also will show in console


        //this.lessons$ = this.loadLessons();


        //---33.FORKJOIN Operater---------
        const lessons$ = this.loadLessons();
        forkJoin(this.course$, lessons$)   //it emits the tuple value only if both of the observables completed.no value emmitted if any one observable wont complete.
            //if one of the 2 observable emmits multiple values then we get the last value emiited before completion.it is used for paralele HTTP request,performing long running calculation in parallel that might emit multiple values and eventually get final value and complete
            .pipe(
                tap(([course, lessons]) => {
                    console.log('course', course);
                    console.log('lessons', lessons);
                })
            )
            .subscribe()
    }

    ngAfterViewInit() {
        /* //----17.search field--------
         //for every keyup there is an event.so, wait till user input stabilizes and avoid duplicates.for that use DEBOUNSETIME Operater
         //DEBOUNCETIME with emit value of input only if user dont enter any value till the time menstioned say 20ms
         const searchLessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
             .pipe(
                 map(event => event.target.value),
                 debounceTime(400),//search value is stable and ready to be used if it remains unchanged for 400ms
                 distinctUntilChanged(),//emit only 1 value if 2 consecutive values are exactly same.this happens with keys like 'shift'
                 switchMap(search => this.loadLessons(search))//CONCATMAP,MERGEMAP,EXHAUSTMAP wont work here.ie, they cannot cancel the old request if the new request comes.so use SWITCHMAP ||||||SwitchMap----http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMap
             )
         // .subscribe(console.log);
 
         //---18.use contat to bind the serch result--------
         const initialLessons$ = this.loadLessons();
         this.lessons$ = concat(initialLessons$, searchLessons$);
         */

        //---27.less code using STARTWITH Operater-----comment all above----
        /*this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
            .pipe(
                map(event => event.target.value),
                startWith(''),
                //tap(searchterm=>console.log(searchterm)), //for manual debugging
                //----31.our own debugger using custom RXJS Debug operater----
                debug(RxJsLoggingLevel.TRACE, "search"),//custom debug
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(search => this.loadLessons(search)),
                debug(RxJsLoggingLevel.DEBUG, "lessons value")//custom debug
            )*/


        //----28.throttle------to limit the no of values emmited in certain interval.ex:used for websockets realtime data----http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-throttle
        /*fromEvent<any>(this.input.nativeElement, 'keyup')
            .pipe(
                map(event => event.target.value),
                //throttle(() => interval(500))//emit value for every half second.with throttling we have a gaurantee that output rate is limited in time (say 1/2 sec here) but problem is we donno whether output is latest value of the stream.ex: if you type 'Hello' in 1/2 sec, then output will be only 'H'.so debouncing is good for search field
                //or
                throttleTime(500)
            ).subscribe(console.log)*/
    }

    loadLessons(search = ''): Observable<Lesson[]> {
        return CreateHttpObservable(`http://localhost:9000/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`)
            .pipe(
                map(res => res['payload'])
            );
    }




}
