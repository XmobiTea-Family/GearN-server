/**
 * Centralizes HTTP header names, content-type values, socket frame commands,
 * and multipart field names used by the SDK transport layer.
 */
export class Commands {
	/**
	 * HTTP header used to identify the SDK client variant and version.
	 */
	public static readonly USER_AGENT: string = "User-Agent";

	/**
	 * HTTP header that declares the request body content type.
	 */
	public static readonly CONTENT_TYPE: string = "Content-Type";

	/**
	 * HTTP header that declares which response content types the client accepts.
	 */
	public static readonly ACCEPT: string = "Accept";

	/**
	 * HTTP header that carries the serialized request body size in bytes when required.
	 */
	public static readonly CONTENT_LENGTH: string = "Content-Length";

	/**
	 * MIME type used for JSON request and response payloads.
	 */
	public static readonly APPLICATION_JSON: string = "application/json";

	/**
	 * MIME type used for MessagePack request and response payloads.
	 */
	public static readonly APPLICATION_MSGPACK: string = "application/msgpack";

	/**
	 * Transport header used to send the current auth token with HTTP requests.
	 */
	public static readonly RequestAuthTokenCmd: string = "Auth-Token";

	/**
	 * Transport header used to send the selected route secret key with HTTP requests.
	 */
	public static readonly RequestSecretCmd: string = "Secret-Key";

	/**
	 * Transport header used to send the current game id when the backend requires it.
	 */
	public static readonly RequestGameIdCmd: string = "Game-Id";

	/**
	 * Socket command name for MessagePack operation requests.
	 */
	public static readonly RequestCmd_MsgPack: string = "rMsgPack";

	/**
	 * Socket command name for MessagePack operation responses.
	 */
	public static readonly ResponseCmd_MsgPack: string = "rMsgPack";

	/**
	 * Socket command name for MessagePack pushed events.
	 */
	public static readonly EventCmd_MsgPack: string = "eMsgPack";

	/**
	 * Socket command name for JSON operation requests.
	 */
	public static readonly RequestCmd_Json: string = "rJson";

	/**
	 * Socket command name for JSON operation responses.
	 */
	public static readonly ResponseCmd_Json: string = "rJson";

	/**
	 * Socket command name for JSON pushed events.
	 */
	public static readonly EventCmd_Json: string = "eJson";

	/**
	 * Multipart field name used for non-file payload data.
	 */
	public static readonly Data: string = "data";

	/**
	 * Multipart field name used for uploaded file content.
	 */
	public static readonly File: string = "file";

	/**
	 * Reverse-proxy helper header that carries the original base URL when needed.
	 */
	public static readonly BaseUrl: string = "X-BaseUrl";
}
