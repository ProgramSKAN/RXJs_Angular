import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Course } from "../model/course";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as moment from 'moment';
import { fromEvent } from 'rxjs';
import { concatMap, distinctUntilChanged, exhaustMap, filter, mergeMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

@Component({
    selector: 'course-dialog',
    templateUrl: './course-dialog.component.html',
    styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    course: Course;

    @ViewChild('saveButton', { static: true }) saveButton: ElementRef;

    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CourseDialogComponent>,
        @Inject(MAT_DIALOG_DATA) course: Course) {

        this.course = course;

        this.form = fb.group({
            description: [course.description, Validators.required],
            category: [course.category, Validators.required],
            releasedAt: [moment(), Validators.required],
            longDescription: [course.longDescription, Validators.required]
        });

    }

    ngOnInit() {
        //----------10.concat operater use case.CONCATMAP(Strategy to combine observables)---------
        // this.form.valueChanges.subscribe(console.log);
        /*//with this for every change in the edit form a request will be sent.but to make sure the next save request is sent only after completing previos save request, use CONCATMAP Operater
        this.form.valueChanges
            .pipe(
                filter(() => this.form.valid)
            ).subscribe(changes => {
                console.log(changes);
                //fromPromise>to convert from promise to observable as fetach by default retuns promise
                const saveCourse$ = this.saveCourse(changes);//for every value of source observable,take the value which is called changes and create each savecourse$ observable(derived observable).
                saveCourse$.subscribe();
            });*/

        //above code with concatMap() //http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-concatMap
        //with this,every change in the edit sends a request and happens sequentially one after the other only.(sequential waterfall chrome)
        //for every chage we send a request here, to reduce no of requests> use DEBOUCETIME Operater >later
        //to make operations run in parallel instead of sequential> use MERGE Observable combination stategy >later
        this.form.valueChanges
            .pipe(
                filter(() => this.form.valid),
                concatMap(changes => this.saveCourse(changes))
            )
            .subscribe();


        //--------11.MERGEMAP------http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeMap
        //with this,We wont wait for one request to complete before lauching other like CONCATMAP
        //since the order of the observable values is important in save operation, we use CONCATMAP not MERGEMAP
        //to use observables in parallel use MERGEMAP
        /*this.form.valueChanges
            .pipe(
                filter(() => this.form.valid),
                mergeMap(changes => this.saveCourse(changes))
            )
            .subscribe();*/


    }

    saveCourse(changes) {
        return fromPromise(fetch(`http://localhost:9000/api/courses/${this.course.id}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
            headers: {
                'content-type': 'application/json'
            }
        }));
    }


    ngAfterViewInit() {
        //-----12.EXHAUSTMAP----------http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-exhaustMap
        //with this, only one click is taken to save course even though multiple clicks are made
        fromEvent(this.saveButton.nativeElement, 'click')
            .pipe(
                exhaustMap(() => this.saveCourse(this.form.value))
            ).subscribe();
    }



    close() {
        this.dialogRef.close();
    }

}
