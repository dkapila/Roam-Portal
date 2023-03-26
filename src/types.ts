export type RoamBlock = {
    time: number;
    title: string;
    id: string;
    uid: string;
}

export type PortalBlock = RoamBlock & {
    isPage: boolean;
    blockTime: number;
    pageTitle: string;
    blockId: string;
    pageUid: string;
}