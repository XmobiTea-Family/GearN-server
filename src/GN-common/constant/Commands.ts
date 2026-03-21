export class Commands {
	// Indicates whether USER AGENT.
	public static readonly USER_AGENT: string = "User-Agent";

	// Stores the CONTENT TYPE value used by this instance.
	public static readonly CONTENT_TYPE: string = "Content-Type";
	// Stores the CONTENT LENGTH value used by this instance.
	public static readonly CONTENT_LENGTH: string = "Content-Length";
	// Stores the APPLICATION JSON value used by this instance.
	public static readonly APPLICATION_JSON: string = "application/json";
	// Stores the APPLICATION MsgPack value used by this instance.
	public static readonly APPLICATION_MSGPACK: string = "application/msgpack";

	// Stores the request auth token cmd value used by this instance.
	public static readonly RequestAuthTokenCmd: string = "Auth-Token";
	// Stores the request secret cmd value used by this instance.
	public static readonly RequestSecretCmd: string = "Secret-Key";
	// Stores the request game ID cmd value used by this instance.
	public static readonly RequestGameIdCmd: string = "Game-Id";

	// Stores the request cmd msg pack value used by this instance.
	public static readonly RequestCmd_MsgPack: string = "rMsgPack";
	// Stores the response cmd msg pack value used by this instance.
	public static readonly ResponseCmd_MsgPack: string = "rMsgPack";
	// Stores the event cmd msg pack value used by this instance.
	public static readonly EventCmd_MsgPack: string = "eMsgPack";

	// Stores the request cmd JSON value used by this instance.
	public static readonly RequestCmd_Json: string = "rJson";
	// Stores the response cmd JSON value used by this instance.
	public static readonly ResponseCmd_Json: string = "rJson";
	// Stores the event cmd JSON value used by this instance.
	public static readonly EventCmd_Json: string = "eJson";

	// Stores the data value used by this instance.
	public static readonly Data: string = "data";
	// Stores the file value used by this instance.
	public static readonly File: string = "file";

}
