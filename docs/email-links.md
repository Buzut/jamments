# Email links
Users will receibe emails that contain "action links". For these action to work properly, your frontend must capture the links `GET` parameters to interract with the API.

## New comment confirmation
This mail is sent to any user submitting a new comment. By both receiving the email and clicking its link, the user proves he's not a robot a probably not a spammer.

This email contains 3 paramaters:
* comment_id
* md5_email
* user_secret

These parameters are then to be posted to the API's [validate comment](https://buzut.github.io/jamments/api/#api-Comments-validateComment) endpoint.

On the front, you can capture them with this code:

```javascript
const params = new URLSearchParams(window.location.search.substring(1));

const commentId = params.get('comment_id');
const userMd5Email = params.get('md5_email');
const userSecret = params.get('user_secret');

// if you use jamments-front, here's how you then validate the comment
jamments.validateComment(commentId, userSecret)
.then(() => {
    // all good, comment validated
})
.catch((err) => {
    // Ooops    
});
```

## Unsubscribe from notifications
When a user receives a new notification email, there's a link allowing him to unsubscribe notifications for the same page. This link contains the following parameters:
* article_id
* user_id
* user_secret

Again, you'll need to capture `GET` parameters to interact with the API's [update notification](https://buzut.github.io/jamments/api/#api-Notifications-updateNotification) endpoint.

```javascript
const params = new URLSearchParams(window.location.search.substring(1));

const articleId = params.get('article_id');
const userId = params.get('user_id');
const userSecret = params.get('user_secret');

// then unsubscribe using jamments-front
jamments.updateNewCommentsSubscription(articleId, userId, userSecret, false)
.then(() => showSuccessNotif('Vous ne recevrez plus d’email pour cet article'))
.catch(showGenericErrMsg);
```

Note that these exemples use [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) and that it is [not compatible](https://www.caniuse.com/#feat=urlsearchparams) with older browsers.

Nevertheless, you can [polyfill it](https://www.npmjs.com/package/url-search-params-polyfill) for browsers that lack support.
