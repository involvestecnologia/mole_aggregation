# mole_aggregation

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
