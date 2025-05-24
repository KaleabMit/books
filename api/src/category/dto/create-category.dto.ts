import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    categories:string;
    @IsNotEmpty()
    @IsString()
    description:string;
}
