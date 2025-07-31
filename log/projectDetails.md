### Note: this project is in progress, and log files will be updated regularly.

## What is this?
A CRUD web application for personal finance tracking. Primarily a sandbox for [DawitSurithpinyo](https://github.com/DawitSurithpinyo) to learn more about fullstack (especially back-end) development, webapp security, coding structure/architecture, basic computer networking, optimal DB management, and hopefully DevOps and cloud in the future.


## Tech stack
Front-end: React.js, Typescript

Back-end: Python, Flask

DB: MongoDB

Caching: Redis

## If you care enough to read until here
I sympathize with you for seeing the 10,000th personal finance webapp project along with 20,000 other to-do list projects.

But I really do care about the details. As I've said above, it's solely for my learning. I don't expect it to be "novel" or "solve real world business problems."

Just to give some examples, I:

- Follow OWASP guidelines on security (authentication, password storage, common attacks prevention, etc). 

    - Used Python's `Bandit` for basic insecure code checking. Will use OWASP ZAP in the future.
    - Ensure that when user is logging in by Google OAuth, client-side will generate state/CSRF token.
- Refactor my old back-end Flask code to better structures for clean concern separations and testability.
- Follow conventions/best practices on working with Git, GitHub, and all the tools and frameworks used in the project.