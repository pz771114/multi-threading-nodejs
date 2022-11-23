const express = require('express')
const app = express();
const port = process.env.port || 3000;
const {Worker,workerData} = require('worker_threads');
const path = require('path');

const THREAD_COUNT = 8;

//define routes
app.get('/non-blocking-1',(request,response)=>{
    response.status(200).send('non blocking page 1');
})

app.get('/non-blocking-2',(request,response)=>{
    response.status(200).send('non blocking page 2');
})


const blockingFn = ()=>{
    return new Promise((resolve, reject)=>{
        const worker = new Worker(path.resolve(__dirname,'worker.js'),
        {
            workerData:{
                thread_count:THREAD_COUNT
            }
        });

        worker.on('message',(data)=>{
            resolve(data);
        });

        worker.on('error',(message)=>{
            reject(message);
        });
        
    });
}
app.get('/blocking',async (request,response)=>{
    console.time('counter');

    const workerPromises = [];
    for(let i=0; i<THREAD_COUNT;i++)
    {
        workerPromises.push(blockingFn());
    }
    
    const result = await Promise.all(workerPromises);
    let data =0;
    for(let i =0;i<THREAD_COUNT;i++)
    {
        data += result[i];
    }
    response.status(200).send(`blocking page : ${data}`);
    
    console.timeEnd('counter');
})

app.listen(port, ()=>{
    console.log(`App is listening on port :${port}`);
})