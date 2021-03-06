# Introduction

This app is a simple Angular application that does signup, login and has user profile information. This works with Auth0 IAAS and uses JWT Tokens based Authentication and Authorization ideas. This code is modified from [Auth0 Angular SDK sample](https://github.com/auth0-samples/auth0-angular-samples/tree/master/Sample-01) provided by Auth0.

# Auth0 Setup

1. Go to [https://auth0.com/](https://auth0.com/) and create an account
2. Assign a tenant name. For example, I have created prashdev.us.auth0.com and all the authentication calls will go through this url to Auth0 servers.
3. To get started with default Auth0 configuration, first we need to create an application inside auth0. To do that, click on applications > create Application. Name the application, say "Abundance", select SPA as the type (Single page application), and click create.
4. Create a file name "auth_config.json" based of auth_config.json.example. From the "basic information" section shown after creating new application, Copy the `client Id` and `Domain` of the application created into auth_config.json file across respective fields.
5. Click on APIs tab in Auth0 and copy the "audience" value into respective field in auth_config.json.
6. Please make sure "allowed logout urls" and "allowed web origins" field in Auth0.com has the URL the app is deployed to, For development please add `http://localhost:4200/` to it.

## Configuration

The sample needs to be configured with your Auth0 domain and client ID in order to work. In the root of the sample, copy `auth_config.json.example` and rename it to `auth_config.json`. Open the file and replace the values with those from your Auth0 tenant:

```json
{
  "domain": "<YOUR AUTH0 DOMAIN>",
  "clientId": "<YOUR AUTH0 CLIENT ID>",
  "audience": "<YOUR AUTH0 API AUDIENCE IDENTIFIER>"
}
```

I have forcefully added `auth_config.json` with configuration variables for `prashdev` environment (Prashanth's environment) to git. Please remove this from revision control when you populate your environment.

# Run dev server

`npm run dev`

or `ng serve`

would serve the dev server to url http://localhost:4200

You can take a look at the `dev` comman in package.json

# Mailchimp Setup

Once you can verify that the login/signup functionality works well, its time to setup MailChimp. The idea here is that when a user signs up, their email ID should be added to Abundance Project's MailChimp email list. This is achieved using Auth0 Hooks and we will be adding NodeJS code to use Auth0's `post-user-registration` hook.

To setup Mailchimp account for testing, Please follow the following steps:

1. Go to [https://mailchimp.com/](https://mailchimp.com/) and signup for a new account. Activate the account from the link sent to your email.

2. To get the API keys click on Profile picture > Account > Extras > API Keys [OR] Try to load this URL in your browser [https://us1.admin.mailchimp.com/account/api/](https://us1.admin.mailchimp.com/account/api/). Click on `create a key` to create one and keep a copy ready for later use. This is your `apiKey`. If the api url shown to you starts with `us1` after the https:// section, then `us1` is your `serverPrefix`.

3. We need the audience ID (aka listId) to which the new signup information are added. To get this go to Audience > All Contacts > Settings > Audience name and defaults. Here you will find it.

Ref: [https://mailchimp.com/help/find-audience-id/](https://mailchimp.com/help/find-audience-id/)

4. We need to create an Auth0 hook, which will add email from new signup to mailchimp email list. To do that, go to [Auth0.com](https://auth0.com/), and under `Auth0 Pipeline` click on hooks. Create a new hook under topic "Post User Registration". Name the hook, say "new-user-to-mailchimp".

5. In the new hook created, click on edit icon. In the editor that is shown, we can paste the following code after replacing the environment variables `apiKey, serverPrefix, listId` with your values.

6. That's it. Now we are set. Please try a new user registration from your angular app, the email id should get added to the list.

```javascript
/**
@param {object} user - The user being created
@param {string} user.id - user id
@param {string} user.tenant - Auth0 tenant name
@param {string} user.username - user name
@param {string} user.email - email
@param {boolean} user.emailVerified - is e-mail verified?
@param {string} user.phoneNumber - phone number
@param {boolean} user.phoneNumberVerified - is phone number verified?
@param {object} user.user_metadata - user metadata
@param {object} user.app_metadata - application metadata
@param {object} context - Auth0 connection and other context info
@param {string} context.requestLanguage - language of the client agent
@param {object} context.connection - information about the Auth0 connection
@param {object} context.connection.id - connection id
@param {object} context.connection.name - connection name
@param {object} context.connection.tenant - connection tenant
@param {object} context.webtask - webtask context
@param {function} cb - function (error, response)
*/
module.exports = function (user, context, cb) {
  let apiKey = "d2425ace59980df97023d247e008dff4";
  let serverPrefix = "us1";
  let listId = "00b65f2190";
  
  console.log(user)
  
  const client = require("@mailchimp/mailchimp_marketing");

  client.setConfig({
    apiKey: apiKey,
    server: serverPrefix,
  });

  const run = async () => {
    const response = await client.lists.addListMember(listId, {
      email_address: user["email"],
      status: "subscribed",
    }).then((resp) => {
        console.log(
            `Successfully added contact as an audience member. 
            The contact's id is ${resp.id}.`
        );
    }).catch((err) => console.log(err));
    console.log(response);
  };

  run();

  // Perform any asynchronous actions, e.g. send notification to Slack.
  cb();
};

```

# Stripe Integration

We are going to use the clientside-only stripe checkout integration for our purpose. To do that,

1. Go to [https://dashboard.stripe.com/settings/checkout](https://dashboard.stripe.com/settings/checkout) and click on "enable client-only integration"

2. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard), click on products and add a product (say "Being Abundance")

3. We are going to add multiple prices for the product in multiple currencies. Let us start by adding $1, one-time, and clicking "add price". ** Please do this manual step carefully, as this might be long and can be prone to errors **

Add prices for values, `1, 2, 3, 4, 5, 11, 21, 51, 100, 501, 1001, 10001, 100001`, for currencies `Pounds, Euros, USD, Canadian dollars`. That would be 52 items in total. Each price gets a price id and we would be copying that to `product_prices.json` to be used client-side. This is the only manual heavy step. If you are done with this, pat you back.

4. Copy and Paste the stripe test publishable key to `src/environments/environment.ts` (for production, copy to `environment.prod.ts`). You can find the keys in [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

Example:

```
export const environment = {
  production: false,
  stripe_key: "pk_test_WkkwNMjim6o9rJCmrIDdgMte",
  ...
}
```

** Remember to replace the key with live publishable key when the app goes live **

5. Install stripe library for client side support

`npm i @stripe/stripe-js`

6. Copy the `donate` component to your master code, and do necessary changes to your code to see the payment checkout in action.

7. This project uses `angular-notifier` package to show payment success and failure notifications. Please add it to the project by following instructions in [https://www.npmjs.com/package/angular-notifier](https://www.npmjs.com/package/angular-notifier).

If you have already added a notifier or use a different notification mechanism, skip this step.

Do not forget to add the line `@import "~angular-notifier/styles";` to `/src/styles.scss`

8. Testing:

For test publishable stripe key, the following card numbers can be used:

4242 4242 4242 4242    -    Card succeeds
4000 0000 0000 0002    -    Card declines

For more test cards and to test other types of cards, goto [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

Pressing "<- Back" button on checkout page leads to "payment failure" condition handled in our angular app.

9. We would like to add the user's donation payment status to the user metadata in Auth0. To do that we are going to call Auth0's management API by sending the `id_token` along with API calls. Some configuration steps are already added to `app.module.ts`. To add that to your project, follow [https://auth0.com/docs/quickstart/spa/angular/02-calling-an-api](https://auth0.com/docs/quickstart/spa/angular/02-calling-an-api). Once done, please add the following environment variables to `environment.ts` (or `environment.prod.ts`)

