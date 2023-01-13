export class Commands {
    public static readonly USER_AGENT: string = "User-Agent";
    
    public static readonly CONTENT_TYPE: string = "Content-Type";
    public static readonly CONTENT_LENGTH: string = "Content-Length";
    public static readonly APPLICATION_JSON: string = "application/json";
    public static readonly APPLICATION_MSGPACK: string = "application/msgpack";

    public static readonly RequestAuthTokenCmd: string = "a";

    public static readonly RequestCmd_MsgPack: string = "r";
    public static readonly ResponseCmd_MsgPack: string = "r";
    public static readonly EventCmd_MsgPack: string = "e";

    public static readonly RequestCmd_Json: string = "t";
    public static readonly ResponseCmd_Json: string = "t";
    public static readonly EventCmd_Json: string = "y";

    public static readonly Data: string = "d";
    public static readonly File: string = "f";

}
