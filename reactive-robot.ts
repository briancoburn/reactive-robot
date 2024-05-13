export type ObjectDataType<T> = Record<string, T>
export type ObserverFunctionType = <T>(name:string, data:ObjectDataType<T>)=>void
const observers = {} as Record<string, ObserverFunctionType>
const rr = {
    addObserver: (key:string, observerFunction:ObserverFunctionType) => {
        observers[key] = observerFunction;
    },
    removeObserver: (key:string) => {
        delete observers[key];
    },
    next: <T>(name:string, data?:ObjectDataType<T>) => {
        for (const j in observers) {
            observers[j](name, data || {})
        }
    },
}
export default rr