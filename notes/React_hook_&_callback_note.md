# What is a React hook?
Before React introduced hooks, we had to use class to implement custom functional components. They cannot store states of objects or do complex logic aside from rendering UI, unless we declare a constructor method and call `this.setState`.

Hooks let us do it - **implement logics and functionalities into our components** - while being much more clean and straightforward.


## Frequently used hooks
### useState(`<default_value>`)
To store state (current values/properties of a data) across a page.

### useEffect(`<function>`, `<dependency_array>`)
Execute `<function>` (to update or do something) if conditions inside the `<dependency_array>` are met.

The `<dependency_array>` is optional:

You can leave it out
```jsx
useEffect(() => {
  // Runs on every render
});
```

Or put empty array
```jsx
useEffect(() => {
  // Runs only on the first render
}, []);
```

Or use something
```jsx
useEffect(() => {
  // Runs on the first render
  // And any time xyz changes in value
}, [xyz]);
```


## Context
Let us keep state of something globally e.g. across all pages.

First, create context with `createContext()`

Then create a function that lets us access the context in other files (by convention, name should start with 'use')

Then create another function, the context provider.

- Define constants (to keep the state of context), custom functions or logics (what should happen to context when xyz happens)
- In return statement, wrap `<context name>.Provider` (context name start with capital letter) component around React children + attach const or functions with the provider.
    - Then use the provider in layout files to wrap around entire app or specified scope. All the pages or components inside will then have access to all the const and functions we attached with provider.


## useCallback
**Cache** (remembers) a function that runs frequently when dependencies change (same thing as the `<dependencies_array>` in `useEffect`). This prevents re-creation of function unless necessary.


## useMemo
Same as `useCallback`, but cache a value instead of a function.

- "Memoization" = caching a value so that it does not need to be recalculated