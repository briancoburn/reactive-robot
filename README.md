# reactive-robot

The reactive-robot framework is a state management solution for typescript/javascript, designed and extensively tested with react,
but it is compatible with other frontend frameworks and node.js. reactive-robot is an alternative to useContext, redux, mobx, jotai, zustand and other 
react state management tools. reactive-robot is an event-based system that is designed to facilitate highly decoupled and performant applications. 
It does this by giving you granular control over the rendering process, and allowing you to couple it to state as you see fit. It handles async naturally because in 
reactive-robot, everything is async. There is no need for memoization, useRef, reducers, atoms, providers or any other silly rules for interacting with global data.
In reactive-robot you have complete access to the global store, but events are used to indicate updated data, and you choose what you want to do in response.
reactive-robot 3.0 has been rewritten in typescript and it's just 33 lines of code. For legacy node and javascript compatibility, use ReactiveRobot.js/mjs, which
are effectively the same rr3.0 with no types.

In reactive-robot, you have a global store, and you have events. You can read and write to the global store as you see fit, 
but you should only rerender components in response to events, not changes to the store.

The rules are
- do not react to changes in global state as you would with traditional observables or providers
- only update components locally, or in response to events sent using the rr.next() method
- when calling rr.addObserver, make sure you pass a unique identifier and a callback function, by convention called onEvent
- the onEvent callback function should accept an event name, and optional data object

At it's core, reactive-robot is just a list of observers, populated using the addObserver function. Events over time can
be thought of as a stream, as you would experience with rxjs. When you do some action that you want to respond to, you call next().
In reactive-robot 3.0, next behaves like any javascript event, pass a name for the event, and an optional data object. When an event occurs,
reactive-robot calls the event handler function, by convention, called onEvent, in each one of the observers. Each observer
decides internally if it is interested in that event, otherwise it is ignored. This easily scales to thousands of observers
and millisecond level event granularity.

In the simple example below, imagine you had an App, with two components, maybe they both act on the same data and need to 
know when the other component has updated the data. All updates are sent as events using rr.next(). This is received by 
the component's onEvent function. When onEvent receives an event, the event, it is evaluated to see if it is of interest to 
that component. If the event indicates a change in data or state, the component can rerender itself. In reactive-robot, you
have complete control over the rendering process, and you can choose to rerender components in response to events, or not.

The rr.store object is provided as a convenience to store global data, you can use it if you want to. The point of the 
whole thing is when Component1 gets an event that should cause a rerender, nothing else needs to be listening for that 
event, so rendering can easily be pushed down to the leaves of your component tree. Compared to other popular frameworks 
for react state management, reactive-robot events are extremely lightweight with minimal boilerplate.

You can also use reactive-robot for debugging. If you are using it correctly, rr becomes a chokepoint for everything
that happens in your application. Call rr.debug() to set to debug mode, and reactive-robot will print all events to 
the console.

If you are smart about naming your events, you might not have any problem remembering them. For instance, say you have 
a user object. The user enters their data, and they want to send that to an api. The event name might logically be
'user.create' or 'user.update'. When the server returns a successful PATCH for an update, the resulting event might logically
be 'user.updated', or if it failed, 'user.update.failed' - but if you have too many event types that are too hard to remember, 
it might make sense to put your event types into a constants file. This is up to you. In general, if your event types
follow the convention of thing.action.result as above, your events will be self-documenting.

In 33 lines of code, reactive-robot gives you this API:

- store - global data object - read and write as you see fit. It is not observable and it is not immutable.
- addObserver(key, observerFunction) - key is a unique identifier for your component, observerFunction is your event handler function, by convention called onEvent
- removeObserver(key) - key is unique identifier
- next(eventName, data) - eventName is a string, data is an optional object
- debug(isDebug) - true or false. Puts reactive-robot in/out of debug mode and it will print all events to the console


example usage

npm install reactive-robot

//Component1.js

```jsx
import {useState,useEffect} from "react";
import rr from 'reactive-robot'

function Component1() {
  //add this component as an observer in the function body, not in useEffect   
  rr.addObserver('Component1', onEvent)//first arg must be a unique identifier!
  useEffect(()=>{
    //put reactive-robot in debug mode  
    rr.debug()
    //add some data to the global store
    rr.store.importantMessage = 'any data that needs to be accessed globally can be stored here'
    //let other components know that the data has changed
    rr.next('importantMessage')
    setTimeout(()=>{
      //after timeout, send a friendly greeting to Component2
      rr.next('updateFromComponent1', {greeting:'hello from Component1'})
    },1000)
  },[])

  const onEvent = (name, data)=>{
    switch(name){
      case 'updateFromComponent2':
        console.log('C1::got update from C2==>evt.data:', data)
        break
    }
  }
  return (
    <div className="Component1">
      {'Component1'}
    </div>
  );
}

export default Component1;

```

//Component2.js
```jsx
import {useEffect} from "react";
import rr from 'reactive-robot'

function Component2() {
  
  const [myImportantMessage, setMyImportantMessage] = useState('')
  const [myReceivedGreeting, setMyReceivedGreeting] = useState('')
  useEffect(()=>{
    rr.addObserver('Component2', onEvent)
    setTimeout(()=>{
      rr.next('updateFromComponent2', {greeting:'hello from Component2'})
    },1000)
  },[])

  const onEvent = (name, data)=>{
    switch(name){
      case 'importantMessage':
        console.log('C2::got importantMessage update==>setting local myImportantMessage to rerender')
        setMyImportantMessage(rr.store.importantMessage)
        break    
      case 'updateFromComponent1':
        console.log('C2::got update from C1==>data.greeting:', data.greeting)
        break
    }
  }

  return (
    <div className="Component2">
      {'Component2'}
      <div>{myImportantMessage}</div>  
      <div>{'greeting from C1:'}</div>  
    </div>
  );
}

export default Component2;

```