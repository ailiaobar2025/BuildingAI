import { HttpExceptionFactory } from "@common/exceptions/http-exception.factory";
import { Injectable, Logger } from "@nestjs/common";
import { VolcengineImageGenerationSDK } from "@sdk/ai/volcengine/image-generation.sdk";

import {
    QueryImageGenerationResultDto,
    SubmitImageGenerationDto,
} from "../dto/image-generation.dto";

/**
 * 图片生成服务
 *
 * 封装火山引擎即梦4.0图片生成功能
 */
@Injectable()
export class ImageGenerationService {
    private readonly logger = new Logger(ImageGenerationService.name);
    private readonly sdk: VolcengineImageGenerationSDK;

    constructor() {
        const endpoint = process.env.VOLCENGINE_IMAGE_ENDPOINT || "https://visual.volcengineapi.com";
        const region = process.env.VOLCENGINE_IMAGE_REGION || "cn-north-1";
        const service = process.env.VOLCENGINE_IMAGE_SERVICE || "cv";
        const accessKeyId = process.env.VOLCENGINE_IMAGE_ACCESS_KEY_ID || "";
        const secretAccessKey = process.env.VOLCENGINE_IMAGE_SECRET_ACCESS_KEY || "";
        const defaultReqKey = process.env.VOLCENGINE_IMAGE_DEFAULT_REQ_KEY || "jimeng_t2i_v40";

        if (!accessKeyId || !secretAccessKey) {
            this.logger.warn("火山引擎图片生成服务未配置密钥，相关功能将不可用");
        }

        this.sdk = new VolcengineImageGenerationSDK({
            endpoint,
            region,
            service,
            accessKeyId,
            secretAccessKey,
            defaultReqKey,
            timeout: 30000,
        });
    }

    async submitTask(dto: SubmitImageGenerationDto) {
        try {
            const payload = {
                req_key: this.sdk.getDefaultReqKey(),
                prompt: dto.prompt,
                image_urls: dto.imageUrls,
                size: dto.size,
                width: dto.width,
                height: dto.height,
                scale: dto.scale,
                force_single: dto.forceSingle,
                min_ratio: dto.minRatio,
                max_ratio: dto.maxRatio,
            };

            const result = await this.sdk.submitTask(payload);

            this.logger.log(`图片生成任务提交成功，任务ID: ${result.taskId}`);

            return result;
        } catch (error) {
            this.logger.error(`提交图片生成任务失败: ${error.message}`, error.stack);
            throw HttpExceptionFactory.business(error.message || "提交图片生成任务失败");
        }
    }

    async queryTask(dto: QueryImageGenerationResultDto) {
        try {
            const payload = {
                req_key: this.sdk.getDefaultReqKey(),
                task_id: dto.taskId,
                req_json: JSON.stringify({
                    return_url: dto.returnUrl ?? true,
                    add_logo: dto.addLogo ?? false,
                    logo_info: {
                        add_logo: dto.addLogo ?? false,
                        position: dto.logoPosition ?? 0,
                        language: dto.logoLanguage ?? 0,
                        opacity: dto.logoOpacity ?? 0.3,
                        logo_text_content: dto.logoTextContent,
                    },
                    content_authentication: {
                        content_producer: dto.contentProducer,
                        producer_id: dto.producerId,
                        content_propagator: dto.contentPropagator,
                        propagate_id: dto.propagateId,
                    },
                }),
            };

            const result = await this.sdk.queryTask(payload);

            this.logger.log(`查询图片生成任务状态: ${dto.taskId}, 状态: ${result.status}`);

            return result;
        } catch (error) {
            this.logger.error(`查询图片生成任务失败: ${error.message}`, error.stack);
            throw HttpExceptionFactory.business(error.message || "查询图片生成任务失败");
        }
    }
}
