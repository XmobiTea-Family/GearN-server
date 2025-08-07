export class Commands {
    public static readonly USER_AGENT: string = "User-Agent";

    public static readonly CONTENT_TYPE: string = "Content-Type";
    public static readonly CONTENT_LENGTH: string = "Content-Length";
    public static readonly APPLICATION_JSON: string = "application/json";
    public static readonly APPLICATION_MSGPACK: string = "application/msgpack";

    public static readonly RequestAuthTokenCmd: string = "Auth-Token";
    public static readonly RequestSecretCmd: string = "Secret-Key";
    public static readonly RequestGameIdCmd: string = "Game-Id";

    public static readonly RequestCmd_MsgPack: string = "rMsgPack";
    public static readonly ResponseCmd_MsgPack: string = "rMsgPack";
    public static readonly EventCmd_MsgPack: string = "eMsgPack";

    public static readonly RequestCmd_Json: string = "rJson";
    public static readonly ResponseCmd_Json: string = "rJson";
    public static readonly EventCmd_Json: string = "eJson";

    public static readonly Data: string = "data";
    public static readonly File: string = "file";

}
