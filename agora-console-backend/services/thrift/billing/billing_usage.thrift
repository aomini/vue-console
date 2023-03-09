namespace java io.agora.billing.usage

struct UsageItem {
    1: optional i32 vid,
    2: optional i32 sku,
    3: optional i32 startTime,
    4: optional i64 value
}

struct VendorUsage {
    1: optional i32 vid,
    2: optional map<i32, i64> values
}

struct Pagination {
    1: optional i32 skuRank,
    2: optional bool isDescend,
    3: optional list<VendorUsage> vendorUsages,
    4: optional i32 offset,
    5: optional i32 limit,
    6: optional i32 totalCount
}

service UsageService {
    string ping(1: i32 str),

    // 单个厂商查询
    list<UsageItem> getUsageByVendor(1: i32 vid, 2: list<i32> skus, 3: i32 fromTs, 4: i32 toTs, 5: i32 interval),

    // 多个厂商查询
    list<UsageItem> getUsageByVendorList(1: list<i32> vids, 2: list<i32> skus, 3: i32 fromTs, 4: i32 toTs, 5: i32 interval),

    // 厂商群组查询
    list<UsageItem> getUsageByGroup(1: list<i32> vids, 2: list<i32> skus, 3: i32 fromTs, 4: i32 toTs, 5: i32 interval),

    // 用量排名查询，以天为interval的单位
    Pagination getUsageByRank(1: list<i32> skus, 2: i32 skuRank, 3: bool isDescend, 4: i64 minVaue, 5: i64 maxValue, 6: i32 fromTs, 7: i32 toTs, 8: i32 interval, 9: i32 offset, 10: i32 limit),
}
