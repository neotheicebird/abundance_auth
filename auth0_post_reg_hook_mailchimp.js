/**
 * 
 * Copy and paste this code into Auth0 hook for Post Registration, to get the new user email id add to mailchimp
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
    console.log(user["email"])
    
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
  