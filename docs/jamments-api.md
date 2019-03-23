# Jamments API
As said, this is a purely HTTP REST API. 100% JAMstack compatible. `GET`, `POST`, `PATCH` and `DELETE` the way you want, it's all yours.

For full control, head over to the [API documentation](https://buzut.github.io/jamments/api/).

## Exemples
Fetch comments by requesting the slug of your page with the JSON extension:

```javascript
// comments for page https://my-blog.net/i-love-jamstack/
function getComments(slug) {
    return fetch(url)
    .then((res) => {
        if (!res.ok) return Promise.reject(new Error(res.status));
        return res.json();
    });
}

// getting rid of starting and trailing slashes
const slug = window.location.pathname.replace(/^\/|\/$/g, '');

getJsonData(`https://comments.my-blog.net/article/${slug}.json`)
.then((comments) => {
    // whatever you wanna do with the comments
    // [{ id: Number, parent_id: Number|Null, name: String, md5_email: String, submitted_at: String, comment: String }, …]
})
.catch(errorHandler);
```

Bear in mind that the comments you get from the API are raw, unsanitized comments, so be cautions, don't expose your users!

To post a comment, it's almost as simple:

```javascript
// 4 params are required
function postComment(body) {
    const formData = new FormData();
    Object.keys(body).forEach(key => formData.append(key, body[key]));

    return fetch(`${commentsBaseAddress}/comment/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData)
    })
    .then((res) => {
        if (!res.ok) return res.text().then((msg) => Promise.reject(new Error(msg)));
        return Promise.resolve();
    });
}

// now once you validated your comments and got the data
postComment({ slug, comment, name, email })
.then(() => {
    // comment submitted 🎉
})
.catch((err) => {
    // something happened
});
```

Also, be aware that these exemples are not 100% compatible with all browsers. We here use the [*fetch API*](https://www.caniuse.com/#feat=fetch) and [*URLSearchParams*](https://www.caniuse.com/#feat=urlsearchparams) that, although well supported, won't work with older browsers.

You could instead use the more ubiquitous [XMLHTTPRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).
