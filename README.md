# Introduction

This app is a simple Angular application that does signup, login and has user profile information. This works with Auth0 IAAS and uses JWT Tokens based Authentication and Authorization ideas. This code is modified from [Auth0 Angular SDK sample](https://github.com/auth0-samples/auth0-angular-samples/tree/master/Sample-01) provided by Auth0.

# Auth0 Setup

1. Go to [https://auth0.com/](https://auth0.com/) and create an account
2. Assign a tenant name. For example, I have created prashdev.us.auth0.com and all the authentication calls will go through this url to Auth0 servers.
3. To get started with default Auth0 configuration, first we need to create an application inside auth0. To do that, click on applications > create Application. Name the application, say "Abundance", select SPA as the type (Single page application), and click create.
4. Create a file name "auth_config.json" based of auth_config.json.example. From the "basic information" section shown after creating new application, Copy the `client Id` and `Domain` of the application created into auth_config.json file across respective fields.
5. Click on APIs tab in Auth0 and copy the "audience" value into respective field in auth_config.json.

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

would serve the dev server to url http://localhost:4200

You can take a look at the `dev` comman in package.json