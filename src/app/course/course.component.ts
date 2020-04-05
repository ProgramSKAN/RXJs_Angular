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
    concatAll, shareReplay
} from 'rxjs/operators';
import { merge, fromEvent, Observable, concat } from 'rxjs';
import { Lesson } from '../model/lesson';
import { CreateHttpObservable } from '../common/util';


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
        this.course$ = CreateHttpObservable(`http://localhost:9000/api/courses/${this.courseId}`);
        //this.lessons$ = this.loadLessons();
    }

    ngAfterViewInit() {
        //----17.search field--------
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


    }

    loadLessons(search = ''): Observable<Lesson[]> {
        return CreateHttpObservable(`http://localhost:9000/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`)
            .pipe(
                map(res => res['payload'])
            );
    }




}
