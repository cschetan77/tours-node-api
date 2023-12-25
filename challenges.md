->How do you process query strings sent in the request URL at backend. 
->Sorting results based on sort query parameter.
->Limiting the fields sent in response. 
->Implement Pagination.
->Aliasing some common features of API.
->Aggregation Pipeline in mongoDB, stages and Aggregation operators.
->Mongoose middlewares - Document and Query
->Virtual Property concept in mongoose.
->Mongoose validation - Built-In and Custom Validators


Exception Handling and Debugging
-> Error handling middleware - 4 args 
-> Indicating the error happened in a particular middleware next(err)
-> Write own custom Error class 
-> Errors returned from mongoose

Authentication, Authorization and security.
->Custom validators in mongoose.
->Encrypt passwords in schema using mongoose middlewares
-> What are JSON web tokens (JWT)
-> Send JWT on signup
-> Send JWT token on login.
-> Protect routes using middleware (steps to validate the token and the user)
-> Restrict certain routes using middleware
->Various HTTP response codes for different kinds of requests.
-> Using nodemailer package to send email through a email service.
-> Using mail trap to trap your mails and get insights. 

Security considerations 
Compromised database ->
1. Strongly encrypt passwords with bcrypt.
2. Strongly encrypt reset tokens.
Brute force attacks ->
3. Implement rate limiting.
4. Implement max login attempts.
Cross Site Scripting attacks ->
1. Store JWT in HTTPOnly cookies.
2. Sanitize user input.
3. Set special HTTP headers (helmet package)

Denial of Service attacks ->
1. Implement rate limiting.
2. Limit body payload.
3. Avoid evil regular expressions.

NoSQL query injection attacks->
1. Use mongoose for MongoDB(because of schema types)
2. Sanitize user inputs.

Other best practices 
1. Always use HTTPS.
2. Create random passwords and reset tokens with expiry dates.
3. Deny access to JWT after password change.
4. Don’t commit sensitive data to git.
5. Don’t send error details to client.
6. Prevent cross site request forgery (csurf package).
7. Require user to re-authenticate before a high value action.
8. Implement a blacklist of untrusted tokens.
9. Keep user logged in with refresh tokens.
10. Implement 2 factor authentication.
11. Prevent parameter pollution causing Uncaught exceptions.

Setting a cookie
Implementing rate limiter as global middleware. (express-rate-limiter)
Implementing sanitize (express-mongo-sanitize).
Avoiding parameter polluting using hpp package 




