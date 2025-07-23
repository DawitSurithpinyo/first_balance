### This is for things not fitting in log/devDiary.md (not new "updates" or "commits"), but ones I want to take note anyway.

TO NOTE:

- When is OOP/design patterns appropriate

    - Singleton bad?

- .vscode and .venv config (python3 activate, edit venvconfig)
- what is linting
- When to use SQL vs NoSQL
- Flask application context
- Proper understanding of the same origin policy and CORS
- HTTP Authorization vs cookies headers (difference and use cases?)

    - Store in cookies vs in Redis cache? (Efficiency, security implications, etc)

- Google OAuth `flow.redirect_uri` is which one? `postmessage` or actual redirect uri registered in the Google cloud console?

    - Where documentation for `postmessage` and why it works for client-side authorization + state and code gen -> server-side verify and retrieve token, but actual redirect uri doesn't?

- Manual login flow: enter username, email, and password -> hash and salt password in back-end. That's it. Is this bad? Should I try implementing according to some standard instead, like OAuth or JWT?
- Why do some say JWT is bad for webapp's main authentication/authorization? (https://www.reddit.com/r/node/comments/16r7ugm/many_website_say_that_jwt_is_dangerous_to_use_so/)

    - Mainly because the token can't be revoked at all (stateless?). Any more reasons?
    - Many recommends using it just for non-main auth to access sub-systems, or use as OTP. Then what is the alternative for main auth? I need one for the manual login.

- How to verify `state` and access token in `authMiddleware` for incoming requests, according to OAuth 2.0?

- XSS, CSRF, replay attack