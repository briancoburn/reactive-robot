

<p align="center">
  <img src="https://user-images.githubusercontent.com/16736249/184500573-aefec4d8-e234-46a5-9fa7-24a49462023f.png"/>
</p>

The reactive-robot framework is a state management solution for javascript, designed and extensively tested with react,
but it is compatible with other frontend frameworks and node.js. reactive-robot is an alternative
to useContext, redux, mobx and other react state management tools. reactive-robot is an event-based system that is designed
to facilitate highly decoupled and performant react applications. It does this by giving you granular control over the 
rendering process, and allowing you to couple it to state as you see fit. It handles async naturally because in 
reactive-robot, everything is async. Memoization is unnecessary unless you have a framework that internally requires it,
because in reactive-robot rendering only happens in response to events at any level, which you control. 

The rules are
- do not react to changes in global state as you would with traditional observables or providers
- only update components locally, or in response to events sent using the rr.next() method
- when calling rr.addObserver, make sure you pass a unique identifier
- the onEvent callback function should accept an object with fields type(String) and data(Object) - type is required, data is optional

At it's core, reactive-robot is just a list of observers, populated using the addObserver function. Events over time can
be thought of as a stream, as you would experience with rxjs. When you do some action that changes data, you call next(), 
passing an object containing a type field and an optional data field. When an event occurs,
reactive-robot calls the event handler function, by convention, called onEvent, in each one of the observers. Each observer
decides internally if it is interested in that event, otherwise it is ignored. This easily scales to thousands of observers
and millisecond level event granularity.

In the simple example below, imagine you had an App, with two components, maybe they both act on the same data and need to 
know when the other component has updated the data. All updates are sent as events using rr.next(). This is received by 
the component's onEvent function. When onEvent receives an event, the event, an object, will contain a type field and 
might contain a data update, or the rr.gData(globalData object) might contain the new data, and receiving an event might 
indicate a component should update from rr.gData. The receiving component can decide and update local state to rerender. 

The rr.gData object is provided as a convenience to store global data, you can use it if you want to. The point of the 
whole thing is when Component1 gets an event that should cause a rerender, nothing else needs to be listening for that 
event, so rendering can easily be pushed down to the leaves of your component tree. Compared to using Actions and 
Reducers in redux, reactive-robot events are extremely lightweight and require a fraction of the boilerplate code needed 
for state management in redux.

You can also use reactive-robot for debugging. If you are using it correctly, rr becomes a chokepoint for everything
that happens in your application. Call rr.debug() to set to debug mode, and reactive-robot will print all events to 
the console.

If you are smart about naming your events, you might not have any problem remembering them. For instance, say you have 
a user object. The user enters their data, and they want to send that to an api. The type of the event might logically be
'user.create' or 'user.update'. When the server returns a successful PATCH for an update, the resulting event might logically
be 'user.updated', or if it failed, 'user.update.failed' - but if you have too many event types that are too hard to remember, 
it might make sense to put your event types into a constants file. This is up to you. In general, if your event types
follow the convention of thing.action.result as above, your events will be self-documenting.

Some UI frameworks may internally implement top-down observables or providers, and in this case you may need to
use memoization with reactive-robot if you have performance or rendering issues that are outside of what reactive-robot 
can control. Basically, reactive-robot cannot guarantee optimal rendering performance with UI frameworks that have 
internal observers - but it will still give you a superior state management solution.

reactive-robot API

- gData - global data object - read and write as you see fit. It is not observable and it is not immutable.
- addObserver(key, observerFunction) - key is a unique identifier for your component, observerFunction is your event handler function, by convention called onEvent
- removeObserver(key) - key is unique identifier
- next(event) - event is an object with two fields, type, a string identifying the type of event, and data, an object containing data related to the event
- debug() - takes no arguments. Puts reactive-robot in debug mode and it will print all events to the console


example usage

npm install reactive-robot

//Component1.js

```jsx
import {useEffect} from "react";
import rr from 'reactive-robot'

function Component1() {
  console.log('rr:', rr)
  useEffect(()=>{
    rr.debug()
    rr.gData.importantMessage = 'any data that needs to be accessed globally can be stored here'
    rr.addObserver('Component1', onEvent)//first arg must be a unique identifier!
    setTimeout(()=>{
      rr.next({type:'updateFromComponent1', data:{greeting:'hello from Component1'}})
    },1000)
  },[])

  const onEvent = (evt)=>{
    switch(evt.type){
      case 'updateFromComponent2':
        console.log('C1::got update from C2==>evt.data:', evt.data)
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
  console.log('rr:', rr)
  useEffect(()=>{
    rr.addObserver('Component2', onEvent)
    setTimeout(()=>{
      rr.next({type:'updateFromComponent2', data:{greeting:'hello from Component2'}})
    },1000)
  },[])

  const onEvent = (evt)=>{
    switch(evt.type){
      case 'updateFromComponent1':
        console.log('C2::got update from C1==>evt.data:', evt.data)
        break
    }
  }

  return (
    <div className="Component2">
      {'Component2'}
    </div>
  );
}

export default Component2;

```
