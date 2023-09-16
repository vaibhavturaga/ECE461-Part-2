/*
import fetch from 'node-fetch';
console.log('fired first');
console.log('fired second');

setTimeout(()=>{
    console.log('fired third');
},2000);

console.log('fired last');

/*

const getData = (dataEndpoint) => {
    return new Promise ((resolve, reject) => {
      //some request to the endpoint;
      
      if(request is successful){
        //do something;
        resolve();
      }
      else if(there is an error){
        reject();
      }
    
    });
 };


 // Example asynchronous function
function asynchronousRequest(args: string | null, callback: (error: Error | null, response?: { body: string }) => void) {
    // Throw an error if no arguments are passed
    if (!args) {
      return callback(new Error('Whoa! Something went wrong.'))
    } else {
      return setTimeout(
        // Just adding in a random number so it seems like the contrived asynchronous function
        // returned different data
        () => callback(null, { body: args + ' ' + Math.floor(Math.random() * 10) }),
        500,
      )
    }
  }
  
  // Nested asynchronous requests
  function callbackHell() {
    asynchronousRequest('First', function first(error, response) {
      if (error) {
        console.log(error)
        return
      }
      console.log(response?.body)
      asynchronousRequest('Second', function second(error, response) {
        if (error) {
          console.log(error)
          return
        }
        console.log(response?.body)
        asynchronousRequest(null, function third(error, response) {
          if (error) {
            console.log(error)
            return
          }
          console.log(response?.body)
        })
      })
    })
  }
  
  // Execute 
  callbackHell()
  

// Initialize a promise
const promise = new Promise((resolve, reject) => {
    resolve('We did it!')
  })
  .then((response)=>{
    console.log(response)
  })

const promise2 = new Promise((resolve, reject)=>{
    setTimeout(()=> resolve('Resolving an asynchronous request!'), 2000)
})

promise2.then((response) => {
    console.log(response)
    return response + ' and chaining'
})
.then((secondResponse) => {
    console.log(secondResponse)
})
console.log(promise2)


function getUsers(onSuccess: boolean) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Handle resolve and reject in the asynchronous API
        if (onSuccess) {
          resolve([
            {id: 1, name: 'Jerry'},
            {id: 2, name: 'Elaine'},
            {id: 3, name: 'George'},
          ])
        } else {
          reject('Failed to fetch data!')
        }
      }, 1000)
    })
  }

  getUsers(false)
  .then((response)=>{
    console.log(response)
  })
  .catch((error)=>{
    console.error(error)
  })

fetch('https://api.github.com/users/octocat')
.then((response: any)=>{
    return response.json()
})
.then((data: any) => {
    console.log(data)
})
.catch((error: Error) => {
    console.error(error)
}) */

async function getUser() {
    return {}
  }

  getUser().then((response) => console.log(response))