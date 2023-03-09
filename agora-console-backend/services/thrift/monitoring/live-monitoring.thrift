namespace java io.agora.datahub.statistics

struct TimeSeriesData {
    1: required i32 timestamp,
    2: required double value
}

struct QueryTimeSeriesRequest {
    1: required i32 vid,
    2: required i32 startTime,
    3: required i32 endTime,
    4: required i32 category
}

struct QueryTimeSeriesResponse {
    1: optional i32 vid,
    2: optional i32 category,
    3: optional string message,
    4: optional list<TimeSeriesData> data
}

struct TimeSeriesReport {
    1: required i32 timestamp,
    2: optional i32 counter,
    3: optional double rate,
    4: required i32 vid,
    5: required i32 category
}

struct PutTimeSeriesRequest {
    1: required list<TimeSeriesReport> data
}

struct PutTimeSeriesResponse {
    1: optional bool success,
    2: optional string message
}

service StatisticsService {
    QueryTimeSeriesResponse queryTimeSeries(1: QueryTimeSeriesRequest request)
    PutTimeSeriesResponse putTimeSeries(1: PutTimeSeriesRequest request)
}
