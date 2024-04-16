type ObserverFunctionType = (name:string)=>void
const observers = {} as Record<string, ObserverFunctionType>
const rr = {
    addObserver: (key:string, observerFunction:ObserverFunctionType) => {
        observers[key] = observerFunction;
    },
    removeObserver: (key:string) => {
        delete observers[key];
    },
    next: (name:string) => {
        for (const j in observers) {
            observers[j](name)
        }
    },
}
export default rr