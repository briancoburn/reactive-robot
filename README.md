# reactive-robot
reactive-robot is a dead-simple state management solution that is type-safe, performant, scalable and maintainable.

It works with typescript/javascript, designed and extensively tested with react, but it is compatible with other frontend frameworks 
and node.js. reactive-robot is an alternative to useContext, redux, mobx, jotai, zustand and other react state management tools. 
reactive-robot is not really comparable to something like react-query because it has no opinion about how you fetch data, and it 
is not intended to sync data with a server.

reactive-robot is an event-based reactive system where all things can be producers and consumers of events. 
It handles async naturally because in reactive-robot, everything is async. There is no need for a browser, memoization, useRef, reducers, atoms, 
context, providers or any other arbitrary rules for interacting with data or preventing unnecessary renders. In reactive-robot you have complete 
access to your store, but events are used to indicate updated data, and you choose what you want to do in response. 

reactive-robot 5.0 has been rewritten in 2024 to be completely type-safe, while using any type of data you want and allowing typescript
to infer types and provide IDE code completion for everything. How? Events are string constants with an optional object payload and a store 
is anything you want. Set it up and let typescript infer what's in it. And if you don't like the idea of one big store, nothing stops you 
from having multiple stores. Get atomic, break it down however you want. Like the store, event payloads are defined by you, and you can use
any type of data you want.

If you've worked with other react state management frameworks, you are probably familiar with concepts like actions, reducers, providers and 
immutability. In reactive-robot, events are similar to actions in redux or zustand. But the similarities end there. There is no concept of
a reducer or any sort of method that stands between you and your data. You want to update something, just update it. If the thing you are
updating happens to be in a deeply-nested object, no problem, it's the same as updating any top-level primitive field. If something happens
asynchronously, no problem, just send an event when it's done.

Does someOtherThing need to know that something updated? Call next() with an event name that someOtherThing is listening for. Then
someOtherThing can decide if it wants to do something in response, like rerender.

reactive-robot is not real opinionated and you can use it as you want, but there are a few concepts and conventions that will help you
get more out of it. 

At it's core, reactive-robot is just a list of observers, populated using the addObserver function. Events over time can
be thought of as a stream, as you would experience with rxjs. When you do some action that you want to respond to, you call next().
In reactive-robot 5.0, next() behaves like any javascript event, pass a name for the event, and consumers can listen for that event.
The event can contain an optional Object data payload. When an event occurs, reactive-robot calls the event handler function, 
by convention, called onEvent, in each one of the registered observers. Each observer decides internally if it is interested in that event, 
otherwise it is ignored. This is a high-performance, low boilerplate way to manage state and communication in any size application. 
There is nothing hidden, nothing magical, no dependencies. If you think of it as a simple observer pattern, or pub-sub mechanism, 
your onEvent method is the observer, and rr.next is the publisher.

reactive-robot gives you this API: 
- addObserver(key, observerFunction) - key is a unique string identifier for your component, observerFunction is your event handler function, by convention called onEvent which should be an ObserverFunctionType
- removeObserver(key) - key is unique string identifier, removes an observer from reactive-robot
- next(evt, data) - evt is a string, which each observer can decide to react to or not, data is an optional Object payload

That's it. Make yourself a store(plain object) and some events(string constants), and an EventData interface and you are good to go. 
It's all you need to manage state in an application of any size. By convention, your store can just be a plain object in a file called store.ts 
and your events are string constants in a file called events.ts. In that same file, you can define an EventData interface that is used to type the
data payload of your events. Make all fields optional, then any event you create can include payload data on that key, or not.

In the simple example below, imagine you had an App, with two components, maybe they both act on the same data and need to 
know when the other component has updated the data. All updates are sent as events using rr.next(). This is received by 
the component's onEvent function. When onEvent receives an event, the event is evaluated to see if it is of interest to 
that component. If the event indicates a change in data or state, the component can rerender itself. In reactive-robot, you
have complete control over the rendering process, and you can choose to rerender individual components in response to events, or not.
Nothing automatic, nothing magic, just an optimized developer workflow to produce code that is easy to scale and maintain.

You may notice the use of useState with [update, setUpdate] in the example below. In reactive-robot, components that are just rendering data
don't need any local state for data at all, but they do need to be told when to rerender. The setUpdate function is a convention that can be used 
to rerender what is essentially a stateless component. reactive-robot has no opinion about local state in components, and obviously you would want to
use it for things like inputs/forms and other local state that doesn't need to be shared globally. In the example below, you could put the incDecAmount
for each component on the global store, but local component state handles this more efficiently. The data-rr-timestamp attribute is also
an optional convention that can be used to help with debugging and performance optimization. It is not used by reactive-robot itself, and
you could call it data-whatever-you-want. But by default it is a timestamp the update of which causes a rerender, and which can be examined in the 
DOM. 

