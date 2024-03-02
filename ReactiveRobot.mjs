let observers = {}
let store = {}
let isDebug = false
let ReactiveRobot = {
  observers:observers,
  store:store,
  isDebug: isDebug,
  addObserver: (key, observerFunction)=>{
    observers[key] = observerFunction
  },
  removeObserver: (key)=>{
    observers[key] = null
    delete observers[key]
  },
  next: (name, data)=>{
    if(isDebug){
      console.log('rr::next()==>name:'+name+', data:', data)
    }
    for(let j in observers){
      if(typeof observers[j]==='function'){
        observers[j](name, data)
      }
    }
  },
  debug: ()=>{
    isDebug = true
  }
}
export default ReactiveRobot