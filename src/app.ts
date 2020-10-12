import 'reflect-metadata';

import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';
import { eventDispatchLoader } from './loaders/eventDispatchLoader';
import { expressLoader } from './loaders/expressLoader';
import { homeLoader } from './loaders/homeLoader';
import { iocLoader } from './loaders/iocLoader';
import { monitorLoader } from './loaders/monitorLoader';
import { publicLoader } from './loaders/publicLoader';
import { swaggerLoader } from './loaders/swaggerLoader';
import { mongoLoader } from './loaders/mongoLoader';
import { winstonLoader } from './loaders/winstonLoader';
import {setDefaults} from './Defaults';

const log = new Logger(__filename);

bootstrapMicroframework({
    loaders: [
        winstonLoader,
        iocLoader,
        eventDispatchLoader,
        mongoLoader,
        expressLoader,
        swaggerLoader,
        monitorLoader,
        homeLoader,
        publicLoader,
    ],
})
    .then(() => {
        banner(log);
        setDefaults();
    })
    .catch(error => log.error('Application is crashed: ' + error));
