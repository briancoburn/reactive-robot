export type EventDataType = {
    [key: string]: any
}
const observers: { [key: string]: {(name:string,data:EventDataType):void} | null } = {}
const store: {[key: string]: any} = {}
let isDebug = false
const rr = {
    observers:observers,
    store:store,
    isDebug: isDebug,
    addObserver: (key:string, observerFunction:(name:string,data:EventDataType)=>void)=>{
        observers[key] = observerFunction
    },
    removeObserver: (key:string)=>{
        observers[key] = null
        delete observers[key]
    },
    next: (name:string, data?:EventDataType)=>{
        if(isDebug){
            console.log('rr::next()==>name:'+name+', data:', data)
        }
        for(const j in observers){
            if(observers[j] !== null && typeof observers[j]==='function'){
                const observerFunction = observers[j] as (name:string,data?:EventDataType)=>void
                observerFunction(name, data || {})
            }
        }
    },
    debug: (val=false)=>{
        isDebug = val
    }
}
export default rr