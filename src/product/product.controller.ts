import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductoDto } from './dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createProductDto: CreateProductoDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    return this.productService.create(createProductDto, imageFile);
  }
}
