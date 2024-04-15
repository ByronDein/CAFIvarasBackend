const mongoose = require('mongoose');
const URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'prueba';
const collectionName = 'alumnos';
const fieldName = 'correo';

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: dbName,
})

const connection = mongoose.connection;

connection.on('error', err => console.log(err));
connection.once('open', async () => {
    console.log('DB is connected');

    const collection = connection.collection(collectionName);
    const cursor = collection.find();

    for await (const doc of cursor) {
        await collection.updateOne(
            { _id: doc._id },
            { $set: { [fieldName]: doc[fieldName].toLowerCase() } }
        );
    }
});
