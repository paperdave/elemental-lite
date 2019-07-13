#!/bin/bash
status=0

echo Running Tests

npm run lint           || status=1
npm run spelling       || status=1

exit $status
