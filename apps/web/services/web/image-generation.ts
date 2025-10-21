/**
 * 图片生成相关API
 */

/**
 * 提交图片生成任务的参数
 */
export interface SubmitImageGenerationParams {
    /** 文本描述（必填） */
    prompt: string;
    /** 参考图URL列表（可选） */
    imageUrls?: string[];
    /** 图片面积（可选） */
    size?: number;
    /** 图片宽度（可选） */
    width?: number;
    /** 图片高度（可选） */
    height?: number;
    /** 缩放比例（可选，0-1） */
    scale?: number;
    /** 是否强制单张输出（可选） */
    forceSingle?: boolean;
    /** 最小宽高比（可选，1/16-16） */
    minRatio?: number;
    /** 最大宽高比（可选，1/16-16） */
    maxRatio?: number;
}

/**
 * 查询图片生成任务结果的参数
 */
export interface QueryImageGenerationParams {
    /** 任务ID（必填） */
    taskId: string;
    /** 是否返回URL（可选） */
    returnUrl?: boolean;
    /** 是否添加水印（可选） */
    addLogo?: boolean;
    /** 水印位置（可选，0-3） */
    logoPosition?: number;
    /** 水印语言（可选，0或1） */
    logoLanguage?: number;
    /** 水印透明度（可选，0-1） */
    logoOpacity?: number;
    /** 水印文本内容（可选） */
    logoTextContent?: string;
    /** 内容生产者ID（可选） */
    contentProducer?: string;
    /** 内容生产者唯一ID（可选） */
    producerId?: string;
    /** 传播服务商ID（可选） */
    contentPropagator?: string;
    /** 传播服务商唯一ID（可选） */
    propagateId?: string;
}

/**
 * 图片生成任务提交响应
 */
export interface ImageGenerationSubmitResponse {
    /** 任务ID */
    taskId: string;
    /** 原始响应数据 */
    raw?: any;
}

/**
 * 图片生成任务状态
 */
export type ImageGenerationStatus = "in_queue" | "generating" | "done" | "not_found" | "expired";

/**
 * 图片生成任务查询响应
 */
export interface ImageGenerationQueryResponse {
    /** 任务状态 */
    status: ImageGenerationStatus;
    /** 图片URL列表 */
    imageUrls?: string[];
    /** Base64数据列表 */
    base64List?: string[];
    /** 原始响应数据 */
    raw?: any;
}

/**
 * 提交图片生成任务
 * @param params 生成参数
 * @returns 任务ID等信息
 */
export function apiSubmitImageGeneration(
    params: SubmitImageGenerationParams,
): Promise<ImageGenerationSubmitResponse> {
    return useWebPost("/image-generation/submit", params);
}

/**
 * 查询图片生成任务结果
 * @param params 查询参数
 * @returns 任务状态和结果
 */
export function apiQueryImageGeneration(
    params: QueryImageGenerationParams,
): Promise<ImageGenerationQueryResponse> {
    return useWebPost("/image-generation/query", params);
}

/**
 * 轮询查询图片生成任务（自动重试直到完成或失败）
 * @param taskId 任务ID
 * @param options 轮询选项
 * @returns 最终结果
 */
export async function apiPollImageGeneration(
    taskId: string,
    options: {
        /** 轮询间隔（毫秒），默认3000 */
        interval?: number;
        /** 最大轮询次数，默认60次（3分钟） */
        maxAttempts?: number;
        /** 每次轮询的回调 */
        onProgress?: (status: ImageGenerationStatus, attempt: number) => void;
    } = {},
): Promise<ImageGenerationQueryResponse> {
    const { interval = 3000, maxAttempts = 60, onProgress } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = await apiQueryImageGeneration({ taskId });

        if (onProgress) {
            onProgress(result.status, attempt);
        }

        // 任务完成
        if (result.status === "done") {
            return result;
        }

        // 任务失败
        if (result.status === "not_found" || result.status === "expired") {
            throw new Error(`任务${result.status === "not_found" ? "不存在" : "已过期"}`);
        }

        // 继续等待
        if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
    }

    throw new Error("查询超时，请稍后再试");
}
