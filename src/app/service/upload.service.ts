import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http'
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const url = `${environment.api}/upload`;

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient) { }

  public upload(files: Set<File>): { [key: string]: { progress: Observable<number>, response: Observable<HttpResponse<{}>> } } {
    // this will be the our resulting map
    const status: { [key: string]: { progress: Observable<number>, response: Observable<HttpResponse<{}>> } } = {};

    files.forEach(file => {
      // create a new progress-subject for every file
      const progress = new Subject<number>();
      const response = new Subject<HttpResponse<{}>>();

      // create a http-post request and pass the form
      // tell it to report the upload progress
      if (file.size <= 5 << 20) {
        // create a new multipart-form for every file
        const formData: FormData = new FormData();
        formData.append("file", file, file.name);
        const req = new HttpRequest("POST", `${url}?uploadType=multipart`, formData, {
          reportProgress: true,
          responseType: 'text'
        });
        
        // send the http-request and subscribe for progress-updates
        this.http.request(req).subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            // calculate the progress percentage

            const percentDone = Math.round((100 * event.loaded) / event.total);
            // pass the percentage into the progress-stream
            progress.next(percentDone);
          } else if (event instanceof HttpResponse) {
            // Close the progress-stream if we get an answer form the API
            // The upload is complete
            response.next(event);
            progress.complete();
          }
        }, err => {
          response.error(err);
          progress.error(err);
        });

        // Save every progress-observable in a map of all observables
        status[file.name] = {
          progress: progress.asObservable(),
          response: response.asObservable(),
        };
      } else {
        const fileMetadata = { title: file.name, mimeType: file.type };
        const initReqHeaders = new HttpHeaders().set('X-Content-Length', `${file.size}`);
        const initReq = new HttpRequest("POST", url, fileMetadata, {
          responseType: 'text',
          headers: initReqHeaders,
        });
        this.http.request<string>(initReq).subscribe(initEvent => {
          if (initEvent instanceof HttpResponse) {
            const uploadId = initEvent.headers.get('x-uploadid');

            const formData: FormData = new FormData();
            formData.append("file", file, file.name);
            
            const headers = new HttpHeaders().set('Content-Range', `bytes 0-${file.size - 1}/${file.size}`);
            const httpParams = new HttpParams().set('uploadId', `${uploadId}`);
            const req = new HttpRequest("POST", `${url}?uploadType=resumable`, formData, {
              reportProgress: true,
              responseType: 'text',
              headers,
              params: httpParams
            });

            // send the http-request and subscribe for progress-updates
            this.http.request(req).subscribe(event => {
              if (event.type === HttpEventType.UploadProgress) {
                // calculate the progress percentage

                const percentDone = Math.round((100 * event.loaded) / event.total);
                // pass the percentage into the progress-stream
                progress.next(percentDone);
              } else if (event instanceof HttpResponse) {
                response.next(event);
                progress.complete();
              }
            }, err => {
              response.error(err);
              progress.error(err);
            });
          }
        }, err => {
					response.error(err);
          progress.error(err);
				});

        // Save every progress-observable in a map of all observables
        status[file.name] = {
          progress: progress.asObservable(),
          response: response.asObservable(),
        };
      }
    });

    // return the map of progress.observables
    return status;
  }
}
