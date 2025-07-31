### This is for things not fitting in log/devDiary.md (not new "updates" or "commits"), but ones I want to take note anyway.

TO NOTE:

## OOP
### When is OOP/design patterns appropriate?
- Unless it's something small i.e., scripts for automation on a small part/system, it's often beneficial to use OOP. 
    - It's easier to explain behavior and flows of classes. We can model product/system as objects of classes and their behavior and attributes.
    - We can isolate classes and specifically test them with different parameters. Downside is when the program is complex, mocking dependencies for unit tests can be harder than functional programming.

- Overall, it's great when the system is large and have different parts with their own logic, or in scenarios where it's beneficial to have a blueprint or base class i.e., default configs, and many objects want to inherit the base and either add their own properties, override defaults, or keep them (polymorphism).

A good discussion explaining when OOP is good and when it's excessive. Mostly can be applied generally, but beware that this answer is for a specific StackOverflow question.
https://softwareengineering.stackexchange.com/a/325825

### Why is singleton pattern generally discouraged?
First, a common misconception between singleton and "single instance":

"Singleton": Just one and only one instance of a class throughout the program's entire lifetime. It has non-public constructor that simply returns the already created class instance or create a new one if there is none (which means, again, this class can only be instantiated once).

"Single instance": A class that, either intentionally or unintentionally, is created only once during the run-time (maybe it's a central resource holder for the server, for example). However, this does NOT stop it from being created more than once.

- **What makes singleton bad IF not used properly:**

    - Hard to test. It could make many other objects depends on the singleton (tight coupling).
    - Very hard to inherit from the singleton.
    - Just make sure that, if you really want to use singleton, you'll need only ONE instance of the thing at all time, in every threads.

- I think the serverManager (first idea for Flask app pattern) is single instance, not a true singleton. It's just a class with method to start the app and things, with getter methods for app/Redis/MongoDB instances, but it did NOT prevent creating more than one serverManager instance. If you're a stalker, I did not push that serverManager code to any branch, so you're not going to see it.
- Anyway, read https://www.bennadel.com/blog/3380-singleton-vs-single-instance-and-a-decade-of-unnecessary-guilt.htm and https://softwareengineering.stackexchange.com/a/40610 for more information.

## IDE/environment boilerplate configs
### `.vscode`
- VSCode workspace-specific setting: there is `.vscode` folder on the root directory of our project. This might make it easier to share settings with other through GitHub, for example.
    - There might be a `settings.json` file in the `.vscode` folder. In there, we can set location of our `.env` file that Python can point to and use in this project i.e., `"python.envFile": "${workspaceFolder}/backend/.env"` = "here at the root of our project (`${workspaceFolder}`), go to the `backend` folder. There will be a `.env` file there. Use it."
    - See more [here](https://code.visualstudio.com/docs/python/environments#_environment-variables).

### `.venv`
- `.venv` config: If you have a `.venv` environment already created but not recognized by terminal anymore (often happens when shutting down computer and starting again), and killing current terminal and starting new one still doesn't help, you can:
    - **Go to directory `.venv` is in.**
    - `source .venv/bin/activate`

- In `.venv/pyvenv.cfg`, you can adjust `command` to tell it to point to the correct directory for your project's `.venv`. Might be useful especially when `.venv` is not at the project's root.

## General programming
### Compile-time vs run-time
- Compile-time: **when you're still writing code (not running)**, and your computer automatically convert your code into machine code.
- Run-time: **When you run your code.** Your computer will execute the machine code it receives from compile-time.

- Example: you write a code declaring a string variable (`x: string = "hi"`), but down the line you write `x = x + 12`. 
    - If you are writing in a "statically typed language" like Typescript or C, your IDE will immediately give you an error on the `x = x + 12` line and won't allow you to run the code. AKA error during compile-time.
    - But if you're using a "dynamically typed language" like Python, it won't give you an error on the `x = x + 12` line, and it will only throw an error once you run the code (run-time) and the program tries to execute the `x = x + 12` line (you can't add a string with an int). That's a run-time error, and it's bad because your program will entirely stop executing just because of the `x = x + 12` line.

### Dependency injection programming technique
- Often, as codes become more complex, there will be dependencies i.e., code of class/function A depends on class/function/whatever B.
- This makes A and B *tightly coupled*: A is highly dependent on B, and when you want to deploy, reuse, or test A with different configurations, you'll need to edit so much of B. Likewise, if you change B, behavior of A will change a lot.
- Dependency injection solves this by simply allowing us to create B however we want, then "inject" it into A. A will use what we injected.
    - "Inject": A accept any instance of B through constructor, function arguments, etc. See [this](https://en.wikipedia.org/wiki/Dependency_injection#Types_of_dependency_injection) for more info.
    - Without dependency injection, we'd let A create B on its own (thus hard-coding configurations of B), and we'd have no power to configure B, or it's extremely hard.
- You can imagine this would make it a lot easier for testing with different configurations.

### what is linting?
- Process of scanning the code base/souce code to do basic checking of bugs, errors, stylistic issues, etc. For example, declaring same variable twice, use of snake case (if you set the rule that your team must use camel case), tracking `FIXME`s and `TODO`s, etc.
    - It may seem unnecessary, but as the code base grow, it becomes easier and easier to make these "basic mistakes," miss them, and let them cause problems during run-time.
    - A "linter" or a "linting tool" is self-explanatory: a software for linting your code. For example, Javascript has ESLint. You can declare rules ("hey, we will use camel case, so flag snake case if you find one"), exceptions (if you find this, don't flag it, it's intentional), etc.
        - Some say (as a joke) Typescript is just Javascript linter, lmfao.

### What is a middleware?
- Example: In an IT system of a company, product X will produce some outputs, and product Y and Z will consume those outputs, and so on. X is a "middleware."
- Another example: Sensitive API endpoints need to check that the users making requests are authenticated and authorized before allowing them. We can add a "middleware" that checks security matters. If the check pass, let the requests go to destination endpoints.


## Architecture
### stateful vs stateless software
- Stateful is when the *server* stores information about the client in each session. Stateless is of course the opposite i.e., you make the client (user's browser) store all current session's information in cookies or headers.
    - Pros of stateful:
        - Server can remember details from previous interactions with the client. For example, if it's an e-commerce website, server can remember what products the user has put in their cart before. So as long as the session on the server is maintained, the products in the cart are still going to be there. This often leads to less data required for each request/transmission too.
        - Centralized sessions management. Back-end have complete control of user sessions, which may create better security, unless improper implementation or "the weakest link is really weak and got exploited".
    - Cons of stateful:
        - Harder to scale. Since it all depends on sessions in the server, too many users or requests can worsen performance. Complex architecture of load balancers/CDN stuffs and caching needs to be implemented.

- Front-end/UI has nothing to do with "stateful" or "stateless." Even if the front-end can "keep" user's selected products in cart via React context (for example), it's just going to disappear once the user close the tab. There is no session on a server to store those information.
- Note that "stateful" vs "stateless" can be used for network protocols too. For example, HTTP is a stateless application-layer protocol, because each HTTP requests are independent of each other. For example, request $n$ doesn't know anything about request $n-1$.

### Multithreading, concurrency, parallelism, and asynchrony
- "Thread": pretty difficult to explain intuitively or what it means exactly. See answers from https://stackoverflow.com/questions/5201852/what-is-a-thread-really.
- Concurrency: computer executing $>1$ tasks by quickly switching between them from start to finish, but NOT doing more than one task AT ONCE. A bit like one counter, with one cashier, serving two lines of customer; this counter can serve more than one lines, but the cashier CANNOT take more than one person at a time.
- Parallelism: computer executing $>1$ tasks by actually doing more than one tasks AT ONCE i.e., multi-core CPUs. A bit like a counter with two cashiers; not only can they serve more than one lines of customer, but they also CAN take more than one customer at a time.
- Multithreading: One of the possible tools to achieve concurrency. It means spawning more than one threads to execute a program.
- Asynchrony (like `async`/`await`): With a single thread, task A can be executed without having to wait for task B to be completed. A does its own things while waiting for task B to notify that it has completed its operation.
    - Example: When you make a request to a server, you don't need to wait for the response to do things like UI update (like loading screen) or making another request. Once the front-end is notified with a response, then maybe it can change from loading screen to something like "submission complete," for example.
    - While you *could* open another thread for requesting to server, it isn't necessary, because all that the thread will be doing is nothing but waiting for a response.

- Concurrency doesn't always mean you have more than one threads (`async`, for example). More than one threads doesn't always mean parallelism either i.e., single-core CPUs.

- Sources:
    - https://www.reddit.com/r/learnprogramming/comments/rg77v4/concurrency_vs_asynchronous/
    - https://stackoverflow.com/questions/4844637/what-is-the-difference-between-concurrency-parallelism-and-asynchronous-methods

## Database
### When to use SQL vs NoSQL
- Generally, when you can map out that the data parts of your application will have some kind of relations or dependencies, and your schema is not super flexible/will not change wildly too often (which is like most of the time), SQL is better.
- But when you can see that, in your use case, your data will be very flexible:
    - Significant difference in fields and values when comparing between data points
    - The number of possible schema is too large, or the schema can often change
- Then it might be better to use NoSQL. To give an example, consider a situation where we have to keep users' workout data. A user can workout in many days, and each day with potentially different workout types.
    - If we use SQL, we'd have to keep track of how many possible workout types there are and valid values for each one (which can always be really different between users), normalize them (foreign key to a dedicated workout types table), and do a lot of work on editing schema, tables, and queries when things change.
        - It would be a nightmare to `join` users table too. Imagine the possible combinations of workout types and values.
    - In contrast, let's say we use NoSQL and define one collection for one user, one document inside it for one day, and inside it are arbitrary sub-documents of workout types that person did in that day. Essentially nested JSONs.
    - You'd not have to worry about possible types of workouts and their really flexible schemas, because we are storing workouts as JSON entities that are easy to query (no `join`s needed).

- All in all, I don't feel like this is an easy topic with silver bullets. I think it would require experiences working with many products and use cases to gain intuition whether SQL or NoSQL suits a situation the best. But I presume SQL works for 60% - 80% of real world use cases.
- Source:
    - https://sqlinsix.medium.com/when-to-use-sql-or-nosql-b50d4a52c157

### What is an ORM (Object-Relational Mapping) tool?
- SQL/relational databases are very popular, but as it scales up, with more and more schema definitions and tables, it becomes harder to query and maintain relations.
- We can use the idea of OOP, where we represent entities as objects with relationships. But to mimic that in SQL DB, we'd have to create a set of tables mimicking objects and their relations, which can be hard.
- So that's exactly what an ORM tool does for you. We just need to define "Models" (classes with relationships), and the ORM tool will automatically map it to valid SQL tables, relationships, and types. Querying also becomes much easier, as all you need to do are select the right function from the ORM library and supply correct parameters and values to query. The ORM will do `WITH(...) AS xx, SELECT ...` or whatever queries necessary for you.
    - This can speed up development time.
    - Come to think about it, MongoDB (ironically NoSQL) interfaces for usage and querying already feels like it's inherently designed to "mimic" ORM.
- That being said:
    - It becomes another library/framework to learn.
    - Some ORM libraries are not optimal i.e., they call `SELECT * FROM table` or other load-heavy queries when not necessary, which can lead to performance issues in large systems. Learning how to write complex SQL queries that are also good and fast is pretty hard, but worth it in the long run.
    - It is possible that some queries we want to do are so complex that we can't do them through an ORM.

- Sources:
    - https://www.baeldung.com/cs/object-relational-mapping
    - https://dev.to/cies/the-case-against-orms-5bh4
    - Some other articles I lost track of

## Flask
- Flask application context
- Flask-Session
- Flask-Caching
- Flask-CORS
- setting response object via `@after_this_request` decorator
- [Security considerations](https://flask.palletsprojects.com/en/stable/web-security/#security-considerations)

## HTTP
- HTTP cookies vs other headers (difference, use cases, security implications, etc)
### HTTP status code 401 vs 403
- 401 (unauthorized): the request lacks valid authentication credentials for the target resources. *If the request includes authentication credentials, then 401 means*  ***the server refused authorization for those credentials.***
    - So 401 is better for invalid CSRF token. The credential (CSRF token) is there, but it's not valid. ***The server refused authorization for that CSRF token.***
    - "The request lacks valid authentication credentials": this means "User not authenticated" is also obviously 401.

- 403 (forbidden): server understood the request, but refuses to fulfill it. *If the request contains authentication credential, then 403 should mean the server deems it* ***insufficient***.
    - This should be thrown when the user is *already authenticated*, but tries to access ***forbidden*** resources i.e., normal user trying to access admin tools. Their privilege is ***insufficient***.

- [Source](https://datatracker.ietf.org/doc/html/rfc9110#name-client-error-4xx)

## cache vs session vs cookies
- Store in cookies (client-side session) vs session vs in Redis cache? (Efficiency, security implications, etc)

## Security
### Authentication vs authorization

### The same origin policy and CORS

### OAuth (Open Authorization)
- Google OAuth `flow.redirect_uri` is which one? `postmessage` or actual redirect uri registered in the Google cloud console?

    - Where documentation for `postmessage` and why it works for client-side authorization + state and code gen -> server-side verify and retrieve token, but actual redirect uri doesn't?

- Manual login flow: enter username, email, and password -> hash and salt password in back-end. That's it. Is this bad? Should I try implementing according to some standard instead, like OAuth or JWT?

### JWT (JSON Web Token)
- Why do some say JWT is bad for webapp's main authentication/authorization? (https://www.reddit.com/r/node/comments/16r7ugm/many_website_say_that_jwt_is_dangerous_to_use_so/)

    - Mainly because the token can't be revoked at all (stateless?). Any more reasons?
    - Many recommends using it just for non-main auth to access sub-systems, or use as OTP. Then what is the alternative for main auth? I need one for the manual login.

### Common attacks
- SQL/NoSQL injection, XSS, CSRF, replay attack, SSRF, HTTP parameter pollution, attacks motivated from storing passwords in DB (rainbow table, brute-force guessing hashes, etc)
- What are they? How do they work? How do we prevent them, and have I implement countermeasure against them in the project?

#### Other attacks that may not be related to web, but doesn't hurt to take note of
- Buffer overflow, improper deserialization, side channel attacks