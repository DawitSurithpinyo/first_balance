# First balance

A simple web application for managing personal finance, allowing you to create, read, update, and delete transactions.

Presentation and demonstration video: https://youtu.be/OIf4qQnWo2M?feature=shared

Presentation slide: https://drive.google.com/file/d/1dCN53q93K80uZQEd0-ZSSOqe5KtXYk3b/view?usp=sharing


## Note: This web application is not for real world usage or production.
This is only a project for an introductory application development class, and it hasn't been deployed. At the time of creation, authors had no knowledge or experience in user authentication, deployment, and security.

## Logs
*Update 21/06/2025*: After the authors' application development class has ended, this project had been untouched until about a week ago, when [DawitSurithpinyo](https://github.com/DawitSurithpinyo) picked it up again as a personal project to learn more about back-end development, webapp security, and fullstack in general. I (DawitSurithpinyo) just added login and logout via Google OAuth 2.0.

- Added Google OAuth login/logout system ([@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) for front-end/client-side authentication + additional Flask API endpoints for retrieving tokens and other credentials).
- For front-end, the login and logout pages have been created, but with barebone UI for now.
- Each user's data is kept in a dedicated MongoDB collection named after their email.

*Update 15/07/2025*: After gaining some more experience in another project, I realized a lot needs to be improved.

- Development on freeze. Refactoring is starting, with back-end first, then front-end.
- Move to `dev` branch, though I can't say when I'll be good enough to start doing CI/CD pipeline or autodeployment.
