import app from './app.js';
import dotenv from 'dotenv';
import ConnectDb from './src/Database/ConnectDb.js';

dotenv.config();

ConnectDb().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log('Error in connecting to the database',err);
})