Also note that addObserver is called in the main function body of a react component. You would not want to register observers in a useEffect, 
because if the component rerendered without calling useEffect, the observer function that is registered with reactive-robot would be stale, and
your component would not receive events. The list of observers that reactive-robot calls is an object where each key is a unique string. So if an
observer is registered multiple times, it's fine, reactive-robot only has one reference to the observer on that key no matter how many times you
call addObserver. This is also why you need a unique key, or id, for each observer. If they are not unique, the last observer registered with that
key will be the only one that is called by reactive-robot.

Let's dive into some code and see how reactive-robot works. Let's say we have two components, Component1 and Component2, and they both can display
and update a global value, count. When one component updates the count, the other component should be notified and rerendered. And let's say one
of the components displays the source of the update, but the other component does not. Because only one component cares about where the update came
from, we'll keep that out of our global state and send it on an event payload.

In reactive-robot, you don't need to have a global store, but it is very useful. The store is entirely defined by you, and reactive-robot doesn't
care what it looks like or what data it contains. Just setup a store, add whatever data you want, supplying your own types for complex objects and
allowing typescript to infer the rest.

store.ts
```
const store = {
  count:0,
}
export default store

```

In reactive-robot, events are a string, with an optional data Object. It is useful to just define your events as string constants. For the optional
data payload, create an interface that is used to type the data payload of your events. Make all fields optional, then any event you create can 
optionally include an EventData type, using only the fields that it cares about.

events.ts

```
export const COUNT_UPDATE='COUNT_UPDATE'

export interface EventData {
  updatedBy?:string
}
```

Here, Component1 includes local state for incDecAmount, but the count it is displaying comes directly from the global store. Because it 
has no local state for count, it uses a fake state update to rerender. Because this component doesn't use any data from an event payload, 
it does not need to include that parameter in the onEvent function. It only needs to know that the count has been updated, so it can rerender.
A switch statement in onEvent is useful to set up initially, even with a single event. As your app scales, you can just add whatever other
events the component cares about.

Component1.tsx

```
import { useState } from 'react'
import rr from "reactive-robot";
import store from "./utils/store.ts";
import {COUNT_UPDATE} from "./utils/events.ts";

function Component1() {
  const [update, setUpdate] = useState(Date.now())
  const [incDecAmount, setIncDecAmount] = useState('1')
  const onEvent = (name:string)=>{
    switch(name){
      case COUNT_UPDATE:
        setUpdate(Date.now())//fake state update!
        break
    }
  }
  rr.addObserver('Component1', onEvent)
  const handleIncrementClick = () => {
    store.count = store.count += parseInt(incDecAmount)
    rr.next(COUNT_UPDATE, {updatedBy:'Component1'})
  }
  console.log('Component1::render()')
  return (
    <section data-rr-timestamp={update} className='component'>
      <span>Component1:</span>
      <span>count:{store.count}</span>
      <span>Increment/Decrement Amount</span>
      <input type='number' value={incDecAmount} onChange={(evt) => {
        setIncDecAmount(evt.target.value)
      }}></input>
      <button onClick={handleIncrementClick}>update</button>
    </section>
  )
}

export default Component1


```

Component2 is similar to Component1, but it displays the source of the update. It uses local state to display the source of the update, and
this is updated from the payload that is received in the COUNT_UPDATE event. Note that Component2 doesn't care where the update came from, it
can update itself in response to an event it sends. It does not need a fake state update to rerender, because it is updating local state in 
response to the COUNT_UPDATE event.

Component2.tsx

```
import { useState } from 'react'
import rr from "reactive-robot";
import store from "./utils/store.ts";
import {COUNT_UPDATE, type EventData} from "./utils/events.ts";

function Component2() {
  const [updatedBy, setUpdatedBy] = useState('')
  const [incDecAmount, setIncDecAmount] = useState('1')
  const onEvent = (name:string, data:EventData)=>{
    switch(name){
      case COUNT_UPDATE:
        setUpdatedBy(data.updatedBy || '')
        break
    }
  }
  rr.addObserver('Component2', onEvent)
  const handleIncrementClick = () => {
    store.count = store.count += parseInt(incDecAmount)
    rr.next(COUNT_UPDATE, {updatedBy:'Component2'})
  }
  return (
    <section className='component'>
      <span>Component2:</span>
      <span>count:{store.count}</span>
      <span>Increment/Decrement Amount</span>
      <input type='number' value={incDecAmount} onChange={(evt) => {
        setIncDecAmount(evt.target.value)
      }}></input>
      <button onClick={handleIncrementClick}>update</button>
      <span>{`updated by:${updatedBy}`}</span>
    </section>
  )
}

export default Component2



```