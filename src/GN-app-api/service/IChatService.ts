export class UserChannel {
    userId: string;
    tsJoin: number;
}

export class AvatarChannel {
    type: number;
    value: string;
}

export class ChatChannel {
    channel: string;
    name: string;
    avatarChannel: AvatarChannel;
    users: UserChannel[];
    tsCreate: number;
    channelType: number;
    messages: ChatMessage[];
}

export class EditChatMessage {
    message: string;
    tsCreate: number;
}

export class ChatMessage extends EditChatMessage {
    channel: string;
    tsLastUpdate: number;
    messageEditeds: EditChatMessage[];
    senderId: string;
    isDelete: boolean;
}

export interface IChatService {
    subscriberChannelAsync(userId: string, channel: string): Promise<void>;

    unSubscriberChannelAsync(userId: string, channel: string): Promise<void>;

    addChatMessageAsync(userId: string, channel: string, msg: string): Promise<ChatMessage>;

    editChatMessageAsync(senderId: string, forceEdit: boolean, tsCreate: number, channel: string, msg?: string, isDelete?: boolean): Promise<ChatMessage>;

    editChatChannelAsync(channel: string, name?: string, avatarChannel?: AvatarChannel, channelType?: number): Promise<ChatChannel>;

    isJoinChannelAsync(userId: string, channel: string): Promise<boolean>;

    getChannelInfoAsync(channel: string): Promise<ChatChannel>;

    getUserIds(users: UserChannel[]): string[];
}
