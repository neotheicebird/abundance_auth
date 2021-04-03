// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { domain, clientId, audience, apiUri } from '../../auth_config.json';

export const environment = {
  production: false,
  stripe_key: "pk_test_WkkwNMjim6o9rJCmrIDdgMte",
  auth: {
    domain,
    clientId,
    audience,
    redirectUri: window.location.origin,
  },
  httpInterceptor: {
    allowedList: [
      {
        // Match any request that starts 'https://prashdev.us.auth0.com/api/v2/' (note the asterisk)
        uri: audience + '*',
        tokenOptions: {
          // The attached token should target this audience
          audience: audience,

          // The attached token should have these scopes
          scope: 'read:current_user create:current_user_metadata update:current_user_metadata'
        }
      }
    ]
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
