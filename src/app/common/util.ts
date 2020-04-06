import { Observable } from "rxjs";


export function CreateHttpObservable(url: string) {
    return Observable.create(observer => {
        //-------14.make this request cancellable---------
        const controller = new AbortController();
        const signal = controller.signal;// if Abortsignal emits true then the fetch request will be cancelled by the browser


        //5.---------------------
        // observer.next();
        // observer.error();
        // observer.complete();
        fetch(url, { signal }).then(response => {

            if (response.ok) {
                return response.json();
            } else {//----21.catch error---------
                observer.error('Request failed with status code: ' + response.status);
            }

        }).then(body => {
            observer.next(body);//return json body to observer
            observer.complete();//stop the stream
            //observer.next();//breaking observer contract.dont do this
        }).catch(err => {
            observer.error(err);//return ex: network error
            //this catch error block only triggers if there is fatal error like network failure,dns error,...something that browser cannot recover from
            //for catching error for response also use if else above
        })
        //----------------------------

        //------14. unsubscribe()-------
        return () => controller.abort();




    });
}