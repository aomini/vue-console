namespace cpp io.agora.billing.events
namespace java io.agora.billing.events



//Vos 计费条目的基本信息
//所有VOS相关的计费条目都会包含这些信息

struct VosHeader {
    2: optional i32 vosip,
    3: optional i32 vid,
    4: optional i64 cid,
    5: optional i32 channelMode, // 当前频道的模式 1 - RTC, 2 - Broadcast
    6: optional string sid,
    7: optional i64 uid,
}

//用户进频道事件
struct VosUJoin {
    1: optional VosHeader header,
    2: optional string cname,
    3: optional i32 channelProfile  //进频道时用户的channel profile, 默认0
}

//用户离开频道事件
struct VosUQuit {
    1: optional VosHeader header,
    2: optional i32 status, //TODO status 含义
    3: optional i64 videoRxKB,
    4: optional i64 videoTxKB,
    5: optional i32 duration  // 用户在这个vos上的时长，单位:秒
}

//视频订阅开始事件,  观众开始订阅视频的时候， 会触发该事件
//观众切换大小流， 会触发一个新的streamType的VosVideoSubStart事件
//该事件由用户端的VOS记录
struct VosVideoSubStart {
    1: optional VosHeader header,
    2: optional i64 speakUid,
    3: optional i32 channelProfile, //进频道时用户的channel profile, 默认0
    4: optional i32 streamType  //大小流， 1 大流 2 小流
}

//视频流发送结束， 主播离开频道，或者取消发送视频。
//该事件由主播端的VOS记录
struct VosVideoSendEnd {
    1: optional VosHeader header,
    2: optional i32 channelProfile // 进频道时用户的channel profile, 默认0
}

//SDK定期上报的视频订阅、发送信息
struct SDKVideoPeriodicProfile {
     1: optional VosHeader header,
     2: optional i32 role,  // 主播 - 1、观众 - 3 ， vos 根据当前用户的角色补充的信息
     3: optional binary data,//透传字段
}

struct VideoPeerState {
    1: optional i64 uid,
    2: optional i32 state,
    3: optional i32 width,
    4: optional i32 height,
    5: optional i32 frameRate,
}

// VOS 定期统计的每个用户的带宽、流量信息
struct VosUserNetstats {
    1: optional VosHeader header,
    2: optional i32 role, // 1- 主播、3 - 观众
    3: optional i64 bandwidthInKbps, //统计周期内的下行带宽 kbps
    4: optional i64 bandwidthOutKbps, //统计周期内的上行带宽 kbps
    5: optional i64 netflowInKB,  //累计下行流量 KB
    6: optional i64 netflowOutKB, //累计上行流量 KB
}

// VOS 定期统计的每个频道的带宽、流量信息
//通常媒体数据会走两路数据，一路直连， 一路通过router 走relay节点。
struct VosChannelNetstats {
    1: optional VosHeader header,
    2: optional i64 netflowInKB, //累计下行流量 KB
    3: optional i64 netflowOutKB, //累计上行流量KB
    4: optional i64 bandwidthInKbps, //统计周期内的下行带宽 kbps
    5: optional i64 bandwidthOutKbps, //统计周期内的上行带宽 kbps
    6: optional i64 netflowRouterKB, //经过所有relay节点的流量，用来计算内部成本KB
}


//计费事件的容器结构， 根据uri来判断具体是什么事件
struct BillingItem {
    1: optional i32 uri,
    2: optional i64 ts,

    1000: optional VosUJoin vosUJoin,
    1001: optional VosUQuit vosUQuit,
    1002: optional VosVideoSubStart vosVideoSubStart,
    1003: optional VosVideoSendEnd vosVideoSendEnd,
    1004: optional VosUserNetstats vosUserNetstats,

    1005: optional SDKVideoPeriodicProfile sdkVideoPeriodicProfile,

    2000: optional VosChannelNetstats vosChannelNetstats,
}