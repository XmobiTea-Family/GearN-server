import { IChatService, AvatarChannel, ChatChannel, ChatMessage, EditChatMessage, UserChannel } from "./IChatService";
import * as mongoDB from "mongodb";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { GNServer } from "./../../GNServer";

export class ChatService implements IChatService {
    private static MAX_CHAT_COUNT: number = 50; 

    private channelDict: { [k: string]: ChatChannel } = {};

    private channelInfoCollection: mongoDB.Collection<mongoDB.Document>;
    private channelMessageCollection: mongoDB.Collection<mongoDB.Document>;

    public async subscriberChannelAsync(userId: string, channel: string) {
        let isJoinChannel = await this.isJoinChannelAsync(userId, channel);
        if (!isJoinChannel) {
            let thisChannel = await this.getChannelAsync(channel);

            let users = thisChannel.users;
            let currentMilliseconds = xDatetime.getCurrentMilliseconds();
            let user = new UserChannel();
            user.tsJoin = currentMilliseconds;
            user.userId = userId;
            users.push(user);

            let userResult = [];

            for (let i = 0; i < users.length; i++) {
                let user = users[i];

                userResult.push({
                    "UserId": user.userId,
                    "TsJoin": user.tsJoin
                })
            }

            this.channelInfoCollection.updateOne({ "Channel": channel }, {
                $set: {
                    "Users": userResult
                }
            });
        }
    }

    public getUserIds(users: UserChannel[]) {
        let userIds: string[] = [];

        for (let i = 0; i < users.length; i++) {
            let user = users[i];

            userIds.push(user.userId);
        }

        return userIds;
    }

    public async unSubscriberChannelAsync(userId: string, channel: string) {
        let thisChannel = await this.getChannelAsync(channel);

        let users = thisChannel.users;
        let user = users.find(x => x.userId == userId);

        if (user) {
            let indexOf = users.indexOf(user);
            users.splice(indexOf, 1);

            let userResult = [];

            for (let i = 0; i < users.length; i++) {
                let user = users[i];

                userResult.push({
                    "UserId": user.userId,
                    "TsJoin": user.tsJoin
                })
            }

            this.channelInfoCollection.updateOne({ "Channel": channel }, {
                $set: {
                    "Users": userResult
                }
            });
        }
    }

    public async addChatMessageAsync(userId: string, channel: string, msg: string) : Promise<ChatMessage> {
        let thisChannel = await this.getChannelAsync(channel);

        let messages = thisChannel.messages;
        if (messages.length >= ChatService.MAX_CHAT_COUNT) messages.shift();

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        let message = new ChatMessage();
        message.channel = channel;
        message.message = msg;
        message.tsLastUpdate = currentMilliseconds;
        message.tsCreate = currentMilliseconds;
        message.messageEditeds = [];
        message.senderId = userId;
        message.isDelete = false;
        messages.push(message);

        let messageDoc = {
            "Channel": message.channel,
            "Message": message.message,
            "TsLastUpdate": message.tsLastUpdate,
            "TsCreate": message.tsCreate,
            "MessageEditeds": message.messageEditeds,
            "SenderId": message.senderId,
            "IsDelete": message.isDelete
        }
        this.channelMessageCollection.insertOne(messageDoc);

        return message;
    }

    public async editChatMessageAsync(senderId: string, forceEdit: boolean, tsCreate: number, channel: string, msg?: string, isDelete?: boolean): Promise<ChatMessage> {
        let thisChannel = await this.getChannelAsync(channel);

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        let message = thisChannel.messages.find(x => x.tsCreate == tsCreate);

        if (message != null) {
            if (!forceEdit && message["senderId"] != senderId) {
                return null;
            }

            let setData = {} as any;

            if (msg != null) {
                let editChatMessage = new EditChatMessage();
                editChatMessage.message = message.message;
                editChatMessage.tsCreate = currentMilliseconds;
                message.messageEditeds.push(editChatMessage);
    
                message.message = msg;

                let messageEditeds = [];
                for (let i = 0; i < message.messageEditeds.length; i++) {
                    let messageEdited = message.messageEditeds[i];
    
                    messageEditeds.push({
                        "Messsage": messageEdited.message,
                        "TsCreate": messageEdited.tsCreate
                    });
                }

                setData["Message"] = msg;
                setData["MessageEditeds"] = messageEditeds;
            }

            if (isDelete != null) {
                message.isDelete = isDelete;

                setData["IsDelete"] = isDelete;
            }

            message.tsLastUpdate = currentMilliseconds;

            setData["TsLastUpdate"] = message.tsLastUpdate;

            this.channelMessageCollection.updateOne({
                "Channel": channel,
                "TsCreate": tsCreate
            }, {
                $set: setData
            });
        }
        else {
            let result = await this.channelMessageCollection.findOne({ "Channel": channel, "TsCreate": tsCreate });
            if (result != null) {
                let setData = {} as any;
                setData["TsLastUpdate"] = currentMilliseconds;

                if (msg != null) {
                    let messageEditeds = result["MessageEditeds"];
                    messageEditeds.push({
                        "Messsage": result.Message,
                        "TsCreate": currentMilliseconds
                    });

                    setData["Message"] = msg;
                    setData["MessageEditeds"] = messageEditeds;
                }

                if (isDelete != null) {
                    setData["IsDelete"] = isDelete;
                }

                this.channelMessageCollection.updateOne({ "_id": result._id }, {
                    $set: setData
                });
            }
        }

        return message;
    }

