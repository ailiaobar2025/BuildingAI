import {
    ArrayMaxSize,
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    MaxLength,
    Min,
} from "class-validator";

export class SubmitImageGenerationDto {
    @IsString({ message: "提示词必须是字符串" })
    @IsNotEmpty({ message: "提示词不能为空" })
    @MaxLength(800, { message: "提示词长度不能超过800字符" })
    prompt: string;

    @IsArray({ message: "参考图列表必须是数组" })
    @IsOptional()
    @ArrayMaxSize(10, { message: "参考图数量不能超过10张" })
    @ArrayUnique({ message: "参考图 URL 不能重复" })
    @IsUrl({}, { each: true, message: "参考图 URL 必须是有效的链接" })
    imageUrls?: string[];

    @IsOptional()
    @IsInt({ message: "面积必须是整数" })
    @Min(1024 * 1024, { message: "面积不能小于 1K 分辨率" })
    @Max(4096 * 4096, { message: "面积不能大于 4K 分辨率" })
    size?: number;

    @IsOptional()
    @IsInt({ message: "宽度必须是整数" })
    @Min(1, { message: "宽度必须大于0" })
    width?: number;

    @IsOptional()
    @IsInt({ message: "高度必须是整数" })
    @Min(1, { message: "高度必须大于0" })
    height?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "scale 必须是 0-1 之间的小数，最多两位小数" })
    @Min(0, { message: "scale 不能小于 0" })
    @Max(1, { message: "scale 不能大于 1" })
    scale?: number;

    @IsOptional()
    @IsBoolean({ message: "forceSingle 必须是布尔值" })
    forceSingle?: boolean;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "minRatio 必须是 1/16 到 16 之间的小数" })
    @Min(1 / 16, { message: "minRatio 不能小于 1/16" })
    @Max(16, { message: "minRatio 不能大于 16" })
    minRatio?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "maxRatio 必须是 1/16 到 16 之间的小数" })
    @Min(1 / 16, { message: "maxRatio 不能小于 1/16" })
    @Max(16, { message: "maxRatio 不能大于 16" })
    maxRatio?: number;
}

export class QueryImageGenerationResultDto {
    @IsString({ message: "任务ID 必须是字符串" })
    @IsNotEmpty({ message: "任务ID 不能为空" })
    taskId: string;

    @IsOptional()
    @IsBoolean({ message: "是否返回 URL 必须是布尔值" })
    returnUrl?: boolean;

    @IsOptional()
    @IsBoolean({ message: "是否添加水印必须是布尔值" })
    addLogo?: boolean;

    @IsOptional()
    @IsIn([0, 1, 2, 3], { message: "水印位置必须在 0-3 之间" })
    logoPosition?: number;

    @IsOptional()
    @IsIn([0, 1], { message: "水印语言必须是 0 或 1" })
    logoLanguage?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "水印透明度必须是 0-1 之间的小数" })
    @Min(0, { message: "水印透明度不能小于 0" })
    @Max(1, { message: "水印透明度不能大于 1" })
    logoOpacity?: number;

    @IsOptional()
    @IsString({ message: "水印文本必须是字符串" })
    @MaxLength(20, { message: "水印文本长度不能超过 20 个字符" })
    logoTextContent?: string;

    @IsOptional()
    @IsString({ message: "内容生产者 ID 必须是字符串" })
    @MaxLength(64, { message: "内容生产者 ID 不能超过 64 个字符" })
    contentProducer?: string;

    @IsOptional()
    @IsString({ message: "内容生产者唯一 ID 必须是字符串" })
    @MaxLength(64, { message: "内容生产者唯一 ID 不能超过 64 个字符" })
    producerId?: string;

    @IsOptional()
    @IsString({ message: "传播服务商 ID 必须是字符串" })
    @MaxLength(64, { message: "传播服务商 ID 不能超过 64 个字符" })
    contentPropagator?: string;

    @IsOptional()
    @IsString({ message: "传播服务商唯一 ID 必须是字符串" })
    @MaxLength(64, { message: "传播服务商唯一 ID 不能超过 64 个字符" })
    propagateId?: string;
}
