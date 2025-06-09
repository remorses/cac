#!/bin/bash

count=0
max_count=10000

while [ $count -lt $max_count ]; do
    echo "Request #$((count + 1)) at $(date)"
    curl -H 'accept: */*' -H 'user-agent: Zed/0.191.0 (macos; aarch64)' 'https://api.zed.dev/extensions/spiceflow-theme/download?min_schema_version=0&max_schema_version=1&min_wasm_api_version=0.0.1&max_wasm_api_version=0.6.0'
    echo "Completed request #$((count + 1))"
    count=$((count + 1))
    if [ $count -lt $max_count ]; then
        sleep 0.1
    fi
done
