import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const users: any[] = JSON.parse(localStorage.getItem('users')) || [];

    return (
      of(null)
        .pipe(
          mergeMap(() => {
            if (
              request.url.endsWith('/users/authenticate') &&
              request.method === 'POST'
            ) {
              const filteredUsers = users.filter(user => {
                return (
                  user.email === request.body.email &&
                  user.password === request.body.password
                );
              });

              if (filteredUsers.length) {
                const user = filteredUsers[0];
                const body = {
                  id: user.id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  token: 'fake-jwt-token',
                  investments: user.investments
                };

                return of(new HttpResponse({ status: 200, body: body }));
              } else {
                return throwError({
                  error: { message: 'Username or password is incorrect' }
                });
              }
            }

            if (request.url.endsWith('/users') && request.method === 'GET') {
              if (
                request.headers.get('Authorization') === 'Bearer fake-jwt-token'
              ) {
                return of(new HttpResponse({ status: 200, body: users }));
              } else {
                return throwError({
                  status: 401,
                  error: { message: 'Unauthorised' }
                });
              }
            }

            if (
              request.url.match(/\/users\/\d+$/) &&
              request.method === 'GET'
            ) {
              if (
                request.headers.get('Authorization') === 'Bearer fake-jwt-token'
              ) {
                const urlParts = request.url.split('/');
                const id = parseInt(urlParts[urlParts.length - 1]);
                const matchedUsers = users.filter(u => {
                  return u.id === id;
                });
                const user = matchedUsers.length ? matchedUsers[0] : null;

                return of(new HttpResponse({ status: 200, body: user }));
              } else {
                return throwError({
                  status: 401,
                  error: { message: 'Unauthorised' }
                });
              }
            }

            if (
              request.url.endsWith('/users/register') &&
              request.method === 'POST'
            ) {
              const newUser = request.body;

              const duplicateUser = users.filter(user => {
                return user.email === newUser.email;
              }).length;
              if (duplicateUser) {
                return throwError({
                  error: {
                    message:
                      'Email ' + newUser.email + ' is already registered'
                  }
                });
              }

              newUser.id = users.length + 1;
              newUser.investments = [];
              users.push(newUser);
              localStorage.setItem('users', JSON.stringify(users));

              return of(new HttpResponse({ status: 200 }));
            }

            return next.handle(request);
          })
        )

        .pipe(materialize())
        .pipe(delay(500))
        .pipe(dematerialize())
    );
  }
}

export let fakeBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
