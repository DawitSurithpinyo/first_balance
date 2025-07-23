### Note: this project is in progress, and log files will be updated regularly.

## May 2025
[DawitSurithpinyo](https://github.com/DawitSurithpinyo) and his friend created first version of this project for a college intro app dev class.

## June 2025
[DawitSurithpinyo](https://github.com/DawitSurithpinyo) picked it up again, and implemented first version of authentication system:

- Added Google OAuth login/logout system [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google).

    - Front-end creates token and state, back-end use them along with Google cloud console's Client secret file to verify on Google's server, returning an authorization bearer token. [Adapted from this documentation](https://developers.google.com/identity/protocols/oauth2/web-server).

- Modified DB structure so that each user's data is kept in a dedicated MongoDB collection named after their email.
- Utitlize environment variables (`.env` + pip's `python-dotenv`) to keep secret configs.
- Added necessary Flask [configurations](https://flask.palletsprojects.com/en/stable/config/), such as [session](https://flask-session.readthedocs.io/en/latest/config.html#relevant-flask-configuration-values), [session-cachelib](https://flask-session.readthedocs.io/en/latest/config.html#cachelib), [CORS](https://flask-cors.readthedocs.io/en/latest/api.html), and [caching](https://flask-caching.readthedocs.io/en/latest/index.html).

## 15th - 21st July 2025
- Move main workspace to `dev` branch.
- Keep [Flask app configs as classes](https://flask.palletsprojects.com/en/stable/config/#development-production). This allows cleaner configs management and creating different class for different deployment i.e., development vs production.
- Use [`redis.Redis`](https://redis.readthedocs.io/en/latest/) for caching instead of `FileSystemCache`.
- Refactor my old back-end Flask code from a single `.py` file into more appropriate structure (`Flask app factory pattern ->  middlewares -> controllers -> useCases -> repositories`).

    - Flask app factory pattern (adapted from [this official guide](https://flask.palletsprojects.com/en/stable/patterns/appfactories/) and [this blog](https://medium.com/@ferrohardian/application-factory-pattern-starting-your-flask-project-e17dd2f12013)) allows creating different app instances for configuration/testing.
    
        - The initial idea was to create a class to handle app creation and use as a singleton, but this could be difficult for creating tests with different app configurations in the future.
    - Separating endpoints into layers based on roles allows clearer flows, better testing and error handling, etc.

        - middlewares: handle authentication checking to prevent unauthorized access to restricted API endpoints
        - controllers: Recieve/send data from/to middlewares, handle basic HTTP request headers/bodies checking i.e., missing properties, unexpected structure, error responses.
        - useCases: Recieve/send data from/to controllers. Check and perform business logic.
        - Repositories: Recieve/send data from/to useCases. Query/interact with DB.

    - Every layers, except the middlewares, use OOP to allow cleaner methods management and convenience for future testing. The controller layer uses [Flask-Classful](https://flask-classful.readthedocs.io/en/latest/#module-flask_classful) to define routes in class style.

- Use `dataclasses` to define types (mimicking `interface` of Typescript). This allows clearer codes (What attributes should this data or request have? What is the structure returned by this function?).

    - Planning to incorporate strict type checking tools i.e., `Pydantic` or `MyPy` in the future.

## 22nd July 2025 - now
- Incorporate `Pydantic` into back-end code base for strict run-time type checking