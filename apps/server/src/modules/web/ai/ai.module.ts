import { AccountLogModule } from "@common/modules/account/account-log.module";
import { User } from "@common/modules/auth/entities/user.entity";
import { DictModule } from "@common/modules/dict/dict.module";
import { AiConsoleModule } from "@modules/console/ai/ai.module";
import { AiMcpServer } from "@modules/console/ai/entities/ai-mcp-server.entity";
import { AiUserMcpServer } from "@modules/console/ai/entities/ai-user-mcp-server.entity";
import { AccountLog } from "@modules/console/finance/entities/account-log.entity";
import { KeyManagerModule } from "@modules/console/key-manager/key-manager.module";
import { AiAgentModule } from "@modules/web/ai-agent/ai-agent.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AiChatMessageController } from "./controllers/ai-chat-message.controller";
import { AiChatRecordController } from "./controllers/ai-chat-record.controller";
import { WebAiMcpServerController } from "./controllers/ai-mcp-server.controller";
import { AiModelController } from "./controllers/ai-model.controller";
import { AiProviderController } from "./controllers/ai-provider.controller";
import { ImageGenerationController } from "./controllers/image-generation.controller";
import { WebAiMcpServerService } from "./services/ai-mcp-server.service";
import { ImageGenerationService } from "./services/image-generation.service";
import { UserMcpServerService } from "./services/user-mcp-server.service";

/**
 * AI功能模块（前台）
 *
 * 提供AI聊天、模型查询、多模态生成等功能
 */
@Module({
    imports: [
        AiConsoleModule,
        AiAgentModule,
        DictModule,
        AccountLogModule,
        KeyManagerModule,
        TypeOrmModule.forFeature([AiMcpServer, AiUserMcpServer, User]),
    ],
    controllers: [
        AiChatMessageController,
        AiChatRecordController,
        AiModelController,
        AiProviderController,
        WebAiMcpServerController,
        ImageGenerationController,
    ],
    providers: [WebAiMcpServerService, UserMcpServerService, ImageGenerationService],
})
export class AiModule {}
