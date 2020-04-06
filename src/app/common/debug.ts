import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
//------30.custom RxJs Operater-----------
//below is a higher order fuction> a function that returns another function
//beacuse in the pipe of lesons$, we have observable that take in observable and returns onservable> so,higher order

export enum RxJsLoggingLevel {
    TRACE,
    DEBUG,
    INFO,
    ERROR
}
let rxjsLoggingLevel = RxJsLoggingLevel.INFO;
export function setRxJsLoggingLevel(level: RxJsLoggingLevel) {
    rxjsLoggingLevel = level;
}
export const debug = (level: number, message: string) =>
    (source: Observable<any>) => source
        .pipe(
            tap(val => {
                if (level >= rxjsLoggingLevel)
                    console.log(message + ': ', val);
            })
        );