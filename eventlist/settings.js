import { Duration } from 'https://cdn.jsdelivr.net/npm/luxon@3.4.4/+esm';

export const settings = {
    sbHost: "localhost",
    sbMainPort: 8060,
    sbEnableDisablePort: 9091,

    enableEvents: true,

    historyAddress: "twitch-endpoint.gently.org.uk",
    historyPort: 443,
    historyAPIKey: "d382f7f3f57e4c45a62af425c643b6be",

    backgroundImage: "../media/eventBackground.png",
    shouldFade: true,
    fadeTime: 7,
    maxEvents: 4,
    eventFilter: [
        "bits",
        "follow",
        "sub",
        "giftsub",
        "resub",
        "raid"
    ],

    showHost: true,

    showRaid: true,

    showFollow: true,
    followMinimumAccountAge: Duration.fromObject({ hours: 1 }),

    showSub: true,

    showResub: true,

    showGiftSub: true,

    showCheer: true,
};

