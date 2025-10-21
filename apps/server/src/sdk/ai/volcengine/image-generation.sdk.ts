import axios, { AxiosInstance } from "axios";
import * as crypto from "crypto";

export interface VolcengineSubmitResponse {
    code: number;
    message: string;
    status: number;
    data?: {
        task_id: string;
    };
}

export interface VolcengineQueryResponse {
    code: number;
    message: string;
    status: number;
    data?: {
        status: "in_queue" | "generating" | "done" | "not_found" | "expired";
        image_urls?: string[] | null;
        binary_data_base64?: string[] | null;
    };
}

const ImageGenerationError = {
    PRE_IMAGE_RISK: "Pre Img Risk Not Pass",
    POST_IMAGE_RISK: "Post Img Risk Not Pass",
    TEXT_RISK: "Text Risk Not Pass",
    POST_TEXT_RISK: "Post Text Risk Not Pass",
    RATE_LIMIT: "Request Has Reached API Limit, Please Try Later",
    CONCURRENT_LIMIT: "Request Has Reached API Concurrent Limit, Please Try Later",
    INTERNAL_ERROR: "Internal Error",
    INTERNAL_RPC_ERROR: "Internal RPC Error",
} as const;

export interface SubmitImagePayload {
    req_key: string;
    prompt: string;
    image_urls?: string[];
    size?: number;
    width?: number;
    height?: number;
    scale?: number;
    force_single?: boolean;
    min_ratio?: number;
    max_ratio?: number;
}

export interface QueryImagePayload {
    req_key: string;
    task_id: string;
    req_json?: string;
}

export interface ImageGenerationConfig {
    endpoint: string;
    region: string;
    service: string;
    accessKeyId: string;
    secretAccessKey: string;
    defaultReqKey: string;
    timeout?: number;
}

export interface SubmitResult {
    taskId: string;
    raw: VolcengineSubmitResponse;
}

export interface QueryResult {
    status: "in_queue" | "generating" | "done" | "not_found" | "expired";
    imageUrls?: string[];
    base64List?: string[];
    raw: VolcengineQueryResponse;
}

/**
 * 火山引擎图片生成SDK
 *
 * 封装火山引擎即梦4.0 API调用逻辑
 */
export class VolcengineImageGenerationSDK {
    private readonly axiosInstance: AxiosInstance;

    constructor(private readonly config: ImageGenerationConfig) {
        this.axiosInstance = axios.create({
            baseURL: config.endpoint,
            timeout: config.timeout ?? 10000,
        });
    }

    public getDefaultReqKey(): string {
        return this.config.defaultReqKey;
    }

    async submitTask(payload: SubmitImagePayload): Promise<SubmitResult> {
        const body: any = {
            req_key: payload.req_key ?? this.config.defaultReqKey,
            prompt: payload.prompt,
        };

        // 只添加有值的可选参数
        if (payload.image_urls && payload.image_urls.length > 0) {
            body.image_urls = payload.image_urls;
        }
        if (payload.size !== undefined) {
            body.size = payload.size;
        }
        if (payload.width !== undefined) {
            body.width = payload.width;
        }
        if (payload.height !== undefined) {
            body.height = payload.height;
        }
        if (payload.scale !== undefined) {
            body.scale = payload.scale;
        }
        if (payload.force_single !== undefined) {
            body.force_single = payload.force_single;
        }
        if (payload.min_ratio !== undefined) {
            body.min_ratio = payload.min_ratio;
        }
        if (payload.max_ratio !== undefined) {
            body.max_ratio = payload.max_ratio;
        }

        const query = {
            Action: "CVSync2AsyncSubmitTask",
            Version: "2022-08-31",
        };

        const headers = this.buildHeaders(JSON.stringify(body), query.Action, query.Version);

        console.log("[VolcengineSDK] Submit task request:", {
            endpoint: this.config.endpoint,
            query,
            body,
            headers: {
                ...headers,
                Authorization: headers.Authorization?.substring(0, 50) + "...",
            },
        });

        try {
            const response = await this.axiosInstance.post<VolcengineSubmitResponse>("/", body, {
                params: query,
                headers,
            });

            const data = response.data;

            console.log("[VolcengineSDK] Submit task response:", data);

            if (data.code !== 10000 || !data.data?.task_id) {
                throw this.transformError(data);
            }

            return {
                taskId: data.data.task_id,
                raw: data,
            };
        } catch (error) {
            if (error.response) {
                console.error("[VolcengineSDK] API Error Response:", {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers,
                });
            }
            throw error;
        }
    }

