if (process.argv.length <= 3) {
    return console.info('Usage: node index.js «url» events | logs');
}

const url = process.argv[2];
const target = process.argv[3];

let endpoint;
const EP_EVENTS = 'events';
const EP_LOGS = 'logs';
switch (target) {
    case EP_EVENTS:
        endpoint = url.endsWith('/') ? `${url}bpe/events` : `${url}/bpe/events`;
        break;
    case EP_LOGS:
        endpoint = url.endsWith('/') ? `${url}bpe/logs` : `${url}/bpe/logs`;
        break;
    default:
        console.error('Invalid option. Only «events» or «logs» are accepted');
        process.exit(1);
        break;
}

const EventSource = require('eventsource');
const sse = new EventSource(endpoint);

const Json = data => {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.warn('unable to parse event data', error);
    }
}

sse.addEventListener('error', function (e) {
    if (e.eventPhase == EventSource.CLOSED) {
        sse.close();
        return console.info('Closed by Server');
    }

    console.log('Error', e);
});

sse.addEventListener('open', function (e) {
    console.log('Stream open. Waiting for events');
});

sse.addEventListener('event', function (e) {
    const evt = Json(e.data);
    if (evt) {
        console.info(`Event #${e.lastEventId}`);
        console.info(evt);
        console.info();
    }
});

const stringCast = value => {
    if (typeof value === 'undefined' || value == null) return '';
    if (value.toString === 'function') return value.toString();

    return ('' + value);
}

const DateTime = timestamp => {
    let d = new Date(timestamp);

    const year = d.getFullYear();
    const month = stringCast(d.getMonth() + 1).padStart(2, '0');
    const day = stringCast(d.getDate()).padStart(2, '0');
    const hours = stringCast(d.getHours()).padStart(2, '0');
    const minutes = stringCast(d.getMinutes()).padStart(2, '0');
    const seconds = stringCast(d.getSeconds()).padStart(2, '0');
    const mseconds = stringCast(d.getMilliseconds()).padStart(3, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${mseconds}`;
};

sse.addEventListener('syslog', function (e) {
    const item = Json(e.data);
    if (item) {
        let type;
        switch (item.type) {
            case 1:
                type = 'Information';
                break;
            case 2:
                type = 'Warning';
                break;
            case 4:
                type = 'Error';
                break;
            case 8:
                type = 'Debug';
                break;
            case 16:
                type = 'Verbose';
                break;
            default:
                type = 'Unknown';
                break;
        }
        // Timestamp
        console.log(`${DateTime(item.timestamp)} - «${type}» message from «${item.source}»`);
        console.log(item.message);
        console.log();
    }
});

process.on('SIGINT', () => {
    console.info();
    console.info('Terminating...');
    if (sse) {
        sse.close();
    }
});



