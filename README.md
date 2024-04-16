# reactive-robot
reactive-robot is a dead-simple state management solution that is type-safe, performant, scalable and maintainable.

reactive-robot is a state management solution for typescript/javascript, designed and extensively tested with react,
but it is compatible with other frontend frameworks and node.js. reactive-robot is an alternative to useContext, redux, mobx, jotai, 
zustand and other react state management tools. reactive-robot is not really comparable to something like react-query because it has
no opinion about how you fetch data, and it is not intended to sync data with a server.

reactive-robot is an event-based reactive system where all things can be producers and consumers of events. 
It handles async naturally because in reactive-robot, everything is async. There is no need for a browser, memoization, useRef, reducers, atoms, 
context, providers or any other arbitrary rules for interacting with data or preventing unnecessary renders. In reactive-robot you have complete 
access to your store, but events are used to indicate updated data, and you choose what you want to do in response. 

reactive-robot 4.0 has been rewritten in 2024 to be completely type-safe, while using any type of data you want and allowing typescript
to infer types and provide IDE code completion for everything. How? Events are string constants and a store is anything you want. 
And if you don't like the idea of one big store, nothing stops you from having multiple stores. Get atomic, break it down however you want.

If you've worked with other react state management frameworks, you are probably familiar with concepts like actions, reducers, providers and 
immutability. In reactive-robot, events are similar to actions in redux or zustand. But the similarities end there. There is no concept of
a reducer or any sort of method that stands between you and your data. You want to update something, just update it. If the thing you are
updating happens to be in a deeply-nested object, no problem, it's the same as updating any top-level primitive field.

Updating data is what applications do. Making things immutable might seem like a good idea when you are incrementing a count primitive
on the top level of your store, but when you start working in the real world of deeply nested data, this creates enormous inefficiency,
as you need to destructure all the way down to the thing that changes, or use an external library to manage this.

Comparing with zustand

Both reactive-robot and zustand use the concept of a store. But in zustand, the store is part of the framework.
In reactive-robot, create a store if you want, but it is not part of the framework and it is not required.
In zustand, you define your state and action types and create a store that satisfies those requirements. That's
a lot of boilerplate you avoid with reactive-robot. In reactive-robot, just define your store however you want, and
let typescript and your IDE infer everything. You get type-safety and code completion with a minimum of hassle.

In reactive-robot there are no rules for how you structure, access or change your data. The one rule is how you notify
observers that something has happened - by calling rr.next() with a single string argument.

So, to take an example from zustand, say you wanted to increment:
store.deep.nested.obj.count

Can't I just do
store.deep.nested.obj.count++
?

Not in zustand. This is a complex operation that requires destructuring down to obj.count, or the use of an external library like immer.

```angular2html
normalInc: () =>
    set((state) => ({
      deep: {
        ...state.deep,
        nested: {
          ...state.deep.nested,
          obj: {
            ...state.deep.nested.obj,
            count: state.deep.nested.obj.count + 1
          }
        }
      }
    })),
```

In reactive-robot, simply update the field. No actions, no reducers, no immutability, no destructuring, just increment the count.

store.deep.nested.obj.count++

Does someOtherThing need to know that count got updated? Call next() with an event name that someOtherThing is listening for. Then
someOtherThing can decide if it wants to do something in response, like rerender.

reactive-robot is not real opinionated and you can use it as you want, but there are a few concepts and conventions that will help you
get more out of it. 

At it's core, reactive-robot is just a list of observers, populated using the addObserver function. Events over time can
be thought of as a stream, as you would experience with rxjs. When you do some action that you want to respond to, you call next().
In reactive-robot 4.0, next behaves like any javascript event, pass a name for the event, and consumers can listen for that event.
When an event occurs, reactive-robot calls the event handler function, by convention, called onEvent, in each one of the registered observers. 
Each observer decides internally if it is interested in that event, otherwise it is ignored. This is a high-performance, low boilerplate way 
to manage state and communication in any size application. There is nothing hidden, nothing magical, no dependencies. If you think of it
as a simple observer pattern, or pub-sub mechanism, your onEvent method is the observer, and rr.next is the publisher.

Earlier versions of reactive-robot focused on an event payload. In reactive-robot 4.0, the event payload has been removed, and the event name
is the only thing that is passed to the observers. This is because the event payload was rarely used, resulted in more boilerplate and code duplication,
and it is just more efficient to consider a store to be the single source of truth. In a typescript environment, this also avoids the need to 
define types for event payloads. Your data is on the store anyway. Going back to the simple example of a count being incremented, you can 
just update the store, and send rr.next(events.COUNT_UPDATED). Any component that cares about the count can respond to that event.

reactive-robot gives you this API:

- addObserver(key, observerFunction) - key is a unique string identifier for your component, observerFunction is your event handler function, by convention called onEvent
- removeObserver(key) - key is unique string identifier, removes an observer from reactive-robot
- next(evt) - evt is a string, which each observer can decide to react to or not

That's it. Make yourself a store(plain object) and some events(string constants), and you are good to go. It's all you need to manage state
in an application of any size. By convention, your store can just be a plain object in a file called store.ts and your events are string 
constants in a file called events.ts.

In the simple example below, imagine you had an App, with two components, maybe they both act on the same data and need to 
know when the other component has updated the data. All updates are sent as events using rr.next(). This is received by 
the component's onEvent function. When onEvent receives an event, the event is evaluated to see if it is of interest to 
that component. If the event indicates a change in data or state, the component can rerender itself. In reactive-robot, you
have complete control over the rendering process, and you can choose to rerender individual components in response to events, or not.

You may notice the use of useState with [update, setUpdate] in the example below. In reactive-robot, components that are just rendering data
don't need any local state for data at all, but they do need to be told when to rerender. The setUpdate function is a convention that can be used 
to rerender what is essentially a stateless component. reactive-robot has no opinion about local state in components, and obviously you might want to
use it for things like inputs/forms and other local state that doesn't need to be shared globally. The data-rr-timestamp attribute is also
an optional convention that can be used to help with debugging and performance optimization. It is not used by reactive-robot itself, and
you could call it data-whatever-you-want. But by default it is a timestamp the update of which causes a rerender, and which can be examined in the 
DOM.

Also note that addObserver is called in the main function body of a react component. You would not want to register observers in a useEffect, 
because if the component rerendered without calling useEffect, the observer function that is registered with reactive-robot would be stale, and
your component would not receive events. The list of observers that reactive-robot calls is an object where each key is a unique string. So if an
observer is registered multiple times, it's fine, reactive-robot only has one reference to the observer on that key no matter how many times you
call addObserver.

```jsx



example usage

npm install reactive-robot

//Component1.js

```jsx


```

//Component2.js
```jsx


```