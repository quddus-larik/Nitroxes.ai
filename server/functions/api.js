import express from 'express';
import ServerlessHtto from 'serverless-http';

const app = express();

app.get('/.netlify/functions/api', (req,res) => {
    res.send('Hello from express'); 
})

const handler = ServerlessHtto(app);

module.exports.handler = async(event,context) => {
    const result = await handler(event,context);
    return result;
}