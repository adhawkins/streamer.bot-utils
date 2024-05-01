import { Duration } from 'https://cdn.jsdelivr.net/npm/luxon@3.4.4/+esm';

export const settings = {
    sbHost: "localhost",
    sbMainPort: 8060,
    sbEnableDisablePort: 9091,

    enableAlerts: true,

    showAvatars: true,
    shouldFade: true,
    fadeTime: 7,
    playSound: true,

    testCommands: true,
    testRequiresModerator: false,

    showSub: true,
    subImage: "../media/sub.png",
    subSound: "../media/sub.mp3",
    subText: "%user_name% has subscribed with Prime",
    subLevelText: "%user_name% has subscribed at Tier %data_subTier%",

    showResub: true,
    resubSound: "../media/resub.mp3",
    resubImage: "../media/resub.png",
    resubText: "%user_name% has resubbed for %data_cumulativeMonths% months",
    showResubMessage: true,

    showGiftSub: true,
    giftSubSound: "../media/giftsub.mp3",
    giftSubImage: "../media/giftsub.png",
    giftText: "%user_name% has gifted a sub to %data_recipientDisplayName%",
    giftLevelText: "%user_name% has gifted a Tier %data_subTier% sub to %data_recipientDisplayName%",

    showGiftBomb: true,
    giftBombSound: "../media/giftbomb.mp3",
    giftBombImage: "../media/giftbomb.png",
    giftBombText: "%user_name% has gifted a sub to %data_recipientDisplayName%",
    giftBombLevelText: "%user_name% has gifted a Tier %data_subTier% sub to %data_recipientDisplayName%",

    showFollow: true,
    followImage: "../media/follow.png",
    followSound: "../media/follow.mp3",
    followText: "%user_name% has followed",
    followMinimumAccountAge: Duration.fromObject({ hours: 1 }),

    showCheer: true,
    cheerImage: "../media/cheer.png",
    cheerSound: "../media/cheer.mp3",
    cheerText: "%user_name% has donated %data_message_bits% bits",

    showRaid: true,
    raidImage: "../media/raid.png",
    raidSound: "../media/raid.mp3",
    raidText: "Raided by %user_name%",
    raidViewersText: "Raided by %user_name% with %data_viewers% viewers",
    ignoreRaids: [
        {
            user: "verstappenfan133",
            minViewers: 2,
        },
        {
            user: "fazecolin_69",
            minViewers: 2,
        },
        {
            user: "single_sanjay",
            minViewers: 2,
        },
    ],


    showHost: true,
    hostSound: "../media/host.mp3",
    hostImage: "../media/host.png",
    hostText: "Hosted by %user_name%",
    hostViewersText: "Hosted by %user_name% with %data_viewers% viewers",

    showHypeTrainStart: true,
    hypeTrainStartSound: "../media/hypetrainstart.mp3",
    hypeTrainStartImage: "../media/hypetrainstart.png",

    showHypeTrainLevelUp: true,
    hypeTrainLevelUpSound: "../media/hypetrainlevelup.mp3",
    hypeTrainLevelUpImage: "../media/hypetrainlevelup.png",

    showHypeTrainEnd: true,
    hypeTrainEndSound: "../media/hypetrainend.mp3",
    hypeTrainEndImage: "../media/hypetrainend.png",
};

