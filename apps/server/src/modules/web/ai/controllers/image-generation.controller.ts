import { BaseController } from "@common/base/controllers/base.controller";
import { WebController } from "@common/decorators/controller.decorator";
import { Body, Post } from "@nestjs/common";

import {
    QueryImageGenerationResultDto,
    SubmitImageGenerationDto,
} from "../dto/image-generation.dto";
import { ImageGenerationService } from "../services/image-generation.service";

@WebController("image-generation")
export class ImageGenerationController extends BaseController {
    constructor(private readonly imageService: ImageGenerationService) {
        super();
    }

    @Post("submit")
    async submitTask(@Body() dto: SubmitImageGenerationDto) {
        const result = await this.imageService.submitTask(dto);
        return {
            taskId: result.taskId,
            raw: result.raw,
        };
    }

    @Post("query")
    async queryTask(@Body() dto: QueryImageGenerationResultDto) {
        const result = await this.imageService.queryTask(dto);
        return {
            status: result.status,
            imageUrls: result.imageUrls,
            base64List: result.base64List,
            raw: result.raw,
        };
    }
}
