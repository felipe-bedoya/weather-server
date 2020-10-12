import {MicroframeworkLoader, MicroframeworkSettings} from 'microframework-w3tec';
import {mongoose} from '@typegoose/typegoose';

export const mongoLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    console.log('Creating conection...');
    const connection = await mongoose.connect('mongodb://localhost/', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'bedoyaweatherdb',
    });
    console.log('Connection created');
    if (settings) {
        settings.setData('connection', connection);
        settings.onShutdown(() => connection.connection.close());
    }
};