    public async editChatChannelAsync(channel: string, name?: string, avatarChannel?: AvatarChannel, channelType?: number): Promise<ChatChannel> {
        let thisChannel = await this.getChannelAsync(channel);

        let setData = {} as any;

        if (name != null) {
            setData["Name"] = name;
            
            thisChannel.name = name;
        }

        if (avatarChannel != null) {
            setData["AvatarChannel"] = {
                "Type": avatarChannel.type,
                "Value": avatarChannel.value
            }

            thisChannel.avatarChannel.type = avatarChannel.type;
            thisChannel.avatarChannel.value = avatarChannel.value;
        }

        if (channelType != null) {
            setData["ChannelType"] = channelType;
            
            thisChannel.channelType = channelType;
        }

        this.channelInfoCollection.updateOne({ "Channel": channel }, {
            $set: setData
        });

        return thisChannel;
    }

    public async isJoinChannelAsync(userId: string, channel: string) {
        let thisChannel = await this.getChannelAsync(channel);

        let user = thisChannel.users.find(x => x.userId == userId);
        return user != null;
    }

    public async getChannelInfoAsync(channel: string) {
        return await this.getChannelAsync(channel);
    }

    public setGNServer(gnServer: GNServer) {
        this.channelInfoCollection = gnServer.getDatabase().runtimeGameCollection("ChannelInfoCollection");
        this.channelMessageCollection = gnServer.getDatabase().runtimeGameCollection("ChannelMessageCollection");
    }

    public run(): void {
        
    }

    private async getChannelAsync(channel: string): Promise<ChatChannel> {
        let thisChannel = this.channelDict[channel];

        if (thisChannel == null) {
            let channelResult = await this.channelInfoCollection.findOne({"Channel": channel}) as mongoDB.Document;
            if (channelResult == null) {
                channelResult = {
                    "Channel": channel,
                    "Name": "",
                    "AvatarChannel": {
                        "Type": 0,
                        "Value": "0"
                    },
                    "Users": [],
                    "TsCreate": xDatetime.getCurrentMilliseconds(),
                    "ChannelType": -1
                }

                this.channelInfoCollection.updateOne({ "Channel": channel }, {
                    $set: channelResult
                },
                {
                    upsert: true
                });
            }

            thisChannel = this.channelDict[channel];

            if (thisChannel == null) {
                thisChannel = new ChatChannel();
                thisChannel.channel = channelResult["Channel"];
                thisChannel.name = channelResult["Name"];

                let avatarChannelResult = channelResult["AvatarChannel"];
                let avatarChannel = new AvatarChannel();
                avatarChannel.type = avatarChannelResult["Type"];
                avatarChannel.value = avatarChannelResult["Value"];
                thisChannel.avatarChannel = avatarChannel;

                let usersResult = channelResult["Users"];
                let users: UserChannel[] = [];
                for (let i = 0; i < usersResult.length; i++) {
                    let userResult = usersResult[i];

                    let userChannel = new UserChannel();
                    userChannel.userId = userResult["UserId"];
                    userChannel.tsJoin = userResult["TsJoin"];

                    users.push(userChannel);
                }

                thisChannel.users = users;
                thisChannel.tsCreate = channelResult["TsCreate"];
                thisChannel.channelType = channelResult["ChannelType"];
                thisChannel.messages = [];

                this.channelDict[channel] = thisChannel;
            }

            let messageResults = await this.channelMessageCollection.find({ "Channel": channel }).sort({"TsCreate": -1}).skip(0).limit(ChatService.MAX_CHAT_COUNT).toArray();
            if (messageResults != null) {
                let messages = thisChannel.messages;

                for (let i = messageResults.length - 1; i >= 0; i--) {
                    let messageResult = messageResults[i];
                    let chatMessage = new ChatMessage();
                    
                    chatMessage.channel = thisChannel.channel;
                    chatMessage.isDelete = messageResult["IsDelete"];
                    chatMessage.message = messageResult["Message"];
                    chatMessage.senderId = messageResult["SenderId"];
                    chatMessage.tsCreate = messageResult["TsCreate"];
                    chatMessage.tsLastUpdate = messageResult["TsLastUpdate"];
    
                    let messageEditeds = messageResult["MessageEditeds"];
    
                    chatMessage.messageEditeds = [];
                    let originMessageEdited = chatMessage.messageEditeds;
    
                    for (let j = 0; j < messageEditeds.length; j++) {
                        let messageEdited = messageEditeds[j];
    
                        let messageChannel = new EditChatMessage();
                        messageChannel.message = messageEdited["Message"];
                        messageChannel.tsCreate = messageEdited["TsCreate"];
    
                        originMessageEdited.push(messageChannel);
                    }
    
                    messages.push(chatMessage);
                }
            }
        }

        return thisChannel;
    }
}
