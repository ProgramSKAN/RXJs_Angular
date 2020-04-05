import { interval, timer, Observable, noop, of, concat, merge } from 'rxjs';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CreateHttpObservable } from '../common/util';
import { map } from 'rxjs/operators';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() { }

  /*//FUNDAMENTALS
  ngOnInit() {
    //---------------1.STREAMS OF VALUES-------------------
    // document.addEventListener('click', evt => {
    //   console.log(evt);
    // });

    // let counter = 0
    // setInterval(() => {
    //   console.log(counter);
    //   counter++;
    // }, 1000);


    // //similar to backend request
    // setTimeout(() => {
    //   console.log('finished...');
    // }, 3000);
    //-----------------------------------------------------
    //----PRINT VALUES OF COUNTER CONTINUOSLY BUT WAIT FOR 3 SEC FOR EVERY CLICK---------
    //------combining multiple streams like this is complex,so RXJS---------
    // document.addEventListener('click', evt => {
    //   console.log(evt);
    //   setTimeout(() => {
    //     console.log('finished...');
    //     let counter = 0
    //     setInterval(() => {
    //       console.log(counter);
    //       counter++;
    //     }, 1000);
    //   }, 3000);
    // });
    //------------------------2.RXJS6-------------------
    //An Observable only becoms a stream if we subscribe to it
    //Observable is a blue print of a stream
    const interval$ = interval(1000);//start stream of values from 0
    const interval1$ = timer(3000, 1000);//start stream of values after 3 sec
    // interval$.subscribe(val => console.log('stream1: ' + val));
    // interval$.subscribe(val => console.log('stream2: ' + val));
    // interval1$.subscribe(val => console.log('stream start after 3 sec: ' + val));

    //----------3.stream of clicks using from event------
    const sub = interval$.subscribe(val => console.log('stream1: ' + val));
    setTimeout(() => {
      sub.unsubscribe();//stop emitting values after 5 sec
    }, 5000);
    const click$ = fromEvent(document, 'click');
    click$.subscribe(
      evt => console.log(evt),
      err => console.log(err),//if streams errors out or complete then its no longer emit stream
      () => console.log('stream completed'),
    );
  }*/


  /*
  //------4.Build our own HTTP Observable-------- move it to util.ts-----
  ngOnInit() {
    const https$ = Observable.create(observer => {
      // observer.next();
      // observer.error();
      // observer.complete();
      fetch('http://localhost:9000/api/courses').then(response => {
        return response.json();
      }).then(body => {
        observer.next(body);//return json body to observer
        observer.complete();//stop the stream
        //observer.next();//breaking observer contract.dont do this
      }).catch(err => {
        observer.error(err);//return ex: network error
      })
    });


    https$.subscribe(
      courses => console.log(courses),
      //()=>{},//empty error handle. for redability use 'noop'>no operation
      noop,
      () => console.log('completed')
    )
  }*/


  ngOnInit() {
    /*
    //--------6.RXJS Operators----------move to home component-----------
    const http$ = CreateHttpObservable('http://localhost:9000/api/courses');

    //use RXJS Operators to derive new observable from existing observable
    const courses$ = http$
      .pipe(//pipe> used to chain multiple operators to produce new observable
        map(res => Object.values(res["payload"]))
      );

    courses$.subscribe(
      courses => console.log(courses),
      //()=>{},//empty error handle. for redability use 'noop'>no operation
      noop,
      () => console.log('completed')
    )*/




    //---------9.Observable Concatination----------
    const source1$ = of(1, 2, 3);//of >used to define all sorts of observable.ex:observable that emits values 1,2,3
    const source2$ = of(4, 5, 6);
    const source3$ = of(7, 8, 9);
    //combine above 2 observables>sequential concatination ||  http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-concat
    const result$ = concat(source1$, source2$, source3$);
    //result$.subscribe(val => console.log(val));//or
    //result$.subscribe(console.log);

    //key notion for concatination is "notion of completion"
    //if source4 never ends then source5,6 never outputted to screen> like below
    const source4$ = interval(1000);
    const source5$ = of(4, 5, 6);
    const source6$ = of(7, 8, 9);
    const result1$ = concat(source4$, source5$, source6$);
    //result1$.subscribe(console.log);


    //------10.MERGE-------------http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-merge
    //Merge is ideal to do asynchronous operations in parallel
    const interval1$ = interval(1000);
    const interval2$ = interval1$.pipe(
      map(val => 10 * val)
    );
    const result2$ = merge(interval1$, interval2$);
    // result2$.subscribe(console.log);




    //------13.Implement Observable unsubscription by making HTTP Observable cancellable---------
    // users of this HTTP obersvable will be able to cancel inflight request
    //ex: if the search HTTP request is ongoing and user types a new search,then we will be able to cancel previous ongoing search request
    const interval3$ = interval(1000);
    const sub1 = interval3$.subscribe(console.log);
    setTimeout(() => {
      sub1.unsubscribe()
    }, 5000);
    //---------15.the below request is cancelled after 0 seconds------
    const http$ = CreateHttpObservable('http://localhost:9000/api/courses');
    const sub2 = http$.subscribe(console.log);
    setTimeout(() => {
      sub2.unsubscribe();
    }, 0);

  }







}