    async queryTask(payload: QueryImagePayload): Promise<QueryResult> {
        const body: QueryImagePayload = {
            ...payload,
            req_key: payload.req_key ?? this.config.defaultReqKey,
        };

        const query = {
            Action: "CVSync2AsyncGetResult",
            Version: "2022-08-31",
        };

        const response = await this.axiosInstance.post<VolcengineQueryResponse>("/", body, {
            params: query,
            headers: this.buildHeaders(JSON.stringify(body), query.Action, query.Version),
        });

        const data = response.data;

        if (data.code !== 10000) {
            throw this.transformError(data);
        }

        const status = data.data?.status ?? "not_found";

        return {
            status,
            imageUrls: data.data?.image_urls ?? undefined,
            base64List: data.data?.binary_data_base64 ?? undefined,
            raw: data,
        };
    }

    private buildHeaders(body: string, action: string, version: string) {
        const contentType = "application/json";
        const now = new Date();
        
        // 火山引擎要求的日期格式: YYYYMMDDTHHmmssZ (移除所有 -, : 和毫秒)
        const datetime = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
        const date = datetime.substring(0, 8); // YYYYMMDD
        
        const host = new URL(this.config.endpoint).host;
        const canonicalURI = "/";
        const canonicalQuery = `Action=${action}&Version=${version}`;
        const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-date:${datetime}\n`;
        const signedHeaders = "content-type;host;x-date";
        const hashedPayload = crypto.createHash("sha256").update(body).digest("hex");
        const canonicalRequest = `POST\n${canonicalURI}\n${canonicalQuery}\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`;

        const algorithm = "HMAC-SHA256";
        const credentialScope = `${date}/${this.config.region}/${this.config.service}/request`;
        const stringToSign = `${algorithm}\n${datetime}\n${credentialScope}\n${crypto
            .createHash("sha256")
            .update(canonicalRequest)
            .digest("hex")}`;

        const signingKey = this.getSigningKey(date);
        const signature = crypto
            .createHmac("sha256", signingKey)
            .update(stringToSign)
            .digest("hex");

        const authorization = `${algorithm} Credential=${this.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

        console.log("[VolcengineSDK] Signing details:", {
            datetime,
            date,
            canonicalRequest: canonicalRequest.substring(0, 200) + "...",
            stringToSign: stringToSign.substring(0, 150) + "...",
        });

        return {
            "Content-Type": contentType,
            Host: host,
            "X-Date": datetime,
            Authorization: authorization,
        };
    }

    private getSigningKey(date: string) {
        const kDate = crypto
            .createHmac("sha256", this.config.secretAccessKey)
            .update(date)
            .digest();
        const kRegion = crypto.createHmac("sha256", kDate).update(this.config.region).digest();
        const kService = crypto.createHmac("sha256", kRegion).update(this.config.service).digest();
        return crypto.createHmac("sha256", kService).update("request").digest();
    }

    private transformError(data: VolcengineSubmitResponse | VolcengineQueryResponse) {
        const message = data.message || "即梦接口调用失败";
        switch (message) {
            case ImageGenerationError.PRE_IMAGE_RISK:
            case ImageGenerationError.TEXT_RISK:
                return new Error("输入内容存在违规，无法处理");
            case ImageGenerationError.POST_IMAGE_RISK:
            case ImageGenerationError.POST_TEXT_RISK:
                return new Error("生成内容未通过审核，请调整提示词后重试");
            case ImageGenerationError.RATE_LIMIT:
            case ImageGenerationError.CONCURRENT_LIMIT:
                return new Error("调用频率过高，请稍后重试");
            case ImageGenerationError.INTERNAL_ERROR:
            case ImageGenerationError.INTERNAL_RPC_ERROR:
                return new Error("即梦服务内部错误，请稍后重试");
            default:
                return new Error(message);
        }
    }
}
