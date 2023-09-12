## Description

This simple application show how to get `events` and `logs` from realtime notification
using [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

## Requirements

* Node 10+
* A Running [MeshCube](https://www.blueupbeacons.com/index.php?page=meshcube) instance.


## Common setup

Clone the repo and install the dependencies.

```bash
git clone https://github.com/daframax/meshcube-sse.git
cd meshcube-sse
```

```bash
npm install
```

## Running the application

To start the application launch the main script passing the MeshCube base url and the required target (events or logs)

```bash
node index.js «MESHCUBE_URL» events | logs
```




