let observers = {}
let gData = {}
let isDebug = {}
let ReactiveRobot = {
  observers:observers,
  gData:gData,
  isDebug: isDebug,
  addObserver: (key, observerFunction)=>{
    observers[key] = observerFunction
  },
  removeObserver: (key)=>{
    observers[key] = null
    delete observers[key]
  },
  next: (event)=>{
    if(isDebug){
      console.log('rr::next()==>event.type:'+event.type+', event.data:', event.data)
    }
    for(let j in observers){
      if(typeof observers[j]==='function'){
        observers[j](event)
      }
    }
  },
  debug: ()=>{
    isDebug = true
  }
}
export default ReactiveRobot