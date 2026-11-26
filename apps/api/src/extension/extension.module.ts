import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ExtensionController } from "./extension.controller";
import { SignInCodes } from "./sign-in-codes";

@Module({
  imports: [AuthModule],
  controllers: [ExtensionController],
  providers: [SignInCodes],
})
export class ExtensionModule {}
