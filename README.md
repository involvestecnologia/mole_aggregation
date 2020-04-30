# Mole Aggregation

This project consists of consolidating information from the Mole project on a monthly basis.

## How to execute the project on your local machine ?

To run the project locally you will need to perform 3 steps:

- Run the local ELK infrastructure.
- Create an index of the Mole project with daily information.
- Run Mole Aggregation.

To facilitate this process, I created a docker-compose that starts all this infrastructure, you will only need to activate some settings:

- In the project's root directory start the infrastructure by running the command below on the terminal:

```
docker-compose -f deployments/development/docker-compose.yml up -d
```
- After the infrastructure is running, create the elasticsearch template using the command below:

```json
PUT _template/monthly-analysis
{
    "index_patterns": [
        "monthly-analysis-*"
    ],
    "settings": {
        "number_of_shards": 2,
        "index.lifecycle.name": "3-month-storage-with-month-rotation",
        "index.lifecycle.rollover_alias": "monthly-analysis"
    },
    "mappings": {
        "_source": {
            "enabled": true
        },
        "properties": {
            "timestamp": {
                "type": "date"
            },
            "database": {
                "type": "keyword"
            },
            "collection": {
                "type": "keyword"
            },
            "operation": {
                "type": "keyword"
            },
            "count": {
                "type": "long"
            }
        }
    }
}

PUT monthly-analysis-000001
PUT monthly-analysis-000001/_aliases/monthly-analysis
```
- After making the settings above, just run the project

```
node mole_aggragation.js
```

## How to deploy in production ?

To run the Mole application, just replace the compose parameters and execute:
```yaml
mole_aggregation:
    image: involvestecnologia/mole-aggregation:latest
    container_name: mole_aggregation
    network_mode: host
    environment:
      - ELASTICSEARCH_URL=http://localhost:9200
      - ELASTICSEARCH_INDEX_INPUT=oplog-*
      - ELASTICSEARCH_INDEX_OUTPUT=monthly-analysis
```
