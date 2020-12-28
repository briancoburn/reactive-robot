


// let observers = []
// let gData = {}
// function addObserver(ob){
//   if(!observers.find((it)=>{return it===ob})){
//     observers.push(ob)
//   }
// }
// function removeObserver(ob){
//   let index = observers.indexOf(ob)
//   if(index > -1){
//     observers.splice(index,1)
//   }
// }
// function next(event){
//   observers.forEach((ob)=>{
//     ob(event)
//   })
// }
//
// export {observers,gData,addObserver,removeObserver,next}

export let observers = []
export let gData = {}
export function addObserver(ob){
  if(!observers.find((it)=>{return it===ob})){
    observers.push(ob)
  }
}
export function removeObserver(ob){
  let index = observers.indexOf(ob)
  if(index > -1){
    observers.splice(index,1)
  }
}
export function next(event){
  observers.forEach((ob)=>{
    ob(event)
  })
}

//export {observers,gData,addObserver,removeObserver,next}

